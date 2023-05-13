import { describe, expect, it } from "@jest/globals";

import { AnyObject } from "@/engine/lib/types";

describe("'game' conditions declaration", () => {
  const checkBinding = (name: string, container: AnyObject = global) => {
    expect(container["xr_conditions"][name]).toBeDefined();
  };

  it("should correctly inject external methods for game", () => {
    require("@/engine/scripts/declarations/conditions/game");

    checkBinding("signal");
    checkBinding("counter_greater");
    checkBinding("counter_equal");
    checkBinding("has_active_tutorial");
    checkBinding("black_screen");
  });
});
