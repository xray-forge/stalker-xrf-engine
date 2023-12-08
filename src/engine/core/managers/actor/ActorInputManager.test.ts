import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { game, level } from "xray16";

import { AnyObject } from "#/utils/types";

import { disposeManager, getManager, registerActor, registry } from "@/engine/core/database";
import { actorConfig } from "@/engine/core/managers/actor/ActorConfig";
import { ActorInputManager } from "@/engine/core/managers/actor/ActorInputManager";
import { EventsManager } from "@/engine/core/managers/events";
import { EActiveItemSlot, GameObject } from "@/engine/lib/types";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";
import { replaceFunctionMock } from "@/fixtures/jest";
import { MockCTime, MockGameObject } from "@/fixtures/xray";
import { EPacketDataType, mockNetPacket, mockNetProcessor, MockNetProcessor } from "@/fixtures/xray/mocks/save";

describe("ActorInputManager class", () => {
  beforeEach(() => {
    resetRegistry();
    mockRegisteredActor();

    actorConfig.DISABLED_INPUT_AT = null;
    actorConfig.DISABLED_INPUT_DURATION = null;
  });

  it("should correctly initialize and destroy", () => {
    const actorInputManager: ActorInputManager = getManager(ActorInputManager);
    const eventsManager: EventsManager = getManager(EventsManager);

    expect(eventsManager.getSubscribersCount()).toBe(4);

    disposeManager(ActorInputManager);

    expect(eventsManager.getSubscribersCount()).toBe(0);
  });

  it("should correctly save and load data", () => {
    const actorInputManager: ActorInputManager = getManager(ActorInputManager);
    const netProcessor: MockNetProcessor = new MockNetProcessor();

    registerActor(MockGameObject.mock());
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

    const newActorInputManager: ActorInputManager = getManager(ActorInputManager);

    newActorInputManager.load(mockNetProcessor(netProcessor));

    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toHaveLength(0);
    expect(newActorInputManager).not.toBe(actorInputManager);
    expect(actorConfig.ACTIVE_ITEM_SLOT).toBe(10);
  });

  it("should correctly toggle inactive input state", () => {
    const manager: ActorInputManager = ActorInputManager.getInstance();

    expect(actorConfig.DISABLED_INPUT_AT).toBeNull();

    manager.setInactiveInputTime(7_000);
    expect(actorConfig.DISABLED_INPUT_AT).toBeDefined();
    expect(String(actorConfig.DISABLED_INPUT_AT)).toBe(String(game.get_game_time()));
    expect(actorConfig.DISABLED_INPUT_DURATION).toBe(7_000);
    expect(level.disable_input).toHaveBeenCalledTimes(1);
  });

  it("should correctly toggle night vision state", () => {
    const manager: ActorInputManager = ActorInputManager.getInstance();
    const torch: GameObject = MockGameObject.mock({ sectionOverride: "device_torch" });

    manager.enableActorNightVision();
    expect(actorConfig.IS_ACTOR_NIGHT_VISION_ENABLED).toBe(false);

    const inventory: Map<string | number, GameObject> = (registry.actor as AnyObject).inventory;

    inventory.set("device_torch", torch);

    manager.enableActorNightVision();
    expect(actorConfig.IS_ACTOR_NIGHT_VISION_ENABLED).toBe(true);
    expect(torch.enable_night_vision).toHaveBeenCalledWith(true);

    manager.enableActorNightVision();
    expect(actorConfig.IS_ACTOR_NIGHT_VISION_ENABLED).toBe(true);
    expect(torch.enable_night_vision).toHaveBeenCalledTimes(1);

    jest.spyOn(torch, "night_vision_enabled").mockImplementation(() => true);

    manager.disableActorNightVision();
    expect(actorConfig.IS_ACTOR_NIGHT_VISION_ENABLED).toBe(false);
    expect(torch.enable_night_vision).toHaveBeenCalledTimes(2);
    expect(torch.enable_night_vision).toHaveBeenNthCalledWith(2, false);
  });

  it.todo("should correctly toggle torch state");

  it.todo("should correctly enable game ui");

  it.todo("should correctly disable game ui");

  it.todo("should correctly handle update event");

  it("should correctly first update event", () => {
    const manager: ActorInputManager = ActorInputManager.getInstance();

    actorConfig.ACTIVE_ITEM_SLOT = EActiveItemSlot.PRIMARY;
    manager.onFirstUpdate();

    expect(registry.actor.activate_slot).toHaveBeenNthCalledWith(1, EActiveItemSlot.PRIMARY);

    actorConfig.ACTIVE_ITEM_SLOT = EActiveItemSlot.KNIFE;
    manager.onFirstUpdate();

    expect(registry.actor.activate_slot).toHaveBeenNthCalledWith(2, EActiveItemSlot.KNIFE);
  });

  it("should correctly network spawn event", () => {
    const manager: ActorInputManager = ActorInputManager.getInstance();

    actorConfig.DISABLED_INPUT_AT = MockCTime.mock(2012, 12, 1, 12, 30, 5, 500);
    manager.onActorGoOnline();
    expect(level.enable_input).toHaveBeenCalledTimes(0);

    actorConfig.DISABLED_INPUT_AT = null;
    manager.onActorGoOnline();
    expect(level.enable_input).toHaveBeenCalledTimes(1);
  });
});
