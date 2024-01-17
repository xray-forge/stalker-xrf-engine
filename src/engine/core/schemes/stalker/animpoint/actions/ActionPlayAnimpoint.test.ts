import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { StalkerStateManager } from "@/engine/core/ai/state";
import { EStalkerState } from "@/engine/core/animation/types";
import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { ISchemeAnimpointState } from "@/engine/core/schemes/stalker/animpoint";
import { ActionPlayAnimpoint } from "@/engine/core/schemes/stalker/animpoint/actions/ActionPlayAnimpoint";
import { AnimpointManager } from "@/engine/core/schemes/stalker/animpoint/AnimpointManager";
import { MX_VECTOR, X_VECTOR, Y_VECTOR } from "@/engine/lib/constants/vectors";
import { EScheme, GameObject } from "@/engine/lib/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";
import { MockGameObject, MockPropertyStorage } from "@/fixtures/xray";

describe("ActionPlayAnimpoint", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly initialize and finalize", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeAnimpointState = mockSchemeState(EScheme.ANIMPOINT);
    const action: ActionPlayAnimpoint = new ActionPlayAnimpoint(state);

    action.setup(object, MockPropertyStorage.mock());

    state.animpointManager = new AnimpointManager(object, state);

    jest.spyOn(state.animpointManager, "start").mockImplementation(jest.fn());
    jest.spyOn(state.animpointManager, "stop").mockImplementation(jest.fn());

    action.initialize();

    expect(state.animpointManager.start).toHaveBeenCalledTimes(1);
    expect(state.animpointManager.stop).toHaveBeenCalledTimes(0);

    action.finalize();

    expect(state.animpointManager.start).toHaveBeenCalledTimes(1);
    expect(state.animpointManager.stop).toHaveBeenCalledTimes(1);
  });

  it("should correctly execute", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const animpointState: ISchemeAnimpointState = mockSchemeState(EScheme.ANIMPOINT);
    const action: ActionPlayAnimpoint = new ActionPlayAnimpoint(animpointState);

    action.setup(object, MockPropertyStorage.mock());

    state.stateManager = new StalkerStateManager(object);
    animpointState.animpointManager = new AnimpointManager(object, animpointState);
    animpointState.animpointManager.lookPosition = MX_VECTOR;
    animpointState.animpointManager.currentAction = EStalkerState.SNEAK;

    jest.spyOn(state.stateManager, "setState").mockImplementation(jest.fn());
    jest.spyOn(animpointState.animpointManager, "start").mockImplementation(jest.fn());
    jest
      .spyOn(animpointState.animpointManager, "getAnimationParameters")
      .mockImplementation(() => $multi(X_VECTOR, Y_VECTOR));

    action.execute();

    expect(animpointState.animpointManager.start).toHaveBeenCalledTimes(1);
    expect(animpointState.animpointManager.getAnimationParameters).toHaveBeenCalledTimes(1);
    expect(state.stateManager.setState).toHaveBeenCalledTimes(1);
    expect(state.stateManager.setState).toHaveBeenCalledWith(
      EStalkerState.SNEAK,
      null,
      null,
      { lookPosition: MX_VECTOR },
      { animationDirection: Y_VECTOR, animationPosition: X_VECTOR }
    );

    animpointState.animpointManager.isStarted = true;

    action.execute();

    expect(animpointState.animpointManager.start).toHaveBeenCalledTimes(1);
    expect(animpointState.animpointManager.getAnimationParameters).toHaveBeenCalledTimes(2);
    expect(state.stateManager.setState).toHaveBeenCalledTimes(2);
  });

  it("should correctly handle switch offline", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeAnimpointState = mockSchemeState(EScheme.ANIMPOINT);
    const action: ActionPlayAnimpoint = new ActionPlayAnimpoint(state);

    action.setup(object, MockPropertyStorage.mock());

    state.animpointManager = new AnimpointManager(object, state);

    jest.spyOn(state.animpointManager, "stop").mockImplementation(jest.fn());

    expect(state.animpointManager.stop).toHaveBeenCalledTimes(0);

    action.onSwitchOffline();

    expect(state.animpointManager.stop).toHaveBeenCalledTimes(1);
  });
});
