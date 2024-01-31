import { describe, expect, it } from "@jest/globals";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { EvaluatorGatherItems } from "@/engine/core/schemes/stalker/gather_items/evaluators";
import { ISchemeGatherItemsState } from "@/engine/core/schemes/stalker/gather_items/gather_items_types";
import { SchemeGatherItems } from "@/engine/core/schemes/stalker/gather_items/SchemeGatherItems";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme/scheme_setup";
import { ActionPlanner, EScheme, GameObject, IniFile } from "@/engine/lib/types";
import { MockGameObject, MockIniFile, mockStalkerIds } from "@/fixtures/xray";

describe("SchemeGatherItems", () => {
  it("should correctly activate schemes", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "gather_items_default@test": {},
      "gather_items_true@test": {
        gather_items_enabled: true,
      },
      "gather_items_false@test": {
        gather_items_enabled: false,
      },
    });

    state.ini = ini;

    loadSchemeImplementation(SchemeGatherItems);
    SchemeGatherItems.activate(object, ini, EScheme.GATHER_ITEMS, "gather_items_default@test");

    expect(state[EScheme.GATHER_ITEMS]).toEqual({
      ini,
      scheme: EScheme.GATHER_ITEMS,
      section: "gather_items_default@test",
    });
  });

  it("should correctly add schemes and replace evaluator", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const ini: IniFile = MockIniFile.mock("test.ltx", {});

    loadSchemeImplementation(SchemeGatherItems);

    SchemeGatherItems.activate(object, ini, EScheme.GATHER_ITEMS, "gather_items_default@test");
    SchemeGatherItems.add(
      object,
      ini,
      EScheme.GATHER_ITEMS,
      "gather_items_default@test",
      state[EScheme.GATHER_ITEMS] as ISchemeGatherItemsState
    );

    const actionPlanner: ActionPlanner = object.motivation_action_manager();

    expect(actionPlanner.evaluator(mockStalkerIds.property_items)).toBeDefined();
    expect(actionPlanner.evaluator(mockStalkerIds.property_items)).toBeInstanceOf(EvaluatorGatherItems);
  });

  it("should correctly reset schemes", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "gather_items_default@test": {},
      "gather_items_true@test": {
        gather_items_enabled: true,
      },
      "gather_items_false@test": {
        gather_items_enabled: false,
      },
    });

    state.ini = ini;

    loadSchemeImplementation(SchemeGatherItems);

    SchemeGatherItems.activate(object, ini, EScheme.GATHER_ITEMS, "gather_items_default@test");

    SchemeGatherItems.reset(object, EScheme.GATHER_ITEMS, state, "gather_items_default@test");
    expect(state[EScheme.GATHER_ITEMS]).toEqual({
      ini,
      scheme: EScheme.GATHER_ITEMS,
      section: "gather_items_default@test",
      canLootItems: true,
    });

    SchemeGatherItems.reset(object, EScheme.GATHER_ITEMS, state, "gather_items_true@test");
    expect(state[EScheme.GATHER_ITEMS]).toEqual({
      ini,
      scheme: EScheme.GATHER_ITEMS,
      section: "gather_items_default@test",
      canLootItems: true,
    });

    SchemeGatherItems.reset(object, EScheme.GATHER_ITEMS, state, "gather_items_false@test");
    expect(state[EScheme.GATHER_ITEMS]).toEqual({
      ini,
      scheme: EScheme.GATHER_ITEMS,
      section: "gather_items_default@test",
      canLootItems: false,
    });
  });
});
