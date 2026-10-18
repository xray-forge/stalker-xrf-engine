import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { AnyObject, LuaArray } from "xray16/lib";
import { $fromArray } from "xray16/macros";
import { MockIniFile } from "xray16/mocks";

import { getManager } from "@/engine/core/database";
import { getGameHookRegistrations } from "@/engine/core/hooks/hooks";
import { EGameHook, EGameHookPhase, IGameHookRegistration } from "@/engine/core/hooks/hooks_types";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { getDynamicZoneHuntingRejection } from "@/engine/extensions/dynamic_zone/dynamic_zone_hunting";
import {
  getDynamicZoneRespawnIdle,
  getDynamicZoneRespawnLimit,
} from "@/engine/extensions/dynamic_zone/dynamic_zone_respawn";
import { enabled, load, name, register, save } from "@/engine/extensions/dynamic_zone/main";
import { mockExtension, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/extensions/extensions_config", () => ({
  openExtensionIni: jest.fn(() => MockIniFile.mock("main.ltx", { respawn: { idle: 3_600 } })),
}));

beforeEach(() => {
  resetRegistry();
});

describe("dynamic zone extension", () => {
  it("should be off until the player turns it on", () => {
    expect(name).toBe("Dynamic zone");
    expect(enabled).toBe(false);
  });

  it("should register its respawn, hunting and offline battle handlers, owned by it, with their contexts", () => {
    register(false, mockExtension({ name: "dynamic_zone" }));

    const idle: LuaArray<IGameHookRegistration> = getGameHookRegistrations(EGameHook.SMART_TERRAIN_RESPAWN_IDLE);
    const limit: LuaArray<IGameHookRegistration> = getGameHookRegistrations(EGameHook.SMART_TERRAIN_RESPAWN_LIMIT);

    expect(idle.length()).toBe(1);
    expect(idle.get(1)).toMatchObject({ handler: getDynamicZoneRespawnIdle, owner: name, phase: EGameHookPhase.SET });
    expect((idle.get(1).context as { respawnIdle: number }).respawnIdle).toBe(3_600);
    expect(limit.length()).toBe(1);
    expect(limit.get(1)).toMatchObject({
      handler: getDynamicZoneRespawnLimit,
      owner: name,
      phase: EGameHookPhase.ADJUST,
    });

    const guard: LuaArray<IGameHookRegistration> = getGameHookRegistrations(EGameHook.SIMULATION_TARGET_VALIDITY);

    expect(guard.length()).toBe(1);
    expect(guard.get(1)).toMatchObject({ handler: getDynamicZoneHuntingRejection, owner: name });
    expect(guard.get(1).context).toEqual({ protectionRadiusSqr: 5_625, terrains: null });
    expect(getManager(EventsManager).getEventSubscribersCount(EGameEvent.ACTOR_UPDATE_1000)).toBe(1);
  });

  it("should keep the bodies offline battles left across saves", () => {
    const corpses = $fromArray([{ id: 10, name: "test_body_10" }]);
    const data: AnyObject = {};

    register(false, mockExtension({ name: "dynamic_zone" }));
    load({ corpses });
    save(data);

    expect(data.corpses).toBe(corpses);

    load({});
    save(data);

    expect(data.corpses).toEqualLuaArrays([]);
  });
});
