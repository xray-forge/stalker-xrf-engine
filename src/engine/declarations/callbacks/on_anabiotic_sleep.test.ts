import { beforeAll, describe, expect, it } from "@jest/globals";
import { AnyObject } from "xray16/lib";

beforeAll(() => {
  require("@/engine/declarations/callbacks/on_anabiotic_sleep");
});

describe("engine.on_anabiotic_sleep", () => {
  it("registers the callback", () => {
    expect((_G as AnyObject).engine.on_anabiotic_sleep).toBeDefined();
  });
});
