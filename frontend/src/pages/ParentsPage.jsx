import React from "react"; import SectionPage from "../components/SectionPage";
export default function ParentsPage(){return <>
 <SectionPage id="parent-resources" eyebrow="PARENTS CORNER" title="A partnership with parents" intro="Create a useful space for parent information and school resources." items={[{title:"Parent Resources",text:"Add handbooks, policies, forms and documents."},{title:"News & Updates",text:"Publish announcements and notices."},{title:"School Calendar",text:"Add term dates, holidays and examination schedules."},{title:"Contact School",text:"Provide school office contact details."}]}/>
 <SectionPage id="news" eyebrow="LATEST NEWS" title="News & Updates" intro="Add your latest school announcements and activities." muted/>
 <SectionPage id="calendar" eyebrow="IMPORTANT DATES" title="School Calendar" intro="Add academic calendars, holidays and events."/>
 </>}
