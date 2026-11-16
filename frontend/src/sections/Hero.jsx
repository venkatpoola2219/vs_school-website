
import React, { useState } from "react";
import siteImages from "../config/siteImages";
import SchoolFinder from "./SchoolFinderaq";

const slides = [
  {
    kicker: "YOUR CHILD'S FUTURE STARTS HERE",
    title: <>Curiosity nurtured in school.<br /><em>Innovation unleashed in life.</em></>,
    desc: "Inspiring young minds to explore, create and achieve."
  },
  {
    kicker: "LEARNING FOR TOMORROW",
    title: <>Big dreams begin<br /><em>with great learning.</em></>,
    desc: "A place where every learner can discover their potential."
  }
];

export default function Hero() {
  const [index, setIndex] = useState(0);

  const slide = slides[index];

  const move = (n) =>
    setIndex(i => (i + n + slides.length) % slides.length);

  return (
    <section id="home" className="hero-section">

      {siteImages.heroBackground && (
        <img
          className="hero-background"
          src={siteImages.heroBackground}
          alt=""
        />
      )}

      <div className="hero-overlay" />

      {/* School Finder Component */}
      <SchoolFinder />

      {siteImages.heroPlane && (
        <img className="hero-plane" src={siteImages.heroPlane} alt="Airplane" />
      )}

      {siteImages.heroStudent && (
        <img className="hero-student" src={siteImages.heroStudent} alt="Student" />
      )}

      {siteImages.anniversaryBadge && (
        <img
          className="anniversary-badge"
          src={siteImages.anniversaryBadge}
          alt="Anniversary"
        />
      )}

      <div className="hero-copy" key={index}>
        <span className="hero-kicker">{slide.kicker}</span>
        <h1>{slide.title}</h1>
        <p>{slide.desc}</p>

        <a className="hero-cta" href="#admissions">
          Enquire now <span>↗</span>
        </a>

        <small className="terms-note">
          *Terms &amp; Conditions Apply
        </small>
      </div>

      <button
        className="hero-arrow hero-arrow-left"
        onClick={() => move(-1)}
        aria-label="Previous slide"
      >
        ‹
      </button>

      <button
        className="hero-arrow hero-arrow-right"
        onClick={() => move(1)}
        aria-label="Next slide"
      >
        ›
      </button>

      <div className="hero-caption">
        <strong>Inspiring the next generation</strong>
        <span>Curious minds. Confident futures.</span>
      </div>

    </section>
  );
}
