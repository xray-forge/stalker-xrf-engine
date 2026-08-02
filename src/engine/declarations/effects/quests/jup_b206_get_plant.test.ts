import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyCallablesModule, getExtern } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";

import { infoPortions } from "@/engine/constants/info_portions";
import { questItems } from "@/engine/constants/items/quest_items";
import { registerZone } from "@/engine/core/database";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { giveItemsToActor } from "@/engine/core/utils/reward";
import { callXrEffect, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/quests/jup_b206_get_plant");
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

describe("jup_b206_get_plant", () => {
  it("should grant the plant and destroy its world object in the quest zone", () => {
    const actor: GameObject = mockActorInsideZone("jup_b206_sr_quest_line");
    const object: GameObject = MockGameObject.mock();
    const destroyObject = jest.fn();

    getExtern<AnyCallablesModule>("xr_effects").destroy_object = destroyObject;

    callXrEffect("jup_b206_get_plant", actor, object);

    expect(hasInfoPortion(infoPortions.jup_b206_anomalous_grove_has_plant)).toBe(true);
    expect(giveItemsToActor).toHaveBeenCalledWith(questItems.jup_b206_plant);
    expect(destroyObject).toHaveBeenCalledWith(actor, object, ["story", "jup_b206_plant_ph", null]);
  });
});
