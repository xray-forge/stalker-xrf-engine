import { beforeAll, describe, it } from "@jest/globals";

import { checkNestedBinding } from "@/fixtures/engine";

describe("custom external callbacks", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/callbacks/custom");
  });

  it("should correctly inject external methods for game", () => {
    checkNestedBinding("engine", "on_anabiotic_sleep");
    checkNestedBinding("engine", "on_anabiotic_wake_up");
    checkNestedBinding("engine", "surge_survive_start");
    checkNestedBinding("engine", "surge_survive_end");
    checkNestedBinding("engine", "on_start_sleeping");
    checkNestedBinding("engine", "on_finish_sleeping");
    checkNestedBinding("engine", "is_task_completed");
    checkNestedBinding("engine", "is_task_failed");
    checkNestedBinding("engine", "effector_callback");
    checkNestedBinding("engine", "check_achievement");
  });
});
