import { beforeAll, describe, expect, it } from "@jest/globals";
import { AnyCallablesModule } from "xray16/lib";

import { getExtern } from "@/engine/core/utils/binding";
import { checkXrCondition } from "@/fixtures/engine";

describe("static conditions declaration", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/conditions/static");
  });

  it("should correctly inject external methods for game", () => {
    checkXrCondition("always");
    checkXrCondition("never");
  });
});

describe("static conditions implementation", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/conditions/static");
  });

  it("should always return true", () => {
    expect(getExtern<AnyCallablesModule>("xr_conditions").always()).toBe(true);
  });

  it("should never return false", () => {
    expect(getExtern<AnyCallablesModule>("xr_conditions").never()).toBe(false);
  });
});
