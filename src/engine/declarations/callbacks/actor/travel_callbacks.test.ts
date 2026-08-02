import { beforeAll, describe, expect, it } from "@jest/globals";
import { AnyObject } from "xray16/lib";

beforeAll(() => {
  require("@/engine/declarations/callbacks/actor/travel_callbacks");
});

describe("travel_callbacks", () => {
  it("registers its travel API", () => {
    expect((_G as AnyObject).travel_callbacks).toBeDefined();
  });
});
