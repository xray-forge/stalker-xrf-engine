import { describe, expect, it, jest } from "@jest/globals";

import { ISchemeCamperState } from "@/engine/core/schemes/stalker/camper";
import { isOnCampPatrolWalkPoint } from "@/engine/core/schemes/stalker/camper/utils/camper_utils";
import { GameObject } from "@/engine/lib/types";
import { mockGameObject } from "@/fixtures/xray";

describe("isOnCampPatrolWalkPoint util", () => {
  it("should correctly check points based on patrol", () => {
    const object: GameObject = mockGameObject();

    expect(
      isOnCampPatrolWalkPoint(object, {
        pathWalk: "test-wp",
        noRetreat: true,
      } as ISchemeCamperState)
    ).toBe(false);

    expect(
      isOnCampPatrolWalkPoint(object, {
        pathWalk: "test-wp-2",
      } as ISchemeCamperState)
    ).toBe(false);

    expect(
      isOnCampPatrolWalkPoint(object, {
        pathWalk: "test-wp",
      } as ISchemeCamperState)
    ).toBe(false);

    jest.spyOn(object.position(), "distance_to_sqr").mockImplementation(() => 0);

    expect(
      isOnCampPatrolWalkPoint(object, {
        pathWalk: "test-wp",
      } as ISchemeCamperState)
    ).toBe(true);
  });

  it("should correctly check points and update state flag", () => {
    const object: GameObject = mockGameObject();
    const state: ISchemeCamperState = {
      pathWalk: "test-wp",
    } as ISchemeCamperState;

    expect(isOnCampPatrolWalkPoint(object, state)).toBe(false);
    expect(state.waypointFlag).toBeNull();

    jest.spyOn(object.position(), "distance_to_sqr").mockImplementation(() => 0);

    expect(isOnCampPatrolWalkPoint(object, state)).toBe(true);
    expect(state.waypointFlag).toBe(3);
  });
});

describe("getNextCampPatrolPoint util", () => {
  it("should correctly initialize", () => {
    // todo;
  });
});
