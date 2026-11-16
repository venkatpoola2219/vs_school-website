import React from "react"; import SectionPage from "../components/SectionPage";
export default function AcademicsPage(){return <>
 <SectionPage id="curriculum" eyebrow="ACADEMICS" title="A learning journey for every stage" intro="Describe the curriculum, teaching standards and learning outcomes." items={[{title:"Curriculum",text:"Add boards, subjects and grade-wise pathways."},{title:"Teaching Approach",text:"Explain classroom practices and experiential learning."},{title:"Early Years",text:"Describe foundational and early childhood learning."},{title:"Beyond Academics",text:"Highlight life skills, creativity and leadership."}]}/>
 <SectionPage id="teaching" eyebrow="OUR APPROACH" title="Learning by doing" intro="Explain how teachers encourage curiosity, collaboration and independent thinking." muted/>
 <SectionPage id="early-years" eyebrow="EARLY YEARS" title="Strong foundations for bright futures" intro="Add details about early years programmes."/>
 <SectionPage id="beyond-academics" eyebrow="HOLISTIC LEARNING" title="Learning beyond the classroom" intro="Add projects, life skills and enrichment programmes." muted/>
 </>}
