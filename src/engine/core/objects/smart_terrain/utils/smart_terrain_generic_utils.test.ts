import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { getManager } from "@/engine/core/database";
import { ESimulationTerrainRole, ISmartTerrainDescriptor, SimulationManager } from "@/engine/core/managers/simulation";
import { getSmartTerrainMapDisplayHint, SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { createObjectJobDescriptor } from "@/engine/core/objects/smart_terrain/job";
import { getSmartTerrainNameCaption } from "@/engine/core/objects/smart_terrain/utils/smart_terrain_generic_utils";
import { Squad } from "@/engine/core/objects/squad";
import { parseConditionsList } from "@/engine/core/utils/ini";
import { forgeConfig } from "@/engine/lib/configs/ForgeConfig";
import { FALSE } from "@/engine/lib/constants/words";
import { AnyObject, TName, TRate } from "@/engine/lib/types";
import { mockRegisteredActor, MockSmartTerrain, MockSquad, resetRegistry } from "@/fixtures/engine";
import { MockAlifeHumanStalker, MockCTime } from "@/fixtures/xray";

describe("smart_terrain_generic_utils module", () => {
  beforeEach(() => {
    forgeConfig.DEBUG.IS_SIMULATION_ENABLED = false;
    resetRegistry();
  });

  it("getSmartTerrainNameCaption should correctly generate captions", () => {
    const first: SmartTerrain = new SmartTerrain("test_init");
    const second: SmartTerrain = new SmartTerrain("test_init");

    expect(getSmartTerrainNameCaption(first)).toBe(`st_${first.name()}_name`);
    expect(getSmartTerrainNameCaption(second)).toBe(`st_${second.name()}_name`);
  });

  it("getSmartTerrainMapDisplayHint should correctly generate map hints without debug", () => {
    const smartTerrain: SmartTerrain = new SmartTerrain("test_init");

    expect(getSmartTerrainMapDisplayHint(smartTerrain)).toBe(getSmartTerrainNameCaption(smartTerrain));
  });

  it("getSmartTerrainMapDisplayHint should correctly generate map hints with debug and defaults", () => {
    mockRegisteredActor();

    const smartTerrain: SmartTerrain = MockSmartTerrain.mockRegistered("test_smart");

    smartTerrain.isSimulationAvailableConditionList = parseConditionsList(FALSE);
    smartTerrain.isRespawnPoint = false;

    forgeConfig.DEBUG.IS_SIMULATION_ENABLED = true;

    expect(getSmartTerrainMapDisplayHint(smartTerrain).replaceAll("\\n", "\n")).toBe(
      `[translated_st_test_smart_name] (${smartTerrain.name()}) (${smartTerrain.id})
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

    const smartTerrain: SmartTerrain = MockSmartTerrain.mockRegistered("test_smart");
    const squads: Array<Squad> = [
      MockSquad.mock(),
      MockSquad.mock(),
      MockSquad.mock(),
      MockSquad.mock(),
      MockSquad.mock(),
      MockSquad.mock(),
    ];

    forgeConfig.DEBUG.IS_SIMULATION_ENABLED = true;

    smartTerrain.isRespawnPoint = true;
    smartTerrain.simulationProperties = $fromObject<TName, TRate>({ a: 1, b: 2 });
    (smartTerrain as AnyObject).online = true;
    smartTerrain.simulationRole = ESimulationTerrainRole.SURGE;
    smartTerrain.squadId = 155;
    smartTerrain.maxStayingSquadsCount = 10;
    smartTerrain.stayingObjectsCount = 3;

    smartTerrain.lastRespawnUpdatedAt = MockCTime.mock(2015, 2, 14, 14, 25, 30, 100);
    smartTerrain.spawnedSquadsList.set("test-1", { num: 3 });
    smartTerrain.spawnedSquadsList.set("test-2", { num: 3 });

    smartTerrain.spawnSquadsConfiguration.set("test-1", { num: parseConditionsList("3"), squads: new LuaTable() });
    smartTerrain.spawnSquadsConfiguration.set("test-2", { num: parseConditionsList("3"), squads: new LuaTable() });

    smartTerrain.objectByJobSection.set("some-job", 4000);
    smartTerrain.objectJobDescriptors.set(4000, createObjectJobDescriptor(MockAlifeHumanStalker.mock({ id: 4000 })));
    smartTerrain.arrivingObjects.set(4001, MockAlifeHumanStalker.mock({ id: 4001 }));

    const descriptor: ISmartTerrainDescriptor = getManager(SimulationManager).getSmartTerrainDescriptor(
      smartTerrain.id
    ) as ISmartTerrainDescriptor;

    descriptor.assignedSquadsCount = 6;

    squads.forEach((it) => descriptor.assignedSquads.set(it.id, it));
    squads.forEach((it, index) => jest.spyOn(it, "getScriptedSimulationTarget").mockImplementation(() => index));

    expect(getSmartTerrainMapDisplayHint(smartTerrain).replaceAll("\\n", "\n")).toBe(
      `[translated_st_test_smart_name] (${smartTerrain.name()}) (${smartTerrain.id})
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
test_squad_1005 -> 0
test_squad_1006 -> 1
test_squad_1007 -> 2
test_squad_1008 -> 3
test_squad_1009 -> 4
test_squad_1010 -> 5
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
