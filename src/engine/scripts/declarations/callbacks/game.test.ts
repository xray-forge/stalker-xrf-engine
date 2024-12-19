import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";

import { smartCoversList } from "@/engine/core/animation/smart_covers";
import { getManager } from "@/engine/core/database";
import { gameOutroConfig, GameOutroManager } from "@/engine/core/managers/outro";
import { SaveManager } from "@/engine/core/managers/save";
import { TradeManager } from "@/engine/core/managers/trade";
import { AnyArgs, AnyObject, TName } from "@/engine/lib/types";
import { callBinding, checkBinding, checkNestedBinding, resetRegistry } from "@/fixtures/engine";

function callAlifeStorageBinding(name: TName, args: AnyArgs = []): unknown {
  return callBinding(name, args, (_G as AnyObject)["alife_storage_manager"]);
}

function callTradeBinding(name: TName, args: AnyArgs = []): unknown {
  return callBinding(name, args, (_G as AnyObject)["trade_manager"]);
}

function callOutroBinding(name: TName, args: AnyArgs = []): void {
  return callBinding(name, args, (_G as AnyObject)["outro"]);
}

describe("game external callbacks", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/callbacks/game");
  });

  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly inject external methods for game", () => {
    checkBinding("main");
    checkBinding("smart_covers");
    checkNestedBinding("smart_covers", "descriptions");
    checkBinding("outro");
    checkBinding("trade_manager");
    checkBinding("alife_storage_manager");
  });

  it("main to be defined for custom scripts", () => {
    expect(() => callBinding("main")).not.toThrow();
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

    callOutroBinding("start_bk_sound");
    expect(outroManager.startBlackScreenAndSound).toHaveBeenCalled();

    callOutroBinding("stop_bk_sound");
    expect(outroManager.stopBlackScreenAndSound).toHaveBeenCalled();

    callOutroBinding("update_bk_sound_fade_start", [25]);
    expect(outroManager.updateBlackScreenAndSoundFadeStart).toHaveBeenCalledWith(25);
    expect(outroManager.stopBlackScreenAndSound).toHaveBeenCalled();

    callOutroBinding("update_bk_sound_fade_stop", [35]);
    expect(outroManager.updateBlackScreenAndSoundFadeStop).toHaveBeenCalledWith(35);
  });

  it("trade manager callbacks should be defined", () => {
    const tradeManager: TradeManager = getManager(TradeManager);

    jest.spyOn(tradeManager, "getSellDiscountForObject").mockImplementation(() => 10);
    jest.spyOn(tradeManager, "getBuyDiscountForObject").mockImplementation(() => 20);

    expect(callTradeBinding("get_sell_discount", [30])).toBe(10);
    expect(tradeManager.getSellDiscountForObject).toHaveBeenCalledWith(30);

    expect(callTradeBinding("get_buy_discount", [40])).toBe(20);
    expect(tradeManager.getBuyDiscountForObject).toHaveBeenCalledWith(40);
  });

  it("alife storage save methods should be defined", () => {
    const saveManager: SaveManager = getManager(SaveManager);

    jest.spyOn(saveManager, "onBeforeGameSave");
    jest.spyOn(saveManager, "onGameSave");
    jest.spyOn(saveManager, "onGameLoad");
    jest.spyOn(saveManager, "onAfterGameLoad");

    callAlifeStorageBinding("CALifeStorageManager_before_save", ["name1"]);
    expect(saveManager.onBeforeGameSave).toHaveBeenCalledWith("name1");

    callAlifeStorageBinding("CALifeStorageManager_save", ["name2"]);
    expect(saveManager.onGameSave).toHaveBeenCalledWith("name2");

    callAlifeStorageBinding("CALifeStorageManager_load", ["name3"]);
    expect(saveManager.onGameLoad).toHaveBeenCalledWith("name3");

    callAlifeStorageBinding("CALifeStorageManager_after_load", ["name4"]);
    expect(saveManager.onAfterGameLoad).toHaveBeenCalledWith("name4");
  });

  it.todo("level_input callbacks should be defined");
});
