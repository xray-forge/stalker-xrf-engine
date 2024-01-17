import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { StalkerStateManager } from "@/engine/core/ai/state";
import { EStalkerState } from "@/engine/core/animation/types";
import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { ISchemeAnimpointState } from "@/engine/core/schemes/stalker/animpoint";
import { ActionReachAnimpoint } from "@/engine/core/schemes/stalker/animpoint/actions/ActionReachAnimpoint";
import { AnimpointManager } from "@/engine/core/schemes/stalker/animpoint/AnimpointManager";
import { MY_VECTOR, MZ_VECTOR, X_VECTOR } from "@/engine/lib/constants/vectors";
import { EGameObjectPath, EScheme, GameObject } from "@/engine/lib/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";
import { MockGameObject, MockPropertyStorage } from "@/fixtures/xray";

describe("ActionReachAnimpoint", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly initialize and finalize", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeAnimpointState = mockSchemeState(EScheme.ANIMPOINT);
    const action: ActionReachAnimpoint = new ActionReachAnimpoint(state);

    action.setup(object, MockPropertyStorage.mock());

    state.animpointManager = new AnimpointManager(object, state);
    jest.spyOn(state.animpointManager, "calculatePosition").mockImplementation(jest.fn());

    action.initialize();

    expect(state.animpointManager.calculatePosition).toHaveBeenCalledTimes(1);

    action.finalize();

    expect(state.animpointManager.calculatePosition).toHaveBeenCalledTimes(1);
  });

  it("should correctly execute animpoint reach action when reached", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const animpointState: ISchemeAnimpointState = mockSchemeState(EScheme.ANIMPOINT);
    const action: ActionReachAnimpoint = new ActionReachAnimpoint(animpointState);

    state.stateManager = new StalkerStateManager(object);

    animpointState.animpointManager = new AnimpointManager(object, animpointState);
    animpointState.animpointManager.positionLevelVertexId = 15;
    animpointState.animpointManager.lookPosition = MZ_VECTOR;
    animpointState.animpointManager.smartCoverDirection = MY_VECTOR;
    animpointState.reachDistanceSqr = 16;
    animpointState.reachMovement = EStalkerState.SPRINT;

    jest.spyOn(state.stateManager, "setState").mockImplementation(jest.fn());
    jest.spyOn(object.position(), "distance_to_sqr").mockImplementation(() => 16);

    action.setup(object, MockPropertyStorage.mock());
    action.execute();

    expect(object.set_dest_level_vertex_id).toHaveBeenCalledWith(15);
    expect(object.set_desired_direction).toHaveBeenCalledWith(MY_VECTOR);
    expect(object.set_path_type).toHaveBeenCalledWith(EGameObjectPath.LEVEL_PATH);

    expect(state.stateManager.setState).toHaveBeenCalledTimes(1);
    expect(state.stateManager.setState).toHaveBeenCalledWith(
      EStalkerState.SPRINT,
      null,
      null,
      {
        lookPosition: MZ_VECTOR,
      },
      null
    );
  });

  it("should correctly execute animpoint reach action when not reached", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const animpointState: ISchemeAnimpointState = mockSchemeState(EScheme.ANIMPOINT);
    const action: ActionReachAnimpoint = new ActionReachAnimpoint(animpointState);

    state.stateManager = new StalkerStateManager(object);

    animpointState.animpointManager = new AnimpointManager(object, animpointState);
    animpointState.animpointManager.positionLevelVertexId = 26;
    animpointState.animpointManager.smartCoverDirection = X_VECTOR;
    animpointState.reachDistanceSqr = 4;
    animpointState.reachMovement = EStalkerState.PATROL;

    jest.spyOn(state.stateManager, "setState").mockImplementation(jest.fn());
    jest.spyOn(object.position(), "distance_to_sqr").mockImplementation(() => 25);

    action.setup(object, MockPropertyStorage.mock());
    action.execute();

    expect(object.set_dest_level_vertex_id).toHaveBeenCalledWith(26);
    expect(object.set_desired_direction).toHaveBeenCalledWith(X_VECTOR);
    expect(object.set_path_type).toHaveBeenCalledWith(EGameObjectPath.LEVEL_PATH);

    expect(state.stateManager.setState).toHaveBeenCalledTimes(1);
    expect(state.stateManager.setState).toHaveBeenCalledWith(EStalkerState.PATROL, null, null, null, null);
  });
});
