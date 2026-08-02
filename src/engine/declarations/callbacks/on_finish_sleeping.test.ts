import { beforeAll, describe, expect, it } from "@jest/globals";
import { AnyObject } from "xray16/lib";

beforeAll(() => {
  require("@/engine/declarations/callbacks/on_finish_sleeping");
});

describe("engine.on_finish_sleeping", () => {
  it("registers the callback", () => {
    expect((_G as AnyObject).engine.on_finish_sleeping).toBeDefined();
  });
});
