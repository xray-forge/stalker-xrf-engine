import { beforeEach, describe, expect, it } from "@jest/globals";

import {
  ESimulationTerrainRole,
  ISmartTerrainDescriptor,
  SimulationBoardManager,
} from "@/engine/core/managers/simulation";
import { getSmartTerrainMapDisplayHint, SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { getSmartTerrainNameCaption } from "@/engine/core/objects/smart_terrain/utils/smart_terrain_generic_utils";
import { Squad } from "@/engine/core/objects/squad";
import { parseConditionsList } from "@/engine/core/utils/ini";
import { toJSON } from "@/engine/core/utils/transform";
import { forgeConfig } from "@/engine/lib/configs/ForgeConfig";
import { AnyObject } from "@/engine/lib/types";
import { mockRegisteredActor, mockSmartTerrain, mockSquad, resetRegistry } from "@/fixtures/engine";
import { MockCTime } from "@/fixtures/xray";

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

    smartTerrain.isRespawnPoint = false;

    forgeConfig.DEBUG.IS_SIMULATION_ENABLED = true;

    expect(getSmartTerrainMapDisplayHint(smartTerrain).replaceAll("\\n", "\n")).toBe(
      `translated_st_test_smart_name (test_smart)
online = nil
simulation_role = default
squad_id = 0
capacity = 0\\0

not respawn point

${toJSON(smartTerrain.simulationProperties)}`
    );
  });

  it("getSmartTerrainMapDisplayHint should correctly generate map hints with debug and some custom values", () => {
    const smartTerrain: SmartTerrain = mockSmartTerrain();
    const testProperties: AnyObject = { a: 1, b: 2 };
    const squads: Array<Squad> = [mockSquad(), mockSquad(), mockSquad(), mockSquad(), mockSquad(), mockSquad()];

    mockRegisteredActor();

    smartTerrain.on_before_register();
    smartTerrain.on_register();

    forgeConfig.DEBUG.IS_SIMULATION_ENABLED = true;

    smartTerrain.isRespawnPoint = true;
    smartTerrain.simulationProperties = testProperties as unknown as LuaTable<string, string>;
    (smartTerrain as AnyObject).online = true;
    smartTerrain.simulationRole = ESimulationTerrainRole.SURGE;
    smartTerrain.squadId = 155;
    smartTerrain.maxPopulation = 10;

    smartTerrain.lastRespawnUpdatedAt = MockCTime.mock(2015, 2, 14, 14, 25, 30, 100);
    smartTerrain.spawnedSquadsList.set("test-1", { num: 3 });
    smartTerrain.spawnedSquadsList.set("test-2", { num: 3 });

    smartTerrain.spawnSquadsConfiguration.set("test-1", { num: parseConditionsList("3"), squads: new LuaTable() });
    smartTerrain.spawnSquadsConfiguration.set("test-2", { num: parseConditionsList("3"), squads: new LuaTable() });

    const descriptor: ISmartTerrainDescriptor = SimulationBoardManager.getInstance().getSmartTerrainDescriptor(
      smartTerrain.id
    ) as ISmartTerrainDescriptor;

    descriptor.stayingSquadsCount = 6;

    squads.forEach((it) => descriptor.assignedSquads.set(it.id, it));

    expect(getSmartTerrainMapDisplayHint(smartTerrain).replaceAll("\\n", "\n")).toBe(
      `translated_st_test_smart_name (test_smart)
online = true
simulation_role = surge
squad_id = 155
capacity = 6\\10

already_spawned:
[test-1] = 3\\3
[test-2] = 3\\3

time_to_spawn: -83133530

${squads.map((it) => it.name()).join("\n")}

${toJSON(testProperties)}`
    );
  });
});
