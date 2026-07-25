import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockPropertyStorage, MockVector } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { communities } from "@/engine/constants/communities";
import { ACTOR_VISUAL_STALKER } from "@/engine/constants/sections";
import { getPortableStoreValue, registerObject } from "@/engine/core/database";
import { EvaluatorWoundedExist } from "@/engine/core/schemes/stalker/help_wounded/evaluators/EvaluatorWoundedExist";
import { ISchemeHelpWoundedState } from "@/engine/core/schemes/stalker/help_wounded/help_wounded_types";
import { helpWoundedConfig } from "@/engine/core/schemes/stalker/help_wounded/HelpWoundedConfig";
import { freeSelectedWoundedStalkerSpot } from "@/engine/core/schemes/stalker/help_wounded/utils";
import { EScheme } from "@/engine/core/schemes/types";
import { getNearestWoundedToHelp } from "@/engine/core/utils/object";
import { isObjectWounded } from "@/engine/core/utils/planner";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/utils/object", () => ({ getNearestWoundedToHelp: jest.fn() }));
jest.mock("@/engine/core/utils/planner", () => ({ isObjectWounded: jest.fn(() => false) }));
jest.mock("@/engine/core/schemes/stalker/help_wounded/utils", () => ({
  freeSelectedWoundedStalkerSpot: jest.fn(),
}));

function createEvaluator(base: Partial<ISchemeHelpWoundedState> = {}): {
  evaluator: EvaluatorWoundedExist;
  object: GameObject;
  state: ISchemeHelpWoundedState;
} {
  const object: GameObject = MockGameObject.mock({ community: communities.stalker });
  const state: ISchemeHelpWoundedState = mockSchemeState<ISchemeHelpWoundedState>(EScheme.HELP_WOUNDED, {
    isHelpingWoundedEnabled: true,
    selectedWoundedId: null,
    ...base,
  });
  const evaluator: EvaluatorWoundedExist = new EvaluatorWoundedExist(state);

  registerObject(object);
  evaluator.setup(object, MockPropertyStorage.mock());

  return { evaluator, object, state };
}

/**
 * Report a wounded stalker from the nearest-wounded lookup.
 */
function withWounded(wounded: GameObject, vertexId: number = 700): void {
  registerObject(wounded);
  replaceFunctionMock(getNearestWoundedToHelp, () => $multi(wounded, vertexId, MockVector.create(1, 2, 3)));
}

describe("EvaluatorWoundedExist", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(getNearestWoundedToHelp);
    resetFunctionMock(isObjectWounded);
    resetFunctionMock(freeSelectedWoundedStalkerSpot);
    replaceFunctionMock(isObjectWounded, () => false);
    replaceFunctionMock(getNearestWoundedToHelp, () => $multi(null, null, null));
  });

  it("should not help when scheme is disabled", () => {
    const { evaluator } = createEvaluator({ isHelpingWoundedEnabled: false });

    withWounded(MockGameObject.mock());

    expect(evaluator.evaluate()).toBe(false);
  });

  it("should not help when object is dead", () => {
    const { evaluator, object } = createEvaluator();

    withWounded(MockGameObject.mock());
    jest.spyOn(object, "alive").mockImplementation(() => false);

    expect(evaluator.evaluate()).toBe(false);
  });

  it("should not help while in combat", () => {
    const { evaluator, object } = createEvaluator();

    withWounded(MockGameObject.mock());
    jest.spyOn(object, "best_enemy").mockImplementation(() => MockGameObject.mock());

    expect(evaluator.evaluate()).toBe(false);
  });

  it("should not help for zombied object", () => {
    const { evaluator, object } = createEvaluator();

    withWounded(MockGameObject.mock());
    jest.spyOn(object, "character_community").mockImplementation(() => communities.zombied);

    expect(evaluator.evaluate()).toBe(false);
  });

  it("should not help for wounded object", () => {
    const { evaluator } = createEvaluator();

    withWounded(MockGameObject.mock());
    replaceFunctionMock(isObjectWounded, () => true);

    expect(evaluator.evaluate()).toBe(false);
  });

  it("should not help for cutscene actor visual", () => {
    const { evaluator, object } = createEvaluator();

    withWounded(MockGameObject.mock());
    jest.spyOn(object, "section").mockImplementation(() => ACTOR_VISUAL_STALKER);

    expect(evaluator.evaluate()).toBe(false);
  });

  it("should not help when nobody is nearby", () => {
    const { evaluator, state } = createEvaluator();

    expect(evaluator.evaluate()).toBe(false);
    expect(state.selectedWoundedId).toBeNull();
  });

  it("should select nearby wounded stalker", () => {
    const { evaluator, object, state } = createEvaluator();
    const wounded: GameObject = MockGameObject.mock();

    withWounded(wounded, 750);

    expect(evaluator.evaluate()).toBe(true);
    expect(state.selectedWoundedId).toBe(wounded.id());
    expect(state.selectedWoundedVertexId).toBe(750);
    expect(state.selectedWoundedVertexPosition).toEqual(MockVector.create(1, 2, 3));
    expect(getPortableStoreValue(wounded.id(), helpWoundedConfig.HELPING_WOUNDED_OBJECT_KEY)).toBe(object.id());
    expect(freeSelectedWoundedStalkerSpot).not.toHaveBeenCalled();
  });

  it("should release previously selected wounded when switching target", () => {
    const { evaluator, state } = createEvaluator({ selectedWoundedId: 111 });
    const wounded: GameObject = MockGameObject.mock();

    withWounded(wounded);

    expect(evaluator.evaluate()).toBe(true);
    expect(freeSelectedWoundedStalkerSpot).toHaveBeenCalledWith(111);
    expect(state.selectedWoundedId).toBe(wounded.id());
  });

  it("should keep the same wounded selected without releasing it", () => {
    const wounded: GameObject = MockGameObject.mock();
    const { evaluator } = createEvaluator({ selectedWoundedId: wounded.id() });

    withWounded(wounded);

    expect(evaluator.evaluate()).toBe(true);
    expect(freeSelectedWoundedStalkerSpot).not.toHaveBeenCalled();
  });
});
