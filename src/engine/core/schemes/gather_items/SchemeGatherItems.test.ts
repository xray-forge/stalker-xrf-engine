import { describe, expect, it } from "@jest/globals";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { EvaluatorGatherItems } from "@/engine/core/schemes/gather_items/evaluators";
import { ISchemeGatherItemsState } from "@/engine/core/schemes/gather_items/ISchemeGatherItemsState";
import { SchemeGatherItems } from "@/engine/core/schemes/gather_items/SchemeGatherItems";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { ActionPlanner, ClientObject, EScheme, IniFile } from "@/engine/lib/types";
import { mockClientGameObject, mockIniFile } from "@/fixtures/xray";
import { mockStalkerIds } from "@/fixtures/xray/mocks/constants";

describe("SchemeGatherItems class", () => {
  it("should correctly activate schemes", () => {
    const object: ClientObject = mockClientGameObject();
    const state: IRegistryObjectState = registerObject(object);
    const ini: IniFile = mockIniFile("test.ltx", {
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
      npc: object,
      scheme: EScheme.GATHER_ITEMS,
      section: "gather_items_default@test",
    });
  });

  it("should correctly add schemes and replace evaluator", () => {
    const object: ClientObject = mockClientGameObject();
    const state: IRegistryObjectState = registerObject(object);
    const ini: IniFile = mockIniFile("test.ltx", {});

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
    const object: ClientObject = mockClientGameObject();
    const state: IRegistryObjectState = registerObject(object);
    const ini: IniFile = mockIniFile("test.ltx", {
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
      npc: object,
      scheme: EScheme.GATHER_ITEMS,
      section: "gather_items_default@test",
      canLootItems: true,
    });

    SchemeGatherItems.reset(object, EScheme.GATHER_ITEMS, state, "gather_items_true@test");
    expect(state[EScheme.GATHER_ITEMS]).toEqual({
      ini,
      npc: object,
      scheme: EScheme.GATHER_ITEMS,
      section: "gather_items_default@test",
      canLootItems: true,
    });

    SchemeGatherItems.reset(object, EScheme.GATHER_ITEMS, state, "gather_items_false@test");
    expect(state[EScheme.GATHER_ITEMS]).toEqual({
      ini,
      npc: object,
      scheme: EScheme.GATHER_ITEMS,
      section: "gather_items_default@test",
      canLootItems: false,
    });
  });
});
