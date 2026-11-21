import React from "react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api";

// Email: something@domain.tld (no spaces, TLD at least 2 letters)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

export default function Enquiry() {
  // Opened from a school page: /admissions/enquire?school=Name&board=CBSE&city=Hyderabad
  const [params] = useSearchParams();
  const schoolName = (params.get("school") || "").trim();
  const schoolBoard = (params.get("board") || "").trim();
  const schoolCity = (params.get("city") || "").trim();
  const schoolLabel = schoolName
    ? `${schoolName}${schoolBoard || schoolCity ? ` (${[schoolBoard, schoolCity].filter(Boolean).join(", ")})` : ""}`
    : "";

  const [form, setForm] = useState({ parentName: "", email: "", phone: "", city: schoolCity, grade: "", message: "" });
  const [status, setStatus] = useState({ loading: false, text: "", error: false });
  // a different school was chosen: fill the city again
  useEffect(() => {
    setForm(f => ({ ...f, city: schoolCity || f.city }));
  }, [schoolCity, schoolName]);

  const update = e => {
    const { name, value } = e.target;
    if (name === "phone") {
      // allow only digits, maximum 10
      setForm(f => ({ ...f, phone: value.replace(/\D/g, "").slice(0, 10) }));
      return;
    }
    setForm(f => ({ ...f, [name]: value }));
  };

  async function submit(e) {
    e.preventDefault();
    if (status.loading) return; // block double submit

    const email = form.email.trim().toLowerCase();
    const phone = form.phone.trim();

    if (!EMAIL_RE.test(email)) {
      setStatus({ loading: false, text: "Please enter a valid email address.", error: true });
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      setStatus({ loading: false, text: "Phone number must be exactly 10 digits.", error: true });
      return;
    }

    setStatus({ loading: true, text: "", error: false });
    try {
      const response = await api.post("/api/enquiries", { ...form, email, phone, schoolName: schoolLabel });
      setStatus({ loading: false, text: response.data.message, error: false });
      setForm({ parentName: "", email: "", phone: "", city: schoolCity, grade: "", message: "" });
    } catch (error) {
      const message = error.response?.data?.message || "Could not connect to the server. Check that Fastify and MySQL are running.";
      setStatus({ loading: false, text: message, error: true });
    }
  }

  return <section id="contact" className="section-pad enquiry-section"><div className="container"><div className="row g-5"><div className="col-lg-5">{schoolName ? <><span className="eyebrow">ENQUIRY FOR</span><h2 className="section-title">{schoolName}</h2><p className="body-copy">{[schoolBoard, schoolCity].filter(Boolean).join(" · ")}<br />Tell us a little about your family and the admissions team of this school will get back to you.</p><p className="body-copy"><Link to="/admissions/enquire">Enquire for a different school</Link></p></> : <><span className="eyebrow">TAKE THE FIRST STEP</span><h2 className="section-title">Let's shape their <em>tomorrow.</em></h2><p className="body-copy">Tell us a little about your family and our admissions team will help you explore the next steps.</p></>}<div className="contact-detail"><i className="bi bi-telephone"></i><div><small>CALL ADMISSIONS</small><strong>+91 80000 00000</strong></div></div><div className="contact-detail"><i className="bi bi-envelope"></i><div><small>EMAIL US</small><strong>admissions@example.edu</strong></div></div></div>
    <div className="col-lg-7"><form className="enquiry-form" onSubmit={submit}><h3>Admission enquiry</h3><p>Fields marked * are required.</p><div className="row g-3">
      {schoolName && <div className="col-12"><label className="form-label">School</label><input className="form-control" value={schoolLabel} readOnly style={{ background: "#f3f6fa", fontWeight: 600 }} /></div>}
      <div className="col-md-6"><label className="form-label">Parent / Guardian name *</label><input className="form-control" name="parentName" value={form.parentName} onChange={update} required maxLength="120" placeholder="Your full name" /></div>
      <div className="col-md-6"><label className="form-label">Email address *</label><input className="form-control" type="email" name="email" value={form.email} onChange={update} required placeholder="name@example.com" autoComplete="email" /></div>
      <div className="col-md-6"><label className="form-label">Phone number *</label><input className="form-control" type="tel" name="phone" value={form.phone} onChange={update} required inputMode="numeric" maxLength="10" pattern="[0-9]{10}" title="Enter exactly 10 digits" placeholder="10-digit mobile number" autoComplete="tel-national" /></div>
      <div className="col-md-6"><label className="form-label">Preferred city *</label><input className="form-control" name="city" value={form.city} onChange={update} required placeholder="Enter city" /></div>
      <div className="col-12"><label className="form-label">Grade / Class *</label><select className="form-select" name="grade" value={form.grade} onChange={update} required><option value="">Select grade</option>{["Pre-primary", "Class 1–5", "Class 6–8", "Class 9–10", "Class 11–12"].map(x => <option key={x}>{x}</option>)}</select></div>
      <div className="col-12"><label className="form-label">Message</label><textarea className="form-control" rows="3" name="message" value={form.message} onChange={update} placeholder="How can we help?"></textarea></div>
      <div className="col-12 d-flex flex-wrap align-items-center gap-3"><button className="btn btn-primary rounded-pill px-4" disabled={status.loading}>{status.loading ? "Submitting..." : "Submit enquiry"} <i className="bi bi-arrow-right ms-2"></i></button>{status.text && <span className={status.error ? "form-status error" : "form-status"}>{status.text}</span>}</div>
    </div></form></div></div></div></section>;
}