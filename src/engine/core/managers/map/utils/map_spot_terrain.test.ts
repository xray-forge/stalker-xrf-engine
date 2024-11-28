import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";

import { getManager, registerStoryLink } from "@/engine/core/database";
import { mapDisplayConfig } from "@/engine/core/managers/map/MapDisplayConfig";
import {
  getTerrainMapSpotHint,
  removeTerrainMapSpot,
  updateTerrainMapSpot,
  updateTerrainsMapSpotDisplay,
} from "@/engine/core/managers/map/utils/map_spot_terrain";
import { ESimulationTerrainRole, ISmartTerrainDescriptor, SimulationManager } from "@/engine/core/managers/simulation";
import { getSmartTerrainNameCaption, SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { createObjectJobDescriptor } from "@/engine/core/objects/smart_terrain/job";
import { Squad } from "@/engine/core/objects/squad";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { parseConditionsList } from "@/engine/core/utils/ini";
import { forgeConfig } from "@/engine/lib/configs/ForgeConfig";
import { FALSE } from "@/engine/lib/constants/words";
import { AnyObject, GameObject, TName, TRate } from "@/engine/lib/types";
import { mockRegisteredActor, MockSmartTerrain, MockSquad, resetRegistry } from "@/fixtures/engine";
import { resetFunctionMock } from "@/fixtures/jest";
import { MockAlifeHumanStalker, MockCTime, MockGameObject } from "@/fixtures/xray";

describe("updateTerrainsMapSpotDisplay util", () => {
  beforeEach(() => {
    for (const [, descriptor] of mapDisplayConfig.MAP_SPOTS) {
      descriptor.isVisible = false;
    }

    mapDisplayConfig.REQUIRE_SMART_TERRAIN_VISIT = false;
    forgeConfig.DEBUG.IS_SIMULATION_ENABLED = false;

    resetRegistry();
    resetFunctionMock(level.map_add_object_spot);
  });

  it("should correctly start display of map spots", () => {
    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();
    const third: GameObject = MockGameObject.mock();

    registerStoryLink(first.id(), "zat_b55_spot");
    registerStoryLink(second.id(), "jup_b1_spot");
    registerStoryLink(third.id(), "pri_a28_spot");

    jest.spyOn(level, "map_add_object_spot").mockImplementation(jest.fn());

    updateTerrainsMapSpotDisplay();

    expect(level.map_add_object_spot).toHaveBeenCalledTimes(3);
    expect(level.map_add_object_spot).toHaveBeenCalledWith(first.id(), "primary_object", "st_zat_b55_name");
    expect(level.map_add_object_spot).toHaveBeenCalledWith(second.id(), "primary_object", "st_jup_b1_name");
    expect(level.map_add_object_spot).toHaveBeenCalledWith(third.id(), "primary_object", "st_pri_a28_name");

    updateTerrainsMapSpotDisplay();

    expect(level.map_add_object_spot).toHaveBeenCalledTimes(3);
  });

  it("should correctly check visited info portion when updating display", () => {
    mockRegisteredActor();

    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();
    const third: GameObject = MockGameObject.mock();

    registerStoryLink(first.id(), "zat_b55_spot");
    registerStoryLink(second.id(), "jup_b1_spot");
    registerStoryLink(third.id(), "pri_a28_spot");

    jest.spyOn(level, "map_add_object_spot").mockImplementation(jest.fn());

    mapDisplayConfig.REQUIRE_SMART_TERRAIN_VISIT = true;

    updateTerrainsMapSpotDisplay();

    expect(level.map_add_object_spot).toHaveBeenCalledTimes(0);

    giveInfoPortion("zat_b55_spot_visited");
    updateTerrainsMapSpotDisplay();

    expect(level.map_add_object_spot).toHaveBeenCalledTimes(1);
    expect(level.map_add_object_spot).toHaveBeenCalledWith(first.id(), "primary_object", "st_zat_b55_name");
  });
});

describe("updateTerrainMapSpot util", () => {
  beforeEach(() => {
    for (const [, descriptor] of mapDisplayConfig.MAP_SPOTS) {
      descriptor.isVisible = false;
    }

    forgeConfig.DEBUG.IS_SIMULATION_ENABLED = false;

    resetRegistry();
    resetFunctionMock(level.map_add_object_spot);
  });

  it("should correctly update terrain display when debug is not enabled", () => {
    const terrain: SmartTerrain = MockSmartTerrain.mock();

    updateTerrainMapSpot(terrain);

    expect(level.map_remove_object_spot).toHaveBeenCalledTimes(0);

    terrain.simulationRole = ESimulationTerrainRole.BASE;
    terrain.mapSpot = "test_spot";

    updateTerrainMapSpot(terrain);

    expect(level.map_remove_object_spot).toHaveBeenCalledTimes(1);
    expect(level.map_remove_object_spot).toHaveBeenCalledWith(terrain.id, "alife_presentation_smart_base_test_spot");
  });

  it("should correctly update terrain display when debug is not enabled", () => {
    forgeConfig.DEBUG.IS_SIMULATION_ENABLED = true;

    const terrain: SmartTerrain = MockSmartTerrain.mockRegistered();

    terrain.mapSpot = "test";
    terrain.simulationRole = ESimulationTerrainRole.BASE;

    resetFunctionMock(level.map_add_object_spot);
    updateTerrainMapSpot(terrain);

    expect(level.map_remove_object_spot).toHaveBeenCalledTimes(1);
    expect(level.map_add_object_spot).toHaveBeenCalledTimes(1);
    expect(level.map_change_spot_hint).toHaveBeenCalledTimes(0);

    expect(level.map_remove_object_spot).toHaveBeenCalledWith(terrain.id, "alife_presentation_smart_base_test");
    expect(level.map_add_object_spot).toHaveBeenCalledWith(
      terrain.id,
      "alife_presentation_smart_base_friend",
      getTerrainMapSpotHint(terrain)
    );

    updateTerrainMapSpot(terrain);

    expect(level.map_remove_object_spot).toHaveBeenCalledTimes(1);
    expect(level.map_add_object_spot).toHaveBeenCalledTimes(1);
    expect(level.map_change_spot_hint).toHaveBeenCalledTimes(1);

    expect(level.map_change_spot_hint).toHaveBeenCalledWith(
      terrain.id,
      "alife_presentation_smart_base_friend",
      getTerrainMapSpotHint(terrain)
    );
  });
});

describe("removeTerrainMapSpot util", () => {
  beforeEach(() => {
    for (const [, descriptor] of mapDisplayConfig.MAP_SPOTS) {
      descriptor.isVisible = false;
    }

    forgeConfig.DEBUG.IS_SIMULATION_ENABLED = false;

    resetRegistry();
  });

  it("should remove terrain spots", () => {
    const terrain: SmartTerrain = MockSmartTerrain.mock();

    removeTerrainMapSpot(terrain);

    expect(level.map_remove_object_spot).toHaveBeenCalledTimes(0);

    terrain.simulationRole = ESimulationTerrainRole.BASE;
    terrain.mapSpot = "test_spot";

    removeTerrainMapSpot(terrain);

    expect(level.map_remove_object_spot).toHaveBeenCalledTimes(1);
    expect(level.map_remove_object_spot).toHaveBeenCalledWith(terrain.id, "alife_presentation_smart_base_test_spot");
  });
});

describe("getSmartTerrainMapDisplayHint util", () => {
  beforeEach(() => {
    forgeConfig.DEBUG.IS_SIMULATION_ENABLED = false;
    resetRegistry();
  });

  it("should correctly generate map hints without debug", () => {
    const terrain: SmartTerrain = new SmartTerrain("test_init");

    expect(getTerrainMapSpotHint(terrain)).toBe(getSmartTerrainNameCaption(terrain));
  });

  it("should correctly generate map hints with debug and defaults", () => {
    mockRegisteredActor();

    const terrain: SmartTerrain = MockSmartTerrain.mockRegistered("test_smart");

    terrain.isSimulationAvailableConditionList = parseConditionsList(FALSE);
    terrain.isRespawnPoint = false;

    forgeConfig.DEBUG.IS_SIMULATION_ENABLED = true;

    expect(getTerrainMapSpotHint(terrain).replaceAll("\\n", "\n")).toBe(
      `[translated_st_test_smart_name] (${terrain.name()}) (${terrain.id})
available = false
online = true
simulation_role = default
squad_id = 0
capacity = 0\\0
arriving_objects = 0
staying_objects = 0
[not respawn point]
[jobs]
total = 54
working = 0
`
    );
  });

  it("getSmartTerrainMapDisplayHint should correctly generate map hints with debug and some custom values", () => {
    mockRegisteredActor();

    const terrain: SmartTerrain = MockSmartTerrain.mockRegistered("test_smart");
    const squads: Array<Squad> = [
      MockSquad.mock(),
      MockSquad.mock(),
      MockSquad.mock(),
      MockSquad.mock(),
      MockSquad.mock(),
      MockSquad.mock(),
    ];

    forgeConfig.DEBUG.IS_SIMULATION_ENABLED = true;

    terrain.isRespawnPoint = true;
    terrain.simulationProperties = $fromObject<TName, TRate>({ a: 1, b: 2 });
    (terrain as AnyObject).online = true;
    terrain.simulationRole = ESimulationTerrainRole.SURGE;
    terrain.squadId = 155;
    terrain.maxStayingSquadsCount = 10;
    terrain.stayingObjectsCount = 3;

    terrain.lastRespawnUpdatedAt = MockCTime.mock(2015, 2, 14, 14, 25, 30, 100);
    terrain.spawnedSquadsList.set("test-1", { num: 3 });
    terrain.spawnedSquadsList.set("test-2", { num: 3 });

    terrain.spawnSquadsConfiguration.set("test-1", { num: parseConditionsList("3"), squads: new LuaTable() });
    terrain.spawnSquadsConfiguration.set("test-2", { num: parseConditionsList("3"), squads: new LuaTable() });

    terrain.objectByJobSection.set("some-job", 4000);
    terrain.objectJobDescriptors.set(4000, createObjectJobDescriptor(MockAlifeHumanStalker.mock({ id: 4000 })));
    terrain.arrivingObjects.set(4001, MockAlifeHumanStalker.mock({ id: 4001 }));

    const descriptor: ISmartTerrainDescriptor = getManager(SimulationManager).getTerrainDescriptorById(
      terrain.id
    ) as ISmartTerrainDescriptor;

    descriptor.assignedSquadsCount = 6;

    squads.forEach((it) => descriptor.assignedSquads.set(it.id, it));
    squads.forEach((it, index) => jest.spyOn(it, "getScriptedSimulationTarget").mockImplementation(() => index));

    expect(getTerrainMapSpotHint(terrain).replaceAll("\\n", "\n")).toBe(
      `[translated_st_test_smart_name] (${terrain.name()}) (${terrain.id})
available = true
online = true
simulation_role = surge
squad_id = 155
capacity = 6\\10
arriving_objects = 1
staying_objects = 3
[spawn_state] (tts: -83163600)
test-1 -> 3\\3
test-2 -> 3\\3
[assigned]
${squads[0].name()} -> 0
${squads[1].name()} -> 1
${squads[2].name()} -> 2
${squads[3].name()} -> 3
${squads[4].name()} -> 4
${squads[5].name()} -> 5
[properties]
a -> 1
b -> 2
[jobs]
total = 54
working = 1
[workers]
some-job -> 4000
`
    );
  });
});
