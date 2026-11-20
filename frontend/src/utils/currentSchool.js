import { useEffect, useState } from "react";

// Remembers which school page is open, so every "Enquire Now" link on that page
// (menu, top bar, school page buttons) opens the enquiry form for that school.
let current = null;
const listeners = new Set();

export function setCurrentSchool(school) {
  current = school;
  listeners.forEach((fn) => fn(school));
}

export function useCurrentSchool() {
  const [school, setSchool] = useState(current);
  useEffect(() => {
    listeners.add(setSchool);
    setSchool(current);
    return () => listeners.delete(setSchool);
  }, []);
  return school;
}

export const ENQUIRY_PATH = "/admissions/enquire";

// "/admissions/enquire?school=Delhi+Public+School&board=CBSE&city=Hyderabad"
export function enquiryUrl(school) {
  if (!school) return ENQUIRY_PATH;
  const params = new URLSearchParams({
    school: school.name || "",
    board: school.board || "",
    city: school.city || "",
  });
  return `${ENQUIRY_PATH}?${params.toString()}`;
}
