import { beforeAll, describe, expect, it } from "@jest/globals";
import { AnyObject } from "xray16/lib";

beforeAll(() => {
  require("@/engine/declarations/callbacks/custom/is_task_failed");
});

describe("engine.is_task_failed", () => {
  it("registers the callback", () => {
    expect((_G as AnyObject).engine.is_task_failed).toBeDefined();
  });
});
