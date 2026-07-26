import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";

import { registerObject } from "@/engine/core/database";
import { ActionMeetWait } from "@/engine/core/schemes/stalker/meet/actions/ActionMeetWait";
import { ISchemeMeetState } from "@/engine/core/schemes/stalker/meet/meet_types";
import { MeetController } from "@/engine/core/schemes/stalker/meet/MeetController";
import { EScheme } from "@/engine/core/schemes/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";

function createAction(): { action: ActionMeetWait; object: GameObject; state: ISchemeMeetState } {
  const object: GameObject = MockGameObject.mock();
  const state: ISchemeMeetState = mockSchemeState<ISchemeMeetState>(EScheme.MEET);
  const action: ActionMeetWait = new ActionMeetWait(state);

  registerObject(object);

  state.meetController = new MeetController(object, state);
  jest.spyOn(state.meetController, "execute").mockImplementation(jest.fn());

  action.setup(object, MockPropertyStorage.mock());

  return { action, object, state };
}

describe("ActionMeetWait", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should stop movement on initialize", () => {
    const { action, object } = createAction();

    action.initialize();

    expect(object.set_desired_position).toHaveBeenCalledTimes(1);
    expect(object.set_desired_direction).toHaveBeenCalledTimes(1);
  });

  it("should correctly finalize", () => {
    const { action } = createAction();

    action.initialize();

    expect(() => action.finalize()).not.toThrow();
  });

  it("should delegate execution to meet manager", () => {
    const { action, state } = createAction();

    action.initialize();
    action.execute();

    expect(state.meetController.execute).toHaveBeenCalledTimes(1);
  });
});
