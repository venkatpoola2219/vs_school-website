export const defaultNavItems = [
  ["About Us", [
    ["Ryan Group", "/about/ryan-group"],
    ["Vision & Mission", "/about/vision"],
    ["Leadership", "/about/leadership"],
    ["Awards & Recognition", "/about/awards"]
  ]],
  ["Academics", [
    ["Curriculum", "/academics/curriculum"],
    ["Teaching Approach", "/academics/teaching"],
    ["Early Years", "/academics/early-years"],
    ["Beyond Academics", "/academics/beyond-academics"]
  ]],
  ["Admissions", [
    ["Admission Process", "/admissions/admission-process"],
    ["Enquire Now", "/admissions/enquire"],
    ["Fee Information", "/admissions/fee-information"],
    ["FAQs", "/admissions/faqs"]
  ]],
  ["Student Life", [
    ["Sports", "/student-life/sports"],
    ["Arts & Culture", "/student-life/arts"],
    ["Clubs & Activities", "/student-life/clubs"],
    ["Achievements", "/student-life/achievements"]
  ]],
  ["Parents Corner", [
    ["Parent Resources", "/parents/parent-resources"],
    ["News & Updates", "/parents/news"],
    ["School Calendar", "/parents/calendar"],
    ["Contact School", "/parents/contact"]
  ]],
  ["Alumni Connect", [
    ["Alumni Network", "/alumni/alumni-network"],
    ["Success Stories", "/alumni/success-stories"],
    ["Alumni Events", "/alumni/alumni-events"]
  ]]
];

export const defaultMenuRecords = defaultNavItems.flatMap(([parent_label, links]) =>
  links.map(([label, url], index) => ({
    label,
    url,
    parent_label,
    sort_order: index + 1,
    is_active: 1
  }))
);
