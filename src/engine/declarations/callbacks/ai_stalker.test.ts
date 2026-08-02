import { beforeAll, describe, expect, it } from "@jest/globals";
import { AnyObject } from "xray16/lib";

beforeAll(() => {
  require("@/engine/declarations/callbacks/ai_stalker");
});

describe("ai_stalker", () => {
  it("registers AI callbacks", () => {
    expect((_G as AnyObject).ai_stalker.update_best_weapon).toBeDefined();
  });
});
