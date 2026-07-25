import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { level, time_global } from "xray16";
import { EGameObjectPath, GameObject } from "xray16/alias";
import { ACTOR_ID, TTimestamp } from "xray16/lib";
import { MockGameObject, MockPropertyStorage, MockVector } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { EStalkerState } from "@/engine/core/animation/types";
import { registerObject, setStalkerState } from "@/engine/core/database";
import { ActionCompanionActivity } from "@/engine/core/schemes/stalker/companion/actions/ActionCompanionActivity";
import { ISchemeCompanionState } from "@/engine/core/schemes/stalker/companion/companion_types";
import { EScheme } from "@/engine/core/schemes/types";
import { mockRegisteredActor, mockSchemeState, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/database/stalker", () => ({ setStalkerState: jest.fn() }));

const NOW: TTimestamp = 100_000;

const BEH_WALK_SIMPLE: number = 0;
const BEH_WAIT_SIMPLE: number = 3;

function createAction(behavior: number = BEH_WALK_SIMPLE): {
  action: ActionCompanionActivity;
  actor: GameObject;
  object: GameObject;
} {
  const { actorGameObject } = mockRegisteredActor({ position: MockVector.create(0, 0, 0) });
  const object: GameObject = MockGameObject.mock({ position: MockVector.create(0, 0, 0) });
  const state: ISchemeCompanionState = mockSchemeState<ISchemeCompanionState>(EScheme.COMPANION, { behavior });
  const action: ActionCompanionActivity = new ActionCompanionActivity(state);

  registerObject(object);
  action.setup(object, MockPropertyStorage.mock());

  return { action, actor: actorGameObject, object };
}

describe("ActionCompanionActivity", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(setStalkerState);
    resetFunctionMock(time_global);
    resetFunctionMock(level.vertex_in_direction);
    resetFunctionMock(level.vertex_position);
    replaceFunctionMock(time_global, () => NOW);
    replaceFunctionMock(level.vertex_position, () => MockVector.create(15, 14, 16));
  });

  it("should correctly initialize", () => {
    const { action, object } = createAction();

    action.initialize();

    expect(object.set_desired_position).toHaveBeenCalledTimes(1);
    expect(object.set_desired_direction).toHaveBeenCalledTimes(1);
    expect(object.enable_talk).toHaveBeenCalledTimes(1);
    expect(action.assistPoint).toBeNull();
    expect(action.lastState).toBe(EStalkerState.GUARD_NA);
    expect(action.keepStateUntil).toBe(NOW);
    expect(setStalkerState).toHaveBeenCalledWith(object, EStalkerState.GUARD_NA, null, null, null, {
      animation: true,
    });
  });

  it("should wait in threat state and keep it stable", () => {
    const { action, object } = createAction(BEH_WAIT_SIMPLE);

    action.initialize();
    resetFunctionMock(setStalkerState);

    action.execute();

    expect(action.lastState).toBe(EStalkerState.THREAT);
    expect(setStalkerState).toHaveBeenCalledWith(
      object,
      EStalkerState.THREAT,
      null,
      null,
      { lookObjectId: ACTOR_ID, lookPosition: null },
      { animation: true }
    );

    action.execute();

    expect(setStalkerState).toHaveBeenCalledTimes(1);
  });

  it("should do nothing for unsupported behavior", () => {
    const { action } = createAction(99);

    action.initialize();
    resetFunctionMock(setStalkerState);

    action.execute();

    expect(setStalkerState).not.toHaveBeenCalled();
  });

  it("should not move when no accessible assist point exists", () => {
    const { action, object } = createAction();

    action.initialize();
    jest.spyOn(object, "accessible").mockImplementation(() => false);

    action.execute();

    expect(action.assistPoint).toBeNull();
    expect(object.set_dest_level_vertex_id).not.toHaveBeenCalled();
  });

  it("should switch to threat state once assist point is reached", () => {
    const { action, object } = createAction();

    action.initialize();
    resetFunctionMock(setStalkerState);

    replaceFunctionMock(level.vertex_in_direction, () => 800);
    jest.spyOn(object, "level_vertex_id").mockImplementation(() => 800);

    action.execute();

    expect(action.assistPoint).toBe(800);
    expect(object.set_path_type).toHaveBeenCalledWith(EGameObjectPath.LEVEL_PATH);
    expect(object.set_dest_level_vertex_id).toHaveBeenCalledWith(800);
    expect(setStalkerState).toHaveBeenCalledWith(
      object,
      EStalkerState.THREAT,
      null,
      null,
      { lookObjectId: ACTOR_ID, lookPosition: null },
      { animation: true }
    );
  });

  it("should raid towards a close assist point", () => {
    const { action, object } = createAction();

    action.initialize();
    resetFunctionMock(setStalkerState);

    replaceFunctionMock(level.vertex_in_direction, () => 800);
    // Object sits at the origin so the mock reports the real distance to the assist point.
    replaceFunctionMock(level.vertex_position, () => MockVector.create(2, 0, 0));

    action.execute();

    expect(action.lastState).toBe(EStalkerState.RAID);
    expect(action.keepStateUntil).toBe(NOW + 1000);
    expect(setStalkerState).toHaveBeenCalledWith(
      object,
      EStalkerState.RAID,
      null,
      null,
      { lookObjectId: ACTOR_ID, lookPosition: null },
      { animation: true }
    );
  });

  it("should rush towards a mid range assist point", () => {
    const { action, object } = createAction();

    action.initialize();
    resetFunctionMock(setStalkerState);

    replaceFunctionMock(level.vertex_in_direction, () => 800);
    replaceFunctionMock(level.vertex_position, () => MockVector.create(10, 0, 0));

    action.execute();

    expect(action.lastState).toBe(EStalkerState.RUSH);
    expect(setStalkerState).toHaveBeenCalledWith(object, EStalkerState.RUSH, null, null, null, { animation: true });
  });

  it("should assault towards a far assist point", () => {
    const { action } = createAction();

    action.initialize();
    resetFunctionMock(setStalkerState);

    replaceFunctionMock(level.vertex_in_direction, () => 800);
    replaceFunctionMock(level.vertex_position, () => MockVector.create(100, 0, 0));

    action.execute();

    expect(action.lastState).toBe(EStalkerState.ASSAULT);
  });

  it("should keep the current state until the timeout passes", () => {
    const { action } = createAction();

    action.initialize();

    replaceFunctionMock(level.vertex_in_direction, () => 800);
    replaceFunctionMock(level.vertex_position, () => MockVector.create(10, 0, 0));

    action.execute();
    resetFunctionMock(setStalkerState);

    action.execute();

    expect(setStalkerState).not.toHaveBeenCalled();
  });

  it("should correctly finalize", () => {
    const { action } = createAction();

    action.initialize();

    expect(() => action.finalize()).not.toThrow();
  });
});
