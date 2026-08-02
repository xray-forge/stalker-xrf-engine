import { beforeAll, describe, expect, it } from "@jest/globals";
import { AnyObject } from "xray16/lib";

beforeAll(() => {
  require("@/engine/declarations/callbacks/interface/inventory_upgrades");
});

describe("inventory_upgrades", () => {
  it("registers upgrade callbacks", () => {
    expect((_G as AnyObject).inventory_upgrades.get_upgrade_cost).toBeDefined();
  });
});
