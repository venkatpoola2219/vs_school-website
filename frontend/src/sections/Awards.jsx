import React from "react";
export default function Awards() {
  const awards = ["Excellence in Education", "Outstanding School Community", "Innovation in Learning", "Student Wellbeing"];
  return <section className="section-pad awards-section"><div className="container"><div className="row align-items-end mb-4"><div className="col-md-8"><span className="eyebrow">RECOGNITION & MILESTONES</span><h2 className="section-title mb-0">Proud of the <em>journey.</em></h2></div><div className="col-md-4 text-md-end mt-3 mt-md-0"><span className="body-copy">Celebrating the people and progress that make our community special.</span></div></div><div className="row g-3">{awards.map((a, i) => <div className="col-6 col-lg-3" key={a}><div className="award-card"><div className="award-seal"><i className="bi bi-award"></i><span>BF</span></div><small>RECOGNITION 0{i + 1}</small><h3>{a}</h3></div></div>)}</div></div></section>;
}
