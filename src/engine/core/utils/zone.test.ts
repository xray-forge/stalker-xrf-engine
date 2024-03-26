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
    const smartTerrain: MockSmartTerrain = MockSmartTerrain.mock();
    const zone: GameObject = MockGameObject.mock({ id: smartTerrain.id });

    jest.spyOn(smartTerrain, "name").mockImplementation(jest.fn(() => "zat_stalker_base_smart"));
    jest.spyOn(zone, "name").mockImplementation(jest.fn(() => "zat_a2_sr_no_assault"));

    smartTerrain.on_before_register();
    smartTerrain.on_register();

    registerZone(zone);

    smartTerrain.terrainControl = new SmartTerrainControl(
      smartTerrain,
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
    smartTerrain.terrainControl.status = ESmartTerrainStatus.NORMAL;

    expect(isInNoCombatZone(stalker)).toBe(false);

    jest.spyOn(zone, "inside").mockImplementation(() => true);
    expect(isInNoCombatZone(stalker)).toBe(true);

    smartTerrain.terrainControl.status = ESmartTerrainStatus.ALARM;
    expect(isInNoCombatZone(stalker)).toBe(false);

    smartTerrain.terrainControl.status = ESmartTerrainStatus.NORMAL;
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
    const smartTerrain: MockSmartTerrain = MockSmartTerrain.mockRegistered();

    smartTerrain.simulationManager.assignSquadToSmartTerrain(squad, smartTerrain.id);
    expect(isInNoWeaponBase(squad)).toBe(false);

    smartTerrain.simulationProperties.set(ESimulationTerrainRole.BASE, 1);
    expect(isInNoWeaponBase(squad)).toBe(true);

    squad.assignedSmartTerrainId = null;
    expect(isInNoWeaponBase(squad)).toBe(false);
  });
});
