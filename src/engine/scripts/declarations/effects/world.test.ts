import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";

import { getManager, IRegistryObjectState, registerObject, registerStoryLink } from "@/engine/core/database";
import { SoundManager } from "@/engine/core/managers/sounds";
import { EScheme, GameObject, SoundObject } from "@/engine/lib/types";
import {
  callXrEffect,
  checkXrEffect,
  mockRegisteredActor,
  mockSchemeState,
  MockSmartTerrain,
  resetRegistry,
} from "@/fixtures/engine";
import { mockClsid, MockGameObject } from "@/fixtures/xray";

describe("world effects declaration", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/effects/world");
  });

  it("should correctly inject external methods for game", () => {
    checkXrEffect("play_sound");
    checkXrEffect("stop_sound");
    checkXrEffect("play_sound_looped");
    checkXrEffect("stop_sound_looped");
    checkXrEffect("play_sound_by_story");
    checkXrEffect("reset_sound_npc");
    checkXrEffect("barrel_explode");
    checkXrEffect("set_game_time");
    checkXrEffect("forward_game_time");
    checkXrEffect("pick_artefact_from_anomaly");
    checkXrEffect("anomaly_turn_off");
    checkXrEffect("anomaly_turn_on");
    checkXrEffect("turn_off_underpass_lamps");
    checkXrEffect("turn_off");
    checkXrEffect("turn_off_object");
    checkXrEffect("turn_on_and_force");
    checkXrEffect("turn_off_and_force");
    checkXrEffect("turn_on_object");
    checkXrEffect("turn_on");
    checkXrEffect("set_weather");
    checkXrEffect("start_surge");
    checkXrEffect("stop_surge");
    checkXrEffect("set_surge_mess_and_task");
    checkXrEffect("enable_anomaly");
    checkXrEffect("disable_anomaly");
    checkXrEffect("launch_signal_rocket");
    checkXrEffect("create_cutscene_actor_with_weapon");
    checkXrEffect("stop_sr_cutscene");
  });
});

describe("world effects implementation", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/effects/world");
  });

  beforeEach(() => {
    resetRegistry();
  });

  it("play_sound should force play sounds", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mock({ clsid: <T>() => mockClsid.script_stalker as T });
    const smartTerrain: MockSmartTerrain = MockSmartTerrain.mockRegistered();
    const soundManager: SoundManager = getManager(SoundManager);

    jest.spyOn(soundManager, "play").mockImplementation(jest.fn(() => null as unknown as SoundObject));

    callXrEffect("play_sound", actorGameObject, object, "test_theme", "test_faction", smartTerrain.name());

    expect(soundManager.play).toHaveBeenCalledTimes(1);
    expect(soundManager.play).toHaveBeenCalledWith(object.id(), "test_theme", "test_faction", smartTerrain.id);

    jest.spyOn(object, "alive").mockImplementation(() => false);

    expect(() => {
      callXrEffect("play_sound", actorGameObject, object, "test_theme", "test_faction", smartTerrain.name());
    }).toThrow(`Stalker '${object.name()}' is dead while trying to play theme sound 'test_theme'.`);
  });

  it("stop_sound should stop sounds", () => {
    const soundManager: SoundManager = getManager(SoundManager);
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(soundManager, "stopSoundByObjectId").mockImplementation(jest.fn());

    callXrEffect("stop_sound", MockGameObject.mockActor(), object);

    expect(soundManager.stopSoundByObjectId).toHaveBeenCalledTimes(1);
    expect(soundManager.stopSoundByObjectId).toHaveBeenCalledWith(object.id());
  });

  it("play_sound_looped should play looped sounds", () => {
    const soundManager: SoundManager = getManager(SoundManager);
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(soundManager, "playLoopedSound").mockImplementation(jest.fn());

    callXrEffect("play_sound_looped", MockGameObject.mockActor(), object, "test_sound");

    expect(soundManager.playLoopedSound).toHaveBeenCalledTimes(1);
    expect(soundManager.playLoopedSound).toHaveBeenCalledWith(object.id(), "test_sound");
  });

  it("stop_sound_looped should stop looped sounds", () => {
    const soundManager: SoundManager = getManager(SoundManager);
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(soundManager, "stopLoopedSound").mockImplementation(jest.fn());

    callXrEffect("stop_sound_looped", MockGameObject.mockActor(), object);

    expect(soundManager.stopLoopedSound).toHaveBeenCalledTimes(1);
    expect(soundManager.stopLoopedSound).toHaveBeenCalledWith(object.id(), null);
  });

  it("play_sound_by_story should play sound by story id", () => {
    const { actorGameObject } = mockRegisteredActor();

    const object: GameObject = MockGameObject.mock();
    const soundManager: SoundManager = getManager(SoundManager);
    const smartTerrain: MockSmartTerrain = MockSmartTerrain.mockRegistered();

    jest.spyOn(soundManager, "play").mockImplementation(jest.fn(() => null as unknown as SoundObject));

    registerStoryLink(object.id(), "test-sid");

    callXrEffect(
      "play_sound_by_story",
      actorGameObject,
      object,
      "test-sid",
      "test-theme",
      "test-faction",
      smartTerrain.name()
    );

    expect(soundManager.play).toHaveBeenCalledTimes(1);
    expect(soundManager.play).toHaveBeenCalledWith(object.id(), "test-theme", "test-faction", smartTerrain.id);
  });

  it.todo("reset_sound_npc should reset sound");

  it.todo("barrel_explode should explode objects");

  it.todo("set_game_time should change game time");

  it.todo("forward_game_time should forward game time");

  it.todo("pick_artefact_from_anomaly should pick artefacts from anomalies");

  it.todo("anomaly_turn_off should turn off anomalies");

  it.todo("anomaly_turn_on should turn on anomalies");

  it.todo("turn_off_underpass_lamps should turn off underpass lamps");

  it.todo("turn_off should turn off lamps");

  it.todo("turn_off_object should turn off lamps");

  it.todo("turn_on_and_force should turn on lamps and set force");

  it.todo("turn_off_and_force should turn off lamps and set force");

  it.todo("turn_on_object should turn on lamps");

  it.todo("turn_on should turn on lamps");

  it.todo("set_weather should change weather");

  it.todo("start_surge should start surge");

  it.todo("stop_surge should stop surge");

  it.todo("set_surge_mess_and_task should set surge message and task");

  it.todo("enable_anomaly should enable anomalies");

  it.todo("disable_anomaly should disable anomalies");

  it.todo("launch_signal_rocket should launch signal rockets");

  it.todo("create_cutscene_actor_with_weapon should create cutscenes");

  it("stop_sr_cutscene should stop cutscenes", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);

    state.activeScheme = EScheme.ANIMPOINT;
    state[EScheme.ANIMPOINT] = mockSchemeState(EScheme.ANIMPOINT, { signals: new LuaTable() });

    callXrEffect("stop_sr_cutscene", MockGameObject.mockActor(), object);

    expect(state[EScheme.ANIMPOINT]?.signals?.get("cam_effector_stop")).toBe(true);
  });
});
