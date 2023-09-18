import { beforeEach, describe, expect, it } from "@jest/globals";

import { disposeManager, getManagerInstance, registerActor, registry } from "@/engine/core/database";
import { ActorInputManager } from "@/engine/core/managers/actor/ActorInputManager";
import { EventsManager } from "@/engine/core/managers/events";
import { replaceFunctionMock } from "@/fixtures/jest";
import { mockClientGameObject } from "@/fixtures/xray";
import { EPacketDataType, mockNetPacket, mockNetProcessor, MockNetProcessor } from "@/fixtures/xray/mocks/save";

describe("ActorInputManager class", () => {
  beforeEach(() => {
    registry.managers = new LuaTable();
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

  it.todo("should correctly toggle inactive input state");

  it.todo("should correctly toggle night vision state");

  it.todo("should correctly toggle torch state");

  it.todo("should correctly enable game ui");

  it.todo("should correctly disable game ui");

  it.todo("should correctly handle update event");

  it.todo("should correctly first update event");

  it.todo("should correctly network spawn event");
});
