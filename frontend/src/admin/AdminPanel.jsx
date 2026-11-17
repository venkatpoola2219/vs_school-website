
import React, { useEffect, useState, useRef } from 'react';
import api from '../api';
import './admin.css';
import { defaultPages } from '../pages/WebsiteDetailPage';
import { defaultMenuRecords } from '../components/defaultMenus';
import RichTextEditor from '../components/RichTextEditor';

const slugify = (text = '') =>
  String(text).toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

// Pages that came with the website keep their old address (/about/vision).
// Every page you create yourself opens at /page/<slug>.
const defaultRoutes = new Set(defaultPages.map(p => `${p.section}/${p.slug}`));
const pageUrl = p =>
  defaultRoutes.has(`${p.section}/${p.slug}`) ? `/${p.section}/${p.slug}` : `/page/${p.slug}`;

const blankPageMenu = { show: true, parent: '', newParent: '', label: '' };

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
  const [pageMenu, setPageMenu] = useState(blankPageMenu);
  const [enquiries, setEnquiries] = useState([]);
  const [enquirySearch, setEnquirySearch] = useState('');
  const [enquiriesLoading, setEnquiriesLoading] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

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
      api.get('/api/admin/settings', cfg),
      api.get('/api/admin/banners', cfg),
      api.get('/api/admin/pages', cfg),
      api.get('/api/admin/menus', cfg),
      api.get('/api/admin/me', cfg),
      api.get('/api/admin/users', cfg)
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
          await api.post('/api/admin/pages', defaultPage, cfg);
        } catch (seedError) {
          if (seedError.response?.status !== 409) throw seedError;
        }
      }
      try {
        await api.post('/api/admin/pages', {
          title: 'System page setup marker',
          slug: seedMarker,
          section: 'system',
          content: 'Internal marker used to prevent deleted starter pages from being recreated.',
          is_published: 0
        }, cfg);
      } catch (seedError) {
        if (seedError.response?.status !== 409) throw seedError;
      }
      const refreshed = await api.get('/api/admin/pages', cfg);
      storedPages = refreshed.data;
    }

    if (!storedMenus.some(item => item.url === menuSeedMarker)) {
      const existingMenuKeys = new Set(storedMenus.map(item => `${item.parent_label}::${item.label}`));
      for (const defaultMenu of defaultMenuRecords) {
        const key = `${defaultMenu.parent_label}::${defaultMenu.label}`;
        if (existingMenuKeys.has(key)) continue;
        try {
          await api.post('/api/admin/menus', defaultMenu, cfg);
        } catch (seedError) {
          if (seedError.response?.status !== 409) throw seedError;
        }
      }
      try {
        await api.post('/api/admin/menus', {
          label: 'System menu setup marker',
          url: menuSeedMarker,
          parent_label: '__system__',
          sort_order: 999999,
          is_active: 0
        }, cfg);
      } catch (seedError) {
        if (seedError.response?.status !== 409) throw seedError;
      }
      const refreshedMenus = await api.get('/api/admin/menus', cfg);
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
  async function loadEnquiries() {
    setEnquiriesLoading(true);
    try {
      const r = await api.get('/api/admin/enquiries', auth);
      setEnquiries(r.data);
    } catch (e) {
      notify(e.response?.data?.message || 'Could not load enquiries.', true);
    } finally {
      setEnquiriesLoading(false);
    }
  }

  function downloadEnquiriesCsv(rows) {
    const cell = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const head = ['Date', 'Parent name', 'Email', 'Phone', 'City', 'Grade', 'Message'];
    const lines = rows.map(x => [
      new Date(x.created_at).toLocaleString(), x.parent_name, x.email, x.phone, x.city, x.grade, x.message
    ].map(cell).join(','));
    const blob = new Blob(['\ufeff' + [head.map(cell).join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'enquiries.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  useEffect(() => {
    if (tab === 'enquiries' && token) loadEnquiries();
  }, [tab]);

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

      const r = await api.post('/api/admin/login', {
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
        '/api/admin/password',
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
        '/api/admin/users',
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
  // anyFile: allow PDF / Word / Excel too (page editor). full: return {path,name,isImage}
  async function upload(file, { anyFile = false, full = false } = {}) {

    if (!file) return '';

    const data = new FormData();

    data.append('file', file);

    setUploading(true);

    try {

      const r = await api.post(
        `/api/admin/upload${anyFile ? '' : '?kind=image'}`,
        data,
        {
          ...auth,
          headers: {
            ...auth.headers,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return full ? r.data : r.data.path;

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
        '/api/admin/settings',
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
          `/api/admin/banners/${editing.id}`,
          banner,
          auth
        );

      } else {

        await api.post(
          '/api/admin/banners',
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

    const payload = {
      ...page,
      slug: slugify(page.slug || page.title),
      section: slugify(page.section) || 'pages'
    };

    if (!payload.slug) {
      notify('Enter a page title or URL slug.', true);
      return;
    }

    const parent =
      pageMenu.parent === '__new__' || !pageMenu.parent
        ? pageMenu.newParent.trim()
        : pageMenu.parent;

    if (pageMenu.show && !parent) {
      notify('Choose a header menu, or type a name for a new header menu.', true);
      return;
    }

    try {

      if (editing.type === 'page' && editing.id) {
        await api.put(`/api/admin/pages/${editing.id}`, payload, auth);
      } else {
        await api.post('/api/admin/pages', payload, auth);
      }

      // Header menu link for this page
      const url = pageUrl(payload);
      const existingMenu = menus.find(
        m => m.url === url || (editing.oldUrl && m.url === editing.oldUrl)
      );

      if (pageMenu.show) {

        const label = pageMenu.label.trim() || payload.title;

        if (existingMenu) {

          await api.put(`/api/admin/menus/${existingMenu.id}`, {
            label,
            url,
            parent_label: parent,
            sort_order: existingMenu.sort_order,
            is_active: 1
          }, auth);

        } else {

          const sameParent = menus.filter(m => m.parent_label === parent);
          const nextOrder = sameParent.length
            ? Math.max(...sameParent.map(m => Number(m.sort_order) || 0)) + 1
            : 1;

          await api.post('/api/admin/menus', {
            label,
            url,
            parent_label: parent,
            sort_order: nextOrder,
            is_active: 1
          }, auth);

        }

      } else if (existingMenu) {

        await api.delete(`/api/admin/menus/${existingMenu.id}`, auth);

      }

      // Reset page form
      setPage(blankPage);
      setPageMenu(blankPageMenu);
      setSlugTouched(false);

      clearEditing();

      await loadAll();

      notify(
        pageMenu.show
          ? 'Page saved and shown in the header menu!'
          : 'Page saved successfully!'
      );

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
          `/api/admin/menus/${editing.id}`,
          menu,
          auth
        );

      } else {

        await api.post(
          '/api/admin/menus',
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

      if (type === 'pages') {
        // also remove this page's link from the header menu
        const target = pages.find(p => p.id === id);
        if (target) {
          const url = pageUrl(target);
          for (const m of menus.filter(m => m.url === url)) {
            await api.delete(`/api/admin/menus/${m.id}`, auth);
          }
        }
      }

      await api.delete(
        `/api/admin/${type}/${id}`,
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

    const url = pageUrl(x);
    const linked = menus.find(m => m.url === url);

    setPageMenu(
      linked
        ? { show: true, parent: linked.parent_label, newParent: '', label: linked.label }
        : { ...blankPageMenu, show: false }
    );

    setSlugTouched(true);

    setEditing({
      type: 'page',
      id: x.id,
      oldUrl: url
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
    setPageMenu(blankPageMenu);
    setSlugTouched(false);

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
  const parentOptions = [...new Set(menus.map(m => m.parent_label).filter(Boolean))];

  const filteredEnquiries = enquiries.filter(x =>
    `${x.parent_name} ${x.email} ${x.phone} ${x.city} ${x.grade} ${x.message}`
      .toLowerCase()
      .includes(enquirySearch.trim().toLowerCase())
  );

  const tabs = [
    ['overview', 'Overview'],
    ['enquiries', 'Enquiries'],
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
                    onChange={e => {
                      const title = e.target.value;
                      setPage(prev => ({
                        ...prev,
                        title,
                        slug: slugTouched ? prev.slug : slugify(title)
                      }));
                    }}
                    required
                  />

                </label>

                <label>
                  URL slug (page address)

                  <input
                    value={page.slug}
                    onChange={e => {
                      setSlugTouched(true);
                      setPage(prev => ({
                        ...prev,
                        slug: e.target.value
                      }));
                    }}
                    placeholder="school-life"
                    required
                  />

                </label>

                <label>
                  Small heading above the title (optional)

                  <input
                    value={page.section}
                    onChange={e =>
                      setPage(prev => ({
                        ...prev,
                        section: e.target.value
                      }))
                    }
                    placeholder="pages"
                  />

                </label>

                <div className="admin-field">
                  <span className="admin-field-label">Page content</span>

                  <RichTextEditor
                    key={editing.id || 'new'}
                    value={page.content}
                    onChange={content =>
                      setPage(prev => ({ ...prev, content }))
                    }
                    uploadFile={file => upload(file, { anyFile: true, full: true })}
                    onError={text => notify(text, true)}
                  />
                </div>

                <div className="admin-menu-box">

                  <label className="admin-check">
                    <input
                      type="checkbox"
                      checked={pageMenu.show}
                      onChange={e =>
                        setPageMenu(prev => ({ ...prev, show: e.target.checked }))
                      }
                    />
                    Show this page in the website header menu
                  </label>

                  {pageMenu.show && (
                    <>
                      <label>
                        Under which header menu?

                        <select
                          value={
                            pageMenu.parent ||
                            (parentOptions[0] ? parentOptions[0] : '__new__')
                          }
                          onChange={e =>
                            setPageMenu(prev => ({ ...prev, parent: e.target.value }))
                          }
                        >
                          {parentOptions.map(name => (
                            <option key={name} value={name}>{name}</option>
                          ))}
                          <option value="__new__">➕ Create a new header menu…</option>
                        </select>
                      </label>

                      {(pageMenu.parent === '__new__' || !parentOptions.length) && (
                        <label>
                          New header menu name

                          <input
                            value={pageMenu.newParent}
                            onChange={e =>
                              setPageMenu(prev => ({ ...prev, parent: '__new__', newParent: e.target.value }))
                            }
                            placeholder="Example: Admissions 2026"
                          />
                        </label>
                      )}

                      <label>
                        Link text in the menu (optional)

                        <input
                          value={pageMenu.label}
                          onChange={e =>
                            setPageMenu(prev => ({ ...prev, label: e.target.value }))
                          }
                          placeholder={page.title || 'Same as page title'}
                        />
                      </label>
                    </>
                  )}

                </div>

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
        {tab === 'enquiries' && (

          <section className="admin-card">

            <h2>Admission enquiries ({enquiries.length})</h2>

            <div className="admin-enquiry-tools">
              <input
                placeholder="Search name, phone, email, city..."
                value={enquirySearch}
                onChange={e => setEnquirySearch(e.target.value)}
              />
              <button type="button" onClick={loadEnquiries}>Refresh</button>
              <button
                type="button"
                onClick={() => downloadEnquiriesCsv(filteredEnquiries)}
                disabled={!filteredEnquiries.length}
              >
                Download Excel/CSV
              </button>
            </div>

            {enquiriesLoading && <p>Loading enquiries...</p>}

            {!enquiriesLoading && !filteredEnquiries.length && (
              <p>No enquiries found.</p>
            )}

            {!!filteredEnquiries.length && (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Parent name</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>City</th>
                      <th>Grade</th>
                      <th>Message</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEnquiries.map(x => (
                      <tr key={x.id}>
                        <td>{new Date(x.created_at).toLocaleString()}</td>
                        <td>{x.parent_name}</td>
                        <td><a href={`tel:${x.phone}`}>{x.phone}</a></td>
                        <td><a href={`mailto:${x.email}`}>{x.email}</a></td>
                        <td>{x.city}</td>
                        <td>{x.grade}</td>
                        <td>{x.message}</td>
                        <td>
                          <button
                            type="button"
                            className="danger"
                            onClick={async () => {
                              if (!window.confirm('Delete this enquiry?')) return;
                              try {
                                await api.delete(`/api/admin/enquiries/${x.id}`, auth);
                                setEnquiries(list => list.filter(item => item.id !== x.id));
                              } catch (e) {
                                notify('Could not delete enquiry.', true);
                              }
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </section>

        )}

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
                    list="parent-menu-options"
                    value={menu.parent_label}
                    onChange={e =>
                      setMenu(prev => ({
                        ...prev,
                        parent_label: e.target.value
                      }))
                    }
                  />

                  <datalist id="parent-menu-options">
                    {parentOptions.map(name => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>

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
                            `/api/admin/users/${x.id}`,
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
