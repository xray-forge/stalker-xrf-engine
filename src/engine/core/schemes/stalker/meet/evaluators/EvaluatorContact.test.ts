import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { FALSE } from "xray16/lib";
import { MockActionPlanner, MockGameObject, MockPropertyEvaluatorConst, MockPropertyStorage } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { EEvaluatorId } from "@/engine/core/ai/planner/types";
import { registerObject, registry } from "@/engine/core/database";
import { EvaluatorContact } from "@/engine/core/schemes/stalker/meet/evaluators/EvaluatorContact";
import { EMeetDistance, ISchemeMeetState } from "@/engine/core/schemes/stalker/meet/meet_types";
import { MeetController } from "@/engine/core/schemes/stalker/meet/MeetController";
import { EScheme } from "@/engine/core/schemes/types";
import { isObjectWounded } from "@/engine/core/utils/planner";
import { mockRegisteredActor, mockSchemeState, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/utils/planner", () => ({ isObjectWounded: jest.fn(() => false) }));

function mockEvaluator(hasEnemy: boolean = false): {
  evaluator: EvaluatorContact;
  object: GameObject;
  state: ISchemeMeetState;
} {
  const object: GameObject = MockGameObject.mock();
  const state: ISchemeMeetState = mockSchemeState<ISchemeMeetState>(EScheme.MEET, { isMeetInitialized: true });
  const planner: MockActionPlanner = new MockActionPlanner();
  const evaluator: EvaluatorContact = new EvaluatorContact(state);

  registerObject(object);

  state.meetController = new MeetController(object, state);
  jest.spyOn(state.meetController, "update").mockImplementation(jest.fn());

  planner.add_evaluator(EEvaluatorId.ENEMY, new MockPropertyEvaluatorConst(hasEnemy).asMock());
  evaluator.actionPlanner = planner.asMock();
  evaluator.setup(object, MockPropertyStorage.mock());

  return { evaluator, object, state };
}

describe("EvaluatorContact", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(isObjectWounded);
    replaceFunctionMock(isObjectWounded, () => false);
    mockRegisteredActor();
  });

  it("should not be ready to contact when meet is not initialized", () => {
    const { evaluator, state } = mockEvaluator();

    state.isMeetInitialized = false;

    expect(evaluator.evaluate()).toBe(false);
    expect(state.meetController.update).not.toHaveBeenCalled();
  });

  it("should not be ready to contact without alive actor", () => {
    const { evaluator, state } = mockEvaluator();

    jest.spyOn(registry.actor, "alive").mockImplementation(() => false);

    expect(evaluator.evaluate()).toBe(false);
    expect(state.meetController.update).not.toHaveBeenCalled();
  });

  it("should not be ready to contact when wounded", () => {
    const { evaluator, state } = mockEvaluator();

    replaceFunctionMock(isObjectWounded, () => true);
    state.meetController.currentDistanceToSpeaker = EMeetDistance.CLOSE;

    expect(evaluator.evaluate()).toBe(false);
    expect(state.meetController.update).toHaveBeenCalledTimes(1);
  });

  it("should not be ready to contact when has best enemy", () => {
    const { evaluator, object, state } = mockEvaluator();

    jest.spyOn(object, "best_enemy").mockImplementation(() => MockGameObject.mock());
    state.meetController.currentDistanceToSpeaker = EMeetDistance.CLOSE;

    expect(evaluator.evaluate()).toBe(false);
  });

  it("should disable talk when enemy evaluator is active", () => {
    const { evaluator, object, state } = mockEvaluator(true);

    state.meetController.currentDistanceToSpeaker = EMeetDistance.CLOSE;

    expect(evaluator.evaluate()).toBe(false);
    expect(state.meetController.use).toBe(FALSE);
    expect(object.disable_talk).toHaveBeenCalledTimes(1);
  });

  it("should be ready to contact based on distance to speaker", () => {
    const { evaluator, state } = mockEvaluator();

    expect(evaluator.evaluate()).toBe(false);

    state.meetController.currentDistanceToSpeaker = EMeetDistance.FAR;
    expect(evaluator.evaluate()).toBe(true);

    state.meetController.currentDistanceToSpeaker = EMeetDistance.CLOSE;
    expect(evaluator.evaluate()).toBe(true);
  });

  it("should lazily resolve action planner from object", () => {
    const { evaluator, object } = mockEvaluator();

    evaluator.actionPlanner = null;
    object
      .motivation_action_manager()
      .add_evaluator(EEvaluatorId.ENEMY, new MockPropertyEvaluatorConst(false).asMock());

    evaluator.evaluate();

    expect(object.motivation_action_manager).toHaveBeenCalled();
    expect(evaluator.actionPlanner).not.toBeNull();
  });
});
