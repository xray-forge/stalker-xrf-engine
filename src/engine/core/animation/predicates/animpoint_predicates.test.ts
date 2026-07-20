import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { TPath } from "xray16/lib";
import { MockAlifeSimulator, MockGameObject } from "xray16/mocks";

import { food } from "@/engine/constants/items/food";
import { misc } from "@/engine/constants/items/misc";
import { animpoint_predicates } from "@/engine/core/animation/predicates/animpoint_predicates";
import { EStalkerState } from "@/engine/core/animation/types";
import { registry } from "@/engine/core/database";
import { IAnimpointActionDescriptor } from "@/engine/core/schemes/stalker/animpoint/animpoint_types";
import { resetRegistry } from "@/fixtures/engine";

const EATABLE_VISUAL: TPath = "actors\\stalker_hero\\stalker_hero_1";
const HARMONICA_VISUAL: TPath = "actors\\stalker_bandit\\stalker_bandit_1";

function getPredicate(state: EStalkerState, index: number): IAnimpointActionDescriptor["predicate"] {
  return animpoint_predicates.get(state)!.get(index)!.predicate;
}

function createObject(visual: TPath = EATABLE_VISUAL): GameObject {
  const object: GameObject = MockGameObject.mock();

  jest.spyOn(object, "get_visual_name").mockReturnValue(visual);

  return object;
}

describe("animpoint predicates", () => {
  beforeEach(() => {
    resetRegistry();
    registry.simulator = MockAlifeSimulator.getInstance();
  });

  describe("always", () => {
    it("allows the base animpoint action", () => {
      expect(getPredicate(EStalkerState.ANIMPOINT_STAY_WALL, 1)(createObject())).toBe(true);
    });
  });

  describe("bread", () => {
    it("requires a compatible visual and a bread item", () => {
      const object: GameObject = createObject();

      jest.spyOn(object, "object").mockReturnValue(MockGameObject.mock());

      expect(getPredicate(EStalkerState.ANIMPOINT_STAY_WALL, 2)(object)).toBe(true);
      expect(object.object).toHaveBeenCalledWith(food.bread);
    });
  });

  describe("kolbasa", () => {
    it("requires a compatible visual and a kolbasa item", () => {
      const object: GameObject = createObject();

      jest.spyOn(object, "object").mockReturnValue(MockGameObject.mock());

      expect(getPredicate(EStalkerState.ANIMPOINT_STAY_WALL, 3)(object)).toBe(true);
      expect(object.object).toHaveBeenCalledWith(food.kolbasa);
    });
  });

  describe("vodka", () => {
    it("requires a compatible visual and a vodka item", () => {
      const object: GameObject = createObject();

      jest.spyOn(object, "object").mockReturnValue(MockGameObject.mock());

      expect(getPredicate(EStalkerState.ANIMPOINT_STAY_WALL, 4)(object)).toBe(true);
      expect(object.object).toHaveBeenCalledWith(food.vodka);
    });
  });

  describe("energy", () => {
    it("requires a compatible visual and an energy drink", () => {
      const object: GameObject = createObject();

      jest.spyOn(object, "object").mockReturnValue(MockGameObject.mock());

      expect(getPredicate(EStalkerState.ANIMPOINT_STAY_WALL, 5)(object)).toBe(true);
      expect(object.object).toHaveBeenCalledWith(food.energy_drink);
    });
  });

  describe("guitar", () => {
    it("requires both camp membership and a guitar", () => {
      const object: GameObject = createObject();

      jest.spyOn(object, "object").mockReturnValue(MockGameObject.mock());

      expect(getPredicate(EStalkerState.ANIMPOINT_SIT_NORMAL, 6)(object, false)).toBe(false);
      expect(getPredicate(EStalkerState.ANIMPOINT_SIT_NORMAL, 6)(object, true)).toBe(true);
      expect(object.object).toHaveBeenCalledWith(misc.guitar_a);
    });
  });

  describe("harmonica", () => {
    it("requires both camp membership, a compatible visual, and a harmonica", () => {
      const object: GameObject = createObject(HARMONICA_VISUAL);

      jest.spyOn(object, "object").mockReturnValue(MockGameObject.mock());

      expect(getPredicate(EStalkerState.ANIMPOINT_SIT_LOW, 7)(object, false)).toBe(false);
      expect(getPredicate(EStalkerState.ANIMPOINT_SIT_LOW, 7)(object, true)).toBe(true);
      expect(object.object).toHaveBeenCalledWith(misc.harmonica_a);
    });
  });

  describe("weapon", () => {
    it("allows weapon animations outside no-combat smart terrains", () => {
      expect(getPredicate(EStalkerState.ANIMPOINT_STAY_WALL, 6)(createObject())).toBe(true);
    });
  });
});
