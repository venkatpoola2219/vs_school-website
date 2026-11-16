
import React, { useEffect, useState, useRef } from 'react';
import api from '../api';
import './admin.css';
import { defaultPages } from '../pages/WebsiteDetailPage';
import { defaultMenuRecords } from '../components/defaultMenus';

const blankPage = {
  title: '',
  slug: '',
  section: 'pages',
  content: '',
  is_published: 1
};

const blankBanner = {
  title: '',
  image_path: '',
  link_url: '',
  sort_order: 0,
  is_active: 1
};

const blankMenu = {
  label: '',
  url: '',
  parent_label: 'Main Menu',
  sort_order: 0,
  is_active: 1
};

const blankPasswordForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
};

const getInitials = (name = '') => {
  return name.trim().slice(0, 2).toUpperCase();
};

export default function AdminPanel() {

  // File input references
  const logoInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  // Authentication
  const [token, setToken] = useState(
    () => sessionStorage.getItem('school_admin_token') || ''
  );

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [currentAdmin, setCurrentAdmin] = useState({
    id: null,
    username: ''
  });

  // Admin accounts
  const [adminUsers, setAdminUsers] = useState([]);

  const [newAdmin, setNewAdmin] = useState({
    username: '',
    password: ''
  });

  // Password update
  const [passwordForm, setPasswordForm] = useState(blankPasswordForm);

  // Dashboard
  const [tab, setTab] = useState('overview');

  // Messages
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Website settings
  const [settings, setSettings] = useState({
    site_name: 'School Website',
    logo_path: ''
  });

  // CMS data
  const [banners, setBanners] = useState([]);
  const [pages, setPages] = useState([]);
  const [menus, setMenus] = useState([]);

  // Forms
  const [banner, setBanner] = useState(blankBanner);
  const [page, setPage] = useState(blankPage);
  const [menu, setMenu] = useState(blankMenu);

  // Edit status
  const [editing, setEditing] = useState({
    type: '',
    id: null
  });

  const [uploading, setUploading] = useState(false);

  // Authentication headers
  const auth = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  // Notification
  const notify = (text, isError = false) => {
    setMessage(isError ? '' : text);
    setError(isError ? text : '');
  };

  // Reset edit status
  function clearEditing() {
    setEditing({
      type: '',
      id: null
    });
  }

  // Load all admin data
  async function loadAll(currentToken = token) {

    const cfg = {
      headers: {
        Authorization: `Bearer ${currentToken}`
      }
    };

    const [s, b, p, m, me, users] = await Promise.all([
      api.get('/admin/settings', cfg),
      api.get('/admin/banners', cfg),
      api.get('/admin/pages', cfg),
      api.get('/admin/menus', cfg),
      api.get('/admin/me', cfg),
      api.get('/admin/users', cfg)
    ]);

    let storedPages = p.data;
    let storedMenus = m.data;
    const seedMarker = 'system-default-pages-seeded';
    const menuSeedMarker = 'system-default-menus-seeded';
    if (!storedPages.some(item => item.slug === seedMarker)) {
      const existingSlugs = new Set(storedPages.map(item => item.slug));
      for (const defaultPage of defaultPages) {
        if (existingSlugs.has(defaultPage.slug)) continue;
        try {
          await api.post('/admin/pages', defaultPage, cfg);
        } catch (seedError) {
          if (seedError.response?.status !== 409) throw seedError;
        }
      }
      try {
        await api.post('/admin/pages', {
          title: 'System page setup marker',
          slug: seedMarker,
          section: 'system',
          content: 'Internal marker used to prevent deleted starter pages from being recreated.',
          is_published: 0
        }, cfg);
      } catch (seedError) {
        if (seedError.response?.status !== 409) throw seedError;
      }
      const refreshed = await api.get('/admin/pages', cfg);
      storedPages = refreshed.data;
    }

    if (!storedMenus.some(item => item.url === menuSeedMarker)) {
      const existingMenuKeys = new Set(storedMenus.map(item => `${item.parent_label}::${item.label}`));
      for (const defaultMenu of defaultMenuRecords) {
        const key = `${defaultMenu.parent_label}::${defaultMenu.label}`;
        if (existingMenuKeys.has(key)) continue;
        try {
          await api.post('/admin/menus', defaultMenu, cfg);
        } catch (seedError) {
          if (seedError.response?.status !== 409) throw seedError;
        }
      }
      try {
        await api.post('/admin/menus', {
          label: 'System menu setup marker',
          url: menuSeedMarker,
          parent_label: '__system__',
          sort_order: 999999,
          is_active: 0
        }, cfg);
      } catch (seedError) {
        if (seedError.response?.status !== 409) throw seedError;
      }
      const refreshedMenus = await api.get('/admin/menus', cfg);
      storedMenus = refreshedMenus.data;
    }

    setSettings(prev => ({
      ...prev,
      ...s.data
    }));

    setBanners(b.data);
    setPages(storedPages.filter(item => item.slug !== seedMarker));
    setMenus(storedMenus.filter(item => item.url !== menuSeedMarker));
    setCurrentAdmin(me.data);
    setAdminUsers(users.data);
  }

  // Check existing login session
  useEffect(() => {

    if (token) {
      loadAll(token).catch(() => {
        sessionStorage.removeItem('school_admin_token');
        setToken('');
        setCurrentAdmin({
          id: null,
          username: ''
        });
      });
    }

  }, []);

  // Login
  async function login(e) {

    e.preventDefault();
    notify('');

    try {

      const r = await api.post('/admin/login', {
        username,
        password
      });

      sessionStorage.setItem(
        'school_admin_token',
        r.data.token
      );

      setToken(r.data.token);
      setPassword('');

      await loadAll(r.data.token);

      notify('Login successful.');

    } catch (e) {

      notify(
        e.response?.data?.message ||
        'Unable to login. Check backend and database.',
        true
      );

    }
  }

  // Logout
  function logout() {

    sessionStorage.removeItem('school_admin_token');

    setToken('');

    setTab('overview');

    setCurrentAdmin({
      id: null,
      username: ''
    });

    setPasswordForm(blankPasswordForm);

    notify('');
  }

  // Update password
  async function updatePassword(e) {

    e.preventDefault();
    notify('');

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      notify(
        'New password and confirm password do not match.',
        true
      );
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      notify(
        'New password must contain at least 8 characters.',
        true
      );
      return;
    }

    try {

      const response = await api.put(
        '/admin/password',
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        },
        auth
      );

      sessionStorage.removeItem('school_admin_token');

      setToken('');

      setCurrentAdmin({
        id: null,
        username: ''
      });

      setPasswordForm(blankPasswordForm);

      notify(
        response.data.message ||
        'Password updated successfully!'
      );

    } catch (e) {

      notify(
        e.response?.data?.message ||
        'Could not update password.',
        true
      );

    }
  }

  // Create another admin
  async function createAdmin(e) {

    e.preventDefault();
    notify('');

    try {

      await api.post(
        '/admin/users',
        newAdmin,
        auth
      );

      setNewAdmin({
        username: '',
        password: ''
      });

      await loadAll();

      notify('New admin account created successfully.');

    } catch (e) {

      notify(
        e.response?.data?.message ||
        'Could not create admin account.',
        true
      );

    }
  }

  // Upload image
  async function upload(file) {

    if (!file) return '';

    const data = new FormData();

    data.append('file', file);

    setUploading(true);

    try {

      const r = await api.post(
        '/admin/upload',
        data,
        {
          ...auth,
          headers: {
            ...auth.headers,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return r.data.path;

    } finally {

      setUploading(false);

    }
  }

  // Save logo and website settings
  async function saveSettings(e) {

    e.preventDefault();
    notify('');

    try {

      await api.put(
        '/admin/settings',
        settings,
        auth
      );

      // Clear selected file
      if (logoInputRef.current) {
        logoInputRef.current.value = '';
      }

      notify('Logo updated successfully!');

    } catch (e) {

      notify(
        e.response?.data?.message ||
        'Could not update logo.',
        true
      );

    }
  }

  // Save banner
  async function saveBanner(e) {

    e.preventDefault();
    notify('');

    try {

      if (editing.type === 'banner' && editing.id) {

        await api.put(
          `/admin/banners/${editing.id}`,
          banner,
          auth
        );

      } else {

        await api.post(
          '/admin/banners',
          banner,
          auth
        );

      }

      // Reset banner form
      setBanner(blankBanner);

      // Clear image input
      if (bannerInputRef.current) {
        bannerInputRef.current.value = '';
      }

      clearEditing();

      await loadAll();

      notify('Banner saved successfully!');

    } catch (e) {

      notify(
        e.response?.data?.message ||
        'Could not save banner.',
        true
      );

    }
  }

  // Save page
  async function savePage(e) {

    e.preventDefault();
    notify('');

    try {

      if (editing.type === 'page' && editing.id) {

        await api.put(
          `/admin/pages/${editing.id}`,
          page,
          auth
        );

      } else {

        await api.post(
          '/admin/pages',
          page,
          auth
        );

      }

      // Reset page form
      setPage(blankPage);

      clearEditing();

      await loadAll();

      notify('Page saved successfully!');

    } catch (e) {

      notify(
        e.response?.data?.message ||
        'Could not save page.',
        true
      );

    }
  }

  // Save menu
  async function saveMenu(e) {

    e.preventDefault();
    notify('');

    try {

      if (editing.type === 'menu' && editing.id) {

        await api.put(
          `/admin/menus/${editing.id}`,
          menu,
          auth
        );

      } else {

        await api.post(
          '/admin/menus',
          menu,
          auth
        );

      }

      // Reset menu form
      setMenu(blankMenu);

      clearEditing();

      await loadAll();

      notify('Menu item saved successfully!');

    } catch (e) {

      notify(
        e.response?.data?.message ||
        'Could not save menu.',
        true
      );

    }
  }

  // Delete records
  async function remove(type, id) {

    if (
      !window.confirm(
        'Are you sure you want to delete this item?'
      )
    ) {
      return;
    }

    try {

      await api.delete(
        `/admin/${type}/${id}`,
        auth
      );

      await loadAll();

      notify('Item deleted successfully.');

    } catch (e) {

      notify(
        e.response?.data?.message ||
        'Delete failed.',
        true
      );

    }
  }

  // Edit banner
  const editBanner = x => {

    setBanner({
      title: x.title || '',
      image_path: x.image_path || '',
      link_url: x.link_url || '',
      sort_order: x.sort_order ?? 0,
      is_active: x.is_active
    });

    if (bannerInputRef.current) {
      bannerInputRef.current.value = '';
    }

    setEditing({
      type: 'banner',
      id: x.id
    });

    setTab('banners');

    notify('');
  };

  // Edit page
  const editPage = x => {

    setPage({
      title: x.title || '',
      slug: x.slug || '',
      section: x.section || 'pages',
      content: x.content || '',
      is_published: x.is_published
    });

    setEditing({
      type: 'page',
      id: x.id
    });

    setTab('pages');

    notify('');
  };

  // Edit menu
  const editMenu = x => {

    setMenu({
      label: x.label || '',
      url: x.url || '',
      parent_label: x.parent_label || 'Main Menu',
      sort_order: x.sort_order ?? 0,
      is_active: x.is_active
    });

    setEditing({
      type: 'menu',
      id: x.id
    });

    setTab('menus');

    notify('');
  };

  // Clear banner form
  function clearBannerForm() {

    setBanner(blankBanner);

    if (bannerInputRef.current) {
      bannerInputRef.current.value = '';
    }

    clearEditing();
    notify('');
  }

  // Clear page form
  function clearPageForm() {

    setPage(blankPage);

    clearEditing();
    notify('');
  }

  // Clear menu form
  function clearMenuForm() {

    setMenu(blankMenu);

    clearEditing();
    notify('');
  }

  // Login screen
  if (!token) {

    return (

      <div className="admin-login-wrap">

        <form
          className="admin-login"
          onSubmit={login}
        >

          <div className="admin-mark">
            SA
          </div>

          <h1>Website Admin</h1>

          <p>
            Sign in to manage your school website
          </p>

          {error && (
            <div className="admin-alert error">
              {error}
            </div>
          )}

          <label>Username</label>

          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoComplete="username"
          />

          <label>Password</label>

          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <button className="admin-primary">
            Login to Dashboard
          </button>

        </form>

      </div>

    );
  }

  // Sidebar tabs
  const tabs = [
    ['overview', 'Overview'],
    ['settings', 'Logo & Settings'],
    ['banners', 'Banners'],
    ['pages', 'Pages'],
    ['menus', 'Menus'],
    ['profile', 'My Account'],
    ['admins', 'Admin Users']
  ];

  return (

    <div className="admin-layout">

      {/* Sidebar */}
      <aside className="admin-sidebar">

        <div className="admin-brand">

          <span>
            {getInitials(currentAdmin.username)}
          </span>

          <div>
            <b>School Admin</b>
            <small>Content management</small>
          </div>

        </div>

        <nav>

          {tabs.map(([id, label]) => (

            <button
              key={id}
              className={tab === id ? 'active' : ''}
              onClick={() => {
                setTab(id);
                clearEditing();
                notify('');
              }}
            >
              {label}
            </button>

          ))}

        </nav>

        <button
          className="admin-logout"
          onClick={logout}
        >
          ↪ Logout
        </button>

      </aside>

      {/* Main content */}
      <main className="admin-main">

        {/* Header */}
        <header className="admin-top">

          <div>
            <small>WEBSITE MANAGEMENT</small>

            <h1>
              {tabs.find(x => x[0] === tab)?.[1]}
            </h1>
          </div>

          <div className="admin-user-info">

            <div className="admin-user-avatar">
              {getInitials(currentAdmin.username)}
            </div>

            <div className="admin-user-details">
              <span>Signed in as</span>
              <strong>{currentAdmin.username}</strong>
            </div>

          </div>

        </header>

        {/* Messages */}
        {message && (
          <div className="admin-alert">
            {message}
          </div>
        )}

        {error && (
          <div className="admin-alert error">
            {error}
          </div>
        )}

        {/* Overview */}
        {tab === 'overview' && (

          <>
            <div className="admin-stats">

              <article>
                <strong>{pages.length}</strong>
                <span>Total pages</span>
              </article>

              <article>
                <strong>{banners.length}</strong>
                <span>Banners</span>
              </article>

              <article>
                <strong>{menus.length}</strong>
                <span>Menu items</span>
              </article>

            </div>

            <section className="admin-card">

              <h2>
                Welcome to your website admin panel
              </h2>

              <p>
                Use the menu to update your logo, banners,
                website pages and navigation links.
                Changes are stored in your existing MySQL database.
              </p>

              <p>
                <b>Public website:</b> open{' '}
                <a
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                >
                  your website
                </a>{' '}
                in another tab to check updates.
              </p>

            </section>
          </>

        )}

        {/* Logo and Settings */}
        {tab === 'settings' && (

          <section className="admin-card">

            <h2>Website identity</h2>

            <form
              onSubmit={saveSettings}
              className="admin-form"
            >

              <label>
                Website name

                <input
                  value={settings.site_name || ''}
                  onChange={e =>
                    setSettings(prev => ({
                      ...prev,
                      site_name: e.target.value
                    }))
                  }
                />

              </label>

              <label>
                Logo image

                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={async e => {

                    const file = e.target.files[0];

                    if (!file) return;

                    try {

                      const path = await upload(file);

                      if (path) {

                        setSettings(prev => ({
                          ...prev,
                          logo_path: path
                        }));

                      }

                    } catch (err) {

                      notify(
                        err.response?.data?.message ||
                        'Logo upload failed.',
                        true
                      );

                    }

                  }}
                />

              </label>

              {/* Logo preview intentionally removed */}

              <button
                className="admin-primary"
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Save settings'}
              </button>

            </form>

          </section>

        )}

        {/* Banners */}
        {tab === 'banners' && (

          <div className="admin-columns">

            <section className="admin-card">

              <h2>
                {editing.type === 'banner'
                  ? 'Edit banner'
                  : 'Add banner'}
              </h2>

              <form
                className="admin-form"
                onSubmit={saveBanner}
              >

                <label>
                  Banner title

                  <input
                    value={banner.title}
                    onChange={e =>
                      setBanner(prev => ({
                        ...prev,
                        title: e.target.value
                      }))
                    }
                  />

                </label>

                <label>
                  Banner image URL

                  <input
                    value={banner.image_path}
                    onChange={e =>
                      setBanner(prev => ({
                        ...prev,
                        image_path: e.target.value
                      }))
                    }
                    placeholder="Upload an image below or paste image path"
                    required
                  />

                </label>

                <label>
                  Upload image

                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    onChange={async e => {

                      const file = e.target.files[0];

                      if (!file) return;

                      try {

                        const path = await upload(file);

                        if (path) {

                          setBanner(prev => ({
                            ...prev,
                            image_path: path
                          }));

                        }

                      } catch (err) {

                        notify(
                          err.response?.data?.message ||
                          'Banner upload failed.',
                          true
                        );

                      }

                    }}
                  />

                </label>

                <label>
                  Link URL

                  <input
                    value={banner.link_url}
                    onChange={e =>
                      setBanner(prev => ({
                        ...prev,
                        link_url: e.target.value
                      }))
                    }
                  />

                </label>

                <label>
                  Display order

                  <input
                    type="number"
                    value={banner.sort_order}
                    onChange={e =>
                      setBanner(prev => ({
                        ...prev,
                        sort_order: e.target.value
                      }))
                    }
                  />

                </label>

                <label className="admin-check">

                  <input
                    type="checkbox"
                    checked={!!banner.is_active}
                    onChange={e =>
                      setBanner(prev => ({
                        ...prev,
                        is_active: e.target.checked ? 1 : 0
                      }))
                    }
                  />

                  Active

                </label>

                <div className="admin-actions">

                  <button
                    className="admin-primary"
                    disabled={uploading}
                  >
                    {editing.type === 'banner'
                      ? 'Update banner'
                      : 'Add banner'}
                  </button>

                  <button
                    type="button"
                    className="admin-secondary"
                    onClick={clearBannerForm}
                  >
                    Clear
                  </button>

                </div>

              </form>

            </section>

            <section className="admin-card">

              <h2>Existing banners</h2>

              {banners.map(x => (

                <div
                  className="admin-list-row"
                  key={x.id}
                >

                  <img
                    src={
                      x.image_path.startsWith('http')
                        ? x.image_path
                        : `${api.defaults.baseURL.replace('/api', '')}${x.image_path}`
                    }
                    alt={x.title || 'Banner'}
                  />

                  <div>
                    <b>{x.title || 'Untitled banner'}</b>

                    <small>
                      Order: {x.sort_order} ·{' '}
                      {x.is_active ? 'Active' : 'Inactive'}
                    </small>
                  </div>

                  <button onClick={() => editBanner(x)}>
                    Edit
                  </button>

                  <button
                    className="danger-text"
                    onClick={() => remove('banners', x.id)}
                  >
                    Delete
                  </button>

                </div>

              ))}

              {!banners.length && (
                <p>No banners added yet.</p>
              )}

            </section>

          </div>

        )}

        {/* Pages */}
        {tab === 'pages' && (

          <div className="admin-columns">

            <section className="admin-card">

              <h2>
                {editing.type === 'page'
                  ? 'Edit page'
                  : 'Create page'}
              </h2>

              <form
                className="admin-form"
                onSubmit={savePage}
              >

                <label>
                  Page title

                  <input
                    value={page.title}
                    onChange={e =>
                      setPage(prev => ({
                        ...prev,
                        title: e.target.value
                      }))
                    }
                    required
                  />

                </label>

                <label>
                  URL slug

                  <input
                    value={page.slug}
                    onChange={e =>
                      setPage(prev => ({
                        ...prev,
                        slug: e.target.value
                      }))
                    }
                    placeholder="school-life"
                    required
                  />

                </label>

                <label>
                  Menu section

                  <input
                    value={page.section}
                    onChange={e =>
                      setPage(prev => ({
                        ...prev,
                        section: e.target.value
                      }))
                    }
                  />

                </label>

                <label>
                  Page content (edit or clear the content below)

                  <textarea
                    rows="9"
                    value={page.content}
                    onChange={e =>
                      setPage(prev => ({
                        ...prev,
                        content: e.target.value
                      }))
                    }
                    placeholder="Enter the complete content for this page. You can update or remove this text at any time."
                  />

                </label>

                <p className="admin-field-help">After saving, add a menu item under Menus with URL <b>/page/{page.slug || 'your-page-slug'}</b> to show this page in the website navigation.</p>

                <label className="admin-check">

                  <input
                    type="checkbox"
                    checked={!!page.is_published}
                    onChange={e =>
                      setPage(prev => ({
                        ...prev,
                        is_published: e.target.checked ? 1 : 0
                      }))
                    }
                  />

                  Published

                </label>

                <div className="admin-actions">

                  <button className="admin-primary">
                    {editing.type === 'page'
                      ? 'Update page'
                      : 'Create page'}
                  </button>

                  <button
                    type="button"
                    className="admin-secondary"
                    onClick={clearPageForm}
                  >
                    Clear
                  </button>

                </div>

              </form>

            </section>

            <section className="admin-card">

              <h2>Website pages</h2>

              {pages.map(x => (

                <div
                  className="admin-list-row"
                  key={x.id}
                >

                  <div className="page-icon">P</div>

                  <div>
                    <b>{x.title}</b>

                    <small>
                      /page/{x.slug} ·{' '}
                      {x.is_published ? 'Published' : 'Draft'}
                    </small>
                  </div>

                  {Number(x.is_published) === 1 && (
                    <a
                      className="admin-preview-link"
                      href={`/page/${encodeURIComponent(x.slug)}`}
                      target="_blank"
                      rel="noreferrer"
                    >Preview</a>
                  )}

                  <button onClick={() => editPage(x)}>
                    Edit
                  </button>

                  <button
                    className="danger-text"
                    onClick={() => remove('pages', x.id)}
                  >
                    Delete
                  </button>

                </div>

              ))}

              {!pages.length && (
                <p>No CMS pages created yet.</p>
              )}

            </section>

          </div>

        )}

        {/* Menus */}
        {tab === 'menus' && (

          <div className="admin-columns">

            <section className="admin-card">

              <h2>
                {editing.type === 'menu'
                  ? 'Edit menu item'
                  : 'Add menu item'}
              </h2>

              <form
                className="admin-form"
                onSubmit={saveMenu}
              >

                <label>
                  Menu label

                  <input
                    value={menu.label}
                    onChange={e =>
                      setMenu(prev => ({
                        ...prev,
                        label: e.target.value
                      }))
                    }
                    required
                  />

                </label>

                <label>
                  URL

                  <input
                    value={menu.url}
                    onChange={e =>
                      setMenu(prev => ({
                        ...prev,
                        url: e.target.value
                      }))
                    }
                    placeholder="/about-us or /about"
                    required
                  />

                </label>

                <label>
                  Parent menu

                  <input
                    value={menu.parent_label}
                    onChange={e =>
                      setMenu(prev => ({
                        ...prev,
                        parent_label: e.target.value
                      }))
                    }
                  />

                </label>

                <label>
                  Display order

                  <input
                    type="number"
                    value={menu.sort_order}
                    onChange={e =>
                      setMenu(prev => ({
                        ...prev,
                        sort_order: e.target.value
                      }))
                    }
                  />

                </label>

                <label className="admin-check">

                  <input
                    type="checkbox"
                    checked={!!menu.is_active}
                    onChange={e =>
                      setMenu(prev => ({
                        ...prev,
                        is_active: e.target.checked ? 1 : 0
                      }))
                    }
                  />

                  Active

                </label>

                <div className="admin-actions">

                  <button className="admin-primary">
                    {editing.type === 'menu'
                      ? 'Update menu'
                      : 'Add menu'}
                  </button>

                  <button
                    type="button"
                    className="admin-secondary"
                    onClick={clearMenuForm}
                  >
                    Clear
                  </button>

                </div>

              </form>

            </section>

            <section className="admin-card">

              <h2>Navigation items</h2>

              {menus.map(x => (

                <div
                  className="admin-list-row"
                  key={x.id}
                >

                  <div className="page-icon">M</div>

                  <div>
                    <b>{x.label}</b>

                    <small>
                      {x.parent_label} · {x.url}
                    </small>
                  </div>

                  <button onClick={() => editMenu(x)}>
                    Edit
                  </button>

                  <button
                    className="danger-text"
                    onClick={() => remove('menus', x.id)}
                  >
                    Delete
                  </button>

                </div>

              ))}

              {!menus.length && (
                <p>
                  No custom menu items yet. Existing website
                  navigation remains unchanged until you add
                  custom menu items.
                </p>
              )}

            </section>

          </div>

        )}

        {/* My Account */}
        {tab === 'profile' && (

          <div className="admin-columns">

            <section className="admin-card">

              <h2>My account</h2>

              <p>
                Currently signed in as{' '}
                <b>{currentAdmin.username}</b>.
              </p>

              <form
                className="admin-form"
                onSubmit={updatePassword}
              >

                <label>
                  Current password

                  <input
                    type="password"
                    autoComplete="current-password"
                    value={passwordForm.currentPassword}
                    onChange={e =>
                      setPasswordForm(prev => ({
                        ...prev,
                        currentPassword: e.target.value
                      }))
                    }
                    required
                  />

                </label>

                <label>
                  New password

                  <input
                    type="password"
                    minLength="8"
                    autoComplete="new-password"
                    value={passwordForm.newPassword}
                    onChange={e =>
                      setPasswordForm(prev => ({
                        ...prev,
                        newPassword: e.target.value
                      }))
                    }
                    required
                  />

                </label>

                <label>
                  Confirm new password

                  <input
                    type="password"
                    minLength="8"
                    autoComplete="new-password"
                    value={passwordForm.confirmPassword}
                    onChange={e =>
                      setPasswordForm(prev => ({
                        ...prev,
                        confirmPassword: e.target.value
                      }))
                    }
                    required
                  />

                </label>

                <button className="admin-primary">
                  Update password
                </button>

              </form>

            </section>

          </div>

        )}

        {/* Admin Users */}
        {tab === 'admins' && (

          <div className="admin-columns">

            <section className="admin-card">

              <h2>Create another admin</h2>

              <form
                className="admin-form"
                onSubmit={createAdmin}
              >

                <label>
                  New admin username

                  <input
                    value={newAdmin.username}
                    onChange={e =>
                      setNewAdmin(prev => ({
                        ...prev,
                        username: e.target.value
                      }))
                    }
                    required
                    autoComplete="off"
                  />

                </label>

                <label>
                  Temporary password (minimum 8 characters)

                  <input
                    type="password"
                    minLength="8"
                    value={newAdmin.password}
                    onChange={e =>
                      setNewAdmin(prev => ({
                        ...prev,
                        password: e.target.value
                      }))
                    }
                    required
                    autoComplete="new-password"
                  />

                </label>

                <button className="admin-primary">
                  Create admin account
                </button>

              </form>

              <p>
                Share the login details securely. Ask the new
                admin to change their password after signing in.
              </p>

            </section>

            <section className="admin-card">

              <h2>Existing admin accounts</h2>

              {adminUsers.map(x => (

                <div
                  className="admin-list-row"
                  key={x.id}
                >

                  <div className="page-icon">A</div>

                  <div>
                    <b>
                      {x.username}{' '}
                      {Number(x.id) === Number(currentAdmin.id)
                        ? '(You)'
                        : ''}
                    </b>

                    <small>
                      Admin account ·{' '}
                      {x.created_at
                        ? new Date(x.created_at).toLocaleDateString()
                        : ''}
                    </small>
                  </div>

                  {Number(x.id) !== Number(currentAdmin.id) && (

                    <button
                      className="danger-text"
                      onClick={async () => {

                        if (
                          !window.confirm(
                            `Delete admin ${x.username}?`
                          )
                        ) {
                          return;
                        }

                        try {

                          await api.delete(
                            `/admin/users/${x.id}`,
                            auth
                          );

                          await loadAll();

                          notify('Admin account deleted.');

                        } catch (e) {

                          notify(
                            e.response?.data?.message ||
                            'Could not delete admin.',
                            true
                          );

                        }

                      }}
                    >
                      Delete
                    </button>

                  )}

                </div>

              ))}

              {!adminUsers.length && (
                <p>No admin accounts found.</p>
              )}

            </section>

          </div>

        )}

      </main>

    </div>

  );
}
