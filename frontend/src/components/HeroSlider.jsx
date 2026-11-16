
import React, { useEffect, useState } from "react";
import siteImages from "../config/siteImages";
import SchoolFinder from "./SchoolFinder";
import api from "../api";

export default function HeroSlider() {
  const [slide, setSlide] = useState(0);
  const [slides, setSlides] = useState(siteImages.heroSlides);

  useEffect(() => {
    api.get("/site-data").then(({data}) => {
      if (data.banners?.length) setSlides(data.banners.map(item => item.image_path.startsWith("http") ? item.image_path : `${api.defaults.baseURL.replace("/api", "")}${item.image_path}`));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(
      () => setSlide(s => (s + 1) % Math.max(slides.length, 1)),
      6500
    );

    return () => clearInterval(timer);
  }, [slides.length]);

  const move = n => setSlide(s => (s + n + slides.length) % slides.length);

  return (
    <section id="home" className="hero-slider">

      {/* Hero Background Slides */}
      {slides.map((url, i) => (
        <div
          key={url}
          className={`hero-slide ${slide === i ? "active" : ""}`}
          style={{ backgroundImage: `url("${url}")` }}
        />
      ))}

      <div className="hero-shade" />

      {/* School Finder */}
      <SchoolFinder />

      {/* Slider Arrows */}
      <button
        className="slider-arrow previous"
        onClick={() => move(-1)}
        aria-label="Previous slide"
      >
        ‹
      </button>

      <button
        className="slider-arrow next"
        onClick={() => move(1)}
        aria-label="Next slide"
      >
        ›
      </button>

      {/* Slider Dots */}
      <div className="slider-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={slide === i ? "selected" : ""}
            onClick={() => setSlide(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

    </section>
  );
}
