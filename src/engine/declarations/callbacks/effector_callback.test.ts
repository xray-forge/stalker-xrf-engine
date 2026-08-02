import { beforeAll, describe, expect, it } from "@jest/globals";
import { AnyObject } from "xray16/lib";

beforeAll(() => {
  require("@/engine/declarations/callbacks/effector_callback");
});

describe("engine.effector_callback", () => {
  it("registers the callback", () => {
    expect((_G as AnyObject).engine.effector_callback).toBeDefined();
  });
});
