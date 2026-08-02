import { beforeAll, describe, expect, it } from "@jest/globals";
import { AnyObject } from "xray16/lib";

beforeAll(() => {
  require("@/engine/declarations/callbacks/on_before_change_level");
});

describe("CALifeUpdateManager__on_before_change_level", () => {
  it("registers the callback", () => {
    expect((_G as AnyObject).CALifeUpdateManager__on_before_change_level).toBeDefined();
  });
});
