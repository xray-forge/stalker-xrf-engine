import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { infoPortions } from "@/engine/constants/info_portions";
import { questItems } from "@/engine/constants/items/quest_items";
import { registerZone } from "@/engine/core/database";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { giveItemsToActor } from "@/engine/core/utils/reward";
import { callXrEffect, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/quests/jup_b10_ufo_searching");
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

describe("jup_b10_ufo_searching", () => {
  it("should start the memory quest and grant its item in the restrictor", () => {
    const actor: GameObject = mockActorInsideZone("jup_b10_ufo_restrictor");

    callXrEffect("jup_b10_ufo_searching", actor, MockGameObject.mock());

    expect(hasInfoPortion(infoPortions.jup_b10_ufo_memory_started)).toBe(true);
    expect(giveItemsToActor).toHaveBeenCalledWith(questItems.jup_b10_ufo_memory);
  });
});
