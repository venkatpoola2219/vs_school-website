import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api";
import Enquiry from "../sections/Enquiry";
import CmsContent from "../components/CmsContent";

// Each URL has its own page content. These pages are rendered inside the
// shared website shell, so navigation stays within the React SPA.
const pageData = {
  "about/ryan-group": {
    eyebrow: "ABOUT US", title: "A legacy of learning and excellence",
    intro: "Get to know the Ryan Group, its educational outlook and the values that shape the learning experience.",
    items: [
      { title: "Our Story", text: "Share the journey, milestones and growth of the institution." },
      { title: "Our Philosophy", text: "Explain the values and beliefs that guide teaching and learning." },
      { title: "Our Vision", text: "Describe the long-term vision and the future students are prepared for." }
    ]
  },
  "about/vision": {
    eyebrow: "OUR PURPOSE", title: "Vision & Mission",
    intro: "Present the purpose, principles and educational values that guide the school community.",
    items: [
      { title: "Our Vision", text: "Add the institution's vision statement here." },
      { title: "Our Mission", text: "Explain the mission and the commitments that support it." },
      { title: "Our Values", text: "Highlight the values encouraged in every learner." }
    ], muted: true
  },
  "about/leadership": {
    eyebrow: "LEADERSHIP", title: "Guided by educational leaders",
    intro: "Introduce the leadership team and share their approach to building a supportive learning environment.",
    items: [
      { title: "Leadership Message", text: "Add a message from the school leadership." },
      { title: "School Leadership", text: "Add leadership profiles, roles and responsibilities." },
      { title: "Our Faculty", text: "Introduce the educators and academic teams." }
    ]
  },
  "about/awards": {
    eyebrow: "RECOGNITION", title: "Awards & Recognition",
    intro: "Showcase verified awards, accreditations, milestones and achievements of the institution.",
    items: [
      { title: "Awards", text: "Add award names, years and awarding organisations." },
      { title: "Accreditations", text: "Add applicable accreditation and affiliation details." },
      { title: "Milestones", text: "Share important institutional milestones." }
    ], muted: true
  },
  "academics/curriculum": {
    eyebrow: "ACADEMICS", title: "Our Curriculum",
    intro: "Explore the academic structure, subject pathways and learning outcomes for each stage.",
    items: [
      { title: "Early Years", text: "Describe foundational learning and early childhood programmes." },
      { title: "Primary School", text: "Explain subject learning and foundational skills." },
      { title: "Middle & Senior School", text: "Add grade-wise curriculum and subject information." }
    ]
  },
  "academics/teaching": {
    eyebrow: "OUR APPROACH", title: "Teaching Approach",
    intro: "Explain how classroom experiences encourage curiosity, collaboration and independent thinking.",
    items: [
      { title: "Experiential Learning", text: "Describe learning through activities, projects and practice." },
      { title: "Personal Attention", text: "Explain how individual learning needs are supported." },
      { title: "Assessment", text: "Outline assessment methods and progress communication." }
    ], muted: true
  },
  "academics/early-years": {
    eyebrow: "EARLY YEARS", title: "Strong foundations for bright futures",
    intro: "Introduce the early years programme, with details about learning, care and age-appropriate activities.",
    items: [
      { title: "Learning Through Play", text: "Describe play-based learning experiences." },
      { title: "Language & Numeracy", text: "Explain early communication and number-readiness activities." },
      { title: "Care & Wellbeing", text: "Share information about daily routines and student wellbeing." }
    ]
  },
  "academics/beyond-academics": {
    eyebrow: "HOLISTIC LEARNING", title: "Learning beyond the classroom",
    intro: "Highlight opportunities that help students explore interests and develop life skills.",
    items: [
      { title: "Life Skills", text: "Add communication, collaboration and leadership activities." },
      { title: "Creative Learning", text: "Describe creative projects and expression opportunities." },
      { title: "Community Engagement", text: "Share student participation and community initiatives." }
    ], muted: true
  },
  "admissions/admission-process": {
    eyebrow: "ADMISSIONS", title: "Admission Process",
    intro: "Provide families with a clear overview of the admission journey and the information they need to prepare.",
    items: [
      { title: "Step 1 · Enquiry", text: "Submit an admission enquiry with the student's grade and preferred location." },
      { title: "Step 2 · Guidance", text: "The admissions team can guide families through the next steps." },
      { title: "Step 3 · Application", text: "Add the application documents, interaction and confirmation process followed by your school." }
    ]
  },
  "admissions/enquire": { eyebrow: "ADMISSIONS", title: "Admission Enquiry", intro: "Share your details with our admissions team and let us help you explore the next steps.", component: Enquiry },
  "admissions/fee-information": {
    eyebrow: "ADMISSIONS", title: "Fee Information",
    intro: "Add the current fee structure, payment schedule and official payment instructions for families.",
    items: [
      { title: "Fee Structure", text: "Add grade-wise fee details and applicable components." },
      { title: "Payment Schedule", text: "Explain payment dates, instalments and accepted payment methods." },
      { title: "Fee Support", text: "Add the official contact for fee-related questions." }
    ], muted: true
  },
  "admissions/faqs": {
    eyebrow: "ADMISSIONS", title: "Frequently Asked Questions",
    intro: "Answer common questions about eligibility, applications, documents, school visits and admissions.",
    items: [
      { title: "Eligibility", text: "Add age criteria and grade-specific eligibility information." },
      { title: "Documents", text: "List the documents families need to submit." },
      { title: "Application Help", text: "Share the contact details for admission support." }
    ]
  },
  "student-life/sports": {
    eyebrow: "STUDENT LIFE", title: "Sports & Physical Education",
    intro: "Introduce the sports and physical education opportunities available to students.",
    items: [
      { title: "Sports Programmes", text: "Add the sports and physical activities offered at the school." },
      { title: "Team Participation", text: "Share information about teams, events and competitions." },
      { title: "Fitness & Wellbeing", text: "Explain how physical wellbeing is encouraged." }
    ]
  },
  "student-life/arts": {
    eyebrow: "STUDENT LIFE", title: "Arts & Culture",
    intro: "Celebrate creative expression through arts, culture, music, performance and student showcases.",
    items: [
      { title: "Visual Arts", text: "Add art, craft and design activities." },
      { title: "Music & Dance", text: "Describe music, dance and performance opportunities." },
      { title: "Cultural Events", text: "Share cultural celebrations and student showcases." }
    ], muted: true
  },
  "student-life/clubs": {
    eyebrow: "STUDENT LIFE", title: "Clubs & Activities",
    intro: "Show how students can discover interests, collaborate and learn through co-curricular activities.",
    items: [
      { title: "Interest Clubs", text: "Add club names and the activities they organise." },
      { title: "STEM & Innovation", text: "Describe science, technology and innovation activities." },
      { title: "Student Leadership", text: "Explain student-led groups and responsibilities." }
    ]
  },
  "student-life/achievements": {
    eyebrow: "STUDENT LIFE", title: "Student Achievements",
    intro: "Celebrate student accomplishments across academics, sports, arts and other areas.",
    items: [
      { title: "Academic Achievements", text: "Add verified academic awards and accomplishments." },
      { title: "Sports Achievements", text: "Share sports results and recognitions." },
      { title: "Creative Achievements", text: "Highlight arts, culture and other student accomplishments." }
    ], muted: true
  },
  "parents/parent-resources": {
    eyebrow: "PARENTS CORNER", title: "Parent Resources",
    intro: "Bring together useful school information, guidelines and resources for parents and guardians.",
    items: [
      { title: "School Guidelines", text: "Add parent handbooks, policies and school guidelines." },
      { title: "Learning Support", text: "Share resources that help families support learning at home." },
      { title: "Useful Downloads", text: "Add forms, circulars and downloadable resources." }
    ]
  },
  "parents/news": {
    eyebrow: "PARENTS CORNER", title: "News & Updates",
    intro: "Publish school announcements, circulars, event updates and important notices for families.",
    items: [
      { title: "Announcements", text: "Add current school announcements." },
      { title: "Circulars", text: "Share parent circulars and important notices." },
      { title: "Campus Updates", text: "Publish updates from the school community." }
    ], muted: true
  },
  "parents/calendar": {
    eyebrow: "PARENTS CORNER", title: "School Calendar",
    intro: "Share the academic calendar, holidays, examination dates and upcoming school events.",
    items: [
      { title: "Academic Dates", text: "Add term dates, assessments and important academic milestones." },
      { title: "Events", text: "List upcoming school events and celebrations." },
      { title: "Holidays", text: "Publish the approved holiday list." }
    ]
  },
  "parents/contact": {
    eyebrow: "PARENTS CORNER", title: "Contact School",
    intro: "Provide the official school contact information and the right channel for each type of enquiry.",
    items: [
      { title: "General Enquiries", text: "Add the school's official phone number and email address." },
      { title: "Admissions", text: "Add the admissions team's contact details." },
      { title: "Visit Us", text: "Add the verified campus address and visiting hours." }
    ], muted: true
  },
  "alumni/alumni-network": {
    eyebrow: "ALUMNI CONNECT", title: "Alumni Network",
    intro: "Invite former students to stay connected and take part in the wider school community.",
    items: [
      { title: "Stay Connected", text: "Add the official alumni registration or contact process." },
      { title: "Alumni Community", text: "Describe ways alumni can connect with one another." },
      { title: "Get Involved", text: "Share mentoring, volunteering and engagement opportunities." }
    ]
  },
  "alumni/success-stories": {
    eyebrow: "ALUMNI CONNECT", title: "Alumni Success Stories",
    intro: "Share verified stories and achievements from former students across different fields.",
    items: [
      { title: "Career Journeys", text: "Feature alumni career paths and professional milestones." },
      { title: "Further Education", text: "Share higher education journeys and achievements." },
      { title: "Inspiring Stories", text: "Publish alumni experiences and reflections." }
    ], muted: true
  },
  "alumni/alumni-events": {
    eyebrow: "ALUMNI CONNECT", title: "Alumni Events",
    intro: "Keep alumni informed about reunions, networking events and school community programmes.",
    items: [
      { title: "Reunions", text: "Add reunion dates, details and registration information." },
      { title: "Networking", text: "Share alumni networking opportunities." },
      { title: "School Events", text: "List events where alumni are invited to participate." }
    ]
  }
};

export const defaultPages = Object.entries(pageData).map(([route, page]) => {
  const [section, slug] = route.split("/");
  const content = [
    page.intro || "",
    ...(page.items || []).flatMap(item => ["", item.title, item.text])
  ].join("\n").trim();
  return {
    title: page.title,
    slug,
    section,
    content,
    is_published: 1
  };
});

export default function WebsiteDetailPage() {
  const { section, slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);
    setPage(null);
    api.get(`/api/pages/${encodeURIComponent(slug)}`)
      .then(({ data }) => {
        if (active) setPage(data);
      })
      .catch(() => {
        if (active) setNotFound(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [section, slug]);

  const routeKey = `${section}/${slug}`;
  const pageTemplate = pageData[routeKey] || {};

  if (loading) {
    return <section className="page-section"><div className="section-inner"><p>Loading page...</p></div></section>;
  }

  if (notFound || !page) {
    return (
      <section className="page-section">
        <div className="section-inner">
          <small className="section-eyebrow">PAGE NOT AVAILABLE</small>
          <h1>We couldn't find this page</h1>
          <p className="section-intro">This page may have been removed or is not currently published.</p>
          <Link className="primary-button" to="/">Back to home</Link>
        </div>
      </section>
    );
  }

  if (pageTemplate.component === Enquiry) return <Enquiry />;

  return (
    <>
      <div className="container pt-4" style={{ paddingTop: 150 }}>
        <nav aria-label="Breadcrumb" className="small text-muted">
          <Link to="/" className="text-decoration-none">Home</Link>
          <span className="mx-2">/</span>
          <span>{page.section}</span>
        </nav>
      </div>
      <section className={`page-section ${pageTemplate.muted ? "section-muted" : ""}`}>
        <div className="section-inner">
          <small className="section-eyebrow">{pageTemplate.eyebrow || String(page.section || "").toUpperCase()}</small>
          <h1>{page.title}</h1>
          <CmsContent html={page.content} style={{ maxWidth: 900 }} />
        </div>
      </section>
    </>
  );
}
