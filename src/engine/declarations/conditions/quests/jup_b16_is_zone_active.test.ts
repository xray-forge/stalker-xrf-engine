import { beforeAll, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { callXrCondition, mockRegisteredActor } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/quests/jup_b16_is_zone_active");
});

describe("jup_b16_is_zone_active", () => {
  it("should check zone", () => {
    expect(callXrCondition("jup_b16_is_zone_active", MockGameObject.mockActor(), MockGameObject.mock())).toBe(false);

    const zone: GameObject = MockGameObject.mock();
    const { actorGameObject } = mockRegisteredActor();

    expect(callXrCondition("jup_b16_is_zone_active", actorGameObject, zone)).toBe(false);

    giveInfoPortion(zone.name());
    expect(callXrCondition("jup_b16_is_zone_active", actorGameObject, zone)).toBe(true);
  });
});
