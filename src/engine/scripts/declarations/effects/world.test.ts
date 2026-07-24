import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { hanging_lamp, level } from "xray16";
import { GameObject, HangingLamp, SoundObject } from "xray16/alias";
import { TRUE, Y_VECTOR } from "xray16/lib";
import {
  MockAlifeItemArtefact,
  MockAlifeItemWeapon,
  MockAlifeObject,
  MockAlifeSimulator,
  MockGameObject,
  MockIniFile,
  MockPatrol,
} from "xray16/mocks";

import { SignalLightBinder } from "@/engine/core/binders/physic";
import { AnomalyZoneBinder } from "@/engine/core/binders/zones";
import {
  getManager,
  IRegistryObjectState,
  registerAnomalyZone,
  registerObject,
  registerSignalLight,
  registerSimulator,
  registerStoryLink,
  registry,
} from "@/engine/core/database";
import { SoundManager, soundsConfig } from "@/engine/core/managers/sounds";
import { LoopedSound } from "@/engine/core/managers/sounds/objects";
import { SurgeManager } from "@/engine/core/managers/surge";
import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import { WeatherManager } from "@/engine/core/managers/weather";
import { ISchemeAnimpointState } from "@/engine/core/schemes/stalker/animpoint";
import { getSchemeStateOptimistic, setSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";
import {
  callXrEffect,
  checkXrEffect,
  mockRegisteredActor,
  mockSchemeState,
  MockSmartTerrain,
  resetRegistry,
} from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/scripts/declarations/effects/world");
});

describe("world effects declaration", () => {
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
  beforeEach(() => {
    resetRegistry();
  });

  it("play_sound should force play sounds", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mockStalker();
    const terrain: MockSmartTerrain = MockSmartTerrain.mockRegistered();
    const soundManager: SoundManager = getManager(SoundManager);

    jest.spyOn(soundManager, "play").mockImplementation(jest.fn(() => null as unknown as SoundObject));

    callXrEffect("play_sound", actorGameObject, object, "test_theme", "test_faction", terrain.name());

    expect(soundManager.play).toHaveBeenCalledTimes(1);
    expect(soundManager.play).toHaveBeenCalledWith(object.id(), "test_theme", "test_faction", terrain.id);

    jest.spyOn(object, "alive").mockImplementation(() => false);

    expect(() => {
      callXrEffect("play_sound", actorGameObject, object, "test_theme", "test_faction", terrain.name());
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
    const terrain: MockSmartTerrain = MockSmartTerrain.mockRegistered();

    jest.spyOn(soundManager, "play").mockImplementation(jest.fn(() => null as unknown as SoundObject));

    registerStoryLink(object.id(), "test-sid");

    callXrEffect(
      "play_sound_by_story",
      actorGameObject,
      object,
      "test-sid",
      "test-theme",
      "test-faction",
      terrain.name()
    );

    expect(soundManager.play).toHaveBeenCalledTimes(1);
    expect(soundManager.play).toHaveBeenCalledWith(object.id(), "test-theme", "test-faction", terrain.id);
  });

  it("reset_sound_npc should reset sound", () => {
    const object: GameObject = MockGameObject.mock();

    callXrEffect("reset_sound_npc", MockGameObject.mockActor(), object);
    expect(soundsConfig.playing.length()).toBe(0);

    const sound: LoopedSound = new LoopedSound(
      MockIniFile.mock("test.ltx", {
        test: {
          path: "testing.ltx",
        },
      }),
      "test"
    );

    soundsConfig.playing.set(object.id(), sound);
    jest.spyOn(sound, "reset").mockImplementation(() => {});

    callXrEffect("reset_sound_npc", MockGameObject.mockActor(), object);

    expect(sound.reset).toHaveBeenCalledWith(object.id());
  });

  it("barrel_explode should explode objects", () => {
    const object: GameObject = MockGameObject.mock();

    registerStoryLink(object.id(), "test-sid");

    callXrEffect("barrel_explode", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid");

    expect(object.explode).toHaveBeenCalledWith(0);
  });

  it("set_game_time should advance the clock to the next requested time and force weather refresh", () => {
    const weatherManager: WeatherManager = getManager(WeatherManager);

    jest.spyOn(level, "get_time_hours").mockReturnValue(12);
    jest.spyOn(level, "get_time_minutes").mockReturnValue(30);
    jest.spyOn(weatherManager, "forceWeatherChange").mockImplementation(jest.fn());

    callXrEffect("set_game_time", MockGameObject.mockActor(), MockGameObject.mock(), "14", "15");

    expect(level.change_game_time).toHaveBeenCalledWith(0, 1, 45);
    expect(weatherManager.forceWeatherChange).toHaveBeenCalledTimes(1);
    expect(surgeConfig.IS_TIME_FORWARDED).toBe(true);
  });

  it("forward_game_time should advance the clock by the requested duration and force weather refresh", () => {
    const weatherManager: WeatherManager = getManager(WeatherManager);

    jest.spyOn(weatherManager, "forceWeatherChange").mockImplementation(jest.fn());

    callXrEffect("forward_game_time", MockGameObject.mockActor(), MockGameObject.mock(), "2", "15");

    expect(level.change_game_time).toHaveBeenCalledWith(0, 2, 15);
    expect(weatherManager.forceWeatherChange).toHaveBeenCalledTimes(1);
    expect(surgeConfig.IS_TIME_FORWARDED).toBe(true);
  });

  it("pick_artefact_from_anomaly should release the matching artefact and spawn it for the target object", () => {
    const object: GameObject = MockGameObject.mock();
    const zone: AnomalyZoneBinder = new AnomalyZoneBinder(MockGameObject.mock());
    const artefact = MockAlifeItemArtefact.mock({ id: 101, section: "af_test" });

    registerSimulator();
    registerAnomalyZone(zone);
    MockAlifeSimulator.addToRegistry(artefact);
    zone.spawnedArtefactsCount = 1;
    zone.artefactPathsByArtefactId.set(artefact.id, "artefact-path");
    jest.spyOn(zone, "onArtefactTaken");

    callXrEffect(
      "pick_artefact_from_anomaly",
      MockGameObject.mockActor(),
      object,
      undefined,
      zone.object.name(),
      "af_test"
    );

    expect(zone.onArtefactTaken).toHaveBeenCalledWith(artefact.id);
    expect(registry.simulator.release).toHaveBeenCalledWith(artefact, true);
    expect(registry.simulator.create).toHaveBeenCalledWith(
      "af_test",
      object.position(),
      object.level_vertex_id(),
      object.game_vertex_id(),
      object.id()
    );
  });

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

  it("turn_off_underpass_lamps should turn off every registered underpass lamp", () => {
    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();
    const firstLamp: HangingLamp = new hanging_lamp();
    const secondLamp: HangingLamp = new hanging_lamp();

    jest.spyOn(first, "get_hanging_lamp").mockReturnValue(firstLamp);
    jest.spyOn(second, "get_hanging_lamp").mockReturnValue(secondLamp);
    registerStoryLink(first.id(), "pas_b400_lamp_start_flash");
    registerStoryLink(second.id(), "pas_b400_lamp_hall_green");

    callXrEffect("turn_off_underpass_lamps", MockGameObject.mockActor(), MockGameObject.mock());

    expect(firstLamp.turn_off).toHaveBeenCalledTimes(1);
    expect(secondLamp.turn_off).toHaveBeenCalledTimes(1);
  });

  it("turn_off should turn off lamps", () => {
    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();

    const firstLamp: HangingLamp = new hanging_lamp();
    const secondLamp: HangingLamp = new hanging_lamp();

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
    const lamp: HangingLamp = new hanging_lamp();

    jest.spyOn(object, "get_hanging_lamp").mockImplementation(() => lamp);

    callXrEffect("turn_off_object", MockGameObject.mockActor(), object);

    expect(object.get_hanging_lamp().turn_off).toHaveBeenCalledTimes(1);
  });

  it("turn_on_and_force should turn on lamps and set force", () => {
    const object: GameObject = MockGameObject.mock();
    const lamp: HangingLamp = new hanging_lamp();

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
    const lamp: HangingLamp = new hanging_lamp();

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
    const lamp: HangingLamp = new hanging_lamp();

    jest.spyOn(object, "get_hanging_lamp").mockImplementation(() => lamp);

    callXrEffect("turn_on_object", MockGameObject.mockActor(), object);

    expect(object.get_hanging_lamp().turn_on).toHaveBeenCalledTimes(1);
  });

  it("turn_on should turn on lamps", () => {
    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();

    const firstLamp: HangingLamp = new hanging_lamp();
    const secondLamp: HangingLamp = new hanging_lamp();

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

  it("set_surge_mess_and_task should configure the surge message and optional task", () => {
    const surgeManager: SurgeManager = getManager(SurgeManager);

    callXrEffect("set_surge_mess_and_task", MockGameObject.mockActor(), MockGameObject.mock(), "surge_message");

    expect(surgeManager.surgeMessage).toBe("surge_message");
    expect(surgeManager.surgeTaskSection).toBe("");

    callXrEffect(
      "set_surge_mess_and_task",
      MockGameObject.mockActor(),
      MockGameObject.mock(),
      "surge_message_with_task",
      "surge_task"
    );

    expect(surgeManager.surgeMessage).toBe("surge_message_with_task");
    expect(surgeManager.surgeTaskSection).toBe("surge_task");
  });

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

  it("launch_signal_rocket should launch signal rockets", () => {
    expect(() => {
      callXrEffect("launch_signal_rocket", MockGameObject.mockActor(), MockGameObject.mock());
    }).toThrow("No signal rocket with name 'nil' on current level.");

    const rocket: SignalLightBinder = new SignalLightBinder(MockGameObject.mock());

    registerSignalLight(rocket);
    jest.spyOn(rocket, "startFly").mockImplementation(() => true);

    callXrEffect("launch_signal_rocket", MockGameObject.mockActor(), MockGameObject.mock(), rocket.object.name());
    expect(rocket.startFly).toHaveBeenCalledTimes(1);
  });

  it("create_cutscene_actor_with_weapon should spawn an actor and clone the active weapon at the patrol point", () => {
    const actor: GameObject = MockGameObject.mockActor();
    const weapon: GameObject = MockGameObject.mock({ section: "wpn_ak74" });
    const actorWeapon = MockAlifeItemWeapon.mock({ id: weapon.id(), section: "wpn_ak74" });
    const cutsceneActor = MockAlifeObject.mock({ id: 501 });
    const cutsceneWeapon = MockAlifeItemWeapon.mock({ id: 502, section: "wpn_ak74" });

    registerSimulator();
    MockAlifeSimulator.addToRegistry(actorWeapon);
    MockPatrol.setup({
      "cutscene-path": {
        points: [{ flag: 0, gvid: 42, lvid: 24, name: "cutscene-point", position: actor.position() as any }],
      },
    });
    jest.spyOn(actor, "active_slot").mockReturnValue(2);
    jest.spyOn(actor, "active_item").mockReturnValue(weapon);
    jest.spyOn(cutsceneWeapon, "clone_addons");
    jest
      .spyOn(registry.simulator, "create")
      .mockImplementationOnce(() => cutsceneActor)
      .mockImplementationOnce(() => cutsceneWeapon);

    callXrEffect(
      "create_cutscene_actor_with_weapon",
      actor,
      MockGameObject.mock(),
      "cutscene_stalker",
      "cutscene-path",
      0,
      90
    );

    expect(registry.simulator.create).toHaveBeenNthCalledWith(1, "cutscene_stalker", actor.position(), 24, 42);
    expect(registry.simulator.create).toHaveBeenNthCalledWith(
      2,
      "wpn_ak74",
      actor.position(),
      24,
      42,
      cutsceneActor.id
    );
    expect(cutsceneWeapon.clone_addons).toHaveBeenCalledWith(actorWeapon);
  });

  it("stop_sr_cutscene should stop cutscenes", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);

    state.activeScheme = EScheme.ANIMPOINT;
    setSchemeState(
      state,
      EScheme.ANIMPOINT,
      mockSchemeState<ISchemeAnimpointState>(EScheme.ANIMPOINT, { signals: new LuaTable() })
    );

    callXrEffect("stop_sr_cutscene", MockGameObject.mockActor(), object);

    expect(getSchemeStateOptimistic(state, EScheme.ANIMPOINT).signals?.get("cam_effector_stop")).toBe(true);
  });
});
