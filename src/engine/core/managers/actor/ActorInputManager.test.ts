import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { game, get_console, level } from "xray16";

import { disposeManager, getManager, registerActor, registry } from "@/engine/core/database";
import { actorConfig } from "@/engine/core/managers/actor/ActorConfig";
import { ActorInputManager } from "@/engine/core/managers/actor/ActorInputManager";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { Console, EActiveItemSlot, GameObject } from "@/engine/lib/types";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";
import { replaceFunctionMock } from "@/fixtures/jest";
import { EPacketDataType, MockCTime, MockGameObject, MockNetProcessor } from "@/fixtures/xray";

describe("ActorInputManager", () => {
  beforeEach(() => {
    resetRegistry();
    mockRegisteredActor();

    actorConfig.DISABLED_INPUT_AT = null;
    actorConfig.DISABLED_INPUT_DURATION = null;
  });

  it("should correctly initialize and destroy", () => {
    const manager: ActorInputManager = getManager(ActorInputManager);
    const eventsManager: EventsManager = getManager(EventsManager);

    expect(eventsManager.getSubscribersCount()).toBe(4);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.ACTOR_UPDATE)).toBe(1);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.ACTOR_FIRST_UPDATE)).toBe(1);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.ACTOR_GO_ONLINE)).toBe(1);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.ACTOR_USE_ITEM)).toBe(1);

    disposeManager(ActorInputManager);

    expect(eventsManager.getSubscribersCount()).toBe(0);
  });

  it("should correctly save and load data", () => {
    const manager: ActorInputManager = getManager(ActorInputManager);
    const processor: MockNetProcessor = new MockNetProcessor();

    registerActor(MockGameObject.mock());
    replaceFunctionMock(registry.actor.active_slot, () => 10);

    manager.setInactiveInputTime(10);

    manager.save(processor.asNetPacket());

    expect(processor.writeDataOrder).toEqual([
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
    expect(processor.dataList).toEqual([true, 12, 6, 12, 9, 30, 0, 0, 10, 9]);

    disposeManager(ActorInputManager);

    const newActorInputManager: ActorInputManager = getManager(ActorInputManager);

    newActorInputManager.load(processor.asNetReader());

    expect(processor.readDataOrder).toEqual(processor.writeDataOrder);
    expect(processor.dataList).toHaveLength(0);
    expect(newActorInputManager).not.toBe(manager);
    expect(actorConfig.ACTIVE_ITEM_SLOT).toBe(10);
  });

  it("should correctly toggle inactive input state", () => {
    const manager: ActorInputManager = getManager(ActorInputManager);

    expect(actorConfig.DISABLED_INPUT_AT).toBeNull();

    manager.setInactiveInputTime(7_000);
    expect(actorConfig.DISABLED_INPUT_AT).toBeDefined();
    expect(String(actorConfig.DISABLED_INPUT_AT)).toBe(String(game.get_game_time()));
    expect(actorConfig.DISABLED_INPUT_DURATION).toBe(7_000);
    expect(level.disable_input).toHaveBeenCalledTimes(1);
  });

  it("should correctly toggle night vision state", () => {
    const manager: ActorInputManager = getManager(ActorInputManager);
    const torch: GameObject = MockGameObject.mock({ section: "device_torch" });

    manager.enableActorNightVision();
    expect(actorConfig.IS_ACTOR_NIGHT_VISION_ENABLED).toBe(false);

    const inventory: Map<string | number, GameObject> = MockGameObject.asMock(registry.actor).objectInventory;

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

  it("should correctly toggle torch state", () => {
    const manager: ActorInputManager = getManager(ActorInputManager);
    const torch: GameObject = MockGameObject.mock({ section: "device_torch" });

    manager.enableActorTorch();
    expect(actorConfig.IS_ACTOR_TORCH_ENABLED).toBe(false);

    const inventory: Map<string | number, GameObject> = MockGameObject.asMock(registry.actor).objectInventory;

    inventory.set("device_torch", torch);

    manager.enableActorTorch();
    expect(actorConfig.IS_ACTOR_TORCH_ENABLED).toBe(true);
    expect(torch.enable_torch).toHaveBeenCalledWith(true);

    manager.enableActorTorch();
    expect(actorConfig.IS_ACTOR_TORCH_ENABLED).toBe(true);
    expect(torch.enable_torch).toHaveBeenCalledTimes(1);

    jest.spyOn(torch, "torch_enabled").mockImplementation(() => true);

    manager.disableActorTorch();
    expect(actorConfig.IS_ACTOR_TORCH_ENABLED).toBe(false);
    expect(torch.enable_torch).toHaveBeenCalledTimes(2);
    expect(torch.enable_torch).toHaveBeenNthCalledWith(2, false);
  });

  it.todo("should correctly enable game ui");

  it.todo("should correctly disable game ui");

  it.todo("should correctly handle update event");

  it("should process anabiotics usage", () => {
    const console: Console = get_console();
    const manager: ActorInputManager = getManager(ActorInputManager);

    jest.spyOn(manager, "disableGameUiOnly").mockImplementation(jest.fn());

    jest.spyOn(console, "get_float").mockReturnValueOnce(0.9).mockReturnValue(0.8);

    manager.processAnabioticItemUsage();

    expect(manager.disableGameUiOnly).toHaveBeenCalledTimes(1);
    expect(level.add_cam_effector).toHaveBeenCalledWith(
      "camera_effects\\surge_02.anm",
      10,
      false,
      "engine.on_anabiotic_sleep"
    );
    expect(level.add_pp_effector).toHaveBeenCalledWith("surge_fade.ppe", 11, false);
    expect(registry.actor.give_info_portion).toHaveBeenCalledWith("anabiotic_in_process");

    expect(registry.musicVolume).toBe(0.9);
    expect(registry.effectsVolume).toBe(0.8);

    expect(console.execute).toHaveBeenCalledWith("snd_volume_music 0");
    expect(console.execute).toHaveBeenCalledWith("snd_volume_eff 0");

    expect(registry.musicVolume).toBe(0.9);
    expect(registry.effectsVolume).toBe(0.8);
  });

  it("should correctly first update event", () => {
    const manager: ActorInputManager = getManager(ActorInputManager);

    actorConfig.ACTIVE_ITEM_SLOT = EActiveItemSlot.PRIMARY;
    manager.onFirstUpdate();

    expect(registry.actor.activate_slot).toHaveBeenNthCalledWith(1, EActiveItemSlot.PRIMARY);

    actorConfig.ACTIVE_ITEM_SLOT = EActiveItemSlot.KNIFE;
    manager.onFirstUpdate();

    expect(registry.actor.activate_slot).toHaveBeenNthCalledWith(2, EActiveItemSlot.KNIFE);
  });

  it("should correctly network spawn event", () => {
    const manager: ActorInputManager = getManager(ActorInputManager);

    actorConfig.DISABLED_INPUT_AT = MockCTime.mock(2012, 12, 1, 12, 30, 5, 500);
    manager.onActorGoOnline();
    expect(level.enable_input).toHaveBeenCalledTimes(0);

    actorConfig.DISABLED_INPUT_AT = null;
    manager.onActorGoOnline();
    expect(level.enable_input).toHaveBeenCalledTimes(1);
  });
});
