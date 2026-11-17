
import React, { useEffect, useMemo, useState } from "react";
import siteImages from "../config/siteImages";
import SchoolFinder from "./SchoolFinder";
import { useSiteData, assetUrl } from "../utils/siteData";

export default function HeroSlider() {
    const [slide, setSlide] = useState(0);
    const { data, ready } = useSiteData();

    // Admin banners if there are any; the built-in banners only after we know there are none.
    const slides = useMemo(() => {
        const fromAdmin = (data?.banners || [])
            .filter(item => item.image_path)
            .map(item => assetUrl(item.image_path));
        if (fromAdmin.length) return fromAdmin;
        return ready ? siteImages.heroSlides : [];
    }, [data, ready]);

    useEffect(() => {
        const timer = setInterval(() => {
            setSlide(s => (s + 1) % Math.max(slides.length, 1));
        }, 6500);

        return () => clearInterval(timer);
    }, [slides.length]);

    const move = (n) => {
        if (!slides.length) return;
        setSlide(s => (s + n + slides.length) % slides.length);
    };

    return (
        <section id="home" className="hero-slider">

            {slides.map((url, i) => (
                <div
                    key={url}
                    className={`hero-slide ${slide === i ? "active" : ""}`}
                    style={{ backgroundImage: `url("${url}")` }}
                />
            ))}

            <div className="hero-shade" />

            <SchoolFinder />

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
