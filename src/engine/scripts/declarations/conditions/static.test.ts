import { beforeAll, describe, expect, it } from "@jest/globals";
import { AnyCallablesModule, getExtern } from "xray16/lib";

import { checkXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/scripts/declarations/conditions/static");
});

describe("always", () => {
  it("should be registered", () => {
    checkXrCondition("always");
  });
});

describe("never", () => {
  it("should be registered", () => {
    checkXrCondition("never");
  });
});

describe("always return true", () => {
  it("should always return true", () => {
    expect(getExtern<AnyCallablesModule>("xr_conditions").always()).toBe(true);
  });
});

describe("never return false", () => {
  it("should never return false", () => {
    expect(getExtern<AnyCallablesModule>("xr_conditions").never()).toBe(false);
  });
});
