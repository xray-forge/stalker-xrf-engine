import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { callback, level } from "xray16";

import { ActorBinder } from "@/engine/core/binders/creature/ActorBinder";
import {
  IRegistryObjectState,
  registerSimulator,
  registerZone,
  registry,
  setPortableStoreValue,
} from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { SaveManager } from "@/engine/core/managers/save";
import { TSimulationObject } from "@/engine/core/managers/simulation";
import { ISchemeDeimosState, SchemeDeimos } from "@/engine/core/schemes/restrictor/sr_deimos";
import { setStableAlifeObjectsUpdate } from "@/engine/core/utils/alife";
import { EScheme, GameObject, ServerActorObject } from "@/engine/lib/types";
import { mockRegisteredActor, mockSchemeState, resetRegistry } from "@/fixtures/engine";
import { resetFunctionMock } from "@/fixtures/jest";
import {
  EPacketDataType,
  MockGameObject,
  mockNetPacket,
  MockNetProcessor,
  mockNetReader,
  mockServerAlifeCreatureActor,
} from "@/fixtures/xray";

describe("ActorBinder class", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
    resetFunctionMock(level.show_indicators);
    resetFunctionMock(level.show_weapon);
  });

  it("should correctly initialize", () => {
    const actor: GameObject = MockGameObject.mockActor();
    const binder: ActorBinder = new ActorBinder(actor);

    expect(binder.isFirstUpdatePerformed).toBe(false);
    expect(binder.deimosIntensity).toBeNull();
    expect(binder.eventsManager).toBe(EventsManager.getInstance());
  });

  it("should correctly handle net spawn / destroy", () => {
    const actor: GameObject = MockGameObject.mockActor();
    const serverActor: ServerActorObject = mockServerAlifeCreatureActor();
    const binder: ActorBinder = new ActorBinder(actor);
    const eventsManager: EventsManager = EventsManager.getInstance();

    jest.spyOn(eventsManager, "emitEvent");

    binder.net_spawn(serverActor);

    const state: IRegistryObjectState = registry.objects.get(actor.id());

    expect(level.show_indicators).toHaveBeenCalledTimes(1);
    expect(registry.actor).toBe(actor);
    expect(state).not.toBeNull();
    expect(state.portableStore).not.toBeNull();
    expect(eventsManager.emitEvent).toHaveBeenCalledTimes(1);
    expect(eventsManager.emitEvent).toHaveBeenCalledWith(EGameEvent.ACTOR_GO_ONLINE, binder);

    binder.net_destroy();

    expect(registry.actor).toBeNull();
    expect(registry.objects.length()).toBe(0);
    expect(level.show_weapon).toHaveBeenCalledWith(true);
    expect(eventsManager.emitEvent).toHaveBeenCalledTimes(2);
    expect(eventsManager.emitEvent).toHaveBeenCalledWith(EGameEvent.ACTOR_GO_OFFLINE, binder);

    expect(actor.set_callback).toHaveBeenCalledTimes(10);
    expect(actor.set_callback).toHaveBeenCalledWith(callback.inventory_info, null);
    expect(actor.set_callback).toHaveBeenCalledWith(callback.article_info, null);
    expect(actor.set_callback).toHaveBeenCalledWith(callback.on_item_take, null);
    expect(actor.set_callback).toHaveBeenCalledWith(callback.on_item_drop, null);
    expect(actor.set_callback).toHaveBeenCalledWith(callback.trade_sell_buy_item, null);
    expect(actor.set_callback).toHaveBeenCalledWith(callback.task_state, null);
    expect(actor.set_callback).toHaveBeenCalledWith(callback.level_border_enter, null);
    expect(actor.set_callback).toHaveBeenCalledWith(callback.level_border_exit, null);
    expect(actor.set_callback).toHaveBeenCalledWith(callback.take_item_from_box, null);
    expect(actor.set_callback).toHaveBeenCalledWith(callback.use_object, null);
  });

  it("should correctly handle re-init", () => {
    const actor: GameObject = MockGameObject.mockActor();
    const binder: ActorBinder = new ActorBinder(actor);
    const eventsManager: EventsManager = EventsManager.getInstance();

    jest.spyOn(eventsManager, "emitEvent");
    jest.spyOn(eventsManager, "registerGameTimeout");

    binder.reinit();

    const state: IRegistryObjectState = registry.objects.get(actor.id());

    expect(registry.actor).toBe(actor);
    expect(state).not.toBeNull();
    expect(state.portableStore).not.toBeNull();

    expect(actor.set_callback).toHaveBeenCalledTimes(7);
    expect(actor.set_callback).toHaveBeenCalledWith(callback.inventory_info, expect.any(Function));
    expect(actor.set_callback).toHaveBeenCalledWith(callback.on_item_take, expect.any(Function));
    expect(actor.set_callback).toHaveBeenCalledWith(callback.on_item_drop, expect.any(Function));
    expect(actor.set_callback).toHaveBeenCalledWith(callback.trade_sell_buy_item, expect.any(Function));
    expect(actor.set_callback).toHaveBeenCalledWith(callback.task_state, expect.any(Function));
    expect(actor.set_callback).toHaveBeenCalledWith(callback.take_item_from_box, expect.any(Function));
    expect(actor.set_callback).toHaveBeenCalledWith(callback.use_object, expect.any(Function));

    expect(eventsManager.emitEvent).toHaveBeenCalledWith(EGameEvent.ACTOR_REINIT, binder);
  });

  it("should correctly force infinite alife update on re-init", () => {
    const actor: GameObject = MockGameObject.mockActor();
    const binder: ActorBinder = new ActorBinder(actor);
    const eventsManager: EventsManager = EventsManager.getInstance();

    jest.spyOn(eventsManager, "registerGameTimeout");

    binder.reinit();

    expect(registry.simulator.set_objects_per_update).toHaveBeenCalledTimes(1);
    expect(registry.simulator.set_objects_per_update).toHaveBeenCalledWith(65_535);

    expect(eventsManager.registerGameTimeout).toHaveBeenCalledWith(setStableAlifeObjectsUpdate, 3000);
  });

  it("should correctly handle update event", () => {
    const { actorGameObject, actorServerObject } = mockRegisteredActor();

    const binder: ActorBinder = new ActorBinder(actorGameObject);
    const eventsManager: EventsManager = EventsManager.getInstance();

    jest.spyOn(eventsManager, "emitEvent");
    jest.spyOn(eventsManager, "tick");

    expect(binder.isFirstUpdatePerformed).toBe(false);

    (actorServerObject as TSimulationObject).isSimulationAvailable = jest.fn(() => true);

    binder.update(521);

    expect(binder.isFirstUpdatePerformed).toBe(true);
    expect(eventsManager.emitEvent).toHaveBeenCalledTimes(2);
    expect(eventsManager.tick).toHaveBeenCalledTimes(1);
    expect(eventsManager.emitEvent).toHaveBeenCalledWith(EGameEvent.ACTOR_FIRST_UPDATE, 521, binder);
    expect(eventsManager.emitEvent).toHaveBeenCalledWith(EGameEvent.ACTOR_UPDATE, 521, binder);

    expect(registry.simulationObjects.get(actorGameObject.id())).toBe(actorServerObject);

    (actorServerObject as TSimulationObject).isSimulationAvailable = jest.fn(() => false);

    binder.update(551);

    expect(eventsManager.emitEvent).toHaveBeenCalledTimes(3);
    expect(eventsManager.tick).toHaveBeenCalledTimes(2);

    expect(registry.simulationObjects.length()).toBe(0);
  });

  it("should correctly handle save/load with default values", () => {
    const { actorGameObject, actorServerObject } = mockRegisteredActor();
    const saveManager: SaveManager = SaveManager.getInstance();
    const netProcessor: MockNetProcessor = new MockNetProcessor();
    const binder: ActorBinder = new ActorBinder(actorGameObject);

    jest.spyOn(saveManager, "clientSave").mockImplementation(jest.fn());
    jest.spyOn(saveManager, "clientLoad").mockImplementation(jest.fn());

    binder.net_spawn(actorServerObject);
    binder.reinit();
    binder.save(mockNetPacket(netProcessor));

    expect(saveManager.clientSave).toHaveBeenCalledWith(netProcessor);
    expect(netProcessor.writeDataOrder).toEqual([
      EPacketDataType.STRING,
      EPacketDataType.U32,
      EPacketDataType.BOOLEAN,
      EPacketDataType.U16,
    ]);
    expect(netProcessor.dataList).toEqual(["save_from_ActorBinder", 0, false, 3]);

    const newBinder: ActorBinder = new ActorBinder(actorGameObject);

    newBinder.isFirstUpdatePerformed = true;
    newBinder.load(mockNetReader(netProcessor));

    expect(newBinder.isFirstUpdatePerformed).toBe(false);
    expect(saveManager.clientLoad).toHaveBeenCalledWith(netProcessor);
    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toHaveLength(0);
  });

  it("should correctly handle save/load with deimos and pstore values", () => {
    const { actorGameObject, actorServerObject } = mockRegisteredActor();
    const saveManager: SaveManager = SaveManager.getInstance();
    const netProcessor: MockNetProcessor = new MockNetProcessor();
    const binder: ActorBinder = new ActorBinder(actorGameObject);

    const firstZone: GameObject = MockGameObject.mock();
    const secondZone: GameObject = MockGameObject.mock();

    registerZone(firstZone);
    registerZone(secondZone);

    const secondState: IRegistryObjectState = registry.objects.get(secondZone.id());

    secondState.activeSection = SchemeDeimos.SCHEME_SECTION;
    secondState[SchemeDeimos.SCHEME_SECTION] = mockSchemeState<ISchemeDeimosState>(EScheme.SR_DEIMOS, {
      intensity: 11.5,
    });

    jest.spyOn(saveManager, "clientSave").mockImplementation(jest.fn());
    jest.spyOn(saveManager, "clientLoad").mockImplementation(jest.fn());

    binder.net_spawn(actorServerObject);
    binder.reinit();

    setPortableStoreValue(actorGameObject.id(), "test-1", "value");
    setPortableStoreValue(actorGameObject.id(), "test-2", "value");

    binder.save(mockNetPacket(netProcessor));

    expect(saveManager.clientSave).toHaveBeenCalledWith(netProcessor);
    expect(netProcessor.writeDataOrder).toEqual([
      EPacketDataType.STRING,
      EPacketDataType.U32,
      EPacketDataType.STRING,
      EPacketDataType.U8,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.U8,
      EPacketDataType.STRING,
      EPacketDataType.BOOLEAN,
      EPacketDataType.F32,
      EPacketDataType.U16,
    ]);
    expect(netProcessor.dataList).toEqual([
      "save_from_ActorBinder",
      2,
      "test-1",
      1,
      "value",
      "test-2",
      1,
      "value",
      true,
      11.5,
      10,
    ]);

    const newBinder: ActorBinder = new ActorBinder(actorGameObject);

    newBinder.load(mockNetReader(netProcessor));

    expect(saveManager.clientLoad).toHaveBeenCalledWith(netProcessor);
    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toHaveLength(0);
  });
});
