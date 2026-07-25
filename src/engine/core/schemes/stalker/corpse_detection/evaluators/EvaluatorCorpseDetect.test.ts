import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockPropertyStorage, MockVector } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { communities } from "@/engine/constants/communities";
import { ACTOR_VISUAL_STALKER } from "@/engine/constants/sections";
import { getPortableStoreValue, registerObject } from "@/engine/core/database";
import {
  ISchemeCorpseDetectionState,
  PS_LOOTING_DEAD_OBJECT,
} from "@/engine/core/schemes/stalker/corpse_detection/corpse_detection_types";
import { EvaluatorCorpseDetect } from "@/engine/core/schemes/stalker/corpse_detection/evaluators/EvaluatorCorpseDetect";
import { freeSelectedLootedObjectSpot } from "@/engine/core/schemes/stalker/corpse_detection/utils";
import { EScheme } from "@/engine/core/schemes/types";
import { getNearestCorpseToLoot } from "@/engine/core/utils/loot";
import { isObjectWounded } from "@/engine/core/utils/planner";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/utils/loot", () => ({ getNearestCorpseToLoot: jest.fn() }));
jest.mock("@/engine/core/utils/planner", () => ({ isObjectWounded: jest.fn(() => false) }));
jest.mock("@/engine/core/schemes/stalker/corpse_detection/utils", () => ({
  freeSelectedLootedObjectSpot: jest.fn(),
}));

function createEvaluator(base: Partial<ISchemeCorpseDetectionState> = {}): {
  evaluator: EvaluatorCorpseDetect;
  object: GameObject;
  state: ISchemeCorpseDetectionState;
} {
  const object: GameObject = MockGameObject.mock({ community: communities.stalker });
  const state: ISchemeCorpseDetectionState = mockSchemeState<ISchemeCorpseDetectionState>(EScheme.CORPSE_DETECTION, {
    isCorpseDetectionEnabled: true,
    selectedCorpseId: null,
    ...base,
  });
  const evaluator: EvaluatorCorpseDetect = new EvaluatorCorpseDetect(state);

  registerObject(object);
  evaluator.setup(object, MockPropertyStorage.mock());

  return { evaluator, object, state };
}

/**
 * Report a lootable corpse from the nearest-corpse lookup.
 */
function withCorpse(corpse: GameObject, vertexId: number = 700): void {
  registerObject(corpse);
  replaceFunctionMock(getNearestCorpseToLoot, () => $multi(corpse, vertexId, MockVector.create(1, 2, 3)));
}

describe("EvaluatorCorpseDetect", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(getNearestCorpseToLoot);
    resetFunctionMock(isObjectWounded);
    resetFunctionMock(freeSelectedLootedObjectSpot);
    replaceFunctionMock(isObjectWounded, () => false);
    replaceFunctionMock(getNearestCorpseToLoot, () => $multi(null, null, null));
  });

  it("should not detect corpse for dead object", () => {
    const { evaluator, object } = createEvaluator();

    withCorpse(MockGameObject.mock());
    jest.spyOn(object, "alive").mockImplementation(() => false);

    expect(evaluator.evaluate()).toBe(false);
  });

  it("should not detect corpse while in combat", () => {
    const { evaluator, object } = createEvaluator();

    withCorpse(MockGameObject.mock());
    jest.spyOn(object, "best_enemy").mockImplementation(() => MockGameObject.mock());

    expect(evaluator.evaluate()).toBe(false);
  });

  it("should not detect corpse when detection is disabled", () => {
    const { evaluator } = createEvaluator({ isCorpseDetectionEnabled: false });

    withCorpse(MockGameObject.mock());

    expect(evaluator.evaluate()).toBe(false);
  });

  it("should not detect corpse for zombied object", () => {
    const { evaluator, object } = createEvaluator();

    withCorpse(MockGameObject.mock());
    jest.spyOn(object, "character_community").mockImplementation(() => communities.zombied);

    expect(evaluator.evaluate()).toBe(false);
  });

  it("should not detect corpse for wounded object", () => {
    const { evaluator } = createEvaluator();

    withCorpse(MockGameObject.mock());
    replaceFunctionMock(isObjectWounded, () => true);

    expect(evaluator.evaluate()).toBe(false);
  });

  it("should not detect corpse for cutscene actor visual", () => {
    const { evaluator, object } = createEvaluator();

    withCorpse(MockGameObject.mock());
    jest.spyOn(object, "section").mockImplementation(() => ACTOR_VISUAL_STALKER);

    expect(evaluator.evaluate()).toBe(false);
  });

  it("should not detect corpse when nothing is nearby", () => {
    const { evaluator, state } = createEvaluator();

    expect(evaluator.evaluate()).toBe(false);
    expect(state.selectedCorpseId).toBeNull();
  });

  it("should select nearby corpse for looting", () => {
    const { evaluator, object, state } = createEvaluator();
    const corpse: GameObject = MockGameObject.mock();

    withCorpse(corpse, 750);

    expect(evaluator.evaluate()).toBe(true);
    expect(state.selectedCorpseId).toBe(corpse.id());
    expect(state.selectedCorpseVertexId).toBe(750);
    expect(state.selectedCorpseVertexPosition).toEqual(MockVector.create(1, 2, 3));
    expect(getPortableStoreValue(corpse.id(), PS_LOOTING_DEAD_OBJECT)).toBe(object.id());
    expect(freeSelectedLootedObjectSpot).not.toHaveBeenCalled();
  });

  it("should release previously selected corpse when switching target", () => {
    const { evaluator, state } = createEvaluator({ selectedCorpseId: 111 });
    const corpse: GameObject = MockGameObject.mock();

    withCorpse(corpse);

    expect(evaluator.evaluate()).toBe(true);
    expect(freeSelectedLootedObjectSpot).toHaveBeenCalledWith(111);
    expect(state.selectedCorpseId).toBe(corpse.id());
  });

  it("should keep the same corpse selected without releasing it", () => {
    const corpse: GameObject = MockGameObject.mock();
    const { evaluator } = createEvaluator({ selectedCorpseId: corpse.id() });

    withCorpse(corpse);

    expect(evaluator.evaluate()).toBe(true);
    expect(freeSelectedLootedObjectSpot).not.toHaveBeenCalled();
  });
});
