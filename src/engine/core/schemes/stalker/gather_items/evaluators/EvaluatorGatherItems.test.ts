import { describe, expect, it, jest } from "@jest/globals";

import { ISchemeGatherItemsState } from "@/engine/core/schemes/stalker/gather_items";
import { EvaluatorGatherItems } from "@/engine/core/schemes/stalker/gather_items/evaluators/EvaluatorGatherItems";
import { EScheme, GameObject } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine";
import { MockGameObject, MockPropertyStorage } from "@/fixtures/xray";

describe("EvaluatorGatherItems class", () => {
  it("should correctly evaluate state for default state", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeGatherItemsState = mockSchemeState(EScheme.GATHER_ITEMS);
    const evaluator: EvaluatorGatherItems = new EvaluatorGatherItems(state);

    evaluator.setup(object, MockPropertyStorage.mock());
    expect(evaluator.state).toBe(state);

    jest.spyOn(object, "is_there_items_to_pickup").mockImplementation(() => true);
    expect(evaluator.evaluate()).toBe(false);

    jest.spyOn(object, "is_there_items_to_pickup").mockImplementation(() => false);
    expect(evaluator.evaluate()).toBe(false);
  });

  it("should correctly evaluate state for lootable state", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeGatherItemsState = mockSchemeState<ISchemeGatherItemsState>(EScheme.GATHER_ITEMS, {
      canLootItems: true,
    });
    const evaluator: EvaluatorGatherItems = new EvaluatorGatherItems(state);

    evaluator.setup(object, MockPropertyStorage.mock());

    jest.spyOn(object, "is_there_items_to_pickup").mockImplementation(() => true);
    expect(evaluator.evaluate()).toBe(true);

    jest.spyOn(object, "is_there_items_to_pickup").mockImplementation(() => false);
    expect(evaluator.evaluate()).toBe(false);
  });

  it("should correctly evaluate state for not lootable state", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeGatherItemsState = mockSchemeState<ISchemeGatherItemsState>(EScheme.GATHER_ITEMS, {
      canLootItems: false,
    });
    const evaluator: EvaluatorGatherItems = new EvaluatorGatherItems(state);

    evaluator.setup(object, MockPropertyStorage.mock());

    jest.spyOn(object, "is_there_items_to_pickup").mockImplementation(() => true);
    expect(evaluator.evaluate()).toBe(false);

    jest.spyOn(object, "is_there_items_to_pickup").mockImplementation(() => false);
    expect(evaluator.evaluate()).toBe(false);
  });
});
