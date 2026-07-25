import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";
import { GameObject } from "xray16/alias";
import { AnyObject, NIL, Nillable } from "xray16/lib";
import { MockAlifeSimulator, MockCUIScriptWnd, MockGameObject, MockVector } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { registry } from "@/engine/core/database";
import { DebugObjectSection } from "@/engine/core/ui/debug/sections/DebugObjectSection";
import {
  logObjectInventoryItems,
  logObjectPlannerState,
  logObjectRelations,
  logObjectState,
  logObjectStateController,
} from "@/engine/core/utils/debug/debug_log";
import { setObjectWounded } from "@/engine/core/utils/object";
import { getNearestGameObject } from "@/engine/core/utils/registry";
import { ERelation, setGameObjectRelation } from "@/engine/core/utils/relation";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/utils/debug/debug_log", () => ({
  logObjectInventoryItems: jest.fn(),
  logObjectPlannerState: jest.fn(),
  logObjectRelations: jest.fn(),
  logObjectState: jest.fn(),
  logObjectStateController: jest.fn(),
}));

jest.mock("@/engine/core/utils/object", () => ({ setObjectWounded: jest.fn() }));
jest.mock("@/engine/core/utils/registry", () => ({ getNearestGameObject: jest.fn(() => null) }));

jest.mock("@/engine/core/utils/relation", () => {
  const actual = jest.requireActual("@/engine/core/utils/relation") as Record<string, unknown>;

  return { ...actual, setGameObjectRelation: jest.fn() };
});

// `level.get_target_obj` is not provided by `xray16` mocks, so it is stubbed per test run.
const getTargetObject = jest.fn((): Nillable<GameObject> => null);

function createSection(): DebugObjectSection {
  const section: DebugObjectSection = new DebugObjectSection(MockCUIScriptWnd.mock(), "test-name");

  // Class field declarations are defined after the base constructor already ran `initializeControls`, which resets
  // the assigned controls back to `undefined` under `useDefineForClassFields`. Re-run initialization here.
  section.initializeControls();
  section.initializeCallBacks();
  section.initializeState();

  return section;
}

describe("DebugObjectSection", () => {
  beforeEach(() => {
    resetRegistry();
    (level as unknown as AnyObject).get_target_obj = getTargetObject;
    getTargetObject.mockReset();
    getTargetObject.mockImplementation(() => null);
    resetFunctionMock(getNearestGameObject);
    resetFunctionMock(setGameObjectRelation);
    resetFunctionMock(setObjectWounded);
    resetFunctionMock(logObjectInventoryItems);
    resetFunctionMock(logObjectPlannerState);
    resetFunctionMock(logObjectRelations);
    resetFunctionMock(logObjectState);
    resetFunctionMock(logObjectStateController);
    replaceFunctionMock(getNearestGameObject, () => null);
  });

  it("should correctly initialize with defaults when game is not started", () => {
    const section: DebugObjectSection = createSection();

    expect(section.uiNearestStalkerLabel.SetText).toHaveBeenCalledWith("Nearest: " + NIL);
    expect(section.uiTargetStalkerLabel.SetText).toHaveBeenCalledWith("Target: " + NIL);
    expect(section.uiTargetStalkerRelationLabel.SetText).toHaveBeenCalledWith("object relation: " + NIL);
    expect(section.uiTargetStalkerSquadRelationLabel.SetText).toHaveBeenCalledWith("squad relation: " + NIL);
    expect(section.uiTargetStalkerHealthLabel.SetText).toHaveBeenCalledWith("health: " + NIL);
    expect(section.uiUseTargetCheck.SetCheck).toHaveBeenCalledWith(true);
  });

  it("should describe nearest and target objects when game is started", () => {
    const nearest: GameObject = MockGameObject.mock({ name: "nearest-object" });
    const target: GameObject = MockGameObject.mock({ name: "target-object", position: MockVector.create(1, 1, 1) });

    mockRegisteredActor();
    registry.simulator = MockAlifeSimulator.getInstance();
    replaceFunctionMock(getNearestGameObject, () => nearest);
    getTargetObject.mockImplementation(() => target);

    const section: DebugObjectSection = createSection();

    expect(section.uiNearestStalkerLabel.SetText).toHaveBeenCalledWith("Nearest: nearest-object");
    expect(section.uiTargetStalkerLabel.SetText).toHaveBeenCalledWith("Target: target-object");
    expect(section.uiTargetStalkerSquadRelationLabel.SetText).toHaveBeenCalledWith("squad relation: " + NIL);
    expect(section.uiTargetStalkerHealthLabel.SetText).toHaveBeenCalledWith("health: " + target.health);
  });

  it("should skip logging handlers when game is not started", () => {
    const section: DebugObjectSection = createSection();

    section.onPrintState();
    section.onPrintActionPlannerState();
    section.onPrintInventoryState();
    section.onPrintRelationsState();
    section.onPrintStateControllerReport();
    section.onSetRelation(ERelation.FRIEND);
    section.onKillObject();
    section.onSetWoundedObject();

    expect(logObjectState).not.toHaveBeenCalled();
    expect(logObjectPlannerState).not.toHaveBeenCalled();
    expect(logObjectInventoryItems).not.toHaveBeenCalled();
    expect(logObjectRelations).not.toHaveBeenCalled();
    expect(logObjectStateController).not.toHaveBeenCalled();
    expect(setGameObjectRelation).not.toHaveBeenCalled();
    expect(setObjectWounded).not.toHaveBeenCalled();
  });

  it("should skip logging handlers when no object is resolved", () => {
    mockRegisteredActor();
    registry.simulator = MockAlifeSimulator.getInstance();
    getTargetObject.mockImplementation(() => null);

    const section: DebugObjectSection = createSection();

    section.onPrintState();
    section.onPrintActionPlannerState();
    section.onPrintInventoryState();
    section.onPrintRelationsState();
    section.onPrintStateControllerReport();
    section.onSetRelation(ERelation.ENEMY);
    section.onKillObject();
    section.onSetWoundedObject();

    expect(logObjectState).not.toHaveBeenCalled();
    expect(logObjectPlannerState).not.toHaveBeenCalled();
    expect(logObjectInventoryItems).not.toHaveBeenCalled();
    expect(logObjectRelations).not.toHaveBeenCalled();
    expect(logObjectStateController).not.toHaveBeenCalled();
    expect(setGameObjectRelation).not.toHaveBeenCalled();
    expect(setObjectWounded).not.toHaveBeenCalled();
  });

  it("should apply handlers to resolved target object", () => {
    const target: GameObject = MockGameObject.mock({ position: MockVector.create(1, 1, 1) });
    const { actorGameObject } = mockRegisteredActor();

    registry.simulator = MockAlifeSimulator.getInstance();
    getTargetObject.mockImplementation(() => target);

    const section: DebugObjectSection = createSection();

    jest.spyOn(section.uiUseTargetCheck, "GetCheck").mockImplementation(() => true);

    section.onPrintState();
    section.onPrintActionPlannerState();
    section.onPrintInventoryState();
    section.onPrintRelationsState();
    section.onPrintStateControllerReport();
    section.onSetRelation(ERelation.NEUTRAL);
    section.onKillObject();
    section.onSetWoundedObject();

    expect(logObjectState).toHaveBeenCalledWith(target);
    expect(logObjectPlannerState).toHaveBeenCalledWith(target);
    expect(logObjectInventoryItems).toHaveBeenCalledWith(target);
    expect(logObjectRelations).toHaveBeenCalledWith(target);
    expect(logObjectStateController).toHaveBeenCalledWith(target);
    expect(setGameObjectRelation).toHaveBeenCalledWith(target, actorGameObject, ERelation.NEUTRAL);
    expect(target.kill).toHaveBeenCalledWith(target);
    expect(setObjectWounded).toHaveBeenCalledWith(target);
  });

  it("should resolve current object based on target check state", () => {
    const nearest: GameObject = MockGameObject.mock();
    const target: GameObject = MockGameObject.mock();

    mockRegisteredActor();
    registry.simulator = MockAlifeSimulator.getInstance();
    replaceFunctionMock(getNearestGameObject, () => nearest);
    getTargetObject.mockImplementation(() => target);

    const section: DebugObjectSection = createSection();

    jest.spyOn(section.uiUseTargetCheck, "GetCheck").mockImplementation(() => true);
    expect(section.getCurrentObject()).toBe(target);

    jest.spyOn(section.uiUseTargetCheck, "GetCheck").mockImplementation(() => false);
    expect(section.getCurrentObject()).toBe(nearest);
  });
});
