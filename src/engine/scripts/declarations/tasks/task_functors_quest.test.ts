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

  it("zat_b29_adv_title should correctly return description", () => {
    const { actorGameObject } = mockRegisteredActor();

    expect(callTaskBinding("zat_b29_adv_descr")).toBeNull();

    for (const it of $range(16, 23)) {
      giveInfoPortion(`zat_b29_bring_af_${it}`);

      jest.spyOn(actorGameObject, "object").mockImplementation(() => null);
      expect(callTaskBinding("zat_b29_adv_descr")).toBe("zat_b29_simple_find_text_5");

      jest.spyOn(actorGameObject, "object").mockImplementation(() => mockGameObject());
      expect(callTaskBinding("zat_b29_adv_descr")).toBe("zat_b29_simple_bring_text_5");

      // First rival checks.

      giveInfoPortion("zat_b29_stalker_rival_1_found_af");
      giveInfoPortion("zat_b29_first_rival_taken_out");

      jest.spyOn(actorGameObject, "object").mockImplementation(() => null);
      expect(callTaskBinding("zat_b29_adv_descr")).toBe("zat_b29_simple_find_text_5");

      jest.spyOn(actorGameObject, "object").mockImplementation(() => mockGameObject());
      expect(callTaskBinding("zat_b29_adv_descr")).toBe("zat_b29_simple_bring_text_5");

      disableInfoPortion("zat_b29_stalker_rival_1_found_af");
      disableInfoPortion("zat_b29_first_rival_taken_out");

      // Second rival checks.

      giveInfoPortion("zat_b29_stalker_rival_2_found_af");
      giveInfoPortion("zat_b29_second_rival_taken_out");

      jest.spyOn(actorGameObject, "object").mockImplementation(() => null);
      expect(callTaskBinding("zat_b29_adv_descr")).toBe("zat_b29_simple_find_text_5");

      jest.spyOn(actorGameObject, "object").mockImplementation(() => mockGameObject());
      expect(callTaskBinding("zat_b29_adv_descr")).toBe("zat_b29_simple_bring_text_5");

      disableInfoPortion("zat_b29_stalker_rival_2_found_af");
      disableInfoPortion("zat_b29_second_rival_taken_out");

      // Take artefact from rival.

      giveInfoPortion("zat_b29_linker_take_af_from_rival");

      jest.spyOn(actorGameObject, "object").mockImplementation(() => null);
      expect(callTaskBinding("zat_b29_adv_descr")).toBe("zat_b29_simple_find_text_4");

      jest.spyOn(actorGameObject, "object").mockImplementation(() => mockGameObject());
      expect(callTaskBinding("zat_b29_adv_descr")).toBe("zat_b29_simple_bring_text_4");

      disableInfoPortion("zat_b29_linker_take_af_from_rival");

      // Rivals found.

      giveInfoPortion("zat_b29_stalkers_rivals_found_af");

      jest.spyOn(actorGameObject, "object").mockImplementation(() => null);
      expect(callTaskBinding("zat_b29_adv_descr")).toBe("zat_b29_simple_find_text_3");

      jest.spyOn(actorGameObject, "object").mockImplementation(() => mockGameObject());
      expect(callTaskBinding("zat_b29_adv_descr")).toBe("zat_b29_simple_bring_text_3");

      disableInfoPortion("zat_b29_stalkers_rivals_found_af");

      // Rivals search without exclusive conditions.

      giveInfoPortion("zat_b29_rivals_search");

      jest.spyOn(actorGameObject, "object").mockImplementation(() => null);
      expect(callTaskBinding("zat_b29_adv_descr")).toBe("zat_b29_simple_find_text_2");

      jest.spyOn(actorGameObject, "object").mockImplementation(() => mockGameObject());
      expect(callTaskBinding("zat_b29_adv_descr")).toBe("zat_b29_simple_bring_text_2");

      // Rivals search on exclusive conditions.

      giveInfoPortion("zat_b29_exclusive_conditions");

      jest.spyOn(actorGameObject, "object").mockImplementation(() => null);
      expect(callTaskBinding("zat_b29_adv_descr")).toBe("zat_b29_simple_find_text_1");

      jest.spyOn(actorGameObject, "object").mockImplementation(() => mockGameObject());
      expect(callTaskBinding("zat_b29_adv_descr")).toBe("zat_b29_simple_bring_text_1");

      disableInfoPortion("zat_b29_rivals_search");
      disableInfoPortion("zat_b29_exclusive_conditions");

      // Clear.

      disableInfoPortion(`zat_b29_bring_af_${it}`);
      expect(callTaskBinding("zat_b29_adv_descr")).toBeNull();
    }
  });
});
