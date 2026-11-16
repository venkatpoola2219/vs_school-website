
import React from "react";
import { useParams, Navigate } from "react-router-dom";
import SectionPage from "../components/SectionPage";

const aboutPages = {
    "ryan-group": {
        id: "ryan-group",
        eyebrow: "ABOUT US",
        title: "A legacy of learning and excellence",
        intro: "Introduce your school group, its journey, educational philosophy and commitment to every learner.",
        items: [
            
            {
                title: "Ryan Group",
                text: "Add your group profile, history and institutions."
            },
            {
                title: "Vision & Mission",
                text: "Explain the values and goals that guide your school."
            },
            {
                title: "Leadership",
                text: "Introduce your leadership team and their experience."
            },
            {
                title: "Awards & Recognition",
                text: "Showcase awards, accreditations and recognitions."
            }
        ]
    },

    "vision": {
        id: "vision",
        eyebrow: "OUR PURPOSE",
        title: "Vision & Mission",
        intro: "Add your institution's vision, mission and educational values.",
        muted: true
    },

    "leadership": {
        id: "leadership",
        eyebrow: "LEADERSHIP",
        title: "Guided by educational leaders",
        intro: "Add leadership messages and profiles."
    },

    "awards": {
        id: "awards",
        eyebrow: "RECOGNITION",
        title: "Awards & Recognition",
        intro: "Add awards, achievements and accreditations.",
        muted: true
    }
};

export default function AboutPage() {

    const { slug } = useParams();

    const page = aboutPages[slug];

    if (!page) {
        return <Navigate to="/" replace />;
    }

    return (
        <SectionPage
            id={page.id}
            eyebrow={page.eyebrow}
            title={page.title}
            intro={page.intro}
            items={page.items}
            muted={page.muted}
        />
    );
}
