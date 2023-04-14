import { describe, it } from "@jest/globals";

import { AnyObject } from "@/engine/lib/types";

describe("'custom' external callbacks", () => {
  const checkBinding = (name: string, container: AnyObject = global) => {
    if (!container["engine"][name]) {
      throw new Error(`Expected '${name}' callback to be declared.`);
    }
  };

  it("should correctly inject external methods for game", () => {
    require("@/engine/scripts/declarations/callbacks/custom");

    checkBinding("dream_callback");
    checkBinding("dream_callback2");
    checkBinding("anabiotic_callback");
    checkBinding("anabiotic_callback2");
    checkBinding("is_task_completed");
    checkBinding("is_task_failed");
    checkBinding("effector_callback");
    checkBinding("check_achievement");
  });
});
