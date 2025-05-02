import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";

import { calculateObjectVisibility, selectBestStalkerWeapon } from "@/engine/core/ai/combat";
import { smartCoversList } from "@/engine/core/animation/smart_covers";
import { getManager } from "@/engine/core/database";
import { ActorInputManager } from "@/engine/core/managers/actor";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { LoadoutManager } from "@/engine/core/managers/loadout";
import { gameOutroConfig, GameOutroManager } from "@/engine/core/managers/outro";
import { SaveManager } from "@/engine/core/managers/save";
import { TradeManager } from "@/engine/core/managers/trade";
import { AnyObject, GameObject, NetPacket } from "@/engine/lib/types";
import { callBinding, callNestedBinding, checkBinding, checkNestedBinding, resetRegistry } from "@/fixtures/engine";
import { MockGameObject, MockNetProcessor } from "@/fixtures/xray";

jest.mock("@/engine/core/ai/combat");

describe("game external callbacks", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/callbacks/game");
  });

  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly inject external methods for game", () => {
    checkBinding("main");

    checkBinding("CSE_ALifeDynamicObject_on_unregister");
    checkBinding("CALifeUpdateManager__on_before_change_level");

    checkBinding("smart_covers");
    checkNestedBinding("smart_covers", "descriptions");

    checkBinding("outro");
    checkNestedBinding("outro", "conditions");
    checkNestedBinding("outro", "start_bk_sound");
    checkNestedBinding("outro", "stop_bk_sound");
    checkNestedBinding("outro", "update_bk_sound_fade_start");
    checkNestedBinding("outro", "update_bk_sound_fade_stop");

    checkBinding("trade_manager");
    checkNestedBinding("trade_manager", "get_sell_discount");
    checkNestedBinding("trade_manager", "get_buy_discount");

    checkBinding("alife_storage_manager");
    checkNestedBinding("alife_storage_manager", "CALifeStorageManager_load");
    checkNestedBinding("alife_storage_manager", "CALifeStorageManager_after_load");
    checkNestedBinding("alife_storage_manager", "CALifeStorageManager_before_save");
    checkNestedBinding("alife_storage_manager", "CALifeStorageManager_save");

    checkBinding("level_input");
    checkNestedBinding("level_input", "on_key_press");

    checkBinding("visual_memory_manager");
    checkNestedBinding("visual_memory_manager", "get_visible_value");

    checkBinding("ai_stalker");
    checkNestedBinding("ai_stalker", "update_best_weapon");
  });

  it("main to be defined for custom scripts", () => {
    expect(() => callBinding("main")).not.toThrow();
  });

  it("CSE_ALifeDynamicObject_on_unregister to be defined and emit events", () => {
    const manager: EventsManager = getManager(EventsManager);

    const onUnregister = jest.fn();

    manager.registerCallback(EGameEvent.SERVER_OBJECT_UNREGISTERED, onUnregister);

    expect(() => callBinding("CSE_ALifeDynamicObject_on_unregister", [5_000])).not.toThrow();
    expect(onUnregister).toHaveBeenCalledTimes(1);
    expect(onUnregister).toHaveBeenCalledWith(5_000);
  });

  it("CALifeUpdateManager__on_before_change_level to be defined and emit events", () => {
    const manager: EventsManager = getManager(EventsManager);
    const packet: NetPacket = MockNetProcessor.mockNetPacket();

    const onBeforeLevelChange = jest.fn();

    manager.registerCallback(EGameEvent.BEFORE_LEVEL_CHANGE, onBeforeLevelChange);

    expect(() => callBinding("CALifeUpdateManager__on_before_change_level", [packet])).not.toThrow();
    expect(onBeforeLevelChange).toHaveBeenCalledTimes(1);
    expect(onBeforeLevelChange).toHaveBeenCalledWith(packet);
  });

  it("smart_covers should be defined", () => {
    expect((_G as AnyObject).smart_covers.descriptions).toBe(smartCoversList);
  });

  it("outro callbacks should be defined", () => {
    const outroManager: GameOutroManager = getManager(GameOutroManager);

    jest.spyOn(outroManager, "startBlackScreenAndSound").mockImplementation(jest.fn());
    jest.spyOn(outroManager, "stopBlackScreenAndSound").mockImplementation(jest.fn());
    jest.spyOn(outroManager, "updateBlackScreenAndSoundFadeStart").mockImplementation(jest.fn());
    jest.spyOn(outroManager, "updateBlackScreenAndSoundFadeStop").mockImplementation(jest.fn());

    expect((_G as AnyObject)["outro"]["conditions"]).toBe(gameOutroConfig.OUTRO_CONDITIONS);

    callNestedBinding("outro", "start_bk_sound");
    expect(outroManager.startBlackScreenAndSound).toHaveBeenCalled();

    callNestedBinding("outro", "stop_bk_sound");
    expect(outroManager.stopBlackScreenAndSound).toHaveBeenCalled();

    callNestedBinding("outro", "update_bk_sound_fade_start", [25]);
    expect(outroManager.updateBlackScreenAndSoundFadeStart).toHaveBeenCalledWith(25);
    expect(outroManager.stopBlackScreenAndSound).toHaveBeenCalled();

    callNestedBinding("outro", "update_bk_sound_fade_stop", [35]);
    expect(outroManager.updateBlackScreenAndSoundFadeStop).toHaveBeenCalledWith(35);
  });

  it("trade manager callbacks should be defined", () => {
    const tradeManager: TradeManager = getManager(TradeManager);

    jest.spyOn(tradeManager, "getSellDiscountForObject").mockImplementation(() => 10);
    jest.spyOn(tradeManager, "getBuyDiscountForObject").mockImplementation(() => 20);

    expect(callNestedBinding("trade_manager", "get_sell_discount", [30])).toBe(10);
    expect(tradeManager.getSellDiscountForObject).toHaveBeenCalledWith(30);

    expect(callNestedBinding("trade_manager", "get_buy_discount", [40])).toBe(20);
    expect(tradeManager.getBuyDiscountForObject).toHaveBeenCalledWith(40);
  });

  it("alife storage save methods should be defined", () => {
    const saveManager: SaveManager = getManager(SaveManager);

    jest.spyOn(saveManager, "onBeforeGameSave");
    jest.spyOn(saveManager, "onGameSave");
    jest.spyOn(saveManager, "onGameLoad");
    jest.spyOn(saveManager, "onAfterGameLoad");

    callNestedBinding("alife_storage_manager", "CALifeStorageManager_before_save", ["name1"]);
    expect(saveManager.onBeforeGameSave).toHaveBeenCalledWith("name1");

    callNestedBinding("alife_storage_manager", "CALifeStorageManager_save", ["name2"]);
    expect(saveManager.onGameSave).toHaveBeenCalledWith("name2");

    callNestedBinding("alife_storage_manager", "CALifeStorageManager_load", ["name3"]);
    expect(saveManager.onGameLoad).toHaveBeenCalledWith("name3");

    callNestedBinding("alife_storage_manager", "CALifeStorageManager_after_load", ["name4"]);
    expect(saveManager.onAfterGameLoad).toHaveBeenCalledWith("name4");
  });

  it("level_input callbacks should be defined", () => {
    const manager: ActorInputManager = getManager(ActorInputManager);

    jest.spyOn(manager, "onKeyPress").mockImplementation(jest.fn(() => false));

    callNestedBinding("level_input", "on_key_press", [1, 2]);

    expect(manager.onKeyPress).toHaveBeenCalledTimes(1);
    expect(manager.onKeyPress).toHaveBeenCalledWith(1, 2);
  });

  it("visual_memory_manager callbacks should be defined", () => {
    const object: GameObject = MockGameObject.mock();
    const target: GameObject = MockGameObject.mock();

    callNestedBinding("visual_memory_manager", "get_visible_value", [object, target, 1000, 50, 25, 5, 1, 200, 20, 2]);

    expect(calculateObjectVisibility).toHaveBeenCalledTimes(1);
    expect(calculateObjectVisibility).toHaveBeenCalledWith(object, target, 1000, 50, 25, 5, 1, 200, 20, 2);
  });

  it("ai_stalker callbacks should be defined", () => {
    const manager: LoadoutManager = getManager(LoadoutManager);

    jest.spyOn(manager, "onGenerateServerObjectLoadout").mockImplementation(jest.fn(() => false));

    const object: GameObject = MockGameObject.mock();
    const weapon: GameObject = MockGameObject.mock();

    callNestedBinding("ai_stalker", "update_best_weapon", [object, weapon]);

    expect(selectBestStalkerWeapon).toHaveBeenCalledTimes(1);
    expect(selectBestStalkerWeapon).toHaveBeenCalledWith(object, weapon);

    callNestedBinding("ai_stalker", "CSE_ALifeObject_spawn_supplies", [object, object.id(), "test"]);

    expect(manager.onGenerateServerObjectLoadout).toHaveBeenCalledTimes(1);
    expect(manager.onGenerateServerObjectLoadout).toHaveBeenCalledWith(object, object.id(), "test");
  });
});
