import { describe, expect, it } from "@jest/globals";

import { AnyObject } from "@/engine/lib/types";

describe("'static' conditions declaration", () => {
  const checkBinding = (name: string, container: AnyObject = global) => {
    expect(container["xr_conditions"][name]).toBeDefined();
  };

  it("should correctly inject external methods for game", () => {
    require("@/engine/scripts/declarations/conditions/static");

    checkBinding("always");
    checkBinding("never");
  });
});
