import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { infoPortions } from "@/engine/constants/info_portions";
import { questItems } from "@/engine/constants/items/quest_items";
import { registerZone } from "@/engine/core/database";
import { createGameAutoSave } from "@/engine/core/utils/game_save";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { takeItemFromActor } from "@/engine/core/utils/reward";
import { spawnObject } from "@/engine/core/utils/spawn";
import { callXrEffect, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/quests/jup_b209_place_scanner");
});

jest.mock("@/engine/core/utils/reward");

jest.mock("@/engine/core/utils/spawn");

jest.mock("@/engine/core/utils/game_save");

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

describe("jup_b209_place_scanner", () => {
  it("should save, place, and consume the scanner in the hypotheses zone", () => {
    const actor: GameObject = mockActorInsideZone("jup_b209_hypotheses");

    callXrEffect("jup_b209_place_scanner", actor, MockGameObject.mock());

    expect(createGameAutoSave).toHaveBeenCalledWith("st_save_jup_b209_placed_mutant_scanner");
    expect(hasInfoPortion(infoPortions.jup_b209_scanner_placed)).toBe(true);
    expect(takeItemFromActor).toHaveBeenCalledWith(questItems.jup_b209_monster_scanner);
    expect(spawnObject).toHaveBeenCalledWith("jup_b209_ph_scanner", "jup_b209_scanner_place_point");
  });
});
