import { beforeAll, describe, expect, it } from "@jest/globals";
import { AnyObject } from "xray16/lib";

beforeAll(() => {
  require("@/engine/declarations/callbacks/trade_manager");
});

describe("trade_manager", () => {
  it("registers discount callbacks", () => {
    expect((_G as AnyObject).trade_manager.get_sell_discount).toBeDefined();
  });
});
