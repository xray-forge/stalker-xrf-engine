import { beforeAll, describe, expect, it } from "@jest/globals";
import { AnyObject } from "xray16/lib";

beforeAll(() => {
  require("@/engine/declarations/callbacks/is_task_completed");
});

describe("engine.is_task_completed", () => {
  it("registers the callback", () => {
    expect((_G as AnyObject).engine.is_task_completed).toBeDefined();
  });
});
