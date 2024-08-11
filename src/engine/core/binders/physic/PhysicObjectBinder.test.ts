import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { callback, level } from "xray16";

import { PhysicObjectBinder } from "@/engine/core/binders/physic/PhysicObjectBinder";
import { getManager, ILogicsOverrides, IRegistryObjectState, registerObject, registry } from "@/engine/core/database";
import { BoxManager } from "@/engine/core/managers/box";
import { SoundManager } from "@/engine/core/managers/sounds";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { parseConditionsList } from "@/engine/core/utils/ini";
import { emitSchemeEvent, initializeObjectSchemeLogic } from "@/engine/core/utils/scheme";
import { ZERO_VECTOR } from "@/engine/lib/constants/vectors";
import { EScheme, ESchemeEvent, ESchemeType, GameObject } from "@/engine/lib/types";
import { mockRegisteredActor, mockSchemeState, resetRegistry } from "@/fixtures/engine";
import { resetFunctionMock } from "@/fixtures/jest";
import {
  EPacketDataType,
  MockAlifeObject,
  MockGameObject,
  MockIniFile,
  MockNetProcessor,
  MockObjectBinder,
} from "@/fixtures/xray";

jest.mock("@/engine/core/utils/scheme");

describe("PhysicObjectBinder", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(emitSchemeEvent);
  });

  it("should handle going online/offline when spawn check is falsy", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: PhysicObjectBinder = new PhysicObjectBinder(object);
    const soundManager: SoundManager = getManager(SoundManager);

    jest.spyOn(soundManager, "stop").mockImplementation(jest.fn());
    (binder as unknown as MockObjectBinder).canSpawn = false;

    binder.net_spawn(MockAlifeObject.mock({ id: object.id() }));

    expect(registry.objects.length()).toBe(0);
    expect(soundManager.stop).not.toHaveBeenCalled();
  });

  it("should handle going online/offline with defaults", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: PhysicObjectBinder = new PhysicObjectBinder(object);
    const soundManager: SoundManager = getManager(SoundManager);

    jest.spyOn(soundManager, "stop").mockImplementation(jest.fn());

    binder.net_spawn(MockAlifeObject.mock({ id: object.id() }));

    const state: IRegistryObjectState = registry.objects.get(object.id());

    expect(state).not.toBeNull();

    binder.reinit();

    expect(registry.objects.get(object.id())).not.toBe(state);
    expect(registry.objects.get(object.id())).toEqual(state);

    binder.net_destroy();

    expect(registry.objects.has(object.id())).toBe(false);
    expect(soundManager.stop).toHaveBeenCalledWith(object.id());
  });

  it("should handle with extended config", () => {
    mockRegisteredActor();

    const binder: PhysicObjectBinder = new PhysicObjectBinder(
      MockGameObject.mock({
        spawnIni: MockIniFile.mock("test.ltx", {
          level_spot: {
            actor_box: true,
          },
        }),
      })
    );
    const soundManager: SoundManager = getManager(SoundManager);

    jest.spyOn(soundManager, "stop").mockImplementation(jest.fn());

    binder.net_spawn(MockAlifeObject.mock({ id: binder.object.id() }));

    const state: IRegistryObjectState = registry.objects.get(binder.object.id());

    expect(level.map_add_object_spot).toHaveBeenCalledWith(
      binder.object.id(),
      "ui_pda2_actor_box_location",
      "st_ui_pda_actor_box"
    );

    jest.spyOn(level, "map_has_object_spot").mockImplementationOnce(() => 1);

    state.activeScheme = EScheme.ANIMPOINT;
    state.overrides = { onOffline: parseConditionsList("%+test_info_pb% test") } as ILogicsOverrides;
    state[EScheme.ANIMPOINT] = mockSchemeState(EScheme.ANIMPOINT);

    binder.net_destroy();

    expect(registry.objects.has(binder.object.id())).toBe(false);
    expect(soundManager.stop).toHaveBeenCalledWith(binder.object.id());
    expect(level.map_remove_object_spot).toHaveBeenCalledWith(binder.object.id(), "ui_pda2_actor_box_location");

    expect(emitSchemeEvent).toHaveBeenCalledWith(state[EScheme.ANIMPOINT], ESchemeEvent.SWITCH_OFFLINE, binder.object);
    expect(hasInfoPortion("test_info_pb")).toBe(true);
  });

  it("should handle update events", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: PhysicObjectBinder = new PhysicObjectBinder(object);

    mockRegisteredActor();

    jest.spyOn(getManager(SoundManager), "update").mockImplementation(jest.fn());

    expect(binder.isInitialized).toBe(false);

    binder.reinit();

    binder.state.activeScheme = EScheme.ANIMPOINT;
    binder.state[EScheme.ANIMPOINT] = mockSchemeState(EScheme.ANIMPOINT);

    binder.update(150);

    expect(object.set_callback).toHaveBeenCalledTimes(3);
    expect(object.set_callback).toHaveBeenCalledWith(callback.hit, binder.onHit, binder);
    expect(object.set_callback).toHaveBeenCalledWith(callback.death, binder.onDeath, binder);
    expect(object.set_callback).toHaveBeenCalledWith(callback.use_object, binder.onUse, binder);

    expect(binder.isInitialized).toBe(true);
    expect(initializeObjectSchemeLogic).toHaveBeenCalledWith(object, binder.state, false, ESchemeType.OBJECT);
    expect(emitSchemeEvent).toHaveBeenCalledWith(binder.state[EScheme.ANIMPOINT], ESchemeEvent.UPDATE, 150);
    expect(getManager(SoundManager).update).toHaveBeenCalledWith(object.id());
  });

  it("should be save relevant", () => {
    const binder: PhysicObjectBinder = new PhysicObjectBinder(MockGameObject.mock());

    expect(binder.net_save_relevant()).toBe(true);
  });

  it("should handle save/load", () => {
    jest.spyOn(Date, "now").mockImplementation(() => 5000);

    const processor: MockNetProcessor = new MockNetProcessor();
    const binder: PhysicObjectBinder = new PhysicObjectBinder(MockGameObject.mock());
    const binderState: IRegistryObjectState = registerObject(binder.object);

    binderState.jobIni = "test.ltx";
    binderState.iniFilename = "test_filename.ltx";
    binderState.sectionLogic = "logic";
    binderState.activeSection = "test@test";
    binderState.smartTerrainName = "test-smart";

    binder.save(processor.asNetPacket());

    expect(processor.writeDataOrder).toEqual([
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
      EPacketDataType.U16,
    ]);
    expect(processor.dataList).toEqual([
      "save_from_PhysicObjectBinder",
      "test.ltx",
      "test_filename.ltx",
      "logic",
      "test@test",
      "test-smart",
      -5000,
      255,
      0,
      8,
      10,
    ]);

    const newBinder: PhysicObjectBinder = new PhysicObjectBinder(MockGameObject.mock());
    const newBinderState: IRegistryObjectState = registerObject(newBinder.object);

    newBinder.load(processor.asNetReader());

    expect(newBinder.isLoaded).toBe(true);
    expect(newBinder.isInitialized).toBe(false);
    expect(newBinderState.jobIni).toBe("test.ltx");
    expect(newBinderState.loadedSectionLogic).toBe("logic");
    expect(newBinderState.loadedActiveSection).toBe("test@test");
    expect(newBinderState.loadedSmartTerrainName).toBe("test-smart");
    expect(newBinderState.loadedIniFilename).toBe("test_filename.ltx");

    expect(processor.readDataOrder).toEqual(processor.writeDataOrder);
    expect(processor.dataList).toHaveLength(0);
  });

  it("should handle use events", () => {
    const object: GameObject = MockGameObject.mock();
    const who: GameObject = MockGameObject.mock();
    const binder: PhysicObjectBinder = new PhysicObjectBinder(object);

    binder.reinit();

    binder.state.activeScheme = EScheme.ANIMPOINT;
    binder.state[EScheme.ANIMPOINT] = mockSchemeState(EScheme.ANIMPOINT);

    binder.onUse(object, who);

    expect(emitSchemeEvent).toHaveBeenCalledWith(binder.state[EScheme.ANIMPOINT], ESchemeEvent.USE, object, who);
  });

  it("should handle hit events", () => {
    const object: GameObject = MockGameObject.mock();
    const who: GameObject = MockGameObject.mock();
    const binder: PhysicObjectBinder = new PhysicObjectBinder(object);

    binder.reinit();

    binder.state.activeScheme = EScheme.ANIMPOINT;
    binder.state[EScheme.ANIMPOINT] = mockSchemeState(EScheme.ANIMPOINT);
    binder.state[EScheme.HIT] = mockSchemeState(EScheme.HIT);

    binder.onHit(object, 0.5, ZERO_VECTOR, who, 10);

    expect(emitSchemeEvent).toHaveBeenCalledWith(
      binder.state[EScheme.HIT],
      ESchemeEvent.HIT,
      object,
      0.5,
      ZERO_VECTOR,
      who,
      10
    );
    expect(emitSchemeEvent).toHaveBeenCalledWith(
      binder.state[binder.state.activeScheme],
      ESchemeEvent.HIT,
      object,
      0.5,
      ZERO_VECTOR,
      who,
      10
    );
  });

  it("should handle death events", () => {
    const object: GameObject = MockGameObject.mock({
      spawnIni: MockIniFile.mock("test.ltx", {
        drop_box: {
          a: 1,
        },
        level_spot: {
          actor_box: true,
        },
      }),
    });
    const killer: GameObject = MockGameObject.mock();
    const binder: PhysicObjectBinder = new PhysicObjectBinder(object);

    jest.spyOn(getManager(BoxManager), "spawnBoxObjectItems").mockImplementation(jest.fn());

    binder.reinit();

    binder.state.activeScheme = EScheme.ANIMPOINT;
    binder.state[EScheme.ANIMPOINT] = mockSchemeState(EScheme.ANIMPOINT);

    binder.onDeath(object, killer);

    expect(emitSchemeEvent).toHaveBeenCalledWith(
      binder.state[binder.state.activeScheme],
      ESchemeEvent.DEATH,
      object,
      killer
    );
    expect(getManager(BoxManager).spawnBoxObjectItems).toHaveBeenCalledWith(object);
  });
});
