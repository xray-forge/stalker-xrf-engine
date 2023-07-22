import { beforeAll, describe, it } from "@jest/globals";

import { checkNestedBinding } from "@/fixtures/engine";

describe("'task_functors' external callbacks", () => {
  const checkTaskBinding = (name: string) => checkNestedBinding("task_functors", name);

  beforeAll(() => {
    require("@/engine/scripts/declarations/tasks/task_functors");
  });

  it("should correctly inject task functors", () => {
    checkTaskBinding("condlist");
    checkTaskBinding("zat_b29_adv_title");
    checkTaskBinding("zat_b29_adv_descr");
    checkTaskBinding("surge_task_title");
    checkTaskBinding("surge_task_descr");
    checkTaskBinding("target_condlist");
    checkTaskBinding("zat_b29_adv_target");
    checkTaskBinding("surge_task_target");
  });
});
