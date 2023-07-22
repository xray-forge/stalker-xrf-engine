import { beforeAll, describe, it } from "@jest/globals";

import { checkXrCondition } from "@/fixtures/engine";

describe("'game' conditions declaration", () => {
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
