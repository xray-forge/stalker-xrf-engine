import { beforeAll, describe, expect, it } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { infoPortions } from "@/engine/constants/info_portions";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { callXrCondition, mockRegisteredActor } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/quests/jup_b25_senya_spawn_condition");
});

describe("jup_b25_senya_spawn_condition", () => {
  it("should require quest progress and the Soroka search", () => {
    mockRegisteredActor();

    expect(callXrCondition("jup_b25_senya_spawn_condition", MockGameObject.mockActor(), MockGameObject.mock())).toBe(
      false
    );

    giveInfoPortion(infoPortions.jup_b16_oasis_found);
    expect(callXrCondition("jup_b25_senya_spawn_condition", MockGameObject.mockActor(), MockGameObject.mock())).toBe(
      false
    );

    giveInfoPortion(infoPortions.zat_b106_search_soroka);
    expect(callXrCondition("jup_b25_senya_spawn_condition", MockGameObject.mockActor(), MockGameObject.mock())).toBe(
      true
    );
  });
});
