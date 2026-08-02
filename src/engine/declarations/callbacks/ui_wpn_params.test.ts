import { beforeAll, describe, expect, it } from "@jest/globals";
import { AnyObject } from "xray16/lib";

beforeAll(() => {
  require("@/engine/declarations/callbacks/ui_wpn_params");
});

describe("ui_wpn_params", () => {
  it("registers weapon parameter callbacks", () => {
    expect((_G as AnyObject).ui_wpn_params.GetRPM).toBeDefined();
  });
});
