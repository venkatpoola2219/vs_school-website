import React from "react";
export default function Statistics() {
  const stats = [["50+", "Years of learning"], ["2.5L+", "Learners inspired"], ["16K+", "Dedicated educators"], ["40+", "Cities connected"], ["150+", "Learning campuses"]];
  return <section className="stats-section"><div className="container"><div className="stats-heading"><span className="eyebrow light">A LEGACY OF LEARNING</span><h2>Growing futures, <em>together.</em></h2></div><div className="row g-0">{stats.map(([number, label]) => <div className="col-6 col-lg stat-item" key={label}><strong>{number}</strong><span>{label}</span></div>)}</div></div></section>;
}
