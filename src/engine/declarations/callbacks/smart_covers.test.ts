import { beforeAll, describe, expect, it } from "@jest/globals";
import { AnyObject } from "xray16/lib";

import { smartCoversList } from "@/engine/core/animation/smart_covers";

beforeAll(() => {
  require("@/engine/declarations/callbacks/smart_covers");
});

describe("smart_covers", () => {
  it("exposes the engine cover list", () => {
    expect((_G as AnyObject).smart_covers.descriptions).toBe(smartCoversList);
  });
});
