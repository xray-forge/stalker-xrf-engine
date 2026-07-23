import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { clsid, game } from "xray16";
import { GameObject, IniFile } from "xray16/alias";
import { createTime } from "xray16/lib";
import { MockGameObject, MockIniFile, MockNetProcessor } from "xray16/mocks";
import { replaceFunctionMock } from "xray16/testing/utils";

import { getManager, registerSimulator, registerZone, registry } from "@/engine/core/database";
import { SoundManager } from "@/engine/core/managers/sounds/SoundManager";
import { SmartTerrain, SmartTerrainControl } from "@/engine/core/objects/smart_terrain";
import { ESmartTerrainStatus } from "@/engine/core/objects/smart_terrain/smart_terrain_types";
import { smartTerrainConfig } from "@/engine/core/objects/smart_terrain/SmartTerrainConfig";
import { mockRegisteredActor, MockSmartTerrain, resetRegistry } from "@/fixtures/engine";

function createControl(terrain: SmartTerrain = MockSmartTerrain.mock()): SmartTerrainControl {
  const ini: IniFile = MockIniFile.mock("test.ltx", {
    smart_control: {
      alarm_start_sound: "alarm_start",
      alarm_stop_sound: "alarm_stop",
      ignore_zone: "ignore_zone",
      noweap_zone: "no_weapon_zone",
    },
  });

  return new SmartTerrainControl(terrain, ini, "smart_control");
}

describe("SmartTerrainControl", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
    mockRegisteredActor();
  });

  it("should initialize control configuration with a normal status", () => {
    const terrain: SmartTerrain = MockSmartTerrain.mock();
    const control: SmartTerrainControl = createControl(terrain);

    expect(control.terrain).toBe(terrain);
    expect(control.status).toBe(ESmartTerrainStatus.NORMAL);
    expect(control.noWeaponZone).toBe("no_weapon_zone");
    expect(control.ignoreZone).toBe("ignore_zone");
    expect(control.alarmStartedAt).toBeNull();
    expect(control.getSmartTerrainStatus()).toBe(ESmartTerrainStatus.NORMAL);
  });

  it("should report danger only when the actor is inside the zone with an active weapon", () => {
    const terrain: SmartTerrain = MockSmartTerrain.mock();
    const control: SmartTerrainControl = createControl(terrain);
    const zone: GameObject = MockGameObject.mock({ name: control.noWeaponZone });

    registerZone(zone);

    jest.spyOn(zone, "inside").mockReturnValue(false);
    expect(control.getActorStatus()).toBe(false);
    expect(registry.activeSmartTerrainId).toBeNull();

    jest.spyOn(zone, "inside").mockReturnValue(true);
    expect(control.getActorStatus()).toBe(false);
    expect(registry.activeSmartTerrainId).toBe(terrain.id);

    jest.spyOn(registry.actor, "active_item").mockReturnValue(MockGameObject.mockWithClassId(clsid.wpn_ak74));
    expect(control.getActorStatus()).toBe(true);

    jest.spyOn(zone, "inside").mockReturnValue(false);
    expect(control.getActorStatus()).toBe(false);
    expect(registry.activeSmartTerrainId).toBeNull();
  });

  it("should start an alarm and return to the current actor danger status after its duration", () => {
    const terrain: SmartTerrain = MockSmartTerrain.mock();
    const control: SmartTerrainControl = createControl(terrain);
    const soundManager: SoundManager = getManager(SoundManager);
    const currentTime = createTime(2012, 6, 12, 9, 30, 0, 0);

    terrain.on_before_register();
    replaceFunctionMock(game.get_game_time, () => currentTime);
    jest.spyOn(currentTime, "diffSec").mockReturnValue(smartTerrainConfig.ALARM_SMART_TERRAIN_BASE);
    jest.spyOn(control, "getActorStatus").mockReturnValue(false);
    jest.spyOn(soundManager, "play").mockImplementation(() => null);

    control.onActorAttackSmartTerrain();

    expect(control.status).toBe(ESmartTerrainStatus.ALARM);
    expect(control.alarmStartedAt).toBe(currentTime);
    expect(soundManager.play).toHaveBeenCalledWith(0, "alarm_start");

    control.update();

    expect(soundManager.play).toHaveBeenCalledWith(0, "alarm_stop");
    expect(control.status).toBe(ESmartTerrainStatus.NORMAL);
    expect(control.alarmStartedAt).toBeNull();
  });

  it("should keep an active alarm until its base duration expires", () => {
    const terrain: SmartTerrain = MockSmartTerrain.mock();
    const control: SmartTerrainControl = createControl(terrain);
    const startedAt = createTime(2012, 6, 12, 9, 30, 0, 0);

    terrain.on_before_register();
    control.status = ESmartTerrainStatus.ALARM;
    control.alarmStartedAt = startedAt;
    replaceFunctionMock(game.get_game_time, () => startedAt);
    jest.spyOn(startedAt, "diffSec").mockReturnValue(smartTerrainConfig.ALARM_SMART_TERRAIN_BASE - 1);
    jest.spyOn(control, "getActorStatus");

    control.update();

    expect(control.status).toBe(ESmartTerrainStatus.ALARM);
    expect(control.alarmStartedAt).toBe(startedAt);
    expect(control.getActorStatus).not.toHaveBeenCalled();
  });

  it("should preserve status and alarm start time through save and load", () => {
    const control: SmartTerrainControl = createControl();
    const restored: SmartTerrainControl = createControl();
    const processor: MockNetProcessor = new MockNetProcessor();

    control.status = ESmartTerrainStatus.ALARM;
    control.alarmStartedAt = createTime(2012, 6, 12, 9, 30, 0, 0);

    control.save(processor.asNetPacket());
    restored.load(processor.asNetReader());

    expect(processor.readDataOrder).toEqual(processor.writeDataOrder);
    expect(processor.dataList).toHaveLength(0);
    expect(restored.status).toBe(ESmartTerrainStatus.ALARM);
    expect(restored.alarmStartedAt?.toString()).toBe(control.alarmStartedAt.toString());
  });
});
