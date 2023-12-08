import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";

import { smartCoversList } from "@/engine/core/animation/smart_covers";
import { getManager } from "@/engine/core/database";
import { gameOutroConfig, GameOutroManager } from "@/engine/core/managers/outro";
import { SaveManager } from "@/engine/core/managers/save";
import { TradeManager } from "@/engine/core/managers/trade";
import { AnyArgs, AnyObject, TName } from "@/engine/lib/types";
import { callBinding, checkBinding, checkNestedBinding, resetRegistry } from "@/fixtures/engine";

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

    const callOutroBinding = (name: TName, args: AnyArgs = []) => callBinding(name, args, (_G as AnyObject)["outro"]);

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

    const callTradeBinding = (name: TName, args: AnyArgs = []) =>
      callBinding(name, args, (_G as AnyObject)["trade_manager"]);

    jest.spyOn(tradeManager, "getSellDiscountForObject").mockImplementation(() => 10);
    jest.spyOn(tradeManager, "getBuyDiscountForObject").mockImplementation(() => 20);

    expect(callTradeBinding("get_sell_discount", [30])).toBe(10);
    expect(tradeManager.getSellDiscountForObject).toHaveBeenCalledWith(30);

    expect(callTradeBinding("get_buy_discount", [40])).toBe(20);
    expect(tradeManager.getBuyDiscountForObject).toHaveBeenCalledWith(40);
  });

  it("on_before_game_save should be handled", () => {
    const saveManager: SaveManager = getManager(SaveManager);

    jest.spyOn(saveManager, "onBeforeGameSave");

    callBinding("on_before_game_save", ["name"]);
    expect(saveManager.onBeforeGameSave).toHaveBeenCalledWith("name");
  });

  it("on_game_save should be handled", () => {
    const saveManager: SaveManager = getManager(SaveManager);

    jest.spyOn(saveManager, "onGameSave");

    callBinding("on_game_save", ["name"]);
    expect(saveManager.onGameSave).toHaveBeenCalledWith("name");
  });

  it("on_before_game_load should be handled", () => {
    const saveManager: SaveManager = getManager(SaveManager);

    jest.spyOn(saveManager, "onBeforeGameLoad");

    callBinding("on_before_game_load", ["name"]);
    expect(saveManager.onBeforeGameLoad).toHaveBeenCalledWith("name");
  });

  it("on_game_load should be handled", () => {
    const saveManager: SaveManager = getManager(SaveManager);

    jest.spyOn(saveManager, "onGameLoad");

    callBinding("on_game_load", ["name"]);
    expect(saveManager.onGameLoad).toHaveBeenCalledWith("name");
  });
});
