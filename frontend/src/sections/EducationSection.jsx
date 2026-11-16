import React, { useState, useEffect } from "react";
const VIDEO_ID = "jVOnGjvgDd8";

export default function EducationSection() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!open) return;
        const onKey = e => e.key === "Escape" && setOpen(false);
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [open]);
    return (
        <section id="about" className="edu-section">
            <div className="container">
                <div className="row align-items-center g-5">
                    <div className="col-lg-7">
                        <div className="edu-content text-center">
                            <h2 className="edu-title">EDUCATION THAT SPARKS CHANGE</h2>
                            <span className="edu-line"></span>

                            <p>
                                We are one of India's leading K-12 institutions, providing academic excellence through dedicated educators focused on child-centred learning. The various <a href="#boards">education boards in India</a> offer different curriculums. We provide a range of options across top education boards in India, like CBSE, ICSE, and IGCSE, helping parents decide which one is the best in India for their child.
                            </p>
                            <p>
                                With multiple Ryan school branches in India, we ensure quality education nationwide. Through Ryan Worldwide School, we've established international partnerships, offering global exposure. Along with being recognized among the top international schools in Mumbai and top international schools in India, we also extend our reach to the top international schools in UAE, fulfilling the Ryan Group's global vision. Are you wondering which board is best in India? Our comprehensive approach across all boards ensures your child receives the best education tailored to their needs.
                            </p>
                            <p>
                                We have also reached out internationally, to establish friendship institutions all across the globe.
                            </p>

                            <a href="#about-us" className="edu-btn">Know More</a>
                        </div>
                    </div>

                    <div className="col-lg-5">
                        <button
                            type="button"
                            className="edu-video"
                            onClick={() => setOpen(true)}
                            aria-label="Play video"
                        >
                            <img
                                src={`https://img.youtube.com/vi/${VIDEO_ID}/hqdefault.jpg`}
                                alt="Welcome To Ryan International School"
                            />
                            <span className="play-btn"></span>
                        </button>

                        {open && (
                            <div className="video-modal" onClick={() => setOpen(false)}>
                                <button
                                    type="button"
                                    className="video-close"
                                    onClick={() => setOpen(false)}
                                    aria-label="Close video"
                                >
                                    &times;
                                </button>

                                <div className="video-modal-box" onClick={e => e.stopPropagation()}>
                                    <iframe
                                        src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0`}
                                        title="Welcome To Ryan International School"
                                        allow="autoplay; encrypted-media; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}