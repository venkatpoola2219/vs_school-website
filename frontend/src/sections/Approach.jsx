import React from "react";
export default function Approach() {
  const items = [
    ["bi-lightbulb", "Curiosity first", "We make space for questions, exploration and creative thinking."],
    ["bi-person-heart", "Every learner matters", "Personal attention and encouragement help every child grow."],
    ["bi-globe-asia-australia", "A wider world", "Real-world experiences help students become thoughtful global citizens."]
  ];
  return <section id="approach" className="section-pad soft-bg"><div className="container"><div className="text-center section-intro"><span className="eyebrow">THE BRIGHT FUTURE WAY</span><h2 className="section-title">Learning for a <em>changing world.</em></h2><p>Strong foundations. Open minds. Skills for a lifetime.</p></div><div className="row g-4 mt-3">{items.map(([icon, title, desc], i) => <div className="col-md-4" key={title}><article className="approach-card"><div className="approach-icon"><i className={`bi ${icon}`}></i></div><span className="card-number">0{i + 1}</span><h3>{title}</h3><p>{desc}</p></article></div>)}</div></div></section>;
}
