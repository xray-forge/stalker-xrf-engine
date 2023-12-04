import { beforeEach, describe, expect, it } from "@jest/globals";

import { ESimulationTerrainRole, ISmartTerrainDescriptor, SimulationManager } from "@/engine/core/managers/simulation";
import { getSmartTerrainMapDisplayHint, SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { createObjectJobDescriptor } from "@/engine/core/objects/smart_terrain/job";
import { getSmartTerrainNameCaption } from "@/engine/core/objects/smart_terrain/utils/smart_terrain_generic_utils";
import { Squad } from "@/engine/core/objects/squad";
import { parseConditionsList } from "@/engine/core/utils/ini";
import { forgeConfig } from "@/engine/lib/configs/ForgeConfig";
import { FALSE } from "@/engine/lib/constants/words";
import { AnyObject, TName, TRate } from "@/engine/lib/types";
import { mockRegisteredActor, mockSmartTerrain, mockSquad, resetRegistry } from "@/fixtures/engine";
import { MockCTime, mockServerAlifeHumanStalker } from "@/fixtures/xray";

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
    const smartTerrain: SmartTerrain = mockSmartTerrain();

    mockRegisteredActor();

    smartTerrain.on_before_register();
    smartTerrain.on_register();

    smartTerrain.isSimulationAvailableConditionList = parseConditionsList(FALSE);
    smartTerrain.isRespawnPoint = false;

    forgeConfig.DEBUG.IS_SIMULATION_ENABLED = true;

    expect(getSmartTerrainMapDisplayHint(smartTerrain).replaceAll("\\n", "\n")).toBe(
      `[translated_st_test_smart_name] (test_smart)
available = false
online = nil
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
    const smartTerrain: SmartTerrain = mockSmartTerrain();
    const squads: Array<Squad> = [mockSquad(), mockSquad(), mockSquad(), mockSquad(), mockSquad(), mockSquad()];

    mockRegisteredActor();

    smartTerrain.on_before_register();
    smartTerrain.on_register();

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
    smartTerrain.objectJobDescriptors.set(4000, createObjectJobDescriptor(mockServerAlifeHumanStalker({ id: 4000 })));
    smartTerrain.arrivingObjects.set(4001, mockServerAlifeHumanStalker({ id: 4001 }));

    const descriptor: ISmartTerrainDescriptor = SimulationManager.getInstance().getSmartTerrainDescriptor(
      smartTerrain.id
    ) as ISmartTerrainDescriptor;

    descriptor.assignedSquadsCount = 6;

    squads.forEach((it) => descriptor.assignedSquads.set(it.id, it));

    expect(getSmartTerrainMapDisplayHint(smartTerrain).replaceAll("\\n", "\n")).toBe(
      `[translated_st_test_smart_name] (test_smart)
available = true
online = true
simulation_role = surge
squad_id = 155
capacity = 6\\10
arriving_objects = 1
staying_objects = 3
[spawn_state] (tts: -83133530)
test-1 -> 3\\3
test-2 -> 3\\3
[assigned]
section_1005
section_1006
section_1007
section_1008
section_1009
section_1010
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
