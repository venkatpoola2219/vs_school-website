import React from "react";
const news = [
  { tag: "CAMPUS LIFE", date: "12 NOV 2026", title: "A vibrant year of learning, discovery and new friendships", image: "photo-1509062522246-3755977927d7" },
  { tag: "ACHIEVEMENTS", date: "05 NOV 2026", title: "Our young innovators shine at the inter-school showcase", image: "photo-1427504494785-3a9ca7044f45" },
  { tag: "COMMUNITY", date: "28 OCT 2026", title: "Families come together for our annual learning festival", image: "photo-1529390079861-591de354faf5" }
];
export default function News() {
  return <section id="news" className="section-pad soft-bg"><div className="container"><div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-4"><div><span className="eyebrow">WHAT'S HAPPENING</span><h2 className="section-title mb-0">Stories from <em>our world.</em></h2></div><a className="text-link" href="#contact">View all updates <i className="bi bi-arrow-up-right"></i></a></div><div className="row g-4">{news.map(item => <div className="col-md-4" key={item.title}><article className="news-card"><img src={`https://images.unsplash.com/${item.image}?auto=format&fit=crop&w=900&q=80`} alt="School community news" /><div className="news-content"><div className="news-meta"><span>{item.tag}</span><span>{item.date}</span></div><h3>{item.title}</h3><a href="#contact" className="text-link">Read story <i className="bi bi-arrow-up-right"></i></a></div></article></div>)}</div></div></section>;
}
