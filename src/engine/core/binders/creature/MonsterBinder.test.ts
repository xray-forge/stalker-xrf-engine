import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { callback } from "xray16";

import { MonsterBinder } from "@/engine/core/binders/creature/MonsterBinder";
import { getManager, IRegistryObjectState, registerObject, registerSimulator, registry } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { SchemeHear } from "@/engine/core/schemes/shared/hear";
import { emitSchemeEvent } from "@/engine/core/utils/scheme";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { X_VECTOR } from "@/engine/lib/constants/vectors";
import { EScheme, ESchemeEvent, GameObject, ServerCreatureObject } from "@/engine/lib/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";
import { resetFunctionMock } from "@/fixtures/jest";
import {
  EPacketDataType,
  MockAlifeMonsterBase,
  MockCTime,
  MockGameObject,
  mockNetPacket,
  MockNetProcessor,
  mockNetReader,
} from "@/fixtures/xray";

jest.mock("@/engine/core/utils/scheme", () => ({
  setupObjectSmartJobsAndLogicOnSpawn: jest.fn(),
  emitSchemeEvent: jest.fn(),
}));

describe("MonsterBinder class", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
    resetFunctionMock(emitSchemeEvent);
  });

  it("should correctly initialize", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: MonsterBinder = new MonsterBinder(object);

    expect(binder.isLoaded).toBe(false);
    expect(binder.state).toBeUndefined();
  });

  it("should correctly re-init", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: MonsterBinder = new MonsterBinder(object);

    binder.reinit();

    expect(registry.objects.get(object.id())).toEqual({ object });
    expect(binder.state).toBe(registry.objects.get(object.id()));

    expect(object.set_callback).toHaveBeenCalledTimes(4);
    expect(object.set_callback).toHaveBeenCalledWith(callback.patrol_path_in_point, binder.onWaypoint, binder);
    expect(object.set_callback).toHaveBeenCalledWith(callback.hit, binder.onHit, binder);
    expect(object.set_callback).toHaveBeenCalledWith(callback.death, binder.onDeath, binder);
    expect(object.set_callback).toHaveBeenCalledWith(callback.sound, binder.onHearSound, binder);
  });

  it.todo("should correctly handle going online/offline");

  it.todo("should correctly handle update event");

  it("should be net save relevant", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: MonsterBinder = new MonsterBinder(object);

    expect(binder.net_save_relevant()).toBe(true);
  });

  it("should correctly handle save/load", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: MonsterBinder = new MonsterBinder(object);
    const netProcessor: MockNetProcessor = new MockNetProcessor();

    jest.spyOn(Date, "now").mockImplementationOnce(() => 2000);

    registerObject(object);

    binder.reinit();

    const state: IRegistryObjectState = registry.objects.get(object.id());

    state.activationTime = 5000;
    state.activationGameTime = MockCTime.mock(2012, 6, 12, 20, 15, 30, 500);
    state.jobIni = "job_ini.ltx";
    state.iniFilename = "ini.ltx";
    state.sectionLogic = "logic";
    state.activeSection = "scheme@section";
    state.smartTerrainName = "some_smart";

    binder.save(mockNetPacket(netProcessor));

    expect(netProcessor.writeDataOrder).toEqual([
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.I32,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U16,
      EPacketDataType.U32,
      EPacketDataType.U16,
      EPacketDataType.U16,
    ]);
    expect(netProcessor.dataList).toEqual([
      "save_from_MonsterBinder",
      "job_ini.ltx",
      "ini.ltx",
      "logic",
      "scheme@section",
      "some_smart",
      3000,
      12,
      6,
      12,
      20,
      15,
      30,
      500,
      0,
      14,
      16,
    ]);

    binder.load(mockNetReader(netProcessor));

    expect(binder.isLoaded).toBe(true);
    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toHaveLength(0);
  });

  it("should correctly handle waypoint event", () => {
    const serverObject: ServerCreatureObject = MockAlifeMonsterBase.mock();
    const object: GameObject = MockGameObject.mock({ idOverride: serverObject.id });
    const binder: MonsterBinder = new MonsterBinder(object);

    binder.reinit();
    binder.net_spawn(serverObject);
    binder.onWaypoint(object, 1, 5);

    expect(emitSchemeEvent).toHaveBeenCalledTimes(0);

    binder.state.activeScheme = EScheme.PATROL;
    binder.state.activeSection = `${EScheme.PATROL}@test`;
    binder.state[EScheme.PATROL] = mockSchemeState(EScheme.PATROL);

    binder.onWaypoint(object, 1, 5);

    expect(emitSchemeEvent).toHaveBeenCalledTimes(1);
    expect(emitSchemeEvent).toHaveBeenCalledWith(
      object,
      binder.state[EScheme.PATROL],
      ESchemeEvent.WAYPOINT,
      object,
      1,
      5
    );
  });

  it.todo("should correctly handle death event");

  it("should correctly handle hit event", () => {
    const serverObject: ServerCreatureObject = MockAlifeMonsterBase.mock();
    const object: GameObject = MockGameObject.mock({ idOverride: serverObject.id });
    const binder: MonsterBinder = new MonsterBinder(object);
    const hitting: GameObject = MockGameObject.mock();
    const manager: EventsManager = getManager(EventsManager);

    jest.spyOn(manager, "emitEvent");

    binder.reinit();
    binder.net_spawn(serverObject);
    binder.onHit(object, 1, X_VECTOR, hitting, "1");

    expect(emitSchemeEvent).toHaveBeenCalledTimes(0);
    expect(manager.emitEvent).toHaveBeenCalledTimes(1);
    expect(manager.emitEvent).toHaveBeenCalledWith(EGameEvent.MONSTER_HIT, object, 1, X_VECTOR, hitting, "1");

    binder.state[EScheme.HIT] = mockSchemeState(EScheme.HIT);

    binder.onHit(object, 1, X_VECTOR, hitting, "1");

    expect(emitSchemeEvent).toHaveBeenCalledTimes(1);
    expect(emitSchemeEvent).toHaveBeenCalledWith(
      object,
      binder.state[EScheme.HIT],
      ESchemeEvent.HIT,
      object,
      1,
      X_VECTOR,
      hitting,
      "1"
    );
    expect(manager.emitEvent).toHaveBeenCalledTimes(2);
  });

  it("should correctly handle hear event", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: MonsterBinder = new MonsterBinder(object);

    jest.spyOn(SchemeHear, "onObjectHearSound").mockImplementation(jest.fn());

    binder.onHearSound(object, object.id(), 128, X_VECTOR, 10);
    expect(SchemeHear.onObjectHearSound).not.toHaveBeenCalled();

    binder.onHearSound(object, ACTOR_ID, 128, X_VECTOR, 10);
    expect(SchemeHear.onObjectHearSound).toHaveBeenCalledWith(object, ACTOR_ID, 128, X_VECTOR, 10);
  });
});
