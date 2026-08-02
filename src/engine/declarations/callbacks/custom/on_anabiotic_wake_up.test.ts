import { beforeAll, describe, expect, it } from "@jest/globals";
import { AnyObject } from "xray16/lib";

beforeAll(() => {
  require("@/engine/declarations/callbacks/custom/on_anabiotic_wake_up");
});

describe("engine.on_anabiotic_wake_up", () => {
  it("registers the callback", () => {
    expect((_G as AnyObject).engine.on_anabiotic_wake_up).toBeDefined();
  });
});
