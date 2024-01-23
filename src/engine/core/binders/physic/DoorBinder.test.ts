import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { callback, sound_object } from "xray16";

import { DoorBinder } from "@/engine/core/binders/physic/DoorBinder";
import { IRegistryObjectState, registerObject, registry } from "@/engine/core/database";
import { extern } from "@/engine/core/utils/binding";
import { parseConditionsList } from "@/engine/core/utils/ini";
import { TRUE } from "@/engine/lib/constants/words";
import { ESoundObjectType, GameObject, IniFile, PhysicObject, ServerObject } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import {
  EPacketDataType,
  MockAlifeObject,
  MockGameObject,
  MockIniFile,
  MockNetProcessor,
  MockObjectBinder,
  MockPhysicObject,
  MockSoundObject,
} from "@/fixtures/xray";

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

    expect(binder.tipConditionList).toBeNull();
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
    expect(MockSoundObject.asObject(binder.idleSound).path).toBe("device\\airtight_door_idle");
    expect(binder.startSound).toBeInstanceOf(sound_object);
    expect(MockSoundObject.asObject(binder.startSound).path).toBe("device\\airtight_door_start");
    expect(binder.stopSound).toBeInstanceOf(sound_object);
    expect(MockSoundObject.asObject(binder.stopSound).path).toBe("device\\airtight_door_stop");

    expect(binder.onUseConditionList).toEqualLuaTables(parseConditionsList(TRUE));
    expect(binder.onStopConditionList).toEqualLuaTables(parseConditionsList(TRUE));
    expect(binder.onStartConditionList).toEqualLuaTables(parseConditionsList(TRUE));

    expect(binder.tipConditionList).toEqualLuaTables(parseConditionsList("none"));
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
    expect(MockSoundObject.asObject(binder.idleSound).path).toBe("device\\first");
    expect(binder.startSound).toBeInstanceOf(sound_object);
    expect(MockSoundObject.asObject(binder.startSound).path).toBe("device\\airtight_door_start");
    expect(binder.stopSound).toBeNull();

    expect(binder.onUseConditionList).toEqualLuaTables(parseConditionsList("{+a} first, second"));
    expect(binder.onStartConditionList).toEqualLuaTables(parseConditionsList("{+b} first, second"));
    expect(binder.onStopConditionList).toEqualLuaTables(parseConditionsList("{+c} first, second"));

    expect(binder.tipConditionList).toEqualLuaTables(parseConditionsList("{+some_info} first, second"));
    expect(binder.startDelay).toBe(250);
    expect(binder.idleDelay).toBe(1000);
  });

  it("should correctly reinit", () => {
    const serverObject: ServerObject = MockAlifeObject.mock();
    const object: GameObject = MockGameObject.mock({ idOverride: serverObject.id });
    const binder: DoorBinder = new DoorBinder(object);

    jest.spyOn(object, "get_physics_object").mockImplementation(() => MockPhysicObject.mock());

    binder.net_spawn(serverObject);

    const state: IRegistryObjectState = registry.objects.get(object.id());

    binder.reinit();

    expect(registry.objects.get(object.id())).not.toBe(state);
    expect(registry.objects.get(object.id()).object).toBe(object);
  });

  it("should correctly handle going online/offline when spawn disabled", () => {
    const serverObject: ServerObject = MockAlifeObject.mock();
    const binder: DoorBinder = new DoorBinder(MockGameObject.mock({ idOverride: serverObject.id }));

    MockObjectBinder.asMock(binder).canSpawn = false;

    expect(binder.net_spawn(serverObject)).toBe(false);
    expect(registry.objects.length()).toBe(0);
  });

  it("should correctly handle going online/offline", () => {
    const serverObject: ServerObject = MockAlifeObject.mock();
    const object: GameObject = MockGameObject.mock({ idOverride: serverObject.id });
    const binder: DoorBinder = new DoorBinder(object);
    const physicObject: PhysicObject = MockPhysicObject.mock();

    jest.spyOn(object, "get_physics_object").mockImplementation(() => physicObject);

    binder.startSound = MockSoundObject.mock("test");
    binder.idleSound = MockSoundObject.mock("test");
    binder.stopSound = MockSoundObject.mock("test");

    expect(binder.net_spawn(serverObject)).toBe(true);

    expect(registry.objects.length()).toBe(1);
    expect(registry.doors.length()).toBe(1);

    expect(object.set_callback).toHaveBeenCalledTimes(2);
    expect(object.set_callback).toHaveBeenCalledWith(callback.script_animation, binder.onAnimation, binder);
    expect(object.set_callback).toHaveBeenCalledWith(callback.use_object, binder.onUse, binder);

    expect(physicObject.stop_anim).toHaveBeenCalled();
    expect(physicObject.anim_time_set).toHaveBeenCalledWith(0);

    binder.net_destroy();

    expect(registry.objects.length()).toBe(0);
    expect(registry.doors.length()).toBe(0);

    expect(object.clear_callbacks).toHaveBeenCalledTimes(1);

    expect(binder.idleSound.stop).toHaveBeenCalledTimes(1);
    expect(binder.startSound.stop).toHaveBeenCalledTimes(1);
    expect(binder.stopSound.stop).toHaveBeenCalledTimes(1);
  });

  it("should correctly handle generic update with idle state", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: DoorBinder = new DoorBinder(object);
    const physicObject: PhysicObject = MockPhysicObject.mock();

    jest.spyOn(object, "get_physics_object").mockImplementation(() => physicObject);

    binder.isIdle = true;
    binder.animationDuration = 150;
    binder.idleSound = MockSoundObject.mock("test");
    binder.tipConditionList = parseConditionsList("{+one} first, second");

    binder.update(50);

    expect(physicObject.stop_anim).toHaveBeenCalled();
    expect(physicObject.anim_time_set).toHaveBeenCalledWith(150);
    expect(binder.idleSound.stop).toHaveBeenCalled();
    expect(object.set_tip_text).toHaveBeenCalledWith("second");
  });

  it("should correctly handle generic update with active state after update", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: DoorBinder = new DoorBinder(object);
    const physicObject: PhysicObject = MockPhysicObject.mock();

    jest.spyOn(object, "get_physics_object").mockImplementation(() => physicObject);

    binder.isLoaded = true;
    binder.isIdle = false;
    binder.animationDuration = 150;

    binder.update(50);

    expect(physicObject.anim_time_set).toHaveBeenCalledWith(150);
    expect(physicObject.run_anim_back).toHaveBeenCalled();
    expect(object.set_tip_text).toHaveBeenCalledWith("");
    expect(binder.animationDuration).toBeNull();
    expect(binder.isLoaded).toBe(false);
  });

  it("should correctly handle generic update with active state", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: DoorBinder = new DoorBinder(object);
    const physicObject: PhysicObject = MockPhysicObject.mock();

    jest.spyOn(object, "get_physics_object").mockImplementation(() => physicObject);

    binder.isIdle = false;
    binder.isPlayingForward = false;

    binder.update(50);

    expect(object.set_tip_text).toHaveBeenCalledWith("");
    expect(physicObject.run_anim_back).toHaveBeenCalledTimes(1);
    expect(physicObject.run_anim_forward).toHaveBeenCalledTimes(0);

    binder.isPlayingForward = true;
    binder.tipConditionList = parseConditionsList("{-one} a, b");

    binder.update(50);

    expect(object.set_tip_text).toHaveBeenCalledWith("a");
    expect(physicObject.run_anim_back).toHaveBeenCalledTimes(1);
    expect(physicObject.run_anim_forward).toHaveBeenCalledTimes(1);
  });

  it("should correctly handle animation forward", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: DoorBinder = new DoorBinder(object);
    const physicObject: PhysicObject = MockPhysicObject.mock();

    const onStartEffect = jest.fn();

    jest.spyOn(object, "get_physics_object").mockImplementation(() => physicObject);

    extern("xr_effects.effect_on_start", onStartEffect);

    binder.isIdle = true;
    binder.isPlayingForward = false;
    binder.startDelay = 4000;
    binder.idleDelay = 8000;
    binder.idleSound = MockSoundObject.mock("test");
    binder.startSound = MockSoundObject.mock("test");
    binder.onStartConditionList = parseConditionsList("%=effect_on_start%");

    binder.startAnimation(true);

    expect(binder.isIdle).toBe(false);
    expect(binder.isPlayingForward).toBe(true);
    expect(binder.idleSound.stop).toHaveBeenCalled();
    expect(physicObject.stop_anim).toHaveBeenCalled();
    expect(binder.startSound.play_at_pos).toHaveBeenCalledWith(object, object.position(), 4, ESoundObjectType.S3D);
    expect(binder.idleSound.play_at_pos).toHaveBeenCalledWith(
      object,
      object.position(),
      12,
      ESoundObjectType.S3D + ESoundObjectType.LOOPED
    );
    expect(onStartEffect).toHaveBeenCalledTimes(1);
  });

  it("should correctly handle animation stop", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: DoorBinder = new DoorBinder(object);
    const physicObject: PhysicObject = MockPhysicObject.mock();

    const onStopEffect = jest.fn();

    jest.spyOn(object, "get_physics_object").mockImplementation(() => physicObject);

    extern("xr_effects.effect_on_stop", onStopEffect);

    binder.isIdle = false;
    binder.animationDuration = 5_000;
    binder.stopSound = MockSoundObject.mock("test");
    binder.onStopConditionList = parseConditionsList("%=effect_on_stop%");

    binder.stopAnimation();

    expect(binder.isIdle).toBe(true);
    expect(binder.animationDuration).toBe(0);
    expect(physicObject.stop_anim).toHaveBeenCalled();
    expect(binder.stopSound.play_at_pos).toHaveBeenCalledWith(object, object.position(), 0, ESoundObjectType.S3D);
    expect(onStopEffect).toHaveBeenCalledTimes(1);
  });

  it("should correctly handle animation event", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: DoorBinder = new DoorBinder(object);
    const physicObject: PhysicObject = MockPhysicObject.mock();
    const onEndEffect = jest.fn();

    jest.spyOn(object, "get_physics_object").mockImplementation(() => physicObject);

    extern("xr_effects.effect_on_end", onEndEffect);

    binder.isIdle = false;
    binder.animationDuration = 10_000;
    binder.onStopConditionList = parseConditionsList("%=effect_on_end%");
    binder.stopSound = MockSoundObject.mock("test");

    binder.onAnimation();

    expect(binder.isIdle).toBe(false);
    expect(binder.animationDuration).toBe(10_000);
    expect(onEndEffect).not.toHaveBeenCalled();

    binder.onAnimation(true);

    expect(binder.isIdle).toBe(true);
    expect(binder.animationDuration).toBe(0);
    expect(binder.stopSound.play_at_pos).toHaveBeenCalledWith(object, object.position(), 0, ESoundObjectType.S3D);
    expect(onEndEffect).toHaveBeenCalled();
  });

  it("should correctly handle use event", () => {
    const onUseEffect = jest.fn();

    extern("xr_effects.effect_on_use", onUseEffect);

    const binder: DoorBinder = new DoorBinder(MockGameObject.mock());

    binder.onUseConditionList = parseConditionsList("%=effect_on_use%");

    binder.onUse(binder.object);

    expect(onUseEffect).toHaveBeenCalledTimes(1);
  });

  it("should correctly handle save/load", () => {
    jest.spyOn(Date, "now").mockImplementation(() => 5000);

    const netProcessor: MockNetProcessor = new MockNetProcessor();
    const binder: DoorBinder = new DoorBinder(MockGameObject.mock());
    const binderState: IRegistryObjectState = registerObject(binder.object);
    const physicObject: PhysicObject = MockPhysicObject.mock();

    jest.spyOn(binder.object, "get_physics_object").mockImplementation(() => physicObject);
    jest.spyOn(physicObject, "anim_time_get").mockImplementation(() => 20);

    binderState.jobIni = "test.ltx";
    binderState.iniFilename = "test_filename.ltx";
    binderState.sectionLogic = "logic";
    binderState.activeSection = "test@test";
    binderState.smartTerrainName = "test-smart";

    binder.isIdle = false;
    binder.isPlayingForward = true;

    binder.save(netProcessor.asMockNetPacket());

    expect(netProcessor.writeDataOrder).toEqual([
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.I32,
      EPacketDataType.U8,
      EPacketDataType.U32,
      EPacketDataType.U16,
      EPacketDataType.BOOLEAN,
      EPacketDataType.BOOLEAN,
      EPacketDataType.F32,
      EPacketDataType.U16,
    ]);
    expect(netProcessor.dataList).toEqual([
      "save_from_DoorBinder",
      "test.ltx",
      "test_filename.ltx",
      "logic",
      "test@test",
      "test-smart",
      -5000,
      255,
      0,
      8,
      false,
      true,
      20,
      13,
    ]);

    const newBinder: DoorBinder = new DoorBinder(MockGameObject.mock());
    const newBinderState: IRegistryObjectState = registerObject(newBinder.object);

    newBinder.load(netProcessor.asNetReader());

    expect(newBinderState.jobIni).toBe("test.ltx");
    expect(newBinderState.loadedSectionLogic).toBe("logic");
    expect(newBinderState.loadedActiveSection).toBe("test@test");
    expect(newBinderState.loadedSmartTerrainName).toBe("test-smart");
    expect(newBinderState.loadedIniFilename).toBe("test_filename.ltx");

    expect(newBinder.isLoaded).toBe(true);
    expect(newBinder.isIdle).toBe(false);
    expect(newBinder.isPlayingForward).toBe(true);
    expect(newBinder.animationDuration).toBe(20);

    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toHaveLength(0);
  });

  it("should be save relevant", () => {
    const binder: DoorBinder = new DoorBinder(MockGameObject.mock());

    expect(binder.net_save_relevant()).toBe(true);
  });
});
