import React from "react";
export default function SectionPage({id,eyebrow,title,intro,items=[],muted=false}) {
 return <section id={id} className={`page-section ${muted?"section-muted":""}`}><div className="section-inner">
  <small className="section-eyebrow">{eyebrow}</small><h2>{title}</h2><p className="section-intro">{intro}</p>
  {!!items.length&&<div className="info-grid">{items.map((item,i)=><article className="info-card" key={item.title}><small>0{i+1}</small><h3>{item.title}</h3><p>{item.text}</p><a href={item.href||"#contact"}>Explore →</a></article>)}</div>}
 </div></section>;
}
