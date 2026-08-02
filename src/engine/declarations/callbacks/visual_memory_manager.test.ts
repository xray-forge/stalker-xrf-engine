import { beforeAll, describe, expect, it } from "@jest/globals";
import { AnyObject } from "xray16/lib";

beforeAll(() => {
  require("@/engine/declarations/callbacks/visual_memory_manager");
});

describe("visual_memory_manager", () => {
  it("registers visibility callbacks", () => {
    expect((_G as AnyObject).visual_memory_manager.get_visible_value).toBeDefined();
  });
});
