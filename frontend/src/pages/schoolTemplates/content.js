import { assetUrl } from "../../utils/siteData";
import { enquiryUrl } from "../../utils/currentSchool";

// The designs a school page can use. Choose one for each school in Admin -> Schools.
export const SCHOOL_TEMPLATES = [
  { id: "classic", name: "Classic", description: "Navy and orange. Clean, traditional school look." },
  { id: "modern", name: "Modern", description: "Full-width photo header, teal colours, big rounded sections." },
  { id: "elegant", name: "Elegant", description: "Cream background, serif headings, burgundy and gold." },
  { id: "bold", name: "Bold", description: "Dark theme with bright yellow highlights." },
];

// Icons the admin can pick for facilities (Bootstrap Icons)
export const FACILITY_ICONS = [
  ["bi-laptop", "Computer"],
  ["bi-trophy", "Sports"],
  ["bi-flask", "Science lab"],
  ["bi-book", "Library"],
  ["bi-palette", "Arts"],
  ["bi-bus-front", "Transport"],
  ["bi-music-note-beamed", "Music"],
  ["bi-globe2", "Languages"],
  ["bi-heart", "Care"],
  ["bi-shield-check", "Safety"],
  ["bi-people", "Community"],
  ["bi-building", "Campus"],
];

export const admissionSteps = [
  { title: "Enquire", text: "Fill in the enquiry form and our team will get in touch." },
  { title: "Campus Visit", text: "Meet the faculty and see the classrooms and facilities." },
  { title: "Interaction", text: "A friendly interaction with the student and parents." },
  { title: "Confirm Admission", text: "Complete the formalities and welcome to the school family." },
];

// Sample (dummy) content - used for any field the admin has not filled in yet.
const defaultFacilities = [
  { icon: "bi-laptop", title: "Smart Classrooms", text: "Bright, technology-enabled classrooms that make every lesson interactive." },
  { icon: "bi-trophy", title: "Sports & Fitness", text: "Playgrounds and coached programmes that build teamwork and confidence." },
  { icon: "bi-flask", title: "Science Labs", text: "Well-equipped laboratories for hands-on learning and curiosity." },
  { icon: "bi-book", title: "Library & Reading", text: "A quiet, welcoming library with books for every age and interest." },
  { icon: "bi-palette", title: "Arts & Culture", text: "Music, dance, drama and art to help every child express themselves." },
  { icon: "bi-bus-front", title: "Safe Transport", text: "Reliable, GPS-tracked school transport covering all major routes." },
];

const filled = (list, keys) =>
  Array.isArray(list) ? list.filter((item) => keys.some((key) => String(item?.[key] || "").trim())) : [];

export function buildSchoolContent(school) {
  const { name, board, city } = school;
  const profile = school.profile || {};
  const d = profile.data || {};

  const stats = filled(d.stats, ["value", "label"]);
  const facilities = filled(d.facilities, ["title", "text"]);
  const contact = d.contact || {};

  return {
    template: SCHOOL_TEMPLATES.some((t) => t.id === profile.template) ? profile.template : "classic",
    name,
    board,
    city,
    enquireUrl: enquiryUrl({ name, board, city }),
    tagline: d.tagline || "A place where every child belongs",
    intro:
      d.intro ||
      `Welcome to ${name}, ${city}. A nurturing school where children are encouraged to think, create and grow into confident, caring individuals.`,
    heroImage: d.hero_image ? assetUrl(d.hero_image) : "",
    stats: stats.length
      ? stats
      : [
          { value: "1,500+", label: "Students" },
          { value: "90+", label: "Teachers" },
          { value: "Nursery – XII", label: "Classes" },
          { value: board, label: "Curriculum" },
        ],
    aboutTitle: d.about_title || "A place where every child belongs",
    aboutHtml:
      d.about_html ||
      `<p>${name} follows the ${board} curriculum and focuses on a balanced education that combines strong academics with sports, arts and life skills. Our classrooms are warm, our teachers are dedicated, and every student is supported to reach their full potential.</p><p>This is sample content. Replace it with the school's real story, vision, mission and achievements from Admin → Schools.</p>`,
    facilities: facilities.length ? facilities : defaultFacilities,
    gallery: (Array.isArray(d.gallery) ? d.gallery : []).filter(Boolean).map(assetUrl),
    contact: {
      address: contact.address || `123 Sample Road, ${city}`,
      phone: contact.phone || "+91 00000 00000",
      email: contact.email || "info@yourschool.example",
      hours: contact.hours || "Mon – Sat, 9:00 AM – 4:00 PM",
    },
    steps: admissionSteps,
  };
}
