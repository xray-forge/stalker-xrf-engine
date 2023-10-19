import { beforeAll, describe, expect, it } from "@jest/globals";

import { smartCoversList } from "@/engine/core/objects/animation/smart_covers";
import { AnyObject } from "@/engine/lib/types";
import { callBinding, checkBinding, checkNestedBinding } from "@/fixtures/engine";

describe("game external callbacks", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/callbacks/game");
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
    expect((_G as AnyObject).smart_covers).toBe(smartCoversList);
  });

  it.todo("outro callbacks should be defined");

  it.todo("trade manager callbacks should be defined");

  it.todo("on_before_game_save should be handled");

  it.todo("on_game_save should be handled");

  it.todo("on_before_game_load should be handled");

  it.todo("on_game_load should be handled");
});
