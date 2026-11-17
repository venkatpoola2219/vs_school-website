import React from "react";
import { useState } from "react";
import api from "../api";


export default function Enquiry() {
  const [form, setForm] = useState({ parentName: "", email: "", phone: "", city: "", grade: "", message: "" });
  const [status, setStatus] = useState({ loading: false, text: "", error: false });
  const update = e => setForm({ ...form, [e.target.name]: e.target.value });
  async function submit(e) {
    e.preventDefault();
    setStatus({ loading: true, text: "", error: false });
    try {
      const response = await api.post("/api/enquiries", form);
      setStatus({ loading: false, text: response.data.message, error: false });
      setForm({ parentName: "", email: "", phone: "", city: "", grade: "", message: "" });
    } catch (error) {
      const message = error.response?.data?.message || "Could not connect to the server. Check that Fastify and MySQL are running.";
      setStatus({ loading: false, text: message, error: true });
    }
  }
  return <section id="contact" className="section-pad enquiry-section"><div className="container"><div className="row g-5"><div className="col-lg-5"><span className="eyebrow">TAKE THE FIRST STEP</span><h2 className="section-title">Let's shape their <em>tomorrow.</em></h2><p className="body-copy">Tell us a little about your family and our admissions team will help you explore the next steps.</p><div className="contact-detail"><i className="bi bi-telephone"></i><div><small>CALL ADMISSIONS</small><strong>+91 80000 00000</strong></div></div><div className="contact-detail"><i className="bi bi-envelope"></i><div><small>EMAIL US</small><strong>admissions@example.edu</strong></div></div></div>
    <div className="col-lg-7"><form className="enquiry-form" onSubmit={submit}><h3>Admission enquiry</h3><p>Fields marked * are required.</p><div className="row g-3">
      <div className="col-md-6"><label className="form-label">Parent / Guardian name *</label><input className="form-control" name="parentName" value={form.parentName} onChange={update} required maxLength="120" placeholder="Your full name" /></div>
      <div className="col-md-6"><label className="form-label">Email address *</label><input className="form-control" type="email" name="email" value={form.email} onChange={update} required placeholder="name@example.com" /></div>
      <div className="col-md-6"><label className="form-label">Phone number *</label><input className="form-control" type="tel" name="phone" value={form.phone} onChange={update} required maxLength="30" placeholder="+91" /></div>
      <div className="col-md-6"><label className="form-label">Preferred city *</label><input className="form-control" name="city" value={form.city} onChange={update} required placeholder="Enter city" /></div>
      <div className="col-12"><label className="form-label">Grade / Class *</label><select className="form-select" name="grade" value={form.grade} onChange={update} required><option value="">Select grade</option>{["Pre-primary", "Class 1–5", "Class 6–8", "Class 9–10", "Class 11–12"].map(x => <option key={x}>{x}</option>)}</select></div>
      <div className="col-12"><label className="form-label">Message</label><textarea className="form-control" rows="3" name="message" value={form.message} onChange={update} placeholder="How can we help?"></textarea></div>
      <div className="col-12 d-flex flex-wrap align-items-center gap-3"><button className="btn btn-primary rounded-pill px-4" disabled={status.loading}>{status.loading ? "Submitting..." : "Submit enquiry"} <i className="bi bi-arrow-right ms-2"></i></button>{status.text && <span className={status.error ? "form-status error" : "form-status"}>{status.text}</span>}</div>
    </div></form></div></div></div></section>;
}
