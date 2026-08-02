import { beforeAll, describe, expect, it } from "@jest/globals";
import { AnyObject } from "xray16/lib";

beforeAll(() => {
  require("@/engine/declarations/callbacks/custom/on_start_sleeping");
});

describe("engine.on_start_sleeping", () => {
  it("registers the callback", () => {
    expect((_G as AnyObject).engine.on_start_sleeping).toBeDefined();
  });
});
