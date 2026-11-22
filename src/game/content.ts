export const CAMPUS_BUILDINGS = [
  {
    id: "courses",
    label: "Courses",
    x: -5.8,
    z: -2.3,
    width: 2.5,
    depth: 1.8,
    tint: "terracotta",
  },
  {
    id: "results",
    label: "Results",
    x: -2.3,
    z: -6,
    width: 2.5,
    depth: 1.8,
    tint: "sunshine",
  },
  {
    id: "faculty",
    label: "Faculty",
    x: 2.7,
    z: -6,
    width: 2.5,
    depth: 1.8,
    tint: "teal",
  },
  {
    id: "fees",
    label: "Fees",
    x: 5.6,
    z: -2.3,
    width: 2.5,
    depth: 1.8,
    tint: "berry",
  },
  {
    id: "demo",
    label: "Book a Demo",
    x: 4.8,
    z: 2.7,
    width: 2.6,
    depth: 1.9,
    tint: "orange",
  },
] as const;

export type CampusSectionId = (typeof CAMPUS_BUILDINGS)[number]["id"];
export type CampusBuilding = (typeof CAMPUS_BUILDINGS)[number];

export const COURSES = [
  {
    name: "Maths",
    level: "Class 9–10",
    price: 2500,
    detail: "Build strong foundations and solve with confidence.",
  },
  {
    name: "Science",
    level: "Class 9–10",
    price: 2500,
    detail: "Make classroom concepts clear, connected and memorable.",
  },
  {
    name: "Board Booster",
    level: "Class 12",
    price: 3500,
    detail: "Focused revision and practice for the board exams.",
  },
] as const;

export const RESULTS = [
  { value: "94%", label: "scored 80+" },
  { value: "38", label: "school toppers" },
  { value: "15", label: "students per batch" },
  { value: "7 years", label: "in Noida" },
] as const;

export const TEACHERS = [
  { initials: "MS", name: "Mr. Sharma", subject: "Maths" },
  { initials: "MI", name: "Ms. Iyer", subject: "Science" },
  { initials: "MK", name: "Mr. Khan", subject: "Physics" },
] as const;

export const SECTION_TITLES: Record<CampusSectionId, string> = {
  courses: "Courses",
  results: "Results that speak",
  faculty: "Meet your teachers",
  fees: "Simple, clear fees",
  demo: "Book a free demo class",
};

export function getMonthlyFee(price: number) {
  return `₹${price.toLocaleString("en-IN")}`;
}

export function getDoorTarget(building: CampusBuilding) {
  return { x: building.x, z: building.z + building.depth / 2 + 0.95 };
}