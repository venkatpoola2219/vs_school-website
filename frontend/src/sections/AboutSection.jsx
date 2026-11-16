import React from "react";
export default function About() {
  return <section id="about" className="section-pad"><div className="container"><div className="row align-items-center g-5">
    <div className="col-lg-6"><div className="about-photo"><img src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1100&q=85" alt="Students learning together" /><div className="photo-caption"><strong>Every child matters.</strong><span>Every possibility counts.</span></div></div></div>
    <div className="col-lg-6"><span className="eyebrow">WELCOME TO BRIGHT FUTURE</span><h2 className="section-title">More than a school.<br /><em>A world of possibility.</em></h2><p className="lead-copy">We believe education should do more than prepare children for exams. It should prepare them for life.</p><p className="body-copy">Our learning community brings together caring educators, inspiring experiences and a supportive environment where every student is encouraged to discover their strengths and shape their own future.</p><a href="#approach" className="text-link">Discover our philosophy <i className="bi bi-arrow-up-right"></i></a></div>
  </div></div></section>;
}
