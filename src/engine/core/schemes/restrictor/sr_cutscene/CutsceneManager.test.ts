import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";
import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";
import { $fromArray } from "xray16/macros";
import { MockGameObject, MockPatrol } from "xray16/mocks";

import { postProcessors } from "@/engine/constants/animation";
import { getManager } from "@/engine/core/database";
import { ActorInputManager } from "@/engine/core/managers/actor";
import { CutsceneManager } from "@/engine/core/schemes/restrictor/sr_cutscene/CutsceneManager";
import { CameraEffectorSet } from "@/engine/core/schemes/restrictor/sr_cutscene/effectors/CameraEffectorSet";
import {
  EEffectorState,
  ESceneState,
  ISchemeCutsceneState,
} from "@/engine/core/schemes/restrictor/sr_cutscene/sr_cutscene_types";
import { EScheme } from "@/engine/core/schemes/types";
import { mockRegisteredActor, mockSchemeState, resetRegistry } from "@/fixtures/engine";

function createCutsceneState(): ISchemeCutsceneState {
  return mockSchemeState<ISchemeCutsceneState>(EScheme.SR_CUTSCENE, {
    cameraEffector: $fromArray(["first_motion"]),
    isGlobalCameraEffect: false,
    isOutdoor: false,
    look: "look_path",
    point: "point_path",
    ppEffector: postProcessors.nil,
    shouldEnableUiOnEnd: true,
  });
}

describe("CutsceneManager", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly initialize", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeCutsceneState = mockSchemeState(EScheme.SR_CUTSCENE);
    const manager: CutsceneManager = new CutsceneManager(object, state);

    expect(manager.object).toBe(object);
    expect(manager.state).toBe(state);
    expect(manager.isUiDisabled).toBe(false);
    expect(manager.isPostprocess).toBe(false);
    expect(manager.motionId).toBe(1);
    expect(manager.motion).toBeNull();
    expect(manager.sceneState).toBe(ESceneState.NONE);
  });

  it("should correctly handle activation", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeCutsceneState = mockSchemeState(EScheme.SR_CUTSCENE);
    const manager: CutsceneManager = new CutsceneManager(object, state);

    jest.spyOn(manager, "onZoneEnter").mockImplementation(jest.fn());

    manager.activate();

    expect(manager.sceneState).toBe(ESceneState.NONE);
    expect(manager.state.signals).toEqualLuaTables({});
    expect(manager.motion).toBeNull();
    expect(manager.onZoneEnter).toHaveBeenCalled();
  });

  it("should update the active motion and process its stop signal", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeCutsceneState = createCutsceneState();
    const manager: CutsceneManager = new CutsceneManager(object, state);
    const motion = { stopEffect: jest.fn(), update: jest.fn() } as unknown as CameraEffectorSet;

    state.signals = new LuaTable();
    state.signals.set("cam_effector_stop", true);
    manager.motion = motion;
    jest.spyOn(manager, "onCutscene").mockImplementation(() => {});

    manager.update();

    expect(motion.update).toHaveBeenCalledTimes(1);
    expect(motion.stopEffect).toHaveBeenCalledTimes(1);
    expect(manager.onCutscene).toHaveBeenCalledTimes(1);
    expect(state.signals.get("cam_effector_stop")).toBeNull();
  });

  it("should select and start the next configured camera motion", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeCutsceneState = createCutsceneState();
    const manager: CutsceneManager = new CutsceneManager(object, state);

    mockRegisteredActor();

    manager.selectNextMotion();

    expect(manager.motion).toBeInstanceOf(CameraEffectorSet);
    expect(manager.motionId).toBe(2);
    expect(manager.motion?.isPlaying).toBe(true);
    expect(level.add_cam_effector).toHaveBeenCalledWith(
      "camera_effects\\first_motion.anm",
      210408,
      false,
      "engine.effector_callback"
    );
  });

  it("should teleport the actor, disable UI, and begin the cutscene on zone entry", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeCutsceneState = createCutsceneState();
    const manager: CutsceneManager = new CutsceneManager(object, state);
    const { actorGameObject } = mockRegisteredActor();
    const teleportActor = jest.fn();
    const actorInputManager: ActorInputManager = getManager(ActorInputManager);

    state.ppEffector = "cutscene.ppe";
    extern("xr_effects", { teleport_actor: teleportActor });
    jest.spyOn(manager, "selectNextMotion").mockImplementation(() => {});
    jest.spyOn(actorInputManager, "disableGameUi").mockImplementation(() => {});

    manager.onZoneEnter();

    expect(manager.sceneState).toBe(ESceneState.RUN);
    expect(teleportActor).toHaveBeenCalledWith(actorGameObject, object, [state.point, state.look]);
    expect(level.add_pp_effector).toHaveBeenCalledWith("cutscene.ppe", 234, false);
    expect(actorInputManager.disableGameUi).toHaveBeenCalledWith(true);
    expect(manager.isUiDisabled).toBe(true);
    expect(manager.selectNextMotion).toHaveBeenCalledTimes(1);
  });

  it("should restore UI and emit completion after the final motion releases", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeCutsceneState = createCutsceneState();
    const manager: CutsceneManager = new CutsceneManager(object, state);
    const { actorGameObject } = mockRegisteredActor();
    const actorInputManager: ActorInputManager = getManager(ActorInputManager);

    state.signals = new LuaTable();
    manager.isPostprocess = true;
    manager.isUiDisabled = true;
    manager.motionId = 2;
    manager.motion = { state: EEffectorState.RELEASE } as CameraEffectorSet;
    MockPatrol.setup({
      look_path: {
        points: [{ flag: 0, gvid: 0, lvid: 0, name: "look", position: actorGameObject.position() as any }],
      },
      point_path: {
        points: [{ flag: 0, gvid: 0, lvid: 0, name: "point", position: actorGameObject.position() as any }],
      },
    });
    jest.spyOn(actorGameObject, "is_talking").mockReturnValue(false);
    jest.spyOn(actorInputManager, "enableGameUi").mockImplementation(() => {});

    manager.onCutscene();

    expect(manager.motion).toBeNull();
    expect(manager.isPostprocess).toBe(false);
    expect(manager.isUiDisabled).toBe(false);
    expect(level.remove_complex_effector).toHaveBeenCalledWith(1999);
    expect(actorInputManager.enableGameUi).toHaveBeenCalledWith(true);
    expect(actorGameObject.set_actor_direction).toHaveBeenCalled();
    expect(state.signals.get("cameff_end")).toBe(true);
  });

  it("should release script control when the actor is talking", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeCutsceneState = createCutsceneState();
    const manager: CutsceneManager = new CutsceneManager(object, state);
    const { actorGameObject } = mockRegisteredActor();
    const actorInputManager: ActorInputManager = getManager(ActorInputManager);

    state.signals = new LuaTable();
    manager.isUiDisabled = true;
    manager.motionId = 2;
    manager.motion = { state: EEffectorState.RELEASE } as CameraEffectorSet;

    MockPatrol.setup({
      look_path: {
        points: [{ flag: 0, gvid: 0, lvid: 0, name: "look", position: actorGameObject.position() as never }],
      },
      point_path: {
        points: [{ flag: 0, gvid: 0, lvid: 0, name: "point", position: actorGameObject.position() as never }],
      },
    });

    jest.spyOn(actorGameObject, "is_talking").mockReturnValue(true);
    jest.spyOn(actorInputManager, "releaseControl").mockImplementation(() => {});
    jest.spyOn(actorInputManager, "enableGameUi").mockImplementation(() => {});

    manager.onCutscene();

    expect(actorInputManager.releaseControl).toHaveBeenCalledTimes(1);
    expect(actorInputManager.enableGameUi).not.toHaveBeenCalled();
    expect(state.signals.get("cameff_end")).toBe(true);
  });

  it("should continue to the next effector while the set is still playing", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeCutsceneState = createCutsceneState();
    const manager: CutsceneManager = new CutsceneManager(object, state);
    const effect = { anim: "next_motion" };
    const motion = {
      getNextEffector: jest.fn(() => effect),
      isPlaying: true,
      startEffect: jest.fn(),
      state: EEffectorState.START,
    };

    mockRegisteredActor();
    manager.motion = motion as unknown as CameraEffectorSet;

    manager.onCutscene();

    expect(motion.isPlaying).toBe(false);
    expect(motion.startEffect).toHaveBeenCalledWith(effect);
  });

  it("should not start a new effector when the set has none left", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeCutsceneState = createCutsceneState();
    const manager: CutsceneManager = new CutsceneManager(object, state);
    const motion = {
      getNextEffector: jest.fn(() => null),
      isPlaying: true,
      startEffect: jest.fn(),
      state: EEffectorState.START,
    };

    mockRegisteredActor();
    manager.motion = motion as unknown as CameraEffectorSet;

    manager.onCutscene();

    expect(motion.startEffect).not.toHaveBeenCalled();
  });

  it("should enable brighten postprocess for outdoor cutscene at night", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeCutsceneState = createCutsceneState();
    const manager: CutsceneManager = new CutsceneManager(object, state);

    mockRegisteredActor();
    state.isOutdoor = true;

    jest.spyOn(level, "get_time_hours").mockImplementation(() => 23);
    jest.spyOn(manager, "selectNextMotion").mockImplementation(jest.fn());
    jest.spyOn(getManager(ActorInputManager), "disableGameUi").mockImplementation(() => {});

    manager.onZoneEnter();

    expect(manager.isPostprocess).toBe(true);
    expect(level.add_complex_effector).toHaveBeenCalledWith("brighten", 1999);
  });

  it("should not enable brighten postprocess for outdoor cutscene at daytime", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeCutsceneState = createCutsceneState();
    const manager: CutsceneManager = new CutsceneManager(object, state);

    mockRegisteredActor();
    state.isOutdoor = true;

    jest.spyOn(level, "get_time_hours").mockImplementation(() => 12);
    jest.spyOn(manager, "selectNextMotion").mockImplementation(jest.fn());
    jest.spyOn(getManager(ActorInputManager), "disableGameUi").mockImplementation(() => {});

    manager.onZoneEnter();

    expect(manager.isPostprocess).toBe(false);
  });
});
