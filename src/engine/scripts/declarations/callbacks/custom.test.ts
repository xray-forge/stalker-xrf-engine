import { describe, expect, it } from "@jest/globals";

import { AnyObject } from "@/engine/lib/types";

describe("'custom' external callbacks", () => {
  const checkBinding = (name: string, container: AnyObject = global) => {
    expect(container["engine"][name]).toBeDefined();
  };

  it("should correctly inject external methods for game", () => {
    require("@/engine/scripts/declarations/callbacks/custom");

    checkBinding("dream_callback");
    checkBinding("dream_callback2");
    checkBinding("anabiotic_callback");
    checkBinding("anabiotic_callback2");
    checkBinding("task_complete");
    checkBinding("task_fail");
    checkBinding("effector_callback");
    checkBinding("check_achievement");
  });
});
