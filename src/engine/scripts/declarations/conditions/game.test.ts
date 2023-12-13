import { beforeAll, describe, it } from "@jest/globals";

import { checkXrCondition } from "@/fixtures/engine";

describe("game conditions declaration", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/conditions/game");
  });

  it("should correctly inject external methods for game", () => {
    checkXrCondition("signal");
    checkXrCondition("counter_greater");
    checkXrCondition("counter_equal");
    checkXrCondition("has_active_tutorial");
    checkXrCondition("black_screen");
  });
});

describe("game conditions implementation", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/conditions/game");
  });

  it.todo("signal should check if signal is active");

  it.todo("counter_greater should check counter value");

  it.todo("counter_equal should check counter value");

  it.todo("has_active_tutorial should check if any tutorial is active");

  it.todo("black_screen should check if black screen is active");
});
