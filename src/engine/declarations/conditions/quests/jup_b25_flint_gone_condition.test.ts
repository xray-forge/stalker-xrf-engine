import { beforeAll, describe, expect, it } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { infoPortions } from "@/engine/constants/info_portions";
import { disableInfoPortion, giveInfoPortion } from "@/engine/core/utils/info_portion";
import { callXrCondition, mockRegisteredActor } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/quests/jup_b25_flint_gone_condition");
});

describe("jup_b25_flint_gone_condition", () => {
  it("should check flint gone condition", () => {
    mockRegisteredActor();

    expect(callXrCondition("jup_b25_flint_gone_condition", MockGameObject.mockActor(), MockGameObject.mock())).toBe(
      false
    );

    giveInfoPortion(infoPortions.jup_b25_flint_blame_done_to_duty);
    expect(callXrCondition("jup_b25_flint_gone_condition", MockGameObject.mockActor(), MockGameObject.mock())).toBe(
      true
    );

    disableInfoPortion(infoPortions.jup_b25_flint_blame_done_to_duty);
    giveInfoPortion(infoPortions.jup_b25_flint_blame_done_to_freedom);
    expect(callXrCondition("jup_b25_flint_gone_condition", MockGameObject.mockActor(), MockGameObject.mock())).toBe(
      true
    );

    disableInfoPortion(infoPortions.jup_b25_flint_blame_done_to_freedom);
    giveInfoPortion(infoPortions.zat_b106_found_soroka_done);
    expect(callXrCondition("jup_b25_flint_gone_condition", MockGameObject.mockActor(), MockGameObject.mock())).toBe(
      true
    );

    disableInfoPortion(infoPortions.zat_b106_found_soroka_done);
    expect(callXrCondition("jup_b25_flint_gone_condition", MockGameObject.mockActor(), MockGameObject.mock())).toBe(
      false
    );
  });
});
