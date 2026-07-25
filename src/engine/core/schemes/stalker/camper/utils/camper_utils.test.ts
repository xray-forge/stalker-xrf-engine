import { describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { LuaArray, Nillable } from "xray16/lib";
import { $fromArray, $fromObject } from "xray16/macros";
import { MockGameObject, MockVector } from "xray16/mocks";

import { ICampPoint, ISchemeCamperState } from "@/engine/core/schemes/stalker/camper";
import {
  getNextCampPatrolPoint,
  isOnCampPatrolWalkPoint,
} from "@/engine/core/schemes/stalker/camper/utils/camper_utils";

describe("isOnCampPatrolWalkPoint", () => {
  it("should correctly check points based on patrol", () => {
    const object: GameObject = MockGameObject.mock();

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
    const object: GameObject = MockGameObject.mock();
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

describe("getNextCampPatrolPoint", () => {
  /**
   * Build a camper state with a sorted scan table for a single waypoint flag.
   */
  function createState(lastLookPoint: Nillable<ICampPoint> = null): ISchemeCamperState {
    return {
      lastLookPoint,
      scanTable: $fromObject<number, LuaArray<ICampPoint>>({
        3: $fromArray<ICampPoint>([
          { key: 0, pos: MockVector.create(0, 0, 0) },
          { key: 1, pos: MockVector.create(1, 0, 0) },
          { key: 2, pos: MockVector.create(2, 0, 0) },
        ]),
      }),
    } as unknown as ISchemeCamperState;
  }

  it("should return the first point when nothing was looked at yet", () => {
    const state: ISchemeCamperState = createState();

    expect(getNextCampPatrolPoint(3, state)?.key).toBe(0);
  });

  it("should return the point following the last one", () => {
    const state: ISchemeCamperState = createState({ key: 0, pos: MockVector.create(0, 0, 0) });

    expect(getNextCampPatrolPoint(3, state)?.key).toBe(1);
  });

  it("should keep the last point when it is the final one", () => {
    const lastLookPoint: ICampPoint = { key: 2, pos: MockVector.create(2, 0, 0) };
    const state: ISchemeCamperState = createState(lastLookPoint);

    expect(getNextCampPatrolPoint(3, state)).toBe(lastLookPoint);
  });

  it("should keep the last point when it is not in the scan table", () => {
    const lastLookPoint: ICampPoint = { key: 99, pos: MockVector.create(9, 0, 0) };
    const state: ISchemeCamperState = createState(lastLookPoint);

    expect(getNextCampPatrolPoint(3, state)).toBe(lastLookPoint);
  });
});
