const crypto = require('node:crypto');
const path = require('node:path');
const fs = require('node:fs');
const { pipeline } = require('node:stream/promises');
const db = require('./db');

const uploadDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15 MB
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const DOC_EXT = new Set(['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv']);
const ALLOWED_EXT = new Set([...IMAGE_EXT, ...DOC_EXT]);
const MIME_BY_EXT = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif',
  '.pdf': 'application/pdf', '.txt': 'text/plain; charset=utf-8', '.csv': 'text/csv; charset=utf-8',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
};
const b64 = value => Buffer.from(value).toString('base64url');
const sign = payload => {
  const secret = process.env.ADMIN_TOKEN_SECRET;
  if (!secret) throw new Error('ADMIN_TOKEN_SECRET is missing in backend/.env');
  const body = b64(JSON.stringify(payload));
  const signature = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${signature}`;
};
function verify(token) {
  try {
    const [body, signature] = token.split('.');
    const expected = crypto.createHmac('sha256', process.env.ADMIN_TOKEN_SECRET).update(body).digest();
    const actual = Buffer.from(signature, 'base64url');
    if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    return payload.exp > Date.now() ? payload : null;
  } catch { return null; }
}
const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};
const checkPassword = (password, stored) => {
  const [salt, hash] = String(stored).split(':');
  const actual = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
};
async function ensureAdmin() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) return;
  const [rows] = await db.execute('SELECT id FROM admin_users WHERE username = ?', [username]);
  if (!rows.length) {
    await db.execute('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)', [username, hashPassword(password)]);
    console.log(`Initial admin account created for ${username}`);
  }
}
function requireAdmin(request, reply, done) {
  const token = (request.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const user = verify(token);
  if (!user) return reply.code(401).send({ message: 'Admin login required.' });
  request.admin = user;
  done();
}

// Render's free disk is wiped on every deploy, so every upload is also stored in
// the database. If a file is missing on disk it is restored from the database.
let filesTableReady = null;
function ensureFilesTable() {
  if (!filesTableReady) {
    filesTableReady = db.execute(`
      CREATE TABLE IF NOT EXISTS cms_files (
        filename VARCHAR(200) NOT NULL PRIMARY KEY,
        mime_type VARCHAR(120) NOT NULL,
        data LONGBLOB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).catch(error => {
      filesTableReady = null;
      throw error;
    });
  }
  return filesTableReady;
}

async function registerCms(app) {
  app.get('/uploads/:filename', async (request, reply) => {
    const filename = path.basename(request.params.filename);
    const file = path.join(uploadDir, filename);
    const ext = path.extname(filename).toLowerCase();
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('Cache-Control', 'public, max-age=86400');
    reply.type(MIME_BY_EXT[ext] || 'application/octet-stream');

    if (fs.existsSync(file)) return reply.send(fs.createReadStream(file));

    // Not on disk (for example after a redeploy): restore it from the database
    try {
      await ensureFilesTable();
      const [rows] = await db.execute('SELECT data FROM cms_files WHERE filename = ?', [filename]);
      if (rows.length) {
        const buffer = rows[0].data;
        fs.writeFile(file, buffer, () => {});
        return reply.send(buffer);
      }
    } catch (error) {
      request.log.error(error, 'Could not read file from database');
    }
    return reply.code(404).type('application/json').send({ message: 'File not found.' });
  });

  app.post('/api/admin/login', async (request, reply) => {
    const { username, password } = request.body || {};
    if (!username || !password) return reply.code(400).send({ message: 'Username and password are required.' });
    const [rows] = await db.execute('SELECT id, username, password_hash FROM admin_users WHERE username = ?', [String(username).trim()]);
    if (!rows.length || !checkPassword(String(password), rows[0].password_hash)) return reply.code(401).send({ message: 'Invalid username or password.' });
    const token = sign({ id: rows[0].id, username: rows[0].username, exp: Date.now() + 8 * 60 * 60 * 1000 });
    return { token, username: rows[0].username };
  });
  app.get('/api/admin/me', { preHandler: requireAdmin }, async request => ({ id: request.admin.id, username: request.admin.username }));

  app.put('/api/admin/password', { preHandler: requireAdmin }, async (request, reply) => {
    const { currentPassword, newPassword } = request.body || {};
    if (!currentPassword || !newPassword || String(newPassword).length < 8) {
      return reply.code(400).send({ message: 'Enter your current password and a new password with at least 8 characters.' });
    }
    const [rows] = await db.execute('SELECT password_hash FROM admin_users WHERE id = ?', [request.admin.id]);
    if (!rows.length || !checkPassword(String(currentPassword), rows[0].password_hash)) {
      return reply.code(401).send({ message: 'Current password is incorrect.' });
    }
    await db.execute('UPDATE admin_users SET password_hash = ? WHERE id = ?', [hashPassword(String(newPassword)), request.admin.id]);
    return { message: 'Password updated. Please log in again with your new password.' };
  });

  app.get('/api/admin/users', { preHandler: requireAdmin }, async () => {
    const [rows] = await db.execute('SELECT id, username, created_at FROM admin_users ORDER BY id');
    return rows;
  });
  app.post('/api/admin/users', { preHandler: requireAdmin }, async (request, reply) => {
    const { username, password } = request.body || {};
    const cleanUsername = String(username || '').trim();
    if (!cleanUsername || !password || String(password).length < 8) {
      return reply.code(400).send({ message: 'Username is required and password must contain at least 8 characters.' });
    }
    try {
      const [result] = await db.execute('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)', [cleanUsername, hashPassword(String(password))]);
      return reply.code(201).send({ id: result.insertId, message: 'Admin account created.' });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') return reply.code(409).send({ message: 'This username already exists.' });
      throw error;
    }
  });
  app.delete('/api/admin/users/:id', { preHandler: requireAdmin }, async (request, reply) => {
    const id = Number(request.params.id);
    if (id === Number(request.admin.id)) return reply.code(400).send({ message: 'You cannot delete the account you are currently using.' });
    const [[{ total }]] = await db.execute('SELECT COUNT(*) AS total FROM admin_users');
    if (Number(total) <= 1) return reply.code(400).send({ message: 'At least one admin account must remain.' });
    await db.execute('DELETE FROM admin_users WHERE id = ?', [id]);
    return { message: 'Admin account deleted.' };
  });

  app.get('/api/site-data', async () => {
    const [[settings], [banners], [menus]] = await Promise.all([
      db.execute('SELECT setting_key, setting_value FROM site_settings'),
      db.execute('SELECT id, title, image_path, link_url, sort_order FROM cms_banners WHERE is_active = 1 ORDER BY sort_order, id'),
      db.execute('SELECT id, label, url, parent_label, sort_order FROM cms_menus WHERE is_active = 1 ORDER BY sort_order, id')
    ]);
    return { settings: Object.fromEntries(settings.map(x => [x.setting_key, x.setting_value])), banners, menus };
  });

  app.get('/api/admin/settings', { preHandler: requireAdmin }, async () => {
    const [rows] = await db.execute('SELECT setting_key, setting_value FROM site_settings');
    return Object.fromEntries(rows.map(x => [x.setting_key, x.setting_value]));
  });
  app.put('/api/admin/settings', { preHandler: requireAdmin }, async (request, reply) => {
    const allowed = ['logo_path', 'site_name'];
    const entries = Object.entries(request.body || {}).filter(([key, value]) => allowed.includes(key) && typeof value === 'string');
    for (const [key, value] of entries) await db.execute('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)', [key, value]);
    return { message: 'Settings saved.' };
  });

  // Upload an image (logo, banner, photo inside a page) or a document (PDF, Word, Excel...).
  // POST /api/admin/upload?kind=image  -> images only (logo, banners)
  // POST /api/admin/upload             -> images and documents (page editor)
  app.post('/api/admin/upload', { preHandler: requireAdmin }, async (request, reply) => {
    const imagesOnly = request.query?.kind === 'image';
    const file = await request.file({ limits: { fileSize: MAX_UPLOAD_BYTES } });
    if (!file) return reply.code(400).send({ message: 'Choose a file.' });
    const ext = path.extname(file.filename || '').toLowerCase();
    const allowedExt = imagesOnly ? IMAGE_EXT : ALLOWED_EXT;
    if (!allowedExt.has(ext)) {
      return reply.code(400).send({
        message: imagesOnly
          ? 'Only JPG, PNG, WEBP and GIF images are allowed.'
          : 'Allowed files: JPG, PNG, WEBP, GIF, PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV.'
      });
    }
    const safeExt = ext === '.jpeg' ? '.jpg' : ext;
    const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${safeExt}`;
    const target = path.join(uploadDir, filename);
    await pipeline(file.file, fs.createWriteStream(target));
    if (file.file.truncated) {
      fs.unlink(target, () => {});
      return reply.code(413).send({ message: `File is too large. Maximum size is ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.` });
    }

    // Keep a permanent copy in the database
    let saved = true;
    try {
      await ensureFilesTable();
      await db.execute(
        'INSERT INTO cms_files (filename, mime_type, data) VALUES (?, ?, ?)',
        [filename, MIME_BY_EXT[safeExt] || 'application/octet-stream', fs.readFileSync(target)]
      );
    } catch (error) {
      saved = false;
      request.log.error(error, 'Could not save uploaded file in the database');
    }

    return { path: `/uploads/${filename}`, name: file.filename, isImage: IMAGE_EXT.has(ext), permanent: saved };
  });

  // Admission enquiries submitted from the website form
  app.get('/api/admin/enquiries', { preHandler: requireAdmin }, async () => {
    const [rows] = await db.execute(
      `SELECT id, parent_name, email, phone, city, grade, message, created_at
         FROM admission_enquiries
        ORDER BY created_at DESC, id DESC
        LIMIT 2000`
    );
    return rows;
  });

  app.delete('/api/admin/enquiries/:id', { preHandler: requireAdmin }, async (request) => {
    await db.execute('DELETE FROM admission_enquiries WHERE id = ?', [request.params.id]);
    return { ok: true };
  });

  app.get('/api/admin/banners', { preHandler: requireAdmin }, async () => {
    const [rows] = await db.execute('SELECT * FROM cms_banners ORDER BY sort_order, id'); return rows;
  });
  app.post('/api/admin/banners', { preHandler: requireAdmin }, async (request, reply) => {
    const { title = '', image_path, link_url = '', sort_order = 0, is_active = 1 } = request.body || {};
    if (!image_path) return reply.code(400).send({ message: 'Upload a banner image first.' });
    const [result] = await db.execute('INSERT INTO cms_banners (title,image_path,link_url,sort_order,is_active) VALUES (?,?,?,?,?)', [title, image_path, link_url, Number(sort_order) || 0, is_active ? 1 : 0]);
    return reply.code(201).send({ id: result.insertId, message: 'Banner added.' });
  });
  app.put('/api/admin/banners/:id', { preHandler: requireAdmin }, async (request, reply) => {
    const { title = '', image_path, link_url = '', sort_order = 0, is_active = 1 } = request.body || {};
    if (!image_path) return reply.code(400).send({ message: 'Image path is required.' });
    await db.execute('UPDATE cms_banners SET title=?,image_path=?,link_url=?,sort_order=?,is_active=? WHERE id=?', [title,image_path,link_url,Number(sort_order)||0,is_active?1:0,request.params.id]);
    return { message: 'Banner updated.' };
  });
  app.delete('/api/admin/banners/:id', { preHandler: requireAdmin }, async request => { await db.execute('DELETE FROM cms_banners WHERE id=?', [request.params.id]); return { message: 'Banner deleted.' }; });

  app.get('/api/admin/pages', { preHandler: requireAdmin }, async () => { const [rows] = await db.execute('SELECT * FROM cms_pages ORDER BY updated_at DESC'); return rows; });
  app.get('/api/pages/:slug', async (request, reply) => {
    const [rows] = await db.execute('SELECT id,title,slug,section,content FROM cms_pages WHERE slug=? AND is_published=1', [request.params.slug]);
    if (!rows.length) return reply.code(404).send({ message: 'Page not found.' }); return rows[0];
  });
  app.post('/api/admin/pages', { preHandler: requireAdmin }, async (request, reply) => {
    const { title, slug, section='pages', content='', is_published=1 } = request.body || {};
    if (!title || !slug) return reply.code(400).send({ message: 'Page title and URL slug are required.' });
    const cleanSlug = String(slug).toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '');
    try { const [r] = await db.execute('INSERT INTO cms_pages (title,slug,section,content,is_published) VALUES (?,?,?,?,?)', [title,cleanSlug,section,content,is_published?1:0]); return reply.code(201).send({ id:r.insertId, message:'Page created.' }); }
    catch (e) { if (e.code === 'ER_DUP_ENTRY') return reply.code(409).send({ message:'That page URL already exists.' }); throw e; }
  });
  app.put('/api/admin/pages/:id', { preHandler: requireAdmin }, async (request, reply) => {
    const { title, slug, section='pages', content='', is_published=1 } = request.body || {};
    if (!title || !slug) return reply.code(400).send({ message: 'Page title and URL slug are required.' });
    const cleanSlug = String(slug).toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '');
    try { await db.execute('UPDATE cms_pages SET title=?,slug=?,section=?,content=?,is_published=? WHERE id=?', [title,cleanSlug,section,content,is_published?1:0,request.params.id]); return { message:'Page updated.' }; }
    catch (e) { if (e.code === 'ER_DUP_ENTRY') return reply.code(409).send({ message:'That page URL already exists.' }); throw e; }
  });
  app.delete('/api/admin/pages/:id', { preHandler: requireAdmin }, async request => { await db.execute('DELETE FROM cms_pages WHERE id=?', [request.params.id]); return { message:'Page deleted.' }; });

  app.get('/api/admin/menus', { preHandler: requireAdmin }, async () => { const [rows] = await db.execute('SELECT * FROM cms_menus ORDER BY parent_label,sort_order,id'); return rows; });
  app.post('/api/admin/menus', { preHandler: requireAdmin }, async (request, reply) => {
    const { label, url, parent_label='Main Menu', sort_order=0, is_active=1 } = request.body || {};
    if (!label || !url) return reply.code(400).send({ message:'Menu label and URL are required.' });
    const [r] = await db.execute('INSERT INTO cms_menus (label,url,parent_label,sort_order,is_active) VALUES (?,?,?,?,?)', [label,url,parent_label,Number(sort_order)||0,is_active?1:0]);
    return reply.code(201).send({ id:r.insertId,message:'Menu item added.' });
  });
  app.put('/api/admin/menus/:id', { preHandler: requireAdmin }, async (request, reply) => {
    const { label, url, parent_label='Main Menu', sort_order=0, is_active=1 } = request.body || {};
    if (!label || !url) return reply.code(400).send({ message:'Menu label and URL are required.' });
    await db.execute('UPDATE cms_menus SET label=?,url=?,parent_label=?,sort_order=?,is_active=? WHERE id=?', [label,url,parent_label,Number(sort_order)||0,is_active?1:0,request.params.id]); return { message:'Menu item updated.' };
  });
  app.delete('/api/admin/menus/:id', { preHandler: requireAdmin }, async request => { await db.execute('DELETE FROM cms_menus WHERE id=?', [request.params.id]); return { message:'Menu item deleted.' }; });
}
module.exports = { registerCms, ensureAdmin, requireAdmin };
