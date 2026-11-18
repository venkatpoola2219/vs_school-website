import React from "react";
import { Link } from "react-router-dom";
import CmsContent from "../../components/CmsContent";

// Design 1 - Classic (navy + orange)
export default function ClassicTemplate({ c }) {
  return (
    <div className="school-page">
      <section
        className="school-hero"
        style={c.heroImage ? { backgroundImage: `linear-gradient(135deg, #183b78ee, #24468fcc), url("${c.heroImage}")`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
      >
        <div className="school-wrap">
          <nav aria-label="Breadcrumb" className="school-crumbs">
            <Link to="/">Home</Link><span>/</span><span>{c.board}</span><span>/</span><span>{c.city}</span>
          </nav>
          <small className="school-eyebrow">{c.board} · {c.city}</small>
          <h1>{c.name}</h1>
          <p>{c.intro}</p>
          <div className="school-hero-actions">
            <Link className="school-btn school-btn-primary" to="/admissions/enquire">Enquire Now</Link>
            <a className="school-btn school-btn-ghost" href="#school-contact">Contact School</a>
          </div>
        </div>
      </section>

      <section className="school-wrap">
        <div className="school-stats">
          {c.stats.map((s, i) => (<div key={i}><b>{s.value}</b><span>{s.label}</span></div>))}
        </div>
      </section>

      <section className="school-section">
        <div className="school-wrap school-about">
          <div>
            <small className="school-eyebrow">ABOUT THE SCHOOL</small>
            <h2>{c.aboutTitle}</h2>
          </div>
          <CmsContent html={c.aboutHtml} />
        </div>
      </section>

      <section className="school-section school-muted">
        <div className="school-wrap">
          <small className="school-eyebrow">CAMPUS & FACILITIES</small>
          <h2>Why families choose us</h2>
          <div className="school-grid">
            {c.facilities.map((f, i) => (
              <article className="school-card" key={i}>
                <i className={`bi ${f.icon || "bi-star"}`} aria-hidden="true"></i>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {c.gallery.length > 0 && (
        <section className="school-section">
          <div className="school-wrap">
            <small className="school-eyebrow">PHOTO GALLERY</small>
            <h2>Life at {c.name}</h2>
            <div className="school-gallery">
              {c.gallery.map((src, i) => (<img key={i} src={src} alt={`${c.name} photo ${i + 1}`} loading="lazy" />))}
            </div>
          </div>
        </section>
      )}

      <section className="school-section">
        <div className="school-wrap">
          <small className="school-eyebrow">ADMISSIONS</small>
          <h2>Simple admission process</h2>
          <ol className="school-steps">
            {c.steps.map((step, i) => (
              <li key={step.title}><span>{i + 1}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="school-section school-muted" id="school-contact">
        <div className="school-wrap school-contact">
          <div>
            <small className="school-eyebrow">CONTACT</small>
            <h2>Visit {c.name}</h2>
            <ul>
              <li><i className="bi bi-geo-alt"></i> {c.contact.address}</li>
              <li><i className="bi bi-telephone"></i> {c.contact.phone}</li>
              <li><i className="bi bi-envelope"></i> {c.contact.email}</li>
              <li><i className="bi bi-clock"></i> {c.contact.hours}</li>
            </ul>
          </div>
          <div className="school-cta">
            <h3>Admissions are open</h3>
            <p>Share your details and our admissions team will call you back.</p>
            <Link className="school-btn school-btn-primary" to="/admissions/enquire">Enquire Now</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
