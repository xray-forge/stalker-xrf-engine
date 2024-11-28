import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { registerSimulator, registerZone } from "@/engine/core/database";
import { ESimulationTerrainRole } from "@/engine/core/managers/simulation";
import { ESmartTerrainStatus, SmartTerrainControl } from "@/engine/core/objects/smart_terrain";
import { isInNoCombatZone, isInNoWeaponBase } from "@/engine/core/utils/zone";
import { GameObject, ServerHumanObject } from "@/engine/lib/types";
import { mockRegisteredActor, MockSmartTerrain, MockSquad, resetRegistry } from "@/fixtures/engine";
import { MockAlifeHumanStalker, MockGameObject, MockIniFile } from "@/fixtures/xray";

describe("isInNoCombatZone util", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly check objects in no-combat zones", () => {
    mockRegisteredActor();
    registerSimulator();

    const stalker: ServerHumanObject = MockAlifeHumanStalker.mock();
    const terrain: MockSmartTerrain = MockSmartTerrain.mock();
    const zone: GameObject = MockGameObject.mock({ id: terrain.id });

    jest.spyOn(terrain, "name").mockImplementation(jest.fn(() => "zat_stalker_base_smart"));
    jest.spyOn(zone, "name").mockImplementation(jest.fn(() => "zat_a2_sr_no_assault"));

    terrain.on_before_register();
    terrain.on_register();

    registerZone(zone);

    terrain.terrainControl = new SmartTerrainControl(
      terrain,
      MockIniFile.mock("test.ltx", {
        test_control: {
          noweap_zone: "no_weap_test",
          ignore_zone: "ignore_zone_test",
          alarm_start_sound: "start_sound.ogg",
          alarm_stop_sound: "stop_sound.ogg",
        },
      }),
      "test_control"
    );
    terrain.terrainControl.status = ESmartTerrainStatus.NORMAL;

    expect(isInNoCombatZone(stalker)).toBe(false);

    jest.spyOn(zone, "inside").mockImplementation(() => true);
    expect(isInNoCombatZone(stalker)).toBe(true);

    terrain.terrainControl.status = ESmartTerrainStatus.ALARM;
    expect(isInNoCombatZone(stalker)).toBe(false);

    terrain.terrainControl.status = ESmartTerrainStatus.NORMAL;
    expect(isInNoCombatZone(stalker)).toBe(true);
  });
});

describe("isInNoWeaponBase util", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly check objects in base terrain", () => {
    mockRegisteredActor();
    registerSimulator();

    const squad: MockSquad = MockSquad.mock();
    const terrain: MockSmartTerrain = MockSmartTerrain.mockRegistered();

    terrain.simulationManager.assignSquadToTerrain(squad, terrain.id);
    expect(isInNoWeaponBase(squad)).toBe(false);

    terrain.simulationProperties.set(ESimulationTerrainRole.BASE, 1);
    expect(isInNoWeaponBase(squad)).toBe(true);

    squad.assignedTerrainId = null;
    expect(isInNoWeaponBase(squad)).toBe(false);
  });
});
