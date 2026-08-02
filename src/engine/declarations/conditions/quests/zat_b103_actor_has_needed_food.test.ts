import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyCallablesModule, getExtern } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";

import { infoPortions } from "@/engine/constants/info_portions";
import { disableInfoPortion, giveInfoPortion } from "@/engine/core/utils/info_portion";
import { callXrCondition, mockRegisteredActor } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/dialogs/dialogs_zaton");
  require("@/engine/declarations/conditions/quests/zat_b103_actor_has_needed_food");
});

describe("zat_b103_actor_has_needed_food", () => {
  it("should accept delegated inventory checks and completed tasks", () => {
    const { actorGameObject: actor } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mock();
    const hasNeededFood = jest.fn<() => boolean>().mockReturnValue(false);

    getExtern<AnyCallablesModule>("dialogs_zaton").zat_b103_actor_has_needed_food = hasNeededFood;

    expect(callXrCondition("zat_b103_actor_has_needed_food", actor, object)).toBe(false);
    expect(hasNeededFood).toHaveBeenCalledWith(actor, object);

    giveInfoPortion(infoPortions.zat_b103_merc_task_done);
    expect(callXrCondition("zat_b103_actor_has_needed_food", actor, object)).toBe(true);

    hasNeededFood.mockReturnValue(true);
    disableInfoPortion(infoPortions.zat_b103_merc_task_done);
    expect(callXrCondition("zat_b103_actor_has_needed_food", actor, object)).toBe(true);
  });
});
