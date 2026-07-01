import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { EEvaluatorId } from "@/engine/core/ai/planner/types";
import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { ISchemeCamperState } from "@/engine/core/schemes/stalker/camper/camper_types";
import { EvaluatorCloseCombat } from "@/engine/core/schemes/stalker/camper/evaluators/EvaluatorCloseCombat";
import { EScheme, GameObject, Nillable, TSection } from "@/engine/lib/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";
import { MockActionPlanner, MockGameObject, MockPropertyStorage, MockVector } from "@/fixtures/xray";
import { MockPropertyEvaluatorConst } from "@/fixtures/xray/mocks/PropertyEvaluatorConst.mock";

interface ISetupResult {
  evaluator: EvaluatorCloseCombat;
  state: ISchemeCamperState;
  object: GameObject;
  objectState: IRegistryObjectState;
  planner: MockActionPlanner;
}

function setupEvaluator({
  active = true,
  enemy = true,
  canFight = true,
  danger = false,
}: {
  active?: boolean;
  enemy?: boolean;
  canFight?: boolean;
  danger?: boolean;
} = {}): ISetupResult {
  const object: GameObject = MockGameObject.mock();
  const state: ISchemeCamperState = mockSchemeState<ISchemeCamperState>(EScheme.CAMPER);
  const evaluator: EvaluatorCloseCombat = new EvaluatorCloseCombat(state);
  const planner: MockActionPlanner = new MockActionPlanner();
  const objectState: IRegistryObjectState = registerObject(object);

  state.radius = 20;
  objectState.activeSection = (active ? state.section : "another@section") as TSection;

  planner.add_evaluator(EEvaluatorId.ENEMY, new MockPropertyEvaluatorConst(enemy).asMock());
  planner.add_evaluator(EEvaluatorId.CAN_FIGHT, new MockPropertyEvaluatorConst(canFight).asMock());
  planner.add_evaluator(EEvaluatorId.DANGER, new MockPropertyEvaluatorConst(danger).asMock());

  evaluator.actionPlanner = planner.asMock();
  evaluator.setup(object, MockPropertyStorage.mock());

  return { evaluator, state, object, objectState, planner };
}

/**
 * Attach a best enemy and control the distance / memory-time inputs of the close-combat state machine.
 */
function withEnemy(object: GameObject, distance: number, memoryTime: Nillable<number>): void {
  const enemy: GameObject = MockGameObject.mock();

  jest.spyOn(object, "best_enemy").mockImplementation(() => enemy);
  jest.spyOn(object, "memory_position").mockImplementation(() => MockVector.mock(0, 0, 0));
  jest.spyOn(object, "memory_time").mockImplementation(() => memoryTime as number);
  jest.spyOn(object.position(), "distance_to").mockImplementation(() => distance);
}

describe("EvaluatorCloseCombat", () => {
  beforeEach(() => {
    resetRegistry();
    // time_global() mock:
    jest.spyOn(Date, "now").mockImplementation(() => 60_000);
  });

  it("should be considered in close combat when scheme section is not active", () => {
    const { evaluator } = setupEvaluator({ active: false });

    expect(evaluator.evaluate()).toBe(true);
  });

  it("should not enter close combat without an enemy", () => {
    const { evaluator } = setupEvaluator({ enemy: false });

    expect(evaluator.evaluate()).toBe(false);
  });

  it("should not enter close combat when object cannot fight", () => {
    const { evaluator } = setupEvaluator({ canFight: false });

    expect(evaluator.evaluate()).toBe(false);
  });

  it("should enter close combat when object is facing danger", () => {
    const { evaluator } = setupEvaluator({ danger: true });

    expect(evaluator.evaluate()).toBe(true);
  });

  it("should keep the current close combat state when there is no best enemy", () => {
    const { evaluator } = setupEvaluator();

    // best_enemy() defaults to null.
    expect(evaluator.evaluate()).toBe(false);

    evaluator.isCloseCombat = true;
    expect(evaluator.evaluate()).toBe(true);
  });

  it("should enter close combat when enemy is within radius and freshly remembered", () => {
    const { evaluator, object } = setupEvaluator();

    withEnemy(object, 19, 50_000); // 60000 - 50000 = 10000 <= 20000, fresh

    expect(evaluator.evaluate()).toBe(true);
    expect(evaluator.isCloseCombat).toBe(true);
  });

  it("should not enter close combat when enemy is outside radius", () => {
    const { evaluator, object } = setupEvaluator();

    withEnemy(object, 21, 50_000);

    expect(evaluator.evaluate()).toBe(false);
    expect(evaluator.isCloseCombat).toBe(false);
  });

  it("should reject a fresh close-combat transition when enemy memory is already stale in the same tick", () => {
    const { evaluator, object } = setupEvaluator();

    // Within radius (compute step would set true) but memory is stale, so the sequential decay step must clear it.
    withEnemy(object, 10, 30_000); // 60000 - 30000 = 30000 > 20000, stale

    expect(evaluator.evaluate()).toBe(false);
    expect(evaluator.isCloseCombat).toBe(false);
  });

  it("should decay close combat when enemy memory time is missing", () => {
    const { evaluator, object } = setupEvaluator();

    evaluator.isCloseCombat = true;
    withEnemy(object, 999, null);

    expect(evaluator.evaluate()).toBe(false);
    expect(evaluator.isCloseCombat).toBe(false);
  });

  it("should keep close combat while the enemy remains freshly remembered", () => {
    const { evaluator, object } = setupEvaluator();

    // Already in close combat, so the compute step is skipped even though the enemy is far, fresh memory keeps it.
    evaluator.isCloseCombat = true;
    withEnemy(object, 999, 55_000);

    expect(evaluator.evaluate()).toBe(true);
    expect(evaluator.isCloseCombat).toBe(true);
  });

  it("should decay close combat when the enemy memory becomes stale", () => {
    const { evaluator, object } = setupEvaluator();

    evaluator.isCloseCombat = true;
    withEnemy(object, 999, 30_000); // stale

    expect(evaluator.evaluate()).toBe(false);
    expect(evaluator.isCloseCombat).toBe(false);
  });
});
