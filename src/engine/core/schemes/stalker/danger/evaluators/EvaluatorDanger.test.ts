import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { EActionId } from "@/engine/core/ai/planner/types";
import { registerSimulator } from "@/engine/core/database";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { ISchemeDangerState } from "@/engine/core/schemes/stalker/danger";
import { dangerConfig } from "@/engine/core/schemes/stalker/danger/DangerConfig";
import { EvaluatorDanger } from "@/engine/core/schemes/stalker/danger/evaluators/EvaluatorDanger";
import { isObjectFacingDanger } from "@/engine/core/schemes/stalker/danger/utils";
import { startSmartTerrainAlarm } from "@/engine/core/utils/smart_terrain";
import { ActionPlanner, DangerObject, EScheme, GameObject, ServerHumanObject } from "@/engine/lib/types";
import { mockSchemeState, MockSmartTerrain, resetRegistry } from "@/fixtures/engine";
import { replaceFunctionMock, resetFunctionMock } from "@/fixtures/jest";
import { MockAlifeHumanStalker, MockDangerObject, MockGameObject, MockPropertyStorage } from "@/fixtures/xray";

jest.mock("@/engine/core/schemes/stalker/danger/utils");
jest.mock("@/engine/core/utils/smart_terrain");

describe("EvaluatorDanger", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
    resetFunctionMock(isObjectFacingDanger);
    resetFunctionMock(startSmartTerrainAlarm);

    jest.spyOn(Date, "now").mockImplementation(() => 60_000);
  });

  it("should correctly handle checks when facing danger without smart terrain", () => {
    replaceFunctionMock(isObjectFacingDanger, () => true);

    const object: GameObject = MockGameObject.mock();
    const planner: ActionPlanner = object.motivation_action_manager();
    const state: ISchemeDangerState = mockSchemeState(EScheme.DANGER);
    const evaluator: EvaluatorDanger = new EvaluatorDanger(state);
    const danger: DangerObject = MockDangerObject.mock(16_000);

    jest.spyOn(object, "best_danger").mockImplementation(() => danger);

    evaluator.setup(object, MockPropertyStorage.mock());

    expect(evaluator.evaluate()).toBe(true);
    expect(state.dangerTime).toBeUndefined();
    expect(startSmartTerrainAlarm).not.toHaveBeenCalled();

    jest.spyOn(planner, "initialized").mockImplementation(() => true);
    jest.spyOn(planner, "current_action_id").mockImplementation(() => EActionId.DANGER);

    expect(evaluator.evaluate()).toBe(true);
    expect(state.dangerTime).toBe(16_000);
    expect(startSmartTerrainAlarm).not.toHaveBeenCalled();
  });

  it("should correctly handle checks when facing danger with smart terrain", () => {
    replaceFunctionMock(isObjectFacingDanger, () => true);

    const terrain: SmartTerrain = MockSmartTerrain.mock();
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeDangerState = mockSchemeState(EScheme.DANGER);
    const evaluator: EvaluatorDanger = new EvaluatorDanger(state);
    const danger: DangerObject = MockDangerObject.mock(16_000);
    const serverObject: ServerHumanObject = MockAlifeHumanStalker.mock({ id: object.id() });

    serverObject.m_smart_terrain_id = terrain.id;

    jest.spyOn(object, "best_danger").mockImplementation(() => danger);

    evaluator.setup(object, MockPropertyStorage.mock());

    expect(evaluator.evaluate()).toBe(true);
    expect(startSmartTerrainAlarm).toHaveBeenCalledWith(terrain);
  });

  it("should correctly handle checks when there is no danger", () => {
    replaceFunctionMock(isObjectFacingDanger, () => false);

    const danger: DangerObject = MockDangerObject.mock();
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeDangerState = mockSchemeState(EScheme.DANGER);
    const evaluator: EvaluatorDanger = new EvaluatorDanger(state);

    evaluator.setup(object, MockPropertyStorage.mock());

    expect(evaluator.evaluate()).toBe(false);

    jest.spyOn(object, "best_danger").mockImplementation(() => danger);
    expect(evaluator.evaluate()).toBe(false);

    state.dangerTime = 60_000 - dangerConfig.INERTIA_TIME;
    expect(evaluator.evaluate()).toBe(false);

    state.dangerTime = 60_000 - dangerConfig.INERTIA_TIME + 1;
    expect(evaluator.evaluate()).toBe(true);
  });
});
