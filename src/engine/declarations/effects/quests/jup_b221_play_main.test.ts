import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { ACTOR_ID, AnyCallablesModule, getExtern } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";

import { infoPortions } from "@/engine/constants/info_portions";
import { getPortableStoreValue } from "@/engine/core/database/portable_store";
import { giveInfoPortion, hasInfoPortion } from "@/engine/core/utils/info_portion";
import { callXrEffect, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/quests/jup_b221_play_main");
});

beforeEach(() => {
  resetRegistry();
});

describe("jup_b221_play_main", () => {
  it("should play the first eligible faction theme and record it", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mock();
    const playSound = jest.fn();

    getExtern<AnyCallablesModule>("xr_effects").play_sound = playSound;
    giveInfoPortion(infoPortions.jup_b25_freedom_flint_gone);

    callXrEffect("jup_b221_play_main", actorGameObject, object, "duty");

    expect(playSound).toHaveBeenCalledWith(actorGameObject, object, ["jup_b221_duty_main_1", null, null]);
    expect(hasInfoPortion("jup_b221_duty_main_1_played")).toBe(true);
    expect(getPortableStoreValue(ACTOR_ID, "jup_b221_played_main_theme")).toBe("1");
  });
});
