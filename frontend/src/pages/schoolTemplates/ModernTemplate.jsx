import React from "react";
import { Link } from "react-router-dom";
import CmsContent from "../../components/CmsContent";

// Design 2 - Modern (full-width photo header, teal)
export default function ModernTemplate({ c }) {
  const sideImage = c.gallery[0] || c.heroImage;
  const photos = c.gallery.slice(sideImage === c.gallery[0] ? 1 : 0);

  return (
    <div className="sm-page">
      <section
        className="sm-hero"
        style={c.heroImage ? { backgroundImage: `linear-gradient(180deg, #04302b99 0%, #04302bdd 100%), url("${c.heroImage}")` } : undefined}
      >
        <div className="sm-wrap">
          <span className="sm-pill">{c.board} · {c.city}</span>
          <h1>{c.name}</h1>
          <p className="sm-tagline">{c.tagline}</p>
          <p className="sm-intro">{c.intro}</p>
          <div className="sm-actions">
            <Link className="sm-btn sm-btn-solid" to={c.enquireUrl}>Apply for admission</Link>
            <a className="sm-btn sm-btn-line" href="#sm-contact">Get in touch</a>
          </div>
        </div>
      </section>

      <div className="sm-wrap">
        <div className="sm-stats">
          {c.stats.map((s, i) => (<div key={i}><b>{s.value}</b><span>{s.label}</span></div>))}
        </div>
      </div>

      <section className="sm-section">
        <div className="sm-wrap sm-about">
          <div>
            <span className="sm-kicker">About us</span>
            <h2>{c.aboutTitle}</h2>
            <CmsContent html={c.aboutHtml} />
          </div>
          <div className="sm-about-visual">
            {sideImage ? <img src={sideImage} alt={c.name} /> : <div className="sm-quote">“{c.tagline}”</div>}
          </div>
        </div>
      </section>

      <section className="sm-section sm-dark">
        <div className="sm-wrap">
          <span className="sm-kicker">Campus & facilities</span>
          <h2>Everything a child needs to thrive</h2>
          <div className="sm-tiles">
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

      {photos.length > 0 && (
        <section className="sm-section">
          <div className="sm-wrap">
            <span className="sm-kicker">Gallery</span>
            <h2>Moments from our campus</h2>
            <div className="sm-gallery">
              {photos.map((src, i) => (<a key={i} href={src} target="_blank" rel="noreferrer"><img src={src} alt={`${c.name} photo ${i + 1}`} loading="lazy" /></a>))}
            </div>
          </div>
        </section>
      )}

      <section className="sm-section sm-soft">
        <div className="sm-wrap">
          <span className="sm-kicker">Admissions</span>
          <h2>Join us in four easy steps</h2>
          <div className="sm-timeline">
            {c.steps.map((step, i) => (
              <div key={step.title}><em>{i + 1}</em><h3>{step.title}</h3><p>{step.text}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="sm-section" id="sm-contact">
        <div className="sm-wrap sm-contact">
          <div>
            <span className="sm-kicker">Contact</span>
            <h2>Come and visit us</h2>
            <ul>
              <li><i className="bi bi-geo-alt-fill"></i>{c.contact.address}</li>
              <li><i className="bi bi-telephone-fill"></i>{c.contact.phone}</li>
              <li><i className="bi bi-envelope-fill"></i>{c.contact.email}</li>
              <li><i className="bi bi-clock-fill"></i>{c.contact.hours}</li>
            </ul>
          </div>
          <div className="sm-cta">
            <h3>Admissions open</h3>
            <p>Tell us about your child and we will call you back.</p>
            <Link className="sm-btn sm-btn-solid" to={c.enquireUrl}>Enquire now</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
