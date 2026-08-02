import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyCallablesModule, getExtern } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";

import { infoPortions } from "@/engine/constants/info_portions";
import { questItems } from "@/engine/constants/items/quest_items";
import { zoneNames } from "@/engine/constants/zone_names";
import { registerZone, registry } from "@/engine/core/database";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { giveItemsToActor } from "@/engine/core/utils/reward";
import { callXrEffect, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/quests/zat_b33_pic_snag_container");
});

jest.mock("@/engine/core/utils/reward");

beforeEach(() => {
  resetRegistry();
});

function mockActorInsideZone(name: string): GameObject {
  const { actorGameObject } = mockRegisteredActor();
  const zone: GameObject = MockGameObject.mock({ name });

  registerZone(zone);
  jest.spyOn(zone, "inside").mockReturnValue(true);

  return actorGameObject;
}

describe("zat_b33_pic_snag_container", () => {
  it("should grant the safe container and notify the actor in the tutor zone", () => {
    const actor: GameObject = mockActorInsideZone(zoneNames.zat_b33_tutor);
    const playSound = jest.fn();

    getExtern<AnyCallablesModule>("xr_effects").play_sound = playSound;

    callXrEffect("zat_b33_pic_snag_container", actor, MockGameObject.mock());

    expect(giveItemsToActor).toHaveBeenCalledWith(questItems.zat_b33_safe_container);
    expect(hasInfoPortion(infoPortions.zat_b33_find_package)).toBe(true);
    expect(playSound).toHaveBeenCalledWith(actor, registry.zones.get(zoneNames.zat_b33_tutor), [
      "pda_news",
      null,
      null,
    ]);
  });
});
