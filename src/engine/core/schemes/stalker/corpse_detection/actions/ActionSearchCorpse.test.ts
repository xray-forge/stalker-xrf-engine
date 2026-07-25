import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { EGameObjectPath, GameObject } from "xray16/alias";
import { MockGameObject, MockPropertyStorage, MockVector } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { EStalkerState } from "@/engine/core/animation/types";
import { getManager, getStalkerState, registerObject, setStalkerState } from "@/engine/core/database";
import { SoundManager } from "@/engine/core/managers/sounds/SoundManager";
import { ActionSearchCorpse } from "@/engine/core/schemes/stalker/corpse_detection/actions/ActionSearchCorpse";
import { ISchemeCorpseDetectionState } from "@/engine/core/schemes/stalker/corpse_detection/corpse_detection_types";
import { freeSelectedLootedObjectSpot } from "@/engine/core/schemes/stalker/corpse_detection/utils";
import { EScheme } from "@/engine/core/schemes/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/database/stalker", () => ({
  getStalkerState: jest.fn(() => null),
  setStalkerState: jest.fn(),
}));

jest.mock("@/engine/core/schemes/stalker/corpse_detection/utils", () => ({
  freeSelectedLootedObjectSpot: jest.fn(),
}));

function createAction(base: Partial<ISchemeCorpseDetectionState> = {}): {
  action: ActionSearchCorpse;
  object: GameObject;
  state: ISchemeCorpseDetectionState;
} {
  const object: GameObject = MockGameObject.mock({ position: MockVector.create(0, 0, 0) });
  const state: ISchemeCorpseDetectionState = mockSchemeState<ISchemeCorpseDetectionState>(EScheme.CORPSE_DETECTION, {
    selectedCorpseId: 500,
    selectedCorpseVertexId: 700,
    selectedCorpseVertexPosition: MockVector.create(1, 0, 0),
    ...base,
  });
  const action: ActionSearchCorpse = new ActionSearchCorpse(state);

  registerObject(object);
  action.setup(object, MockPropertyStorage.mock());

  return { action, object, state };
}

describe("ActionSearchCorpse", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(setStalkerState);
    resetFunctionMock(getStalkerState);
    resetFunctionMock(freeSelectedLootedObjectSpot);
    replaceFunctionMock(getStalkerState, () => null);
  });

  it("should send object to corpse on initialize", () => {
    const { action, object, state } = createAction();

    action.initialize();

    expect(action.lootingObjectId).toBe(state.selectedCorpseId);
    expect(object.set_desired_position).toHaveBeenCalledTimes(1);
    expect(object.set_desired_direction).toHaveBeenCalledTimes(1);
    expect(object.set_path_type).toHaveBeenCalledWith(EGameObjectPath.LEVEL_PATH);
    expect(object.set_dest_level_vertex_id).toHaveBeenCalledWith(700);
    expect(setStalkerState).toHaveBeenCalledWith(object, EStalkerState.PATROL);
  });

  it("should release selected corpse on finalize", () => {
    const { action } = createAction();

    action.initialize();
    action.isLootingSoundPlayed = true;
    action.finalize();

    expect(freeSelectedLootedObjectSpot).toHaveBeenCalledWith(500);
    expect(action.isLootingSoundPlayed).toBe(false);
    expect(action.lootingObjectId).toBeNull();
  });

  it("should not release corpse on finalize without selection", () => {
    const { action } = createAction({ selectedCorpseId: null });

    action.initialize();
    action.finalize();

    expect(freeSelectedLootedObjectSpot).not.toHaveBeenCalled();
  });

  it("should do nothing on execute before initialization", () => {
    const { action, object } = createAction();

    action.execute();

    expect(object.set_dest_level_vertex_id).not.toHaveBeenCalled();
    expect(setStalkerState).not.toHaveBeenCalled();
  });

  it("should start searching once corpse position is reached", () => {
    const { action, object, state } = createAction();
    const soundManager: SoundManager = getManager(SoundManager);

    jest.spyOn(soundManager, "play").mockImplementation(() => null);

    action.initialize();
    resetFunctionMock(setStalkerState);

    action.execute();

    expect(setStalkerState).toHaveBeenCalledWith(object, EStalkerState.SEARCH_CORPSE, null, null, {
      lookPosition: state.selectedCorpseVertexPosition,
    });
    expect(soundManager.play).toHaveBeenCalledWith(object.id(), "corpse_loot_begin");

    // Sound is played only once per looting session.
    action.execute();

    expect(soundManager.play).toHaveBeenCalledTimes(1);
  });

  it("should not restart searching when already searching corpse", () => {
    const { action } = createAction();

    action.initialize();
    replaceFunctionMock(getStalkerState, () => EStalkerState.SEARCH_CORPSE);
    resetFunctionMock(setStalkerState);

    action.execute();

    expect(setStalkerState).not.toHaveBeenCalled();
  });

  it("should retarget when another corpse is selected", () => {
    const { action, object, state } = createAction();

    action.initialize();
    replaceFunctionMock(getStalkerState, () => EStalkerState.SEARCH_CORPSE);

    state.selectedCorpseId = 900;
    state.selectedCorpseVertexId = 950;
    resetFunctionMock(setStalkerState);

    action.execute();

    expect(action.lootingObjectId).toBe(900);
    expect(object.set_dest_level_vertex_id).toHaveBeenCalledWith(950);
    expect(setStalkerState).toHaveBeenCalledWith(object, EStalkerState.PATROL);
  });
});
