import React from "react";
import { Link } from "react-router-dom";
import CmsContent from "../../components/CmsContent";

// Design 3 - Elegant (cream, serif, burgundy + gold)
export default function ElegantTemplate({ c }) {
  return (
    <div className="se-page">
      <section className="se-hero">
        <div className="se-narrow">
          <span className="se-crumb">{c.board} &nbsp;•&nbsp; {c.city}</span>
          <h1>{c.name}</h1>
          <div className="se-rule"><span></span></div>
          <p className="se-tagline">{c.tagline}</p>
          <p className="se-intro">{c.intro}</p>
          <div className="se-actions">
            <Link className="se-btn se-btn-fill" to="/admissions/enquire">Enquire now</Link>
            <a className="se-btn se-btn-line" href="#se-contact">Contact</a>
          </div>
        </div>
        {c.heroImage && (
          <div className="se-wide"><img src={c.heroImage} alt={c.name} /></div>
        )}
      </section>

      <section className="se-stats">
        <div className="se-wide-row">
          {c.stats.map((s, i) => (<div key={i}><b>{s.value}</b><span>{s.label}</span></div>))}
        </div>
      </section>

      <section className="se-section">
        <div className="se-narrow se-center">
          <span className="se-kicker">Our story</span>
          <h2>{c.aboutTitle}</h2>
          <div className="se-rule"><span></span></div>
          <CmsContent html={c.aboutHtml} style={{ textAlign: "left" }} />
        </div>
      </section>

      <section className="se-section se-tint">
        <div className="se-container">
          <div className="se-center">
            <span className="se-kicker">Campus & facilities</span>
            <h2>Why families choose us</h2>
            <div className="se-rule"><span></span></div>
          </div>
          <div className="se-list">
            {c.facilities.map((f, i) => (
              <article key={i}>
                <b>{String(i + 1).padStart(2, "0")}</b>
                <div><h3>{f.title}</h3><p>{f.text}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {c.gallery.length > 0 && (
        <section className="se-section">
          <div className="se-container">
            <div className="se-center">
              <span className="se-kicker">Gallery</span>
              <h2>A glimpse of school life</h2>
              <div className="se-rule"><span></span></div>
            </div>
            <div className="se-gallery">
              {c.gallery.map((src, i) => (<img key={i} src={src} alt={`${c.name} photo ${i + 1}`} loading="lazy" />))}
            </div>
          </div>
        </section>
      )}

      <section className="se-section">
        <div className="se-narrow">
          <div className="se-center">
            <span className="se-kicker">Admissions</span>
            <h2>The admission journey</h2>
            <div className="se-rule"><span></span></div>
          </div>
          <ol className="se-steps">
            {c.steps.map((step, i) => (
              <li key={step.title}><b>{i + 1}</b><div><h3>{step.title}</h3><p>{step.text}</p></div></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="se-contact" id="se-contact">
        <div className="se-narrow se-center">
          <span className="se-kicker se-gold">Contact</span>
          <h2>Visit {c.name}</h2>
          <p>{c.contact.address}</p>
          <p>{c.contact.phone} &nbsp;•&nbsp; {c.contact.email}</p>
          <p>{c.contact.hours}</p>
          <Link className="se-btn se-btn-gold" to="/admissions/enquire">Enquire now</Link>
        </div>
      </section>
    </div>
  );
}
