import React from "react";
import { Link } from "react-router-dom";
import CmsContent from "../../components/CmsContent";

// Design 4 - Bold (dark with yellow highlights)
export default function BoldTemplate({ c }) {
  const initials = c.name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  return (
    <div className="sb-page">
      <section className="sb-hero">
        <div className="sb-wrap sb-hero-grid">
          <div>
            <span className="sb-tag">{c.board} / {c.city}</span>
            <h1>{c.name}</h1>
            <p className="sb-tagline">{c.tagline}</p>
            <p className="sb-intro">{c.intro}</p>
            <div className="sb-actions">
              <Link className="sb-btn sb-btn-yellow" to="/admissions/enquire">Enquire now →</Link>
              <a className="sb-btn sb-btn-ghost" href="#sb-contact">Contact</a>
            </div>
          </div>
          <div className="sb-frame">
            {c.heroImage ? <img src={c.heroImage} alt={c.name} /> : <div className="sb-initials">{initials}</div>}
          </div>
        </div>
      </section>

      <section className="sb-stats">
        <div className="sb-wrap sb-stats-row">
          {c.stats.map((s, i) => (<div key={i}><b>{s.value}</b><span>{s.label}</span></div>))}
        </div>
      </section>

      <section className="sb-section">
        <div className="sb-wrap sb-about">
          <div>
            <span className="sb-tag">About</span>
            <h2>{c.aboutTitle}</h2>
          </div>
          <div className="sb-panel"><CmsContent html={c.aboutHtml} /></div>
        </div>
      </section>

      <section className="sb-section sb-alt">
        <div className="sb-wrap">
          <span className="sb-tag">Facilities</span>
          <h2>Built for big ideas</h2>
          <div className="sb-cards">
            {c.facilities.map((f, i) => (
              <article key={i}>
                <i className={`bi ${f.icon || "bi-star"}`} aria-hidden="true"></i>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {c.gallery.length > 0 && (
        <section className="sb-section">
          <div className="sb-wrap">
            <span className="sb-tag">Gallery</span>
            <h2>On campus</h2>
            <div className="sb-gallery">
              {c.gallery.map((src, i) => (<img key={i} src={src} alt={`${c.name} photo ${i + 1}`} loading="lazy" />))}
            </div>
          </div>
        </section>
      )}

      <section className="sb-section sb-alt">
        <div className="sb-wrap">
          <span className="sb-tag">Admissions</span>
          <h2>How to join</h2>
          <div className="sb-steps">
            {c.steps.map((step, i) => (
              <div key={step.title}><b>{String(i + 1).padStart(2, "0")}</b><h3>{step.title}</h3><p>{step.text}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="sb-contact" id="sb-contact">
        <div className="sb-wrap sb-contact-grid">
          <div>
            <h2>Visit {c.name}</h2>
            <ul>
              <li><i className="bi bi-geo-alt-fill"></i>{c.contact.address}</li>
              <li><i className="bi bi-telephone-fill"></i>{c.contact.phone}</li>
              <li><i className="bi bi-envelope-fill"></i>{c.contact.email}</li>
              <li><i className="bi bi-clock-fill"></i>{c.contact.hours}</li>
            </ul>
          </div>
          <Link className="sb-btn sb-btn-dark" to="/admissions/enquire">Enquire now →</Link>
        </div>
      </section>
    </div>
  );
}
