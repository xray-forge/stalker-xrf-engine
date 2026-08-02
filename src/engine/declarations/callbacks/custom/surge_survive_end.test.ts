import { beforeAll, describe, expect, it } from "@jest/globals";
import { AnyObject } from "xray16/lib";

beforeAll(() => {
  require("@/engine/declarations/callbacks/custom/surge_survive_end");
});

describe("engine.surge_survive_end", () => {
  it("registers the callback", () => {
    expect((_G as AnyObject).engine.surge_survive_end).toBeDefined();
  });
});
