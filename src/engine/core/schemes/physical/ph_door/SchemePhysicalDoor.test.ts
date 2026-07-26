import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject, IniFile } from "xray16/alias";
import { MockGameObject, MockIniFile } from "xray16/mocks";

import { registerObject } from "@/engine/core/database";
import { getConfigSwitchConditions, parseConditionsList } from "@/engine/core/ini";
import { ISchemePhysicalDoorState } from "@/engine/core/schemes/physical/ph_door/ph_door_types";
import { PhysicalDoorController } from "@/engine/core/schemes/physical/ph_door/PhysicalDoorController";
import { SchemePhysicalDoor } from "@/engine/core/schemes/physical/ph_door/SchemePhysicalDoor";
import { loadSchemeImplementation } from "@/engine/core/schemes/runtime";
import { EScheme } from "@/engine/core/schemes/types";
import { assertSchemeSubscribedToController, resetRegistry } from "@/fixtures/engine";

describe("SchemePhysicalDoor", () => {
  beforeEach(() => {
    resetRegistry();
    loadSchemeImplementation(SchemePhysicalDoor);
  });

  it("should correctly activate with defaults", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", { "ph_door@test": {} });

    registerObject(object);

    const state: ISchemePhysicalDoorState = SchemePhysicalDoor.activate(object, ini, EScheme.PH_DOOR, "ph_door@test");

    expect(state.logic).toEqualLuaTables({});
    expect(state.closed).toBe(true);
    expect(state.locked).toBe(false);
    expect(state.noForce).toBe(false);
    expect(state.notForNpc).toBe(false);
    expect(state.showTips).toBe(true);
    expect(state.tipOpen).toBe("tip_door_open");
    expect(state.tipUnlock).toBe("tip_door_locked");
    expect(state.tipClose).toBe("tip_door_close");
    expect(state.slider).toBe(false);
    expect(state.sndOpenStart).toBe("trader_door_open_start");
    expect(state.sndCloseStart).toBe("trader_door_close_start");
    expect(state.sndCloseStop).toBe("trader_door_close_stop");
    expect(state.onUse).toBeNull();
    expect(state.hitOnBone).toEqualLuaTables({});

    expect(object.lock_door_for_npc).not.toHaveBeenCalled();
    expect(object.unlock_door_for_npc).not.toHaveBeenCalled();
    expect(object.register_door_for_npc).toHaveBeenCalledTimes(1);

    assertSchemeSubscribedToController(state, PhysicalDoorController);
  });

  it("should correctly activate with data", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "ph_door@test": {
        on_info: "{+test} first, second",
        closed: false,
        locked: true,
        no_force: true,
        not_for_npc: true,
        show_tips: false,
        tip_open: "tip_open_custom",
        tip_close: "tip_close_custom",
        slider: true,
        snd_open_start: "snd_open",
        snd_close_start: "snd_close",
        snd_close_stop: "snd_close_stop",
        on_use: "{+test} a, b",
        hit_on_bone: "2|hit_section",
      },
    });

    registerObject(object);

    const state: ISchemePhysicalDoorState = SchemePhysicalDoor.activate(object, ini, EScheme.PH_DOOR, "ph_door@test");

    expect(state.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "ph_door@test"));
    expect(state.closed).toBe(false);
    expect(state.locked).toBe(true);
    expect(state.noForce).toBe(true);
    expect(state.notForNpc).toBe(true);
    expect(state.showTips).toBe(false);
    expect(state.tipOpen).toBe("tip_open_custom");
    expect(state.tipUnlock).toBe("tip_open_custom");
    expect(state.tipClose).toBe("tip_close_custom");
    expect(state.slider).toBe(true);
    expect(state.sndOpenStart).toBe("snd_open");
    expect(state.sndCloseStart).toBe("snd_close");
    expect(state.sndCloseStop).toBe("snd_close_stop");
    expect(state.onUse?.condlist).toEqualLuaTables(parseConditionsList("{+test} a, b"));
    expect(state.hitOnBone.get(2).state).toEqualLuaTables(parseConditionsList("hit_section"));
  });

  it("should lock door for npc when locked and not locked yet", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", { "ph_door@test": { locked: true } });

    registerObject(object);
    jest.spyOn(object, "is_door_locked_for_npc").mockImplementation(() => false);

    SchemePhysicalDoor.activate(object, ini, EScheme.PH_DOOR, "ph_door@test");

    expect(object.lock_door_for_npc).toHaveBeenCalledTimes(1);
    expect(object.unlock_door_for_npc).not.toHaveBeenCalled();
  });

  it("should not lock door for npc when it is already locked", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", { "ph_door@test": { not_for_npc: true } });

    registerObject(object);
    jest.spyOn(object, "is_door_locked_for_npc").mockImplementation(() => true);

    SchemePhysicalDoor.activate(object, ini, EScheme.PH_DOOR, "ph_door@test");

    expect(object.lock_door_for_npc).not.toHaveBeenCalled();
    expect(object.unlock_door_for_npc).not.toHaveBeenCalled();
  });

  it("should unlock door for npc when not locked anymore", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", { "ph_door@test": {} });

    registerObject(object);
    jest.spyOn(object, "is_door_locked_for_npc").mockImplementation(() => true);

    SchemePhysicalDoor.activate(object, ini, EScheme.PH_DOOR, "ph_door@test");

    expect(object.lock_door_for_npc).not.toHaveBeenCalled();
    expect(object.unlock_door_for_npc).toHaveBeenCalledTimes(1);
  });
});
