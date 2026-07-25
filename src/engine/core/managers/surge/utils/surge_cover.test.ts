import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";
import { GameObject } from "xray16/alias";
import { AnyObject, FALSE, TRUE } from "xray16/lib";
import { MockGameObject, MockVector } from "xray16/mocks";
import { replaceFunctionMock } from "xray16/testing/utils";

import { registerZone, registry } from "@/engine/core/database";
import { parseConditionsList } from "@/engine/core/ini";
import { ESimulationTerrainRole } from "@/engine/core/managers/simulation/types";
import { SURGE_MANAGER_CONFIG_LTX, surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import {
  canSurgeKillSquad,
  getActorTargetSurgeCover,
  getNearestAvailableSurgeCover,
  getOnlineSurgeCoversList,
  initializeSurgeCovers,
  isActorInSurgeCover,
} from "@/engine/core/managers/surge/utils/surge_cover";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { mockRegisteredActor, MockSmartTerrain, MockSquad, resetRegistry } from "@/fixtures/engine";

/**
 * Register a zone game object usable as a surge cover under the provided name.
 */
function registerCover(name: string, isActorInside: boolean = false): GameObject {
  const zone: GameObject = MockGameObject.mock({ name });

  jest.spyOn(zone, "inside").mockImplementation(() => isActorInside);
  registerZone(zone);

  return zone;
}

describe("surge_cover utils", () => {
  beforeEach(() => {
    resetRegistry();
    mockRegisteredActor();

    surgeConfig.SURGE_COVERS = new LuaTable();
  });

  it("initializeSurgeCovers should reset covers when level has no configuration", () => {
    surgeConfig.SURGE_COVERS.set(1, { name: "stale_cover", conditionList: null });

    replaceFunctionMock(level.name, () => "level_without_covers");

    initializeSurgeCovers();

    expect(surgeConfig.SURGE_COVERS.length()).toBe(0);
  });

  it("initializeSurgeCovers should read cover names and their condition lists", () => {
    const ltx: AnyObject = SURGE_MANAGER_CONFIG_LTX as unknown as AnyObject;
    const originals: AnyObject = {
      section_exist: ltx.section_exist,
      line_count: ltx.line_count,
      r_line: ltx.r_line,
      line_exist: ltx.line_exist,
      r_string: ltx.r_string,
    };

    replaceFunctionMock(level.name, () => "zaton");

    ltx.section_exist = jest.fn((section: string) => section === "zaton");
    ltx.line_count = jest.fn(() => 2);
    ltx.r_line = jest.fn((_section: string, index: number) => [null, index === 0 ? "cover_a" : "cover_b", ""]);
    ltx.line_exist = jest.fn((section: string, field: string) => section === "cover_a" && field === "condlist");
    ltx.r_string = jest.fn(() => TRUE);

    try {
      initializeSurgeCovers();

      expect(surgeConfig.SURGE_COVERS.length()).toBe(2);
      expect(surgeConfig.SURGE_COVERS.get(1).name).toBe("cover_a");
      expect(surgeConfig.SURGE_COVERS.get(1).conditionList).toEqualLuaTables(parseConditionsList(TRUE));
      expect(surgeConfig.SURGE_COVERS.get(2).name).toBe("cover_b");
      expect(surgeConfig.SURGE_COVERS.get(2).conditionList).toBeNull();
    } finally {
      Object.assign(ltx, originals);
    }
  });

  it("getOnlineSurgeCoversList should only include registered zones", () => {
    const online: GameObject = registerCover("online_cover");

    surgeConfig.SURGE_COVERS.set(1, { name: "online_cover", conditionList: null });
    surgeConfig.SURGE_COVERS.set(2, { name: "offline_cover", conditionList: null });

    const covers = getOnlineSurgeCoversList();

    expect(covers.length()).toBe(1);
    expect(covers.get(1)).toBe(online);
  });

  it("getNearestAvailableSurgeCover should return null when no covers are online", () => {
    surgeConfig.SURGE_COVERS.set(1, { name: "offline_cover", conditionList: null });

    expect(getNearestAvailableSurgeCover(registry.actor)).toBeNull();
  });

  it("getNearestAvailableSurgeCover should immediately return the cover the object is inside", () => {
    const inside: GameObject = registerCover("inside_cover", true);

    registerCover("other_cover");

    surgeConfig.SURGE_COVERS.set(1, { name: "inside_cover", conditionList: null });
    surgeConfig.SURGE_COVERS.set(2, { name: "other_cover", conditionList: null });

    expect(getNearestAvailableSurgeCover(registry.actor)).toBe(inside);
  });

  it("getNearestAvailableSurgeCover should pick the closest valid cover", () => {
    const far: GameObject = registerCover("far_cover");
    const near: GameObject = registerCover("near_cover");

    jest.spyOn(far, "position").mockImplementation(() => {
      const position = MockVector.mock(0, 0, 0);

      jest.spyOn(position, "distance_to_sqr").mockImplementation(() => 1_000);

      return position;
    });

    jest.spyOn(near, "position").mockImplementation(() => {
      const position = MockVector.mock(0, 0, 0);

      jest.spyOn(position, "distance_to_sqr").mockImplementation(() => 10);

      return position;
    });

    surgeConfig.SURGE_COVERS.set(1, { name: "far_cover", conditionList: null });
    surgeConfig.SURGE_COVERS.set(2, { name: "near_cover", conditionList: null });

    expect(getNearestAvailableSurgeCover(registry.actor)).toBe(near);
  });

  it("getNearestAvailableSurgeCover should skip covers blocked by their condition list", () => {
    registerCover("blocked_cover");

    surgeConfig.SURGE_COVERS.set(1, { name: "blocked_cover", conditionList: parseConditionsList(FALSE) });

    expect(getNearestAvailableSurgeCover(registry.actor)).toBeNull();

    surgeConfig.SURGE_COVERS.set(1, { name: "blocked_cover", conditionList: parseConditionsList(TRUE) });

    expect(getNearestAvailableSurgeCover(registry.actor)).not.toBeNull();
  });

  it("isActorInSurgeCover should follow the nearest cover state", () => {
    expect(isActorInSurgeCover()).toBe(false);

    registerCover("cover", true);
    surgeConfig.SURGE_COVERS.set(1, { name: "cover", conditionList: null });

    expect(isActorInSurgeCover()).toBe(true);
  });

  it("getActorTargetSurgeCover should return null when there is no cover to travel to", () => {
    expect(getActorTargetSurgeCover()).toBeNull();

    registerCover("cover", true);
    surgeConfig.SURGE_COVERS.set(1, { name: "cover", conditionList: null });

    // Already inside the cover, so no navigation target is needed.
    expect(getActorTargetSurgeCover()).toBeNull();
  });

  it("getActorTargetSurgeCover should return the cover to travel to", () => {
    const cover: GameObject = registerCover("cover");

    surgeConfig.SURGE_COVERS.set(1, { name: "cover", conditionList: null });

    expect(getActorTargetSurgeCover()).toBe(cover);
  });

  it("canSurgeKillSquad should be false for squads without an assigned terrain", () => {
    const squad: MockSquad = MockSquad.mock();

    squad.assignedTerrainId = null;

    expect(canSurgeKillSquad(squad)).toBe(false);
  });

  it("canSurgeKillSquad should follow the surge role of the assigned terrain", () => {
    const squad: MockSquad = MockSquad.mock();
    const terrain: SmartTerrain = MockSmartTerrain.mockRegistered();

    squad.assignedTerrainId = terrain.id;

    terrain.simulationProperties.set(ESimulationTerrainRole.SURGE, 0);
    expect(canSurgeKillSquad(squad)).toBe(true);

    terrain.simulationProperties.set(ESimulationTerrainRole.SURGE, 5);
    expect(canSurgeKillSquad(squad)).toBe(false);
  });

  it("canSurgeKillSquad should be false when the assigned terrain is not in simulation", () => {
    const squad: MockSquad = MockSquad.mock();

    squad.assignedTerrainId = 9_999;

    expect(canSurgeKillSquad(squad)).toBe(false);
  });
});
