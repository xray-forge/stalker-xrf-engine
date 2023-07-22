import { beforeAll, describe, expect, it } from "@jest/globals";

import { getExtern } from "@/engine/core/utils/binding";
import { AnyCallablesModule } from "@/engine/lib/types";
import { checkXrCondition } from "@/fixtures/engine";

describe("'static' conditions declaration", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/conditions/static");
  });

  it("should correctly inject external methods for game", () => {
    checkXrCondition("always");
    checkXrCondition("never");
  });

  it("should always return true", () => {
    expect(getExtern<AnyCallablesModule>("xr_conditions").always()).toBe(true);
  });

  it("should never return false", () => {
    expect(getExtern<AnyCallablesModule>("xr_conditions").never()).toBe(false);
  });
});
