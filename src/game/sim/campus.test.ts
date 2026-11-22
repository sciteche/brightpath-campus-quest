import { describe, expect, it } from "vitest";

import { CAMPUS_BUILDINGS } from "../content";
import { CAMPUS_WALK_LIMIT, canOccupy, moveCampusPlayer } from "./campus";

describe("campus movement rules", () => {
  it("keeps the player on the island boundary", () => {
    const result = moveCampusPlayer({ x: CAMPUS_WALK_LIMIT - 0.02, z: 0 }, { x: 1, z: 0 }, 0.05);

    expect(Math.hypot(result.position.x, result.position.z)).toBeLessThanOrEqual(CAMPUS_WALK_LIMIT);
  });

  it("does not let the player occupy a building", () => {
    const building = CAMPUS_BUILDINGS[0];
    expect(building).toBeDefined();

    if (!building) return;
    expect(canOccupy({ x: building.x, z: building.z })).toBe(false);
    const result = moveCampusPlayer({ x: building.x - 1.6, z: building.z }, { x: 1, z: 0 }, 0.05);
    expect(
      Math.hypot(result.position.x - building.x, result.position.z - building.z),
    ).toBeGreaterThan(1.2);
  });

  it("moves toward a selected campus door", () => {
    const result = moveCampusPlayer({ x: 0, z: 6.5 }, { x: 0, z: 0 }, 0.05, {
      id: "fees",
      x: 5.6,
      z: -0.4,
    });

    expect(result.moving).toBe(true);
    expect(result.position.x).toBeGreaterThan(0);
  });
});
