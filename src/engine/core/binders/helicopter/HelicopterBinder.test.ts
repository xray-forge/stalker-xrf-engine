import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { CHelicopter } from "xray16";

import { HelicopterBinder } from "@/engine/core/binders/helicopter/HelicopterBinder";
import { IRegistryObjectState, registerObject, registry } from "@/engine/core/database";
import { ISchemeHelicopterMoveState } from "@/engine/core/schemes/helicopter/heli_move";
import { HelicopterCombatManager } from "@/engine/core/schemes/helicopter/heli_move/combat";
import { HelicopterFireManager } from "@/engine/core/schemes/helicopter/heli_move/fire";
import { emitSchemeEvent } from "@/engine/core/utils/scheme";
import { ZERO_VECTOR } from "@/engine/lib/constants/vectors";
import { EScheme, ESchemeEvent, GameObject, ServerObject } from "@/engine/lib/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";
import { resetFunctionMock } from "@/fixtures/jest";
import { EPacketDataType, MockAlifeObject, MockGameObject, MockNetProcessor, MockObjectBinder } from "@/fixtures/xray";

jest.mock("@/engine/core/utils/scheme");

describe("HelicopterBinder", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(emitSchemeEvent);
  });

  it("should correctly initialize", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const binder: HelicopterBinder = new HelicopterBinder(object);

    expect(binder.inInitialized).toBe(false);
    expect(binder.isLoaded).toBe(false);
    expect(binder.flameStartHealth).toBe(0);
    expect(binder.helicopter).toBeInstanceOf(CHelicopter);
    expect(binder.helicopterFireManager).toBeInstanceOf(HelicopterFireManager);
  });

  it.todo("should correctly handle re-init event");

  it.todo("should correctly handle update event");

  it("should correctly handle going online and offline when spawn disabled", () => {
    const serverObject: ServerObject = MockAlifeObject.mockNew();
    const object: GameObject = MockGameObject.mockHelicopter({ id: serverObject.id });
    const binder: HelicopterBinder = new HelicopterBinder(object);

    MockObjectBinder.asMock(binder).canSpawn = false;

    expect(binder.net_spawn(serverObject)).toBe(false);

    expect(registry.objects.length()).toBe(0);
    expect(registry.helicopter.storage.length()).toBe(0);
  });

  it("should correctly handle going online and offline", () => {
    const serverObject: ServerObject = MockAlifeObject.mockNew();
    const object: GameObject = MockGameObject.mockHelicopter({ id: serverObject.id });
    const binder: HelicopterBinder = new HelicopterBinder(object);

    expect(binder.net_spawn(serverObject)).toBe(true);

    expect(registry.objects.length()).toBe(1);
    expect(registry.helicopter.storage.length()).toBe(1);

    binder.net_destroy();

    expect(registry.objects.length()).toBe(0);
    expect(registry.helicopter.storage.length()).toBe(0);
  });

  it("should be net save relevant", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const binder: HelicopterBinder = new HelicopterBinder(object);

    expect(binder.net_save_relevant()).toBe(true);
  });

  it("should correctly handle save/load events", () => {
    jest.spyOn(Date, "now").mockImplementation(() => 5000);

    const processor: MockNetProcessor = new MockNetProcessor();
    const binder: HelicopterBinder = new HelicopterBinder(MockGameObject.mockHelicopter());
    const binderState: IRegistryObjectState = registerObject(binder.object);

    binder.combatManager = new HelicopterCombatManager(binder.object);

    jest.spyOn(binder.combatManager, "save").mockImplementation(jest.fn());

    binderState.iniFilename = "test_filename.ltx";
    binderState.jobIni = "test.ltx";
    binderState.sectionLogic = "logic";
    binderState.activeSection = "test@test";
    binderState.smartTerrainName = "test-smart";

    binder.save(processor.asNetPacket());

    expect(binder.combatManager.save).toHaveBeenCalledWith(processor);

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
      "save_from_HelicopterBinder",
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

    const newBinder: HelicopterBinder = new HelicopterBinder(MockGameObject.mock());
    const newBinderState: IRegistryObjectState = registerObject(newBinder.object);

    newBinder.combatManager = new HelicopterCombatManager(binder.object);

    jest.spyOn(newBinder.combatManager, "load").mockImplementation(jest.fn());

    newBinder.load(processor.asNetReader());

    expect(newBinder.combatManager.load).toHaveBeenCalledWith(processor);

    expect(newBinderState.jobIni).toBe("test.ltx");
    expect(newBinderState.loadedSectionLogic).toBe("logic");
    expect(newBinderState.loadedActiveSection).toBe("test@test");
    expect(newBinderState.loadedSmartTerrainName).toBe("test-smart");
    expect(newBinderState.loadedIniFilename).toBe("test_filename.ltx");

    expect(newBinder.isLoaded).toBe(true);

    expect(processor.readDataOrder).toEqual(processor.writeDataOrder);
    expect(processor.dataList).toHaveLength(0);
  });

  it.todo("should correctly check health and start burning");

  it("should correctly handle hit events", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const enemy: GameObject = MockGameObject.mockStalker();
    const binder: HelicopterBinder = new HelicopterBinder(object);
    const state: IRegistryObjectState = registerObject(object);
    const schemeState: ISchemeHelicopterMoveState = mockSchemeState(EScheme.HIT);

    state.activeScheme = EScheme.HIT;
    state[EScheme.HIT] = schemeState;
    binder.state = state;

    jest.spyOn(binder.helicopterFireManager, "onHit").mockImplementation(jest.fn());

    binder.onHit(0.5, 1, 10, enemy.id());

    expect(binder.helicopterFireManager.enemy).toBe(enemy);
    expect(binder.helicopterFireManager.onHit).toHaveBeenCalledTimes(1);

    expect(emitSchemeEvent).toHaveBeenCalledTimes(1);
    expect(emitSchemeEvent).toHaveBeenCalledWith(object, schemeState, ESchemeEvent.HIT, object, 0.5, null, enemy, null);
  });

  it("should correctly handle waypoint events", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const binder: HelicopterBinder = new HelicopterBinder(object);
    const state: IRegistryObjectState = registerObject(object);
    const schemeState: ISchemeHelicopterMoveState = mockSchemeState(EScheme.HELI_MOVE);

    state.activeScheme = EScheme.HELI_MOVE;
    state[EScheme.HELI_MOVE] = schemeState;

    binder.state = state;
    binder.onWaypoint(10, ZERO_VECTOR, 4);

    expect(emitSchemeEvent).toHaveBeenCalledTimes(1);
    expect(emitSchemeEvent).toHaveBeenCalledWith(object, schemeState, ESchemeEvent.WAYPOINT, object, null, 4);
  });
});
