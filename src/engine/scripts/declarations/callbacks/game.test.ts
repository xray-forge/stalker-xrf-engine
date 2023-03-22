import { describe, expect, it } from "@jest/globals";

import { AnyObject } from "@/engine/lib/types";

describe("'game' external callbacks", () => {
  const checkBinding = (name: string, container: AnyObject = global) => {
    expect(container[name]).toBeDefined();
  };

  it("should correctly inject external methods for game", () => {
    require("@/engine/scripts/declarations/callbacks/game");

    checkBinding("smart_covers");
    checkBinding("outro");
    checkBinding("trade_manager");
  });
});
