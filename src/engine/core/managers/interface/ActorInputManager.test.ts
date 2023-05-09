import { beforeEach, describe, expect, it } from "@jest/globals";

import { disposeManager, getManagerInstance, registerActor, registry } from "@/engine/core/database";
import { EventsManager } from "@/engine/core/managers";
import { ActorInputManager } from "@/engine/core/managers/interface/ActorInputManager";
import { replaceFunctionMock } from "@/fixtures/utils/function_mock";
import { mockClientGameObject } from "@/fixtures/xray";
import { EPacketDataType, mockNetPacket, mockNetProcessor, MockNetProcessor } from "@/fixtures/xray/mocks/save";

describe("ActorInputManager class", () => {
  beforeEach(() => {
    registry.managers = new LuaTable();
  });

  it("should correctly initialize and destroy", () => {
    const actorInputManager: ActorInputManager = getManagerInstance(ActorInputManager);
    const eventsManager: EventsManager = getManagerInstance(EventsManager);

    expect(eventsManager.getSubscribersCount()).toBe(2);
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

    actorInputManager.save(mockNetPacket(netProcessor));

    expect(netProcessor.writeDataOrder).toEqual([EPacketDataType.U8, EPacketDataType.U16]);
    expect(netProcessor.dataList).toEqual([10, 1]);

    disposeManager(ActorInputManager);

    const newActorInputManager: ActorInputManager = getManagerInstance(ActorInputManager);

    newActorInputManager.load(mockNetProcessor(netProcessor));

    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toHaveLength(0);
    expect(newActorInputManager).not.toBe(actorInputManager);
    expect(newActorInputManager.activeItemSlot).toBe(10);
  });
});
