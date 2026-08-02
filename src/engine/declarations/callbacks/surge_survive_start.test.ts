import { beforeAll, describe, expect, it } from "@jest/globals";
import { AnyObject } from "xray16/lib";

beforeAll(() => {
  require("@/engine/declarations/callbacks/surge_survive_start");
});

describe("engine.surge_survive_start", () => {
  it("registers the callback", () => {
    expect((_G as AnyObject).engine.surge_survive_start).toBeDefined();
  });
});
