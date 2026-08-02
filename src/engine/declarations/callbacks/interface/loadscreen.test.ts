import { beforeAll, describe, expect, it } from "@jest/globals";
import { AnyObject } from "xray16/lib";

beforeAll(() => {
  require("@/engine/declarations/callbacks/interface/loadscreen");
});

describe("loadscreen", () => {
  it("registers tip callbacks", () => {
    expect((_G as AnyObject).loadscreen.get_tip_number).toBeDefined();
  });
});
