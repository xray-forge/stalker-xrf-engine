import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { EGameObjectPath, GameObject } from "xray16/alias";
import { MockGameObject, MockPropertyStorage, MockVector } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { EStalkerState } from "@/engine/core/animation/types";
import { getManager, getStalkerState, registerObject, setStalkerState } from "@/engine/core/database";
import { SoundManager } from "@/engine/core/managers/sounds/SoundManager";
import { ActionHelpWounded } from "@/engine/core/schemes/stalker/help_wounded/actions/ActionHelpWounded";
import { ISchemeHelpWoundedState } from "@/engine/core/schemes/stalker/help_wounded/help_wounded_types";
import { freeSelectedWoundedStalkerSpot } from "@/engine/core/schemes/stalker/help_wounded/utils";
import { EScheme } from "@/engine/core/schemes/types";
import { sendToNearestAccessibleVertex } from "@/engine/core/utils/position";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/database/stalker", () => ({
  getStalkerState: jest.fn(() => null),
  setStalkerState: jest.fn(),
}));

jest.mock("@/engine/core/schemes/stalker/help_wounded/utils", () => ({
  freeSelectedWoundedStalkerSpot: jest.fn(),
}));

jest.mock("@/engine/core/utils/position", () => ({
  sendToNearestAccessibleVertex: jest.fn((_: unknown, vertexId: number) => vertexId),
}));

function createAction(base: Partial<ISchemeHelpWoundedState> = {}): {
  action: ActionHelpWounded;
  object: GameObject;
  state: ISchemeHelpWoundedState;
} {
  const object: GameObject = MockGameObject.mock({ position: MockVector.create(0, 0, 0) });
  const state: ISchemeHelpWoundedState = mockSchemeState<ISchemeHelpWoundedState>(EScheme.HELP_WOUNDED, {
    isHelpingWoundedEnabled: true,
    selectedWoundedId: 500,
    selectedWoundedVertexId: 700,
    selectedWoundedVertexPosition: MockVector.create(1, 0, 0),
    ...base,
  });
  const action: ActionHelpWounded = new ActionHelpWounded(state);

  registerObject(object);
  action.setup(object, MockPropertyStorage.mock());

  return { action, object, state };
}

describe("ActionHelpWounded", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(setStalkerState);
    resetFunctionMock(getStalkerState);
    resetFunctionMock(freeSelectedWoundedStalkerSpot);
    resetFunctionMock(sendToNearestAccessibleVertex);
    replaceFunctionMock(getStalkerState, () => null);
    replaceFunctionMock(sendToNearestAccessibleVertex, (_: unknown, vertexId: number) => vertexId);
  });

  it("should send object to wounded on initialize", () => {
    const { action, object, state } = createAction();

    action.initialize();

    expect(action.helpingTargetId).toBe(state.selectedWoundedId);
    expect(object.set_desired_position).toHaveBeenCalledTimes(1);
    expect(object.set_desired_direction).toHaveBeenCalledTimes(1);
    expect(object.set_path_type).toHaveBeenCalledWith(EGameObjectPath.LEVEL_PATH);
    expect(object.set_dest_level_vertex_id).toHaveBeenCalledWith(700);
    expect(setStalkerState).toHaveBeenCalledWith(object, EStalkerState.RUN);
  });

  it("should release selected wounded on finalize", () => {
    const { action } = createAction();

    action.initialize();
    action.isHelpingSoundPlayed = true;
    action.finalize();

    expect(freeSelectedWoundedStalkerSpot).toHaveBeenCalledWith(500);
    expect(action.isHelpingSoundPlayed).toBe(false);
    expect(action.helpingTargetId).toBeNull();
  });

  it("should do nothing on execute before initialization", () => {
    const { action, object } = createAction();

    action.execute();

    expect(object.set_dest_level_vertex_id).not.toHaveBeenCalled();
    expect(setStalkerState).not.toHaveBeenCalled();
  });

  it("should start healing once wounded position is reached", () => {
    const { action, object, state } = createAction();
    const soundManager: SoundManager = getManager(SoundManager);

    jest.spyOn(soundManager, "play").mockImplementation(() => null);

    action.initialize();
    resetFunctionMock(setStalkerState);

    action.execute();

    expect(setStalkerState).toHaveBeenCalledWith(
      object,
      EStalkerState.HELP_WOUNDED_WITH_MEDKIT,
      null,
      null,
      { lookPosition: state.selectedWoundedVertexPosition },
      { isForced: true }
    );
    expect(soundManager.play).toHaveBeenCalledWith(object.id(), "wounded_medkit");

    // Sound is played only once per healing action.
    action.execute();

    expect(soundManager.play).toHaveBeenCalledTimes(1);
  });

  it("should not restart healing when already healing", () => {
    const { action } = createAction();

    action.initialize();
    replaceFunctionMock(getStalkerState, () => EStalkerState.HELP_WOUNDED_WITH_MEDKIT);
    resetFunctionMock(setStalkerState);

    action.execute();

    expect(setStalkerState).not.toHaveBeenCalled();
  });

  it("should retarget when another wounded is selected", () => {
    const { action, object, state } = createAction();

    action.initialize();
    replaceFunctionMock(getStalkerState, () => EStalkerState.HELP_WOUNDED_WITH_MEDKIT);

    state.selectedWoundedId = 900;
    state.selectedWoundedVertexId = 950;
    resetFunctionMock(setStalkerState);

    action.execute();

    expect(action.helpingTargetId).toBe(900);
    expect(object.set_dest_level_vertex_id).toHaveBeenCalledWith(950);
    expect(setStalkerState).toHaveBeenCalledWith(object, EStalkerState.RUN);
  });
});
