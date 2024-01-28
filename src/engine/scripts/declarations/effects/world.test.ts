import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";

import { AnomalyZoneBinder } from "@/engine/core/binders/zones";
import {
  getManager,
  IRegistryObjectState,
  registerAnomalyZone,
  registerObject,
  registerStoryLink,
} from "@/engine/core/database";
import { SoundManager } from "@/engine/core/managers/sounds";
import { SurgeManager } from "@/engine/core/managers/surge";
import { Y_VECTOR } from "@/engine/lib/constants/vectors";
import { TRUE } from "@/engine/lib/constants/words";
import { EScheme, GameObject, HangingLamp, SoundObject } from "@/engine/lib/types";
import {
  callXrEffect,
  checkXrEffect,
  mockRegisteredActor,
  mockSchemeState,
  MockSmartTerrain,
  resetRegistry,
} from "@/fixtures/engine";
import { MockGameObject, MockHangingLamp } from "@/fixtures/xray";

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
    const object: GameObject = MockGameObject.mockStalker();
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

    jest.spyOn(soundManager, "stop").mockImplementation(jest.fn());

    callXrEffect("stop_sound", MockGameObject.mockActor(), object);

    expect(soundManager.stop).toHaveBeenCalledTimes(1);
    expect(soundManager.stop).toHaveBeenCalledWith(object.id());
  });

  it("play_sound_looped should play looped sounds", () => {
    const soundManager: SoundManager = getManager(SoundManager);
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(soundManager, "playLooped").mockImplementation(jest.fn());

    callXrEffect("play_sound_looped", MockGameObject.mockActor(), object, "test_sound");

    expect(soundManager.playLooped).toHaveBeenCalledTimes(1);
    expect(soundManager.playLooped).toHaveBeenCalledWith(object.id(), "test_sound");
  });

  it("stop_sound_looped should stop looped sounds", () => {
    const soundManager: SoundManager = getManager(SoundManager);
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(soundManager, "stopAllLooped").mockImplementation(jest.fn());

    callXrEffect("stop_sound_looped", MockGameObject.mockActor(), object);

    expect(soundManager.stopAllLooped).toHaveBeenCalledTimes(1);
    expect(soundManager.stopAllLooped).toHaveBeenCalledWith(object.id());
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

  it("barrel_explode should explode objects", () => {
    const object: GameObject = MockGameObject.mock();

    registerStoryLink(object.id(), "test-sid");

    callXrEffect("barrel_explode", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid");

    expect(object.explode).toHaveBeenCalledWith(0);
  });

  it.todo("set_game_time should change game time");

  it.todo("forward_game_time should forward game time");

  it.todo("pick_artefact_from_anomaly should pick artefacts from anomalies");

  it("anomaly_turn_off should turn off anomalies", () => {
    const zone: AnomalyZoneBinder = new AnomalyZoneBinder(MockGameObject.mock());

    registerAnomalyZone(zone);

    jest.spyOn(zone, "turnOff").mockImplementation(jest.fn());

    expect(() => {
      callXrEffect("anomaly_turn_off", MockGameObject.mockActor(), MockGameObject.mock(), "test-not-existing");
    }).toThrow("No anomaly zone with name 'test-not-existing' defined.");

    callXrEffect("anomaly_turn_off", MockGameObject.mockActor(), MockGameObject.mock(), zone.object.name());
    expect(zone.turnOff).toHaveBeenCalled();
  });

  it("anomaly_turn_on should turn on anomalies", () => {
    const zone: AnomalyZoneBinder = new AnomalyZoneBinder(MockGameObject.mock());

    registerAnomalyZone(zone);

    jest.spyOn(zone, "turnOn").mockImplementation(jest.fn());

    expect(() => {
      callXrEffect("anomaly_turn_on", MockGameObject.mockActor(), MockGameObject.mock(), "test-not-existing");
    }).toThrow("No anomaly zone with name 'test-not-existing' defined.");

    callXrEffect("anomaly_turn_on", MockGameObject.mockActor(), MockGameObject.mock(), zone.object.name());
    expect(zone.turnOn).toHaveBeenCalledTimes(1);
    expect(zone.turnOn).toHaveBeenCalledWith(false);

    callXrEffect("anomaly_turn_on", MockGameObject.mockActor(), MockGameObject.mock(), zone.object.name(), TRUE);
    expect(zone.turnOn).toHaveBeenCalledTimes(2);
    expect(zone.turnOn).toHaveBeenCalledWith(true);
  });

  it.todo("turn_off_underpass_lamps should turn off underpass lamps");

  it("turn_off should turn off lamps", () => {
    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();

    const firstLamp: HangingLamp = MockHangingLamp.mock();
    const secondLamp: HangingLamp = MockHangingLamp.mock();

    jest.spyOn(first, "get_hanging_lamp").mockImplementation(() => firstLamp);
    jest.spyOn(second, "get_hanging_lamp").mockImplementation(() => secondLamp);

    expect(() => {
      callXrEffect("turn_off", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid-not-existing");
    }).toThrow("Object with story id 'test-sid-not-existing' does not exist.");

    registerStoryLink(first.id(), "test-sid-1");
    registerStoryLink(second.id(), "test-sid-2");

    callXrEffect("turn_off", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid-1", "test-sid-2");

    expect(first.get_hanging_lamp().turn_off).toHaveBeenCalledTimes(1);
    expect(second.get_hanging_lamp().turn_off).toHaveBeenCalledTimes(1);
  });

  it("turn_off_object should turn off lamps", () => {
    const object: GameObject = MockGameObject.mock();
    const lamp: HangingLamp = MockHangingLamp.mock();

    jest.spyOn(object, "get_hanging_lamp").mockImplementation(() => lamp);

    callXrEffect("turn_off_object", MockGameObject.mockActor(), object);

    expect(object.get_hanging_lamp().turn_off).toHaveBeenCalledTimes(1);
  });

  it("turn_on_and_force should turn on lamps and set force", () => {
    const object: GameObject = MockGameObject.mock();
    const lamp: HangingLamp = MockHangingLamp.mock();

    jest.spyOn(object, "get_hanging_lamp").mockImplementation(() => lamp);

    registerStoryLink(object.id(), "test-sid");

    expect(() => {
      callXrEffect("turn_on_and_force", MockGameObject.mockActor(), MockGameObject.mock(), "not-existing");
    }).toThrow("Object with story id 'not-existing' does not exist.");

    callXrEffect("turn_on_and_force", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid");

    expect(object.get_hanging_lamp().turn_on).toHaveBeenCalledTimes(1);
    expect(object.start_particles).toHaveBeenCalledWith("weapons\\light_signal", "link");
    expect(object.set_const_force).toHaveBeenCalledWith(Y_VECTOR, 55, 14_000);

    callXrEffect("turn_on_and_force", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid", 40, 15_000);

    expect(object.set_const_force).toHaveBeenCalledTimes(2);
    expect(object.set_const_force).toHaveBeenCalledWith(Y_VECTOR, 40, 15_000);
  });

  it("turn_off_and_force should turn off lamps and set force", () => {
    const object: GameObject = MockGameObject.mock();
    const lamp: HangingLamp = MockHangingLamp.mock();

    jest.spyOn(object, "get_hanging_lamp").mockImplementation(() => lamp);

    registerStoryLink(object.id(), "test-sid");

    expect(() => {
      callXrEffect("turn_off_and_force", MockGameObject.mockActor(), MockGameObject.mock(), "not-existing");
    }).toThrow("Object with story id 'not-existing' does not exist.");

    callXrEffect("turn_off_and_force", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid");

    expect(object.get_hanging_lamp().turn_off).toHaveBeenCalledTimes(1);
    expect(object.stop_particles).toHaveBeenCalledWith("weapons\\light_signal", "link");
  });

  it("turn_on_object should turn on lamps", () => {
    const object: GameObject = MockGameObject.mock();
    const lamp: HangingLamp = MockHangingLamp.mock();

    jest.spyOn(object, "get_hanging_lamp").mockImplementation(() => lamp);

    callXrEffect("turn_on_object", MockGameObject.mockActor(), object);

    expect(object.get_hanging_lamp().turn_on).toHaveBeenCalledTimes(1);
  });

  it("turn_on should turn on lamps", () => {
    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();

    const firstLamp: HangingLamp = MockHangingLamp.mock();
    const secondLamp: HangingLamp = MockHangingLamp.mock();

    jest.spyOn(first, "get_hanging_lamp").mockImplementation(() => firstLamp);
    jest.spyOn(second, "get_hanging_lamp").mockImplementation(() => secondLamp);

    expect(() => {
      callXrEffect("turn_on", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid-not-existing");
    }).toThrow("Object with story id 'test-sid-not-existing' does not exist.");

    registerStoryLink(first.id(), "test-sid-1");
    registerStoryLink(second.id(), "test-sid-2");

    callXrEffect("turn_on", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid-1", "test-sid-2");

    expect(first.get_hanging_lamp().turn_on).toHaveBeenCalledTimes(1);
    expect(second.get_hanging_lamp().turn_on).toHaveBeenCalledTimes(1);
  });

  it("set_weather should change game weather", () => {
    callXrEffect("set_weather", MockGameObject.mockActor(), MockGameObject.mock());
    expect(level.set_weather).not.toHaveBeenCalled();

    callXrEffect("set_weather", MockGameObject.mockActor(), MockGameObject.mock(), "test-weather-1");
    expect(level.set_weather).toHaveBeenCalledTimes(1);
    expect(level.set_weather).toHaveBeenCalledWith("test-weather-1", false);

    callXrEffect("set_weather", MockGameObject.mockActor(), MockGameObject.mock(), "test-weather-2", TRUE);
    expect(level.set_weather).toHaveBeenCalledTimes(2);
    expect(level.set_weather).toHaveBeenCalledWith("test-weather-2", true);
  });

  it("start_surge should stop sounds", () => {
    const surgeManager: SurgeManager = getManager(SurgeManager);
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(surgeManager, "requestSurgeStart").mockImplementation(jest.fn());

    callXrEffect("start_surge", MockGameObject.mockActor(), object);

    expect(surgeManager.requestSurgeStart).toHaveBeenCalledTimes(1);
  });

  it("stop_surge should stop sounds", () => {
    const surgeManager: SurgeManager = getManager(SurgeManager);
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(surgeManager, "requestSurgeStop").mockImplementation(jest.fn());

    callXrEffect("stop_surge", MockGameObject.mockActor(), object);

    expect(surgeManager.requestSurgeStop).toHaveBeenCalledTimes(1);
  });

  it.todo("set_surge_mess_and_task should set surge message and task");

  it("enable_anomaly should enable anomalies", () => {
    const object: GameObject = MockGameObject.mock();

    registerStoryLink(object.id(), "test-sid");

    expect(() => {
      callXrEffect("enable_anomaly", MockGameObject.mockActor(), MockGameObject.mock());
    }).toThrow("Story id for 'enable_anomaly' effect is not provided.");

    expect(() => {
      callXrEffect("enable_anomaly", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid-not-existing");
    }).toThrow("There is no anomaly with story id 'test-sid-not-existing'.");

    callXrEffect("enable_anomaly", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid");
    expect(object.enable_anomaly).toHaveBeenCalledTimes(1);
  });

  it("disable_anomaly should disable anomalies", () => {
    const object: GameObject = MockGameObject.mock();

    registerStoryLink(object.id(), "test-sid");

    expect(() => {
      callXrEffect("disable_anomaly", MockGameObject.mockActor(), MockGameObject.mock());
    }).toThrow("Story id for 'disable_anomaly' effect is not provided.");

    expect(() => {
      callXrEffect("disable_anomaly", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid-not-existing");
    }).toThrow("There is no anomaly with story id 'test-sid-not-existing'.");

    callXrEffect("disable_anomaly", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid");
    expect(object.disable_anomaly).toHaveBeenCalledTimes(1);
  });

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
