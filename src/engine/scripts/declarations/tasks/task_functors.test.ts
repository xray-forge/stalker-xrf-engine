import { describe, it } from "@jest/globals";

import { AnyObject } from "@/engine/lib/types";

describe("'task_functors' external callbacks", () => {
  const checkBinding = (name: string, container: AnyObject = global) => {
    if (!container["task_functors"][name]) {
      throw new Error(`Expected '${name}' callback to be declared.`);
    }
  };

  it("should correctly inject task functors", () => {
    require("@/engine/scripts/declarations/tasks/task_functors");

    checkBinding("condlist");
    checkBinding("zat_b29_adv_title");
    checkBinding("zat_b29_adv_descr");
    checkBinding("surge_task_title");
    checkBinding("surge_task_descr");
    checkBinding("target_condlist");
    checkBinding("zat_b29_adv_target");
    checkBinding("surge_task_target");
  });
});
