import React from "react"; import SectionPage from "../components/SectionPage";
export default function AdmissionsPage(){return <>
 <SectionPage id="admission-process" eyebrow="ADMISSIONS" title="Begin your admission journey" intro="Guide parents through eligibility, documents, important dates and application steps." items={[{title:"Admission Process",text:"Explain the steps to apply for admission."},{title:"Enquire Now",text:"Connect parents with your admissions team."},{title:"Fee Information",text:"Add fee structure and payment details."},{title:"FAQs",text:"Answer common admission questions."}]}/>
 <section id="admissions" className="page-section admission-callout"><div className="section-inner"><small className="section-eyebrow">ENQUIRE NOW</small><h2>Find the right school for your child</h2><p className="section-intro">Contact the admissions team for school information and availability.</p><a className="primary-button" href="tel:7600800500">Call 7600800500</a></div></section>
 <SectionPage id="fee-information" eyebrow="FEE INFORMATION" title="Fee guidance" intro="Add fee details, payment schedules and office contact information." muted/>
 <SectionPage id="admission-faq" eyebrow="HELP CENTRE" title="Frequently asked questions" intro="Add answers to parents' common questions."/>
 </>}
