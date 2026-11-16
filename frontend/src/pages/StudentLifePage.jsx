import React from "react"; import SectionPage from "../components/SectionPage";
export default function StudentLifePage(){return <>
 <SectionPage id="sports" eyebrow="STUDENT LIFE" title="Discover every opportunity" intro="Show how students develop confidence, teamwork and creativity beyond academics." items={[{title:"Sports",text:"Add facilities, teams and competitions."},{title:"Arts & Culture",text:"Highlight music, dance, drama and cultural events."},{title:"Clubs & Activities",text:"Introduce clubs, student councils and activities."},{title:"Achievements",text:"Celebrate student awards and success stories."}]}/>
 <SectionPage id="arts" eyebrow="CREATIVITY" title="Arts, culture and expression" intro="Add creative programmes, performances and cultural events." muted/>
 <SectionPage id="clubs" eyebrow="GET INVOLVED" title="Clubs & Activities" intro="Add clubs, student-led activities and events."/>
 <SectionPage id="achievements" eyebrow="OUR STUDENTS" title="Celebrating student achievements" intro="Add student accomplishments and competition results." muted/>
 </>}
