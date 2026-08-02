import { beforeAll, describe, expect, it } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { infoPortions } from "@/engine/constants/info_portions";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { callXrCondition, mockRegisteredActor } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/quests/jup_b202_actor_treasure_not_in_steal");
});

describe("jup_b202_actor_treasure_not_in_steal", () => {
  it("should check treasure state", () => {
    mockRegisteredActor();

    expect(
      callXrCondition("jup_b202_actor_treasure_not_in_steal", MockGameObject.mockActor(), MockGameObject.mock())
    ).toBe(true);

    giveInfoPortion(infoPortions.jup_b52_actor_items_can_be_stolen);

    expect(
      callXrCondition("jup_b202_actor_treasure_not_in_steal", MockGameObject.mockActor(), MockGameObject.mock())
    ).toBe(false);

    giveInfoPortion(infoPortions.jup_b202_actor_items_returned);

    expect(
      callXrCondition("jup_b202_actor_treasure_not_in_steal", MockGameObject.mockActor(), MockGameObject.mock())
    ).toBe(true);
  });
});
