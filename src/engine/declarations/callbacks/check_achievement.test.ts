import { beforeAll, describe, expect, it } from "@jest/globals";
import { AnyObject } from "xray16/lib";

import { achievementsPreconditionsMap } from "@/engine/core/utils/achievements";

beforeAll(() => {
  require("@/engine/declarations/callbacks/check_achievement");
});

describe("engine.check_achievement", () => {
  it("registers all achievement checkers", () => {
    expect((_G as AnyObject).engine.check_achievement).toBe(achievementsPreconditionsMap);
  });
});
