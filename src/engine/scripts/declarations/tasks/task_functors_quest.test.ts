import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";

import { disableInfoPortion, giveInfoPortion } from "@/engine/core/utils/info_portion";
import { AnyArgs, AnyObject, TName } from "@/engine/lib/types";
import { callBinding, checkNestedBinding, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";
import { mockGameObject } from "@/fixtures/xray";

describe("task_functors external callbacks", () => {
  const checkTaskBinding = (name: TName) => checkNestedBinding("task_functors", name);
  const callTaskBinding = (name: TName, args: AnyArgs = []) => callBinding(name, args, (_G as AnyObject).task_functors);

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

  it("zat_b29_adv_title should correctly return title", () => {
    const { actorGameObject } = mockRegisteredActor();

    expect(callTaskBinding("zat_b29_adv_title")).toBeNull();

    for (const it of $range(16, 23)) {
      giveInfoPortion(`zat_b29_bring_af_${it}`);

      jest.spyOn(actorGameObject, "object").mockImplementation(() => null);
      expect(callTaskBinding("zat_b29_adv_title")).toBe(`zat_b29_simple_find_title_${it}`);

      jest.spyOn(actorGameObject, "object").mockImplementation(() => mockGameObject());
      expect(callTaskBinding("zat_b29_adv_title")).toBe(`zat_b29_simple_bring_title_${it}`);

      disableInfoPortion(`zat_b29_bring_af_${it}`);
      expect(callTaskBinding("zat_b29_adv_title")).toBeNull();
    }
  });
});
