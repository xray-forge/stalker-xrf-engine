import { beforeAll, beforeEach, describe, it } from "@jest/globals";

import { AnyArgs, AnyObject, TName } from "@/engine/lib/types";
import { callBinding, checkNestedBinding, resetRegistry } from "@/fixtures/engine";

describe("task_functors external callbacks", () => {
  const checkTaskBinding = (name: TName) => checkNestedBinding("task_functors", name);
  const callTaskBinding = (name: TName, args: AnyArgs) => callBinding(name, args, (_G as AnyObject).task_functors);

  beforeAll(() => {
    require("@/engine/scripts/declarations/tasks/task_functors_quest");
  });

  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly inject task functors", () => {
    checkTaskBinding("zat_b29_adv_title");
    checkTaskBinding("zat_b29_adv_descr");
    checkTaskBinding("zat_b29_adv_target");
  });
});
