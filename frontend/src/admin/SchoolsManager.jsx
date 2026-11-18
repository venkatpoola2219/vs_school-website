import React, { useEffect, useState } from 'react';
import api from '../api';
import RichTextEditor from '../components/RichTextEditor';
import { assetUrl } from '../utils/siteData';
import { SCHOOL_TEMPLATES, FACILITY_ICONS } from '../pages/schoolTemplates/content';

const slugify = (text = '') =>
  String(text).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const blankData = () => ({
  tagline: '',
  intro: '',
  hero_image: '',
  stats: [1, 2, 3, 4].map(() => ({ value: '', label: '' })),
  about_title: '',
  about_html: '',
  facilities: [],
  gallery: [],
  contact: { address: '', phone: '', email: '', hours: '' }
});

const blankForm = () => ({
  id: null,
  name: '',
  slug: '',
  slugTouched: false,
  boardId: '',
  newBoard: '',
  cityId: '',
  newCity: '',
  template: 'classic',
  data: blankData()
});

function formFromSchool(school) {
  const base = blankData();
  const d = school.data || {};
  const stats = Array.isArray(d.stats) ? d.stats.slice(0, 4) : [];
  while (stats.length < 4) stats.push({ value: '', label: '' });
  return {
    id: school.id,
    name: school.name,
    slug: school.slug,
    slugTouched: true,
    boardId: String(school.board_id),
    newBoard: '',
    cityId: String(school.city_id),
    newCity: '',
    template: school.template || 'classic',
    data: {
      ...base,
      ...d,
      stats,
      facilities: Array.isArray(d.facilities) ? d.facilities : [],
      gallery: Array.isArray(d.gallery) ? d.gallery : [],
      contact: { ...base.contact, ...(d.contact || {}) }
    }
  };
}

export default function SchoolsManager({ auth, upload, notify }) {
  const [schools, setSchools] = useState([]);
  const [boards, setBoards] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(blankForm());

  async function load() {
    setLoading(true);
    try {
      const r = await api.get('/api/admin/schools', auth);
      setSchools(r.data.schools);
      setBoards(r.data.boards);
      setCities(r.data.cities);
    } catch (e) {
      notify(e.response?.data?.message || 'Could not load schools.', true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const setData = (key, value) =>
    setForm(prev => ({ ...prev, data: { ...prev.data, [key]: value } }));

  const setContact = (key, value) =>
    setForm(prev => ({ ...prev, data: { ...prev.data, contact: { ...prev.data.contact, [key]: value } } }));

  const setStat = (index, key, value) =>
    setForm(prev => ({
      ...prev,
      data: {
        ...prev.data,
        stats: prev.data.stats.map((s, i) => (i === index ? { ...s, [key]: value } : s))
      }
    }));

  const setFacility = (index, key, value) =>
    setForm(prev => ({
      ...prev,
      data: {
        ...prev.data,
        facilities: prev.data.facilities.map((f, i) => (i === index ? { ...f, [key]: value } : f))
      }
    }));

  const uploadErrorText = err => err.response?.data?.message || 'Upload failed. Please try again.';

  async function pickHero(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const path = await upload(file);
      if (path) setData('hero_image', path);
    } catch (err) {
      notify(uploadErrorText(err), true);
    }
  }

  async function pickGallery(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    for (const file of files) {
      try {
        const path = await upload(file);
        if (path) setForm(prev => ({ ...prev, data: { ...prev.data, gallery: [...prev.data.gallery, path] } }));
      } catch (err) {
        notify(uploadErrorText(err), true);
        break;
      }
    }
  }

  function startNew() {
    setForm(blankForm());
    notify('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function edit(school) {
    setForm(formFromSchool(school));
    notify('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function save(e) {
    e.preventDefault();
    notify('');

    if (!form.name.trim()) {
      notify('Enter the school name.', true);
      return;
    }

    const board = form.boardId === '__new__' || !form.boardId ? { name: form.newBoard } : { id: form.boardId };
    const city = form.cityId === '__new__' || !form.cityId ? { name: form.newCity } : { id: form.cityId };

    if (!board.id && !board.name.trim()) {
      notify('Choose a board, or type a new board name.', true);
      return;
    }
    if (!city.id && !city.name.trim()) {
      notify('Choose a city, or type a new city name.', true);
      return;
    }

    const data = {
      ...form.data,
      stats: form.data.stats.filter(s => s.value.trim() || s.label.trim()),
      facilities: form.data.facilities.filter(f => f.title.trim() || f.text.trim())
    };

    const payload = {
      name: form.name.trim(),
      slug: slugify(form.slug || form.name),
      board,
      city,
      template: form.template,
      data
    };

    setSaving(true);
    try {
      if (form.id) await api.put(`/api/admin/schools/${form.id}`, payload, auth);
      else await api.post('/api/admin/schools', payload, auth);
      setForm(blankForm());
      await load();
      notify('School page saved successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      notify(err.response?.data?.message || 'Could not save the school.', true);
    } finally {
      setSaving(false);
    }
  }

  async function remove(school) {
    if (!window.confirm(`Delete "${school.name}" and its page? It will no longer appear in the school finder.`)) return;
    try {
      await api.delete(`/api/admin/schools/${school.id}`, auth);
      if (form.id === school.id) setForm(blankForm());
      await load();
      notify('School deleted successfully.');
    } catch (err) {
      notify(err.response?.data?.message || 'Delete failed.', true);
    }
  }

  const pageLink = school => `/${school.board_slug}/${school.city_slug}/${school.slug}`;
  const templateName = id => SCHOOL_TEMPLATES.find(t => t.id === id)?.name || 'Classic';

  return (
    <div className="admin-columns">
      <section className="admin-card">
        <h2>{form.id ? 'Edit school page' : 'Add school'}</h2>

        <form className="admin-form" onSubmit={save}>
          <h3 className="admin-subhead">1. School details</h3>

          <label>
            School name
            <input
              value={form.name}
              onChange={e => {
                const name = e.target.value;
                setForm(prev => ({ ...prev, name, slug: prev.slugTouched ? prev.slug : slugify(name) }));
              }}
              required
            />
          </label>

          <label>
            Page address (slug)
            <input
              value={form.slug}
              onChange={e => setForm(prev => ({ ...prev, slug: e.target.value, slugTouched: true }))}
              placeholder="oakridge-international-school"
            />
          </label>

          <label>
            Board
            <select
              value={form.boardId}
              onChange={e => setForm(prev => ({ ...prev, boardId: e.target.value }))}
            >
              <option value="">Select board…</option>
              {boards.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
              <option value="__new__">➕ New board…</option>
            </select>
          </label>

          {form.boardId === '__new__' && (
            <label>
              New board name
              <input
                value={form.newBoard}
                onChange={e => setForm(prev => ({ ...prev, newBoard: e.target.value }))}
                placeholder="Example: IB"
              />
            </label>
          )}

          <label>
            City
            <select
              value={form.cityId}
              onChange={e => setForm(prev => ({ ...prev, cityId: e.target.value }))}
            >
              <option value="">Select city…</option>
              {cities.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
              <option value="__new__">➕ New city…</option>
            </select>
          </label>

          {form.cityId === '__new__' && (
            <label>
              New city name
              <input
                value={form.newCity}
                onChange={e => setForm(prev => ({ ...prev, newCity: e.target.value }))}
                placeholder="Example: Warangal"
              />
            </label>
          )}

          <h3 className="admin-subhead">2. Page design</h3>

          <div className="tpl-grid">
            {SCHOOL_TEMPLATES.map(t => (
              <button
                type="button"
                key={t.id}
                className={`tpl-card tpl-${t.id} ${form.template === t.id ? 'selected' : ''}`}
                onClick={() => setForm(prev => ({ ...prev, template: t.id }))}
              >
                <span className="tpl-swatch"><i></i><i></i><i></i></span>
                <b>{t.name}</b>
                <small>{t.description}</small>
              </button>
            ))}
          </div>

          <h3 className="admin-subhead">3. Top section</h3>

          <label>
            Tagline (short line under the school name)
            <input
              value={form.data.tagline}
              onChange={e => setData('tagline', e.target.value)}
              placeholder="A place where every child belongs"
            />
          </label>

          <label>
            Introduction (2-3 lines)
            <textarea
              rows={3}
              value={form.data.intro}
              onChange={e => setData('intro', e.target.value)}
            />
          </label>

          <div className="admin-field">
            <span className="admin-field-label">Main photo (top of the page)</span>
            {form.data.hero_image && (
              <img className="banner-preview" src={assetUrl(form.data.hero_image)} alt="Main" />
            )}
            <input type="file" accept="image/*" onChange={pickHero} />
            {form.data.hero_image && (
              <button type="button" className="admin-link-button" onClick={() => setData('hero_image', '')}>
                Remove photo
              </button>
            )}
          </div>

          <h3 className="admin-subhead">4. Key numbers (up to 4)</h3>

          {form.data.stats.map((s, i) => (
            <div className="admin-row-2" key={i}>
              <input
                value={s.value}
                onChange={e => setStat(i, 'value', e.target.value)}
                placeholder="Number, e.g. 1,500+"
              />
              <input
                value={s.label}
                onChange={e => setStat(i, 'label', e.target.value)}
                placeholder="Label, e.g. Students"
              />
            </div>
          ))}

          <h3 className="admin-subhead">5. About the school</h3>

          <label>
            Heading
            <input
              value={form.data.about_title}
              onChange={e => setData('about_title', e.target.value)}
              placeholder="A place where every child belongs"
            />
          </label>

          <div className="admin-field">
            <span className="admin-field-label">Text, photos and files</span>
            <RichTextEditor
              key={form.id || 'new'}
              value={form.data.about_html}
              onChange={html => setData('about_html', html)}
              uploadFile={file => upload(file, { anyFile: true, full: true })}
              onError={text => notify(text, true)}
            />
          </div>

          <h3 className="admin-subhead">6. Facilities</h3>

          {!form.data.facilities.length && (
            <p className="admin-hint">No facilities added. Sample facilities are shown until you add your own.</p>
          )}

          {form.data.facilities.map((f, i) => (
            <div className="admin-facility" key={i}>
              <select value={f.icon || 'bi-star'} onChange={e => setFacility(i, 'icon', e.target.value)}>
                {FACILITY_ICONS.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <input
                value={f.title}
                onChange={e => setFacility(i, 'title', e.target.value)}
                placeholder="Title, e.g. Science Labs"
              />
              <input
                value={f.text}
                onChange={e => setFacility(i, 'text', e.target.value)}
                placeholder="One line description"
              />
              <button
                type="button"
                className="admin-icon-delete"
                title="Remove"
                onClick={() => setData('facilities', form.data.facilities.filter((_, idx) => idx !== i))}
              >
                ✕
              </button>
            </div>
          ))}

          <button
            type="button"
            className="admin-link-button"
            onClick={() => setData('facilities', [...form.data.facilities, { icon: 'bi-star', title: '', text: '' }])}
          >
            ➕ Add facility
          </button>

          <h3 className="admin-subhead">7. Photo gallery</h3>

          {!!form.data.gallery.length && (
            <div className="admin-gallery">
              {form.data.gallery.map((path, i) => (
                <div key={path + i}>
                  <img src={assetUrl(path)} alt={`Gallery ${i + 1}`} />
                  <button
                    type="button"
                    title="Remove photo"
                    onClick={() => setData('gallery', form.data.gallery.filter((_, idx) => idx !== i))}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <input type="file" accept="image/*" multiple onChange={pickGallery} />
          <small className="admin-hint">You can choose many photos at once.</small>

          <h3 className="admin-subhead">8. Contact details</h3>

          <label>
            Address
            <input value={form.data.contact.address} onChange={e => setContact('address', e.target.value)} />
          </label>
          <label>
            Phone
            <input value={form.data.contact.phone} onChange={e => setContact('phone', e.target.value)} />
          </label>
          <label>
            Email
            <input value={form.data.contact.email} onChange={e => setContact('email', e.target.value)} />
          </label>
          <label>
            Visiting hours
            <input
              value={form.data.contact.hours}
              onChange={e => setContact('hours', e.target.value)}
              placeholder="Mon – Sat, 9:00 AM – 4:00 PM"
            />
          </label>

          <div className="admin-actions">
            <button className="admin-primary" disabled={saving}>
              {saving ? 'Saving…' : form.id ? 'Update school page' : 'Add school'}
            </button>
            <button type="button" onClick={startNew}>Clear</button>
          </div>
        </form>
      </section>

      <section className="admin-card">
        <h2>Schools ({schools.length})</h2>

        <p className="admin-hint">
          Schools added here appear in the home page “Find a school” selector.
        </p>

        {loading && <p>Loading schools…</p>}
        {!loading && !schools.length && <p>No schools added yet.</p>}

        {schools.map(s => (
          <div className="admin-list-row admin-school-row" key={s.id}>
            <div>
              <b>{s.name}</b>
              <small>{s.board} · {s.city} · {templateName(s.template)} design</small>
            </div>
            <a href={pageLink(s)} target="_blank" rel="noreferrer" className="admin-link-button">View</a>
            <button type="button" onClick={() => edit(s)}>Edit</button>
            <button type="button" className="danger-text" onClick={() => remove(s)}>Delete</button>
          </div>
        ))}
      </section>
    </div>
  );
}
