import { beforeAll, describe, expect, it } from "@jest/globals";
import { AnyCallablesModule, getExtern } from "xray16/lib";

import { checkXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/scripts/declarations/conditions/static");
});

describe("static conditions declaration", () => {
  it("should correctly inject external methods for game", () => {
    checkXrCondition("always");
    checkXrCondition("never");
  });
});

describe("static conditions implementation", () => {
  it("should always return true", () => {
    expect(getExtern<AnyCallablesModule>("xr_conditions").always()).toBe(true);
  });

  it("should never return false", () => {
    expect(getExtern<AnyCallablesModule>("xr_conditions").never()).toBe(false);
  });
});
