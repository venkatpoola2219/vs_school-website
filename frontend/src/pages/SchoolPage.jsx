import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api";

// Page for one school: /:board/:city/:school  (for example /cbse/hyderabad/delhi-public-school)
// The school name, board and city come from the database. Everything else
// below is DUMMY CONTENT - replace the text in this file with real details.

const highlights = [
  { icon: "bi-laptop", title: "Smart Classrooms", text: "Bright, technology-enabled classrooms that make every lesson interactive." },
  { icon: "bi-trophy", title: "Sports & Fitness", text: "Playgrounds and coached programmes that build teamwork and confidence." },
  { icon: "bi-flask", title: "Science Labs", text: "Well-equipped laboratories for hands-on learning and curiosity." },
  { icon: "bi-book", title: "Library & Reading", text: "A quiet, welcoming library with books for every age and interest." },
  { icon: "bi-palette", title: "Arts & Culture", text: "Music, dance, drama and art to help every child express themselves." },
  { icon: "bi-bus-front", title: "Safe Transport", text: "Reliable, GPS-tracked school transport covering all major routes." }
];

const admissionSteps = [
  { title: "Enquire", text: "Fill in the enquiry form and our team will get in touch." },
  { title: "Campus Visit", text: "Meet the faculty and see the classrooms and facilities." },
  { title: "Interaction", text: "A friendly interaction with the student and parents." },
  { title: "Confirm Admission", text: "Complete the formalities and welcome to the school family." }
];

export default function SchoolPage() {
  const { board, city, school } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    setData(null);

    api
      .get(`/api/schools/${board}/${city}/${school}`)
      .then(({ data }) => active && setData(data))
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [board, city, school]);

  if (loading) {
    return (
      <section className="page-section" style={{ paddingTop: 170 }}>
        <div className="section-inner"><p>Loading school page...</p></div>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="page-section" style={{ paddingTop: 170 }}>
        <div className="section-inner">
          <small className="section-eyebrow">SCHOOL NOT FOUND</small>
          <h1>We couldn't find this school</h1>
          <p className="section-intro">Please go back and select a valid board, city and school.</p>
          <Link className="primary-button" to="/">Back to home</Link>
        </div>
      </section>
    );
  }

  const { name, board: boardName, city: cityName } = data;

  const stats = [
    ["1,500+", "Students"],
    ["90+", "Teachers"],
    ["Nursery – XII", "Classes"],
    [boardName, "Curriculum"]
  ];

  return (
    <div className="school-page">

      {/* Hero */}
      <section className="school-hero">
        <div className="school-wrap">
          <nav aria-label="Breadcrumb" className="school-crumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>{boardName}</span>
            <span>/</span>
            <span>{cityName}</span>
          </nav>

          <small className="school-eyebrow">{boardName} · {cityName}</small>
          <h1>{name}</h1>
          <p>
            Welcome to {name}, {cityName}. A nurturing school where children are
            encouraged to think, create and grow into confident, caring individuals.
          </p>

          <div className="school-hero-actions">
            <Link className="school-btn school-btn-primary" to="/admissions/enquire">Enquire Now</Link>
            <a className="school-btn school-btn-ghost" href="#school-contact">Contact School</a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="school-wrap">
        <div className="school-stats">
          {stats.map(([value, label]) => (
            <div key={label}>
              <b>{value}</b>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="school-section">
        <div className="school-wrap school-about">
          <div>
            <small className="school-eyebrow">ABOUT THE SCHOOL</small>
            <h2>A place where every child belongs</h2>
          </div>
          <div>
            <p>
              {name} follows the {boardName} curriculum and focuses on a balanced
              education that combines strong academics with sports, arts and
              life skills. Our classrooms are warm, our teachers are dedicated, and
              every student is supported to reach their full potential.
            </p>
            <p>
              This is sample content. Replace it with the school's real story,
              vision, mission and achievements.
            </p>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="school-section school-muted">
        <div className="school-wrap">
          <small className="school-eyebrow">CAMPUS & FACILITIES</small>
          <h2>Why families choose us</h2>

          <div className="school-grid">
            {highlights.map((item) => (
              <article className="school-card" key={item.title}>
                <i className={`bi ${item.icon}`} aria-hidden="true"></i>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Admissions */}
      <section className="school-section">
        <div className="school-wrap">
          <small className="school-eyebrow">ADMISSIONS</small>
          <h2>Simple admission process</h2>

          <ol className="school-steps">
            {admissionSteps.map((step, index) => (
              <li key={step.title}>
                <span>{index + 1}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Contact */}
      <section className="school-section school-muted" id="school-contact">
        <div className="school-wrap school-contact">
          <div>
            <small className="school-eyebrow">CONTACT</small>
            <h2>Visit {name}</h2>
            <ul>
              <li><i className="bi bi-geo-alt"></i> 123 Sample Road, {cityName}</li>
              <li><i className="bi bi-telephone"></i> +91 00000 00000</li>
              <li><i className="bi bi-envelope"></i> info@yourschool.example</li>
              <li><i className="bi bi-clock"></i> Mon – Sat, 9:00 AM – 4:00 PM</li>
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
