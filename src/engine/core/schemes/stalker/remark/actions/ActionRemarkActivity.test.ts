import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";
import { GameObject, SoundObject } from "xray16/alias";
import { NIL } from "xray16/lib";
import { MockGameObject, MockPropertyStorage, MockSoundObject } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { EStalkerState } from "@/engine/core/animation/types";
import { getManager, registerObject, registerStoryLink, setStalkerState } from "@/engine/core/database";
import { parseConditionsList } from "@/engine/core/ini";
import { simulationConfig } from "@/engine/core/managers/simulation/SimulationConfig";
import { SoundManager } from "@/engine/core/managers/sounds/SoundManager";
import { getTerrainObjectIdByJobSection } from "@/engine/core/objects/smart_terrain/job";
import { ActionRemarkActivity, initTarget } from "@/engine/core/schemes/stalker/remark/actions/ActionRemarkActivity";
import { ISchemeRemarkState } from "@/engine/core/schemes/stalker/remark/remark_types";
import { EScheme } from "@/engine/core/schemes/types";
import { mockRegisteredActor, mockSchemeState, MockSmartTerrain, patrols, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/database/stalker", () => ({ setStalkerState: jest.fn() }));
jest.mock("@/engine/core/objects/smart_terrain/job", () => ({ getTerrainObjectIdByJobSection: jest.fn(() => null) }));

function createAction(base: Partial<ISchemeRemarkState> = {}): {
  action: ActionRemarkActivity;
  object: GameObject;
  state: ISchemeRemarkState;
} {
  const object: GameObject = MockGameObject.mock();
  const state: ISchemeRemarkState = mockSchemeState<ISchemeRemarkState>(EScheme.REMARK, {
    anim: parseConditionsList(EStalkerState.HELLO),
    snd: null,
    sndAnimSync: false,
    target: NIL,
    ...base,
  });
  const action: ActionRemarkActivity = new ActionRemarkActivity(state);

  registerObject(object);
  action.setup(object, MockPropertyStorage.mock());

  return { action, object, state };
}

describe("ActionRemarkActivity", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(setStalkerState);
    resetFunctionMock(getTerrainObjectIdByJobSection);
    resetFunctionMock(level.object_by_id);
    replaceFunctionMock(getTerrainObjectIdByJobSection, () => null);
    mockRegisteredActor();
  });

  it("should fix position and direction on initialize", () => {
    const { action, object } = createAction();

    action.initialize();

    expect(object.set_desired_position).toHaveBeenCalledTimes(1);
    expect(object.set_desired_direction).toHaveBeenCalledTimes(1);
  });

  it("should reset state machine on activation", () => {
    const { action, state } = createAction({ snd: "remark_sound", sndAnimSync: false });

    action.activate();

    expect(state.signals).toEqualLuaTables({});
    expect(action.soundEndSignalled).toBe(false);
    expect(action.actionEndSignalled).toBe(false);
    expect(action.animEndSignalled).toBe(false);
    expect(action.animScheduled).toBe(true);
    expect(action.sndScheduled).toBe(true);
    expect(action.sndStarted).toBe(false);
    expect(action.tipsSound).toBeNull();
  });

  it("should not schedule sound when synced with animation", () => {
    const { action } = createAction({ snd: "remark_sound", sndAnimSync: true });

    action.activate();

    expect(action.sndScheduled).toBe(false);
  });

  it("should stop tips sound on finalize", () => {
    const { action } = createAction();
    const sound: SoundObject = MockSoundObject.mock("test");

    action.initialize();
    action.tipsSound = sound;
    action.finalize();

    expect(sound.stop).toHaveBeenCalledTimes(1);
  });

  it("should play animation without target", () => {
    const { action, object } = createAction();

    action.activate();
    action.execute();

    expect(setStalkerState).toHaveBeenCalledWith(object, EStalkerState.HELLO, expect.anything(), 0);
  });

  it("should play animation with resolved target", () => {
    const target: GameObject = MockGameObject.mock();
    const { action, object } = createAction({ target: "story|target_sid" });

    registerObject(target);
    registerStoryLink(target.id(), "target_sid");
    replaceFunctionMock(level.object_by_id, () => target);

    action.activate();
    action.execute();

    expect(setStalkerState).toHaveBeenCalledWith(object, EStalkerState.HELLO, expect.anything(), 0, {
      lookObjectId: target.id(),
      lookPosition: null,
    });
  });

  it("should do nothing while animation is playing", () => {
    const { action } = createAction();

    action.activate();
    action.execute();
    resetFunctionMock(setStalkerState);

    action.execute();

    expect(setStalkerState).not.toHaveBeenCalled();
  });

  it("should play sound and signal animation end after animation callback", () => {
    const { action, object, state } = createAction({ snd: "remark_sound" });
    const soundManager: SoundManager = getManager(SoundManager);

    jest.spyOn(soundManager, "play").mockImplementation(() => null);

    action.activate();
    action.execute();

    action.onAnimationUpdate();

    expect(action.sndStarted).toBe(true);
    expect(soundManager.play).toHaveBeenCalledWith(object.id(), "remark_sound");
    expect(action.animEndSignalled).toBe(true);
    expect(state.signals?.get("anim_end")).toBe(true);
    expect(action.actionEndSignalled).toBe(false);
  });

  it("should signal action end once sound end is reported", () => {
    const { action, state } = createAction();

    action.activate();
    action.execute();
    action.onAnimationUpdate();

    state.signals?.set("sound_end", true);
    action.update();

    expect(action.soundEndSignalled).toBe(true);
    expect(action.actionEndSignalled).toBe(true);
    expect(state.signals?.get("action_end")).toBe(true);
  });

  it("should signal action end for theme end as well", () => {
    const { action, state } = createAction();

    action.activate();
    action.execute();
    action.onAnimationUpdate();

    state.signals?.set("theme_end", true);
    action.update();

    expect(action.actionEndSignalled).toBe(true);
  });
});

describe("initTarget", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(getTerrainObjectIdByJobSection);
    replaceFunctionMock(getTerrainObjectIdByJobSection, () => null);
  });

  it("should treat nil target as not initialized", () => {
    const object: GameObject = MockGameObject.mock();

    registerObject(object);

    expect(initTarget(object, NIL)).toEqual([null, null, false]);
  });

  it("should resolve story target", () => {
    const object: GameObject = MockGameObject.mock();
    const target: GameObject = MockGameObject.mock();

    registerObject(object);
    registerObject(target);
    registerStoryLink(target.id(), "target_sid");

    expect(initTarget(object, "story|target_sid")).toEqual([null, target.id(), true]);
  });

  it("should resolve path target", () => {
    const object: GameObject = MockGameObject.mock();

    registerObject(object);

    expect(initTarget(object, "path|test-wp,1")).toEqual([patrols["test-wp"].points[1].position, null, true]);
  });

  it("should not initialize path target without point index", () => {
    const object: GameObject = MockGameObject.mock();

    registerObject(object);

    expect(initTarget(object, "path|test-wp")).toEqual([null, null, false]);
  });

  it("should resolve job target in named terrain", () => {
    const object: GameObject = MockGameObject.mock();

    registerObject(object);
    simulationConfig.TERRAINS.set("test-smart", MockSmartTerrain.mock("test-smart"));
    replaceFunctionMock(getTerrainObjectIdByJobSection, () => 505);

    expect(initTarget(object, "job|walker_1,test-smart")).toEqual([null, 505, true]);
  });

  it("should not initialize job target without resolved object", () => {
    const object: GameObject = MockGameObject.mock();

    registerObject(object);

    expect(initTarget(object, "job|walker_1,test-smart")).toEqual([null, null, false]);
  });

  it("should fail for malformed target values", () => {
    const object: GameObject = MockGameObject.mock();

    registerObject(object);

    expect(() => initTarget(object, "story")).toThrow("Wrong target field for object");
    expect(() => initTarget(object, "|value")).toThrow("Wrong target field for object");
    expect(() => initTarget(object, "type|")).toThrow("Wrong target field for object");
    expect(() => initTarget(object, "unknown|value")).toThrow("Wrong target field for object");
    expect(() => initTarget(object, null as never)).toThrow("Wrong target field for object");
  });
});
