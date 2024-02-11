import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { CConsole, CUILines, game, get_console, get_hud, StaticDrawableWrapper } from "xray16";

import { getManager, getPortableStoreValue } from "@/engine/core/database";
import { UpgradesManager } from "@/engine/core/managers/upgrades";
import { disconnectFromGame } from "@/engine/core/utils/game";
import { createGameAutoSave } from "@/engine/core/utils/game_save";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { GameHud, Optional } from "@/engine/lib/types";
import { callXrEffect, checkXrEffect, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";
import { resetFunctionMock } from "@/fixtures/jest";
import { MockGameObject, MockStaticDrawableWrapper } from "@/fixtures/xray";

jest.mock("@/engine/core/utils/game");
jest.mock("@/engine/core/utils/game_save");

describe("game effects declaration", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/effects/game");
  });

  it("should correctly inject external methods for game", () => {
    checkXrEffect("inc_counter");
    checkXrEffect("dec_counter");
    checkXrEffect("set_counter");
    checkXrEffect("game_disconnect");
    checkXrEffect("game_credits");
    checkXrEffect("after_credits");
    checkXrEffect("before_credits");
    checkXrEffect("game_over");
    checkXrEffect("on_tutor_gameover_stop");
    checkXrEffect("on_tutor_gameover_quickload");
    checkXrEffect("stop_tutorial");
    checkXrEffect("scenario_autosave");
    checkXrEffect("mech_discount");
    checkXrEffect("upgrade_hint");
    checkXrEffect("add_cs_text");
    checkXrEffect("del_cs_text");
  });
});

describe("game effects implementation", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/effects/game");
  });

  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(disconnectFromGame);
    resetFunctionMock(createGameAutoSave);
    resetFunctionMock(game.start_tutorial);
    resetFunctionMock(game.stop_tutorial);
    resetFunctionMock(get_console().execute);
  });

  it("inc_counter should correctly increment portable store count", () => {
    const { actorGameObject } = mockRegisteredActor();

    expect(() => callXrEffect("inc_counter", actorGameObject, MockGameObject.mock())).not.toThrow();

    expect(getPortableStoreValue(ACTOR_ID, "test-pstore")).toBeNull();

    callXrEffect("inc_counter", actorGameObject, MockGameObject.mock(), "test-pstore");

    expect(getPortableStoreValue(ACTOR_ID, "test-pstore")).toBe(1);

    callXrEffect("inc_counter", actorGameObject, MockGameObject.mock(), "test-pstore");

    expect(getPortableStoreValue(ACTOR_ID, "test-pstore")).toBe(2);

    callXrEffect("inc_counter", actorGameObject, MockGameObject.mock(), "test-pstore", 4);

    expect(getPortableStoreValue(ACTOR_ID, "test-pstore")).toBe(6);
  });

  it("dec_counter should correctly decrement portable store count", () => {
    const { actorGameObject } = mockRegisteredActor();

    expect(() => callXrEffect("dec_counter", actorGameObject, MockGameObject.mock())).not.toThrow();

    callXrEffect("inc_counter", actorGameObject, MockGameObject.mock(), "test-pstore", 6);
    callXrEffect("dec_counter", actorGameObject, MockGameObject.mock(), "test-pstore");

    expect(getPortableStoreValue(ACTOR_ID, "test-pstore")).toBe(5);

    callXrEffect("dec_counter", actorGameObject, MockGameObject.mock(), "test-pstore");

    expect(getPortableStoreValue(ACTOR_ID, "test-pstore")).toBe(4);

    callXrEffect("dec_counter", actorGameObject, MockGameObject.mock(), "test-pstore", 4);

    expect(getPortableStoreValue(ACTOR_ID, "test-pstore")).toBe(0);

    callXrEffect("dec_counter", actorGameObject, MockGameObject.mock(), "test-pstore", 1000);

    expect(getPortableStoreValue(ACTOR_ID, "test-pstore")).toBe(0);
  });

  it("set_counter should correctly set portable store count", () => {
    const { actorGameObject } = mockRegisteredActor();

    expect(() => callXrEffect("set_counter", actorGameObject, MockGameObject.mock())).not.toThrow();

    callXrEffect("inc_counter", actorGameObject, MockGameObject.mock(), "test-pstore", 6);
    callXrEffect("set_counter", actorGameObject, MockGameObject.mock(), "test-pstore");

    expect(getPortableStoreValue(ACTOR_ID, "test-pstore")).toBe(0);

    callXrEffect("set_counter", actorGameObject, MockGameObject.mock(), "test-pstore", 200);

    expect(getPortableStoreValue(ACTOR_ID, "test-pstore")).toBe(200);
  });

  it("game_disconnect should correctly disconnect from game", () => {
    expect(disconnectFromGame).toHaveBeenCalledTimes(0);

    callXrEffect("game_disconnect", MockGameObject.mockActor(), MockGameObject.mock());

    expect(disconnectFromGame).toHaveBeenCalledTimes(1);
  });

  it("game_over should correctly trigger game over", () => {
    const console: CConsole = get_console();

    expect(console.execute).toHaveBeenCalledTimes(0);

    callXrEffect("game_over", MockGameObject.mockActor(), MockGameObject.mock());

    expect(console.execute).toHaveBeenCalledTimes(0);

    callXrEffect("game_credits", MockGameObject.mockActor(), MockGameObject.mock());
    callXrEffect("game_over", MockGameObject.mockActor(), MockGameObject.mock());

    expect(console.execute).toHaveBeenCalledTimes(1);
    expect(console.execute).toHaveBeenCalledWith("main_menu on");
  });

  it("after_credits should show menu after credits", () => {
    const console: CConsole = get_console();

    expect(console.execute).toHaveBeenCalledTimes(0);

    callXrEffect("after_credits", MockGameObject.mockActor(), MockGameObject.mock());

    expect(console.execute).toHaveBeenCalledTimes(1);
    expect(console.execute).toHaveBeenCalledWith("main_menu on");
  });

  it("before_credits should hide menu before credits", () => {
    const console: CConsole = get_console();

    expect(console.execute).toHaveBeenCalledTimes(0);

    callXrEffect("before_credits", MockGameObject.mockActor(), MockGameObject.mock());

    expect(console.execute).toHaveBeenCalledTimes(1);
    expect(console.execute).toHaveBeenCalledWith("main_menu off");
  });

  it("game_credits should correctly show game credits", () => {
    expect(game.start_tutorial).toHaveBeenCalledTimes(0);

    callXrEffect("game_credits", MockGameObject.mockActor(), MockGameObject.mock());

    expect(game.start_tutorial).toHaveBeenCalledTimes(1);
    expect(game.start_tutorial).toHaveBeenCalledWith("credits_seq");
  });

  it("on_tutor_gameover_stop should handle game over scenario stop", () => {
    const console: CConsole = get_console();

    expect(console.execute).toHaveBeenCalledTimes(0);

    callXrEffect("on_tutor_gameover_stop", MockGameObject.mockActor(), MockGameObject.mock());

    expect(console.execute).toHaveBeenCalledTimes(1);
    expect(console.execute).toHaveBeenCalledWith("main_menu on");
  });

  it("on_tutor_gameover_quickload should handle quick load on game over", () => {
    const console: CConsole = get_console();

    expect(console.execute).toHaveBeenCalledTimes(0);

    callXrEffect("on_tutor_gameover_quickload", MockGameObject.mockActor(), MockGameObject.mock());

    expect(console.execute).toHaveBeenCalledTimes(1);
    expect(console.execute).toHaveBeenCalledWith("load_last_save");
  });

  it("stop_tutorial should handle stop tutorial", () => {
    expect(game.stop_tutorial).toHaveBeenCalledTimes(0);

    callXrEffect("stop_tutorial", MockGameObject.mockActor(), MockGameObject.mock());

    expect(game.stop_tutorial).toHaveBeenCalledTimes(1);
  });

  it("scenario_autosave should create autosaves", () => {
    expect(createGameAutoSave).toHaveBeenCalledTimes(0);

    callXrEffect("scenario_autosave", MockGameObject.mockActor(), MockGameObject.mock());

    expect(createGameAutoSave).toHaveBeenCalledTimes(1);
  });

  it("mech_discount should update mechanic discounts", () => {
    const manager: UpgradesManager = getManager(UpgradesManager);

    jest.spyOn(manager, "setCurrentPriceDiscount").mockImplementation(jest.fn());

    callXrEffect("mech_discount", MockGameObject.mockActor(), MockGameObject.mock());

    expect(manager.setCurrentPriceDiscount).not.toHaveBeenCalled();

    callXrEffect("mech_discount", MockGameObject.mockActor(), MockGameObject.mock(), "not-number");

    expect(manager.setCurrentPriceDiscount).not.toHaveBeenCalled();

    callXrEffect("mech_discount", MockGameObject.mockActor(), MockGameObject.mock(), "15");

    expect(manager.setCurrentPriceDiscount).toHaveBeenCalledTimes(1);
    expect(manager.setCurrentPriceDiscount).toHaveBeenCalledWith(15);

    callXrEffect("mech_discount", MockGameObject.mockActor(), MockGameObject.mock(), 25);

    expect(manager.setCurrentPriceDiscount).toHaveBeenCalledTimes(2);
    expect(manager.setCurrentPriceDiscount).toHaveBeenCalledWith(25);
  });

  it("upgrade_hint should update mechanic hints", () => {
    const manager: UpgradesManager = getManager(UpgradesManager);

    jest.spyOn(manager, "setCurrentHints").mockImplementation(jest.fn());

    callXrEffect("upgrade_hint", MockGameObject.mockActor(), MockGameObject.mock());

    expect(manager.setCurrentHints).toHaveBeenCalledTimes(1);
    expect(manager.setCurrentHints).toHaveBeenCalledWith([]);

    callXrEffect("upgrade_hint", MockGameObject.mockActor(), MockGameObject.mock(), "a", "b", "c");

    expect(manager.setCurrentHints).toHaveBeenCalledTimes(2);
    expect(manager.setCurrentHints).toHaveBeenCalledWith(["a", "b", "c"]);
  });

  it("add_cs_text should show custom screen text", () => {
    const hud: GameHud = get_hud();

    callXrEffect("add_cs_text", MockGameObject.mockActor(), MockGameObject.mock());

    expect(hud.RemoveCustomStatic).not.toHaveBeenCalled();
    expect(hud.AddCustomStatic).not.toHaveBeenCalled();

    jest
      .spyOn(hud, "GetCustomStatic")
      .mockImplementationOnce(() => MockStaticDrawableWrapper.mock("text_on_screen_center"));

    callXrEffect("add_cs_text", MockGameObject.mockActor(), MockGameObject.mock(), "custom_label");

    expect(hud.RemoveCustomStatic).toHaveBeenCalledWith("text_on_screen_center");
    expect(hud.AddCustomStatic).toHaveBeenCalledTimes(1);
    expect(hud.AddCustomStatic).toHaveBeenCalledWith("text_on_screen_center", true);

    const textControl: Optional<CUILines> = hud
      .GetCustomStatic("text_on_screen_center")
      ?.wnd()
      .TextControl() as Optional<CUILines>;

    expect(textControl?.SetText).toHaveBeenCalledTimes(1);
    expect(textControl?.SetText).toHaveBeenCalledWith("translated_custom_label");
  });

  it("del_cs_text should remove custom screen text", () => {
    callXrEffect("del_cs_text", MockGameObject.mockActor(), MockGameObject.mock());

    const hud: GameHud = get_hud();
    const csText: Optional<StaticDrawableWrapper> = hud.GetCustomStatic("text_on_screen_center");

    expect(csText).toBeNull();

    callXrEffect("del_cs_text", MockGameObject.mockActor(), MockGameObject.mock());
    callXrEffect("add_cs_text", MockGameObject.mockActor(), MockGameObject.mock(), "custom");

    const newCsText: Optional<StaticDrawableWrapper> = hud.GetCustomStatic("text_on_screen_center");

    expect(newCsText).not.toBeNull();

    callXrEffect("del_cs_text", MockGameObject.mockActor(), MockGameObject.mock());

    expect(hud.GetCustomStatic("text_on_screen_center")).toBeNull();
    expect(hud.RemoveCustomStatic).toHaveBeenCalledWith("text_on_screen_center");
  });
});
