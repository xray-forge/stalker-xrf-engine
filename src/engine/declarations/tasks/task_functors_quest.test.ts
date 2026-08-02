import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { AnyArgs, AnyObject, TName } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";

import { registerStoryLink } from "@/engine/core/database";
import { disableInfoPortion, giveInfoPortion } from "@/engine/core/utils/info_portion";
import { callBinding, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

function callTaskBinding(name: TName, args: AnyArgs = []): unknown {
  return callBinding(name, args, (_G as AnyObject).task_functors);
}

beforeAll(() => {
  require("@/engine/declarations/tasks/task_functors_quest");
});

beforeEach(() => {
  resetRegistry();
});

describe("zat_b29_adv_title", () => {
  it("should correctly return title", () => {
    const { actorGameObject } = mockRegisteredActor();

    expect(callTaskBinding("zat_b29_adv_title")).toBeNull();

    for (const it of $range(16, 23)) {
      giveInfoPortion(`zat_b29_bring_af_${it}`);

      jest.spyOn(actorGameObject, "object").mockImplementation(() => null);
      expect(callTaskBinding("zat_b29_adv_title")).toBe(`zat_b29_simple_find_title_${it}`);

      jest.spyOn(actorGameObject, "object").mockImplementation(() => MockGameObject.mock());
      expect(callTaskBinding("zat_b29_adv_title")).toBe(`zat_b29_simple_bring_title_${it}`);

      disableInfoPortion(`zat_b29_bring_af_${it}`);
      expect(callTaskBinding("zat_b29_adv_title")).toBeNull();
    }
  });
});

describe("zat_b29_adv_descr", () => {
  it("should correctly return description", () => {
    const { actorGameObject } = mockRegisteredActor();

    expect(callTaskBinding("zat_b29_adv_descr")).toBeNull();

    for (const it of $range(16, 23)) {
      giveInfoPortion(`zat_b29_bring_af_${it}`);

      jest.spyOn(actorGameObject, "object").mockImplementation(() => null);
      expect(callTaskBinding("zat_b29_adv_descr")).toBe("zat_b29_simple_find_text_5");

      jest.spyOn(actorGameObject, "object").mockImplementation(() => MockGameObject.mock());
      expect(callTaskBinding("zat_b29_adv_descr")).toBe("zat_b29_simple_bring_text_5");

      // First rival checks.

      giveInfoPortion("zat_b29_stalker_rival_1_found_af");
      giveInfoPortion("zat_b29_first_rival_taken_out");

      jest.spyOn(actorGameObject, "object").mockImplementation(() => null);
      expect(callTaskBinding("zat_b29_adv_descr")).toBe("zat_b29_simple_find_text_5");

      jest.spyOn(actorGameObject, "object").mockImplementation(() => MockGameObject.mock());
      expect(callTaskBinding("zat_b29_adv_descr")).toBe("zat_b29_simple_bring_text_5");

      disableInfoPortion("zat_b29_stalker_rival_1_found_af");
      disableInfoPortion("zat_b29_first_rival_taken_out");

      // Second rival checks.

      giveInfoPortion("zat_b29_stalker_rival_2_found_af");
      giveInfoPortion("zat_b29_second_rival_taken_out");

      jest.spyOn(actorGameObject, "object").mockImplementation(() => null);
      expect(callTaskBinding("zat_b29_adv_descr")).toBe("zat_b29_simple_find_text_5");

      jest.spyOn(actorGameObject, "object").mockImplementation(() => MockGameObject.mock());
      expect(callTaskBinding("zat_b29_adv_descr")).toBe("zat_b29_simple_bring_text_5");

      disableInfoPortion("zat_b29_stalker_rival_2_found_af");
      disableInfoPortion("zat_b29_second_rival_taken_out");

      // Take artefact from rival.

      giveInfoPortion("zat_b29_linker_take_af_from_rival");

      jest.spyOn(actorGameObject, "object").mockImplementation(() => null);
      expect(callTaskBinding("zat_b29_adv_descr")).toBe("zat_b29_simple_find_text_4");

      jest.spyOn(actorGameObject, "object").mockImplementation(() => MockGameObject.mock());
      expect(callTaskBinding("zat_b29_adv_descr")).toBe("zat_b29_simple_bring_text_4");

      disableInfoPortion("zat_b29_linker_take_af_from_rival");

      // Rivals found.

      giveInfoPortion("zat_b29_stalkers_rivals_found_af");

      jest.spyOn(actorGameObject, "object").mockImplementation(() => null);
      expect(callTaskBinding("zat_b29_adv_descr")).toBe("zat_b29_simple_find_text_3");

      jest.spyOn(actorGameObject, "object").mockImplementation(() => MockGameObject.mock());
      expect(callTaskBinding("zat_b29_adv_descr")).toBe("zat_b29_simple_bring_text_3");

      disableInfoPortion("zat_b29_stalkers_rivals_found_af");

      // Rivals search without exclusive conditions.

      giveInfoPortion("zat_b29_rivals_search");

      jest.spyOn(actorGameObject, "object").mockImplementation(() => null);
      expect(callTaskBinding("zat_b29_adv_descr")).toBe("zat_b29_simple_find_text_2");

      jest.spyOn(actorGameObject, "object").mockImplementation(() => MockGameObject.mock());
      expect(callTaskBinding("zat_b29_adv_descr")).toBe("zat_b29_simple_bring_text_2");

      // Rivals search on exclusive conditions.

      giveInfoPortion("zat_b29_exclusive_conditions");

      jest.spyOn(actorGameObject, "object").mockImplementation(() => null);
      expect(callTaskBinding("zat_b29_adv_descr")).toBe("zat_b29_simple_find_text_1");

      jest.spyOn(actorGameObject, "object").mockImplementation(() => MockGameObject.mock());
      expect(callTaskBinding("zat_b29_adv_descr")).toBe("zat_b29_simple_bring_text_1");

      disableInfoPortion("zat_b29_rivals_search");
      disableInfoPortion("zat_b29_exclusive_conditions");

      // Clear.

      disableInfoPortion(`zat_b29_bring_af_${it}`);
      expect(callTaskBinding("zat_b29_adv_descr")).toBeNull();
    }
  });
});

describe("zat_b29_adv_target", () => {
  it("should have no target when the actor carries none of the requested artefacts", () => {
    const { actorGameObject } = mockRegisteredActor();

    registerStoryLink(500, "zat_a2_stalker_barmen");

    expect(callTaskBinding("zat_b29_adv_target")).toBeNull();

    // Requested artefact info portion alone is not enough, it has to be in the inventory.
    giveInfoPortion("zat_b29_bring_af_16");
    jest.spyOn(actorGameObject, "object").mockImplementation(() => null);

    expect(callTaskBinding("zat_b29_adv_target")).toBeNull();
  });

  it("should target the barmen once one of the requested artefacts is carried", () => {
    const { actorGameObject } = mockRegisteredActor();

    registerStoryLink(500, "zat_a2_stalker_barmen");
    giveInfoPortion("zat_b29_bring_af_16");
    jest.spyOn(actorGameObject, "object").mockImplementation(() => MockGameObject.mock());

    expect(callTaskBinding("zat_b29_adv_target")).toBe(500);
  });

  it("should target the first rival while it is not taken out", () => {
    mockRegisteredActor();

    registerStoryLink(500, "zat_a2_stalker_barmen");
    registerStoryLink(501, "zat_b29_stalker_rival_1");
    registerStoryLink(502, "zat_b29_stalker_rival_default_1");

    giveInfoPortion("zat_b29_stalkers_rivals_found_af");
    giveInfoPortion("zat_b29_stalker_rival_1_found_af");

    expect(callTaskBinding("zat_b29_adv_target")).toBe(502);

    giveInfoPortion("zat_b29_exclusive_conditions");

    expect(callTaskBinding("zat_b29_adv_target")).toBe(501);
  });

  it("should target the second rival while it is not taken out", () => {
    mockRegisteredActor();

    registerStoryLink(500, "zat_a2_stalker_barmen");
    registerStoryLink(503, "zat_b29_stalker_rival_2");
    registerStoryLink(504, "zat_b29_stalker_rival_default_2");

    giveInfoPortion("zat_b29_stalkers_rivals_found_af");
    giveInfoPortion("zat_b29_stalker_rival_2_found_af");

    expect(callTaskBinding("zat_b29_adv_target")).toBe(504);

    giveInfoPortion("zat_b29_exclusive_conditions");

    expect(callTaskBinding("zat_b29_adv_target")).toBe(503);
  });

  it("should keep targeting a taken out rival while the requested artefact is missing", () => {
    const { actorGameObject } = mockRegisteredActor();

    registerStoryLink(500, "zat_a2_stalker_barmen");
    registerStoryLink(502, "zat_b29_stalker_rival_default_1");

    giveInfoPortion("zat_b29_stalkers_rivals_found_af");
    giveInfoPortion("zat_b29_stalker_rival_1_found_af");
    giveInfoPortion("zat_b29_first_rival_taken_out");

    expect(callTaskBinding("zat_b29_adv_target")).toBe(502);

    // Once the artefact is looted the rival is no longer the target, the barmen is.
    giveInfoPortion("zat_b29_bring_af_16");
    jest.spyOn(actorGameObject, "object").mockImplementation(() => MockGameObject.mock());

    expect(callTaskBinding("zat_b29_adv_target")).toBe(500);
  });

  it("should target the barmen once the artefact is taken from a rival", () => {
    const { actorGameObject } = mockRegisteredActor();

    registerStoryLink(500, "zat_a2_stalker_barmen");
    registerStoryLink(502, "zat_b29_stalker_rival_default_1");

    giveInfoPortion("zat_b29_stalkers_rivals_found_af");
    giveInfoPortion("zat_b29_stalker_rival_1_found_af");
    giveInfoPortion("zat_b29_linker_take_af_from_rival");
    giveInfoPortion("zat_b29_bring_af_16");
    jest.spyOn(actorGameObject, "object").mockImplementation(() => MockGameObject.mock());

    expect(callTaskBinding("zat_b29_adv_target")).toBe(500);
  });
});
