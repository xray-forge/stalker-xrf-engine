import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { registerSmartTerrainCampfire } from "@/engine/core/database";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import {
  turnOffSmartTerrainCampfires,
  turnOnTerrainCampfires,
} from "@/engine/core/utils/smart_terrain/smart_terrain_campfires";
import { GameObject, ZoneCampfire } from "@/engine/lib/types";
import { MockSmartTerrain, resetRegistry } from "@/fixtures/engine";
import { MockCZoneCampfire, MockGameObject } from "@/fixtures/xray";

describe("turnOnSmartTerrainCampfires/turnOffSmartTerrainCampfires utils", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly tun on and turn off linked campfires", () => {
    const terrain: SmartTerrain = MockSmartTerrain.mock();
    const first: ZoneCampfire = MockCZoneCampfire.mock(true);
    const second: ZoneCampfire = MockCZoneCampfire.mock(false);
    const third: ZoneCampfire = MockCZoneCampfire.mock(true);
    const fourth: ZoneCampfire = MockCZoneCampfire.mock(false);

    expect(terrain.areCampfiresOn).toBe(false);
    expect(first.is_on()).toBe(true);
    expect(second.is_on()).toBe(false);
    expect(third.is_on()).toBe(true);
    expect(fourth.is_on()).toBe(false);

    turnOnTerrainCampfires(terrain);

    expect(terrain.areCampfiresOn).toBe(true);
    expect(first.is_on()).toBe(true);
    expect(second.is_on()).toBe(false);
    expect(third.is_on()).toBe(true);
    expect(fourth.is_on()).toBe(false);

    const firstObject: GameObject = MockGameObject.mock();
    const secondObject: GameObject = MockGameObject.mock();

    jest.spyOn(firstObject, "get_campfire").mockImplementation(() => first);
    jest.spyOn(secondObject, "get_campfire").mockImplementation(() => second);

    registerSmartTerrainCampfire(terrain, firstObject);
    registerSmartTerrainCampfire(terrain, secondObject);

    expect(first.is_on()).toBe(false);
    expect(second.is_on()).toBe(false);

    turnOnTerrainCampfires(terrain);

    expect(terrain.areCampfiresOn).toBe(true);
    expect(first.is_on()).toBe(true);
    expect(second.is_on()).toBe(true);
    expect(third.is_on()).toBe(true);
    expect(fourth.is_on()).toBe(false);

    turnOffSmartTerrainCampfires(terrain);

    expect(terrain.areCampfiresOn).toBe(false);
    expect(first.is_on()).toBe(false);
    expect(second.is_on()).toBe(false);
    expect(third.is_on()).toBe(true);
    expect(fourth.is_on()).toBe(false);
  });
});
