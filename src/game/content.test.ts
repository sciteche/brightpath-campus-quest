import { describe, expect, it } from "vitest";

import { COURSES, RESULTS } from "./content";

describe("BrightPath published demo details", () => {
  it("keeps the requested monthly course fees", () => {
    expect(COURSES.map(({ name, level, price }) => [name, level, price])).toEqual([
      ["Maths", "Class 9–10", 2500],
      ["Science", "Class 9–10", 2500],
      ["Board Booster", "Class 12", 3500],
    ]);
  });

  it("keeps the requested results and batch figures", () => {
    expect(RESULTS.map(({ value, label }) => [value, label])).toEqual([
      ["94%", "scored 80+"],
      ["38", "school toppers"],
      ["15", "students per batch"],
      ["7 years", "in Noida"],
    ]);
  });
});
