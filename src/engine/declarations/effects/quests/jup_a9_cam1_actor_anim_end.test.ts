import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { infoPortions } from "@/engine/constants/info_portions";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { callXrEffect, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/quests/jup_a9_cam1_actor_anim_end");
});

beforeEach(() => {
  resetRegistry();
});

describe("jup_a9_cam1_actor_anim_end", () => {
  it("should give info portion", () => {
    mockRegisteredActor();

    callXrEffect("jup_a9_cam1_actor_anim_end", MockGameObject.mockActor(), MockGameObject.mock());
    expect(hasInfoPortion(infoPortions.jup_a9_cam1_actor_anim_end)).toBe(true);
  });
});
