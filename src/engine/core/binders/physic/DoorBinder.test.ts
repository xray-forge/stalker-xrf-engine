import { beforeEach, describe, expect, it } from "@jest/globals";
import { sound_object } from "xray16";

import { DoorBinder } from "@/engine/core/binders/physic/DoorBinder";
import { parseConditionsList } from "@/engine/core/utils/ini";
import { TRUE } from "@/engine/lib/constants/words";
import { GameObject, IniFile } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { MockGameObject, MockIniFile, MockSoundObject } from "@/fixtures/xray";

describe("DoorBinder class", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly initialize without ini definition", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: DoorBinder = new DoorBinder(object);

    expect(binder.isLoaded).toBe(false);
    expect(binder.isIdle).toBe(true);
    expect(binder.isPlayingForward).toBe(false);
    expect(binder.animationDuration).toBe(0);

    expect(binder.idleSound).toBeNull();
    expect(binder.startSound).toBeNull();
    expect(binder.stopSound).toBeNull();

    expect(binder.onUseConditionList).toBeUndefined();
    expect(binder.onStopConditionList).toBeUndefined();
    expect(binder.onStartConditionList).toBeUndefined();

    expect(binder.tip).toBeUndefined();
    expect(binder.startDelay).toBeUndefined();
    expect(binder.idleDelay).toBeUndefined();
  });

  it("should correctly initialize with ini definition and defaults", () => {
    const spawnIni: IniFile = MockIniFile.mock("spawn_test.ltx", {
      animated_object: {
        cfg: "another.ltx",
      },
    });

    MockIniFile.register("another.ltx", {
      animated_object: {},
    });

    const object: GameObject = MockGameObject.mock({ spawn_ini: () => spawnIni });
    const binder: DoorBinder = new DoorBinder(object);

    expect(binder.isLoaded).toBe(false);
    expect(binder.isIdle).toBe(true);
    expect(binder.isPlayingForward).toBe(false);
    expect(binder.animationDuration).toBe(0);

    expect(binder.idleSound).toBeInstanceOf(sound_object);
    expect(MockSoundObject.fromObject(binder.idleSound).path).toBe("device\\airtight_door_idle");
    expect(binder.startSound).toBeInstanceOf(sound_object);
    expect(MockSoundObject.fromObject(binder.startSound).path).toBe("device\\airtight_door_start");
    expect(binder.stopSound).toBeInstanceOf(sound_object);
    expect(MockSoundObject.fromObject(binder.stopSound).path).toBe("device\\airtight_door_stop");

    expect(binder.onUseConditionList).toEqualLuaTables(parseConditionsList(TRUE));
    expect(binder.onStopConditionList).toEqualLuaTables(parseConditionsList(TRUE));
    expect(binder.onStartConditionList).toEqualLuaTables(parseConditionsList(TRUE));

    expect(binder.tip).toEqualLuaTables(parseConditionsList("none"));
    expect(binder.startDelay).toBe(0);
    expect(binder.idleDelay).toBe(2000);
  });

  it("should correctly initialize with ini definition and custom values", () => {
    const spawnIni: IniFile = MockIniFile.mock("spawn_test.ltx", {
      animated_object: {
        idle_snd: "device\\first",
        stop_snd: "nil",
        tip: "{+some_info} first, second",
        on_use: "{+a} first, second",
        on_start: "{+b} first, second",
        on_stop: "{+c} first, second",
        start_delay: 250,
        idle_delay: 1000,
      },
    });

    const object: GameObject = MockGameObject.mock({ spawn_ini: () => spawnIni });
    const binder: DoorBinder = new DoorBinder(object);

    expect(binder.isLoaded).toBe(false);
    expect(binder.isIdle).toBe(true);
    expect(binder.isPlayingForward).toBe(false);
    expect(binder.animationDuration).toBe(0);

    expect(binder.idleSound).toBeInstanceOf(sound_object);
    expect(MockSoundObject.fromObject(binder.idleSound).path).toBe("device\\first");
    expect(binder.startSound).toBeInstanceOf(sound_object);
    expect(MockSoundObject.fromObject(binder.startSound).path).toBe("device\\airtight_door_start");
    expect(binder.stopSound).toBeNull();

    expect(binder.onUseConditionList).toEqualLuaTables(parseConditionsList("{+a} first, second"));
    expect(binder.onStartConditionList).toEqualLuaTables(parseConditionsList("{+b} first, second"));
    expect(binder.onStopConditionList).toEqualLuaTables(parseConditionsList("{+c} first, second"));

    expect(binder.tip).toEqualLuaTables(parseConditionsList("{+some_info} first, second"));
    expect(binder.startDelay).toBe(250);
    expect(binder.idleDelay).toBe(1000);
  });

  it.todo("should correctly initialize");

  it.todo("should correctly handle going online/offline");

  it.todo("should correctly handle update event");

  it.todo("should correctly handle use event");

  it.todo("should correctly handle animation end event");

  it.todo("should correctly handle animation stop");

  it.todo("should correctly handle animation forward");

  it.todo("should correctly handle animation backward");
});
