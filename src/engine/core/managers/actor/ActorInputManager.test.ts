import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { game, level } from "xray16";

import { AnyObject } from "#/utils/types";

import { disposeManager, getManagerInstance, registerActor, registry } from "@/engine/core/database";
import { ActorInputManager } from "@/engine/core/managers/actor/ActorInputManager";
import { EventsManager } from "@/engine/core/managers/events";
import { ClientObject, EActiveItemSlot } from "@/engine/lib/types";
import { mockRegisteredActor } from "@/fixtures/engine";
import { replaceFunctionMock } from "@/fixtures/jest";
import { mockClientGameObject, MockCTime } from "@/fixtures/xray";
import { EPacketDataType, mockNetPacket, mockNetProcessor, MockNetProcessor } from "@/fixtures/xray/mocks/save";

describe("ActorInputManager class", () => {
  beforeEach(() => {
    registry.managers = new LuaTable();
    mockRegisteredActor();
  });

  it("should correctly initialize and destroy", () => {
    const actorInputManager: ActorInputManager = getManagerInstance(ActorInputManager);
    const eventsManager: EventsManager = getManagerInstance(EventsManager);

    expect(eventsManager.getSubscribersCount()).toBe(3);
    expect(actorInputManager.activeItemSlot).toBe(3);
    expect(actorInputManager.isWeaponHidden).toBe(false);
    expect(actorInputManager.isWeaponHiddenInDialog).toBe(false);

    disposeManager(ActorInputManager);

    expect(eventsManager.getSubscribersCount()).toBe(0);
  });

  it("should correctly save and load data", () => {
    const actorInputManager: ActorInputManager = getManagerInstance(ActorInputManager);
    const netProcessor: MockNetProcessor = new MockNetProcessor();

    registerActor(mockClientGameObject());
    replaceFunctionMock(registry.actor.active_slot, () => 10);

    actorInputManager.setInactiveInputTime(10);

    actorInputManager.save(mockNetPacket(netProcessor));

    expect(netProcessor.writeDataOrder).toEqual([
      EPacketDataType.BOOLEAN,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U16,
      EPacketDataType.U8,
      EPacketDataType.U16,
    ]);
    expect(netProcessor.dataList).toEqual([true, 12, 6, 12, 9, 30, 0, 0, 10, 9]);

    disposeManager(ActorInputManager);

    const newActorInputManager: ActorInputManager = getManagerInstance(ActorInputManager);

    newActorInputManager.load(mockNetProcessor(netProcessor));

    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toHaveLength(0);
    expect(newActorInputManager).not.toBe(actorInputManager);
    expect(newActorInputManager.activeItemSlot).toBe(10);
  });

  it("should correctly toggle inactive input state", () => {
    const manager: ActorInputManager = ActorInputManager.getInstance();

    expect(manager.disableInputAt).toBeNull();

    manager.setInactiveInputTime(7_000);
    expect(manager.disableInputAt).toBeDefined();
    expect(String(manager.disableInputAt)).toBe(String(game.get_game_time()));
    expect(manager.disableInputDuration).toBe(7_000);
    expect(level.disable_input).toHaveBeenCalledTimes(1);
  });

  it("should correctly toggle night vision state", () => {
    const manager: ActorInputManager = ActorInputManager.getInstance();
    const torch: ClientObject = mockClientGameObject({ sectionOverride: "device_torch" });

    manager.enableActorNightVision();
    expect(manager.isActorNightVisionEnabled).toBe(false);

    const inventory: Map<string | number, ClientObject> = (registry.actor as AnyObject).inventory;

    inventory.set("device_torch", torch);

    manager.enableActorNightVision();
    expect(manager.isActorNightVisionEnabled).toBe(true);
    expect(torch.enable_night_vision).toHaveBeenCalledWith(true);

    manager.enableActorNightVision();
    expect(manager.isActorNightVisionEnabled).toBe(true);
    expect(torch.enable_night_vision).toHaveBeenCalledTimes(1);

    jest.spyOn(torch, "night_vision_enabled").mockImplementation(() => true);

    manager.disableActorNightVision();
    expect(manager.isActorNightVisionEnabled).toBe(false);
    expect(torch.enable_night_vision).toHaveBeenCalledTimes(2);
    expect(torch.enable_night_vision).toHaveBeenNthCalledWith(2, false);
  });

  it.todo("should correctly toggle torch state");

  it.todo("should correctly enable game ui");

  it.todo("should correctly disable game ui");

  it.todo("should correctly handle update event");

  it("should correctly first update event", () => {
    const manager: ActorInputManager = ActorInputManager.getInstance();

    manager.activeItemSlot = EActiveItemSlot.PRIMARY;
    manager.onFirstUpdate(0);

    expect(registry.actor.activate_slot).toHaveBeenNthCalledWith(1, EActiveItemSlot.PRIMARY);

    manager.activeItemSlot = EActiveItemSlot.KNIFE;
    manager.onFirstUpdate(0);

    expect(registry.actor.activate_slot).toHaveBeenNthCalledWith(2, EActiveItemSlot.KNIFE);
  });

  it("should correctly network spawn event", () => {
    const manager: ActorInputManager = ActorInputManager.getInstance();

    manager.disableInputAt = MockCTime.mock(2012, 12, 1, 12, 30, 5, 500);
    manager.onNetworkSpawn();
    expect(level.enable_input).toHaveBeenCalledTimes(0);

    manager.disableInputAt = null;
    manager.onNetworkSpawn();
    expect(level.enable_input).toHaveBeenCalledTimes(1);
  });
});
