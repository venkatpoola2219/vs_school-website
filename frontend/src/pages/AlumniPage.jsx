import React from "react"; import SectionPage from "../components/SectionPage";
export default function AlumniPage(){return <>
 <SectionPage id="alumni-network" eyebrow="ALUMNI CONNECT" title="A community for life" intro="Bring former students together and keep them connected to the school." items={[{title:"Alumni Network",text:"Add registration details and ways to stay connected."},{title:"Success Stories",text:"Share alumni journeys and achievements."},{title:"Alumni Events",text:"Publish reunions and networking events."}]}/>
 <SectionPage id="success-stories" eyebrow="ALUMNI STORIES" title="Where are they now?" intro="Add alumni profiles and inspiring journeys." muted/>
 <SectionPage id="alumni-events" eyebrow="STAY CONNECTED" title="Alumni Events" intro="Add upcoming reunions and alumni meet-ups."/>
 </>}
