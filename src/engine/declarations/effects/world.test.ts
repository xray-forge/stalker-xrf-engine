import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { hanging_lamp, level } from "xray16";
import { GameObject, HangingLamp, SoundObject } from "xray16/alias";
import { TRUE, TSection, Y_VECTOR } from "xray16/lib";
import {
  MockAlifeHumanStalker,
  MockAlifeItemArtefact,
  MockAlifeItemWeapon,
  MockAlifeObject,
  MockAlifeSimulator,
  MockGameObject,
  MockIniFile,
  MockPatrol,
} from "xray16/mocks";

import { questItems } from "@/engine/constants/items/quest_items";
import { weapons } from "@/engine/constants/items/weapons";
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
import { callXrEffect, mockRegisteredActor, mockSchemeState, MockSmartTerrain, resetRegistry } from "@/fixtures/engine";

/**
 * Register a simulator, a cutscene patrol path and an actor carrying a weapon of the provided section.
 */
function mockCutsceneSetup(section: TSection = "wpn_ak74"): { actor: GameObject; weapon: GameObject } {
  const actor: GameObject = MockGameObject.mockActor();
  const weapon: GameObject = MockGameObject.mock({ section });

  registerSimulator();
  MockAlifeSimulator.addToRegistry(MockAlifeItemWeapon.mock({ id: weapon.id(), section }));
  MockPatrol.setup({
    "cutscene-path": {
      points: [{ flag: 0, gvid: 42, lvid: 24, name: "cutscene-point", position: actor.position() as never }],
    },
  });

  return { actor, weapon };
}

beforeAll(() => {
  require("@/engine/declarations/effects/world");
});

beforeEach(() => {
  resetRegistry();
});

describe("play_sound", () => {
  it("should force play sounds", () => {
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
});

describe("stop_sound", () => {
  it("should stop sounds", () => {
    const soundManager: SoundManager = getManager(SoundManager);
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(soundManager, "stop").mockImplementation(jest.fn());

    callXrEffect("stop_sound", MockGameObject.mockActor(), object);

    expect(soundManager.stop).toHaveBeenCalledTimes(1);
    expect(soundManager.stop).toHaveBeenCalledWith(object.id());
  });
});

describe("play_sound_looped", () => {
  it("should play looped sounds", () => {
    const soundManager: SoundManager = getManager(SoundManager);
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(soundManager, "playLooped").mockImplementation(jest.fn());

    callXrEffect("play_sound_looped", MockGameObject.mockActor(), object, "test_sound");

    expect(soundManager.playLooped).toHaveBeenCalledTimes(1);
    expect(soundManager.playLooped).toHaveBeenCalledWith(object.id(), "test_sound");
  });
});

describe("stop_sound_looped", () => {
  it("should stop looped sounds", () => {
    const soundManager: SoundManager = getManager(SoundManager);
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(soundManager, "stopAllLooped").mockImplementation(jest.fn());

    callXrEffect("stop_sound_looped", MockGameObject.mockActor(), object);

    expect(soundManager.stopAllLooped).toHaveBeenCalledTimes(1);
    expect(soundManager.stopAllLooped).toHaveBeenCalledWith(object.id());
  });
});

describe("play_sound_by_story", () => {
  it("should play sound by story id", () => {
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
});

describe("reset_sound_npc", () => {
  it("should reset sound", () => {
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
});

describe("barrel_explode", () => {
  it("should explode objects", () => {
    const object: GameObject = MockGameObject.mock();

    registerStoryLink(object.id(), "test-sid");

    callXrEffect("barrel_explode", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid");

    expect(object.explode).toHaveBeenCalledWith(0);
  });
});

describe("set_game_time", () => {
  it("should advance the clock to the next requested time and force weather refresh", () => {
    const weatherManager: WeatherManager = getManager(WeatherManager);

    jest.spyOn(level, "get_time_hours").mockReturnValue(12);
    jest.spyOn(level, "get_time_minutes").mockReturnValue(30);
    jest.spyOn(weatherManager, "forceWeatherChange").mockImplementation(jest.fn());

    callXrEffect("set_game_time", MockGameObject.mockActor(), MockGameObject.mock(), "14", "15");

    expect(level.change_game_time).toHaveBeenCalledWith(0, 1, 45);
    expect(weatherManager.forceWeatherChange).toHaveBeenCalledTimes(1);
    expect(surgeConfig.IS_TIME_FORWARDED).toBe(true);
  });

  it("should wrap to the next day when the requested hour already passed", () => {
    jest.spyOn(getManager(WeatherManager), "forceWeatherChange").mockImplementation(jest.fn());
    jest.spyOn(level, "get_time_hours").mockReturnValue(20);
    jest.spyOn(level, "get_time_minutes").mockReturnValue(30);

    callXrEffect("set_game_time", MockGameObject.mockActor(), MockGameObject.mock(), "8", "45");

    expect(level.change_game_time).toHaveBeenCalledWith(0, 12, 15);
  });

  it("should only move the minutes when the requested hour is the current one", () => {
    jest.spyOn(getManager(WeatherManager), "forceWeatherChange").mockImplementation(jest.fn());
    jest.spyOn(level, "get_time_hours").mockReturnValue(12);
    jest.spyOn(level, "get_time_minutes").mockReturnValue(10);

    callXrEffect("set_game_time", MockGameObject.mockActor(), MockGameObject.mock(), "12", "40");

    expect(level.change_game_time).toHaveBeenCalledWith(0, 0, 30);
  });

  it("should default the minutes to zero when they are not provided", () => {
    jest.spyOn(getManager(WeatherManager), "forceWeatherChange").mockImplementation(jest.fn());
    jest.spyOn(level, "get_time_hours").mockReturnValue(10);
    jest.spyOn(level, "get_time_minutes").mockReturnValue(20);

    callXrEffect("set_game_time", MockGameObject.mockActor(), MockGameObject.mock(), "12");

    expect(level.change_game_time).toHaveBeenCalledWith(0, 1, 40);
  });
});

describe("forward_game_time", () => {
  it("should advance the clock by the requested duration and force weather refresh", () => {
    const weatherManager: WeatherManager = getManager(WeatherManager);

    jest.spyOn(weatherManager, "forceWeatherChange").mockImplementation(jest.fn());

    callXrEffect("forward_game_time", MockGameObject.mockActor(), MockGameObject.mock(), "2", "15");

    expect(level.change_game_time).toHaveBeenCalledWith(0, 2, 15);
    expect(weatherManager.forceWeatherChange).toHaveBeenCalledTimes(1);
    expect(surgeConfig.IS_TIME_FORWARDED).toBe(true);
  });
});

describe("pick_artefact_from_anomaly", () => {
  it("should release the matching artefact and spawn it for the target object", () => {
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

  it("should resolve the target object through its story id", () => {
    const stalker = MockAlifeHumanStalker.mock({ id: 111 });
    const zone: AnomalyZoneBinder = new AnomalyZoneBinder(MockGameObject.mock());
    const artefact = MockAlifeItemArtefact.mock({ id: 112, section: "af_test" });

    registerSimulator();
    registerAnomalyZone(zone);
    registerStoryLink(stalker.id, "anomaly-target");
    MockAlifeSimulator.addToRegistry(artefact);
    zone.spawnedArtefactsCount = 1;
    zone.artefactPathsByArtefactId.set(artefact.id, "artefact-path");
    jest.spyOn(zone, "onArtefactTaken");

    callXrEffect(
      "pick_artefact_from_anomaly",
      MockGameObject.mockActor(),
      null as unknown as GameObject,
      "anomaly-target",
      zone.object.name(),
      "af_test"
    );

    expect(zone.onArtefactTaken).toHaveBeenCalledWith(artefact.id);
  });

  it("should take the first artefact when no section is requested", () => {
    const object: GameObject = MockGameObject.mock();
    const zone: AnomalyZoneBinder = new AnomalyZoneBinder(MockGameObject.mock());
    const artefact = MockAlifeItemArtefact.mock({ id: 121, section: "af_other" });

    registerSimulator();
    registerAnomalyZone(zone);
    MockAlifeSimulator.addToRegistry(artefact);
    zone.spawnedArtefactsCount = 1;
    zone.artefactPathsByArtefactId.set(artefact.id, "artefact-path");

    callXrEffect("pick_artefact_from_anomaly", MockGameObject.mockActor(), object, undefined, zone.object.name());

    expect(registry.simulator.release).toHaveBeenCalledWith(artefact, true);
    expect(registry.simulator.create).toHaveBeenCalledWith(
      "af_other",
      object.position(),
      object.level_vertex_id(),
      object.game_vertex_id(),
      object.id()
    );
  });

  it("should do nothing when the zone has no spawned artefacts", () => {
    const zone: AnomalyZoneBinder = new AnomalyZoneBinder(MockGameObject.mock());

    registerSimulator();
    registerAnomalyZone(zone);
    zone.spawnedArtefactsCount = 0;

    callXrEffect(
      "pick_artefact_from_anomaly",
      MockGameObject.mockActor(),
      MockGameObject.mock(),
      undefined,
      zone.object.name(),
      "af_test"
    );

    expect(registry.simulator.release).not.toHaveBeenCalled();
  });

  it("should do nothing when the requested section is not in the zone", () => {
    const zone: AnomalyZoneBinder = new AnomalyZoneBinder(MockGameObject.mock());
    const artefact = MockAlifeItemArtefact.mock({ id: 131, section: "af_other" });

    registerSimulator();
    registerAnomalyZone(zone);
    MockAlifeSimulator.addToRegistry(artefact);
    zone.spawnedArtefactsCount = 1;
    zone.artefactPathsByArtefactId.set(artefact.id, "artefact-path");

    callXrEffect(
      "pick_artefact_from_anomaly",
      MockGameObject.mockActor(),
      MockGameObject.mock(),
      undefined,
      zone.object.name(),
      "af_test"
    );

    expect(registry.simulator.release).not.toHaveBeenCalled();
  });

  it("should reject an unknown story id, a dead target, and an unknown anomaly zone", () => {
    const zone: AnomalyZoneBinder = new AnomalyZoneBinder(MockGameObject.mock());

    registerSimulator();
    registerAnomalyZone(zone);

    expect(() =>
      callXrEffect(
        "pick_artefact_from_anomaly",
        MockGameObject.mockActor(),
        null as unknown as GameObject,
        "missing-story-id",
        zone.object.name(),
        "af_test"
      )
    ).toThrow();

    const deadStalker = MockAlifeHumanStalker.mock({ id: 141 });

    jest.spyOn(deadStalker, "alive").mockReturnValue(false);
    registerStoryLink(deadStalker.id, "dead-target");

    expect(() =>
      callXrEffect(
        "pick_artefact_from_anomaly",
        MockGameObject.mockActor(),
        null as unknown as GameObject,
        "dead-target",
        zone.object.name(),
        "af_test"
      )
    ).toThrow();

    expect(() =>
      callXrEffect(
        "pick_artefact_from_anomaly",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        undefined,
        "missing-zone",
        "af_test"
      )
    ).toThrow();
  });
});

describe("anomaly_turn_off", () => {
  it("should turn off anomalies", () => {
    const zone: AnomalyZoneBinder = new AnomalyZoneBinder(MockGameObject.mock());

    registerAnomalyZone(zone);

    jest.spyOn(zone, "turnOff").mockImplementation(jest.fn());

    expect(() => {
      callXrEffect("anomaly_turn_off", MockGameObject.mockActor(), MockGameObject.mock(), "test-not-existing");
    }).toThrow("No anomaly zone with name 'test-not-existing' defined.");

    callXrEffect("anomaly_turn_off", MockGameObject.mockActor(), MockGameObject.mock(), zone.object.name());
    expect(zone.turnOff).toHaveBeenCalled();
  });
});

describe("anomaly_turn_on", () => {
  it("should turn on anomalies", () => {
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
});

describe("turn_off_underpass_lamps", () => {
  it("should turn off every registered underpass lamp", () => {
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
});

describe("turn_off", () => {
  it("should turn off lamps", () => {
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
});

describe("turn_off_object", () => {
  it("should turn off lamps", () => {
    const object: GameObject = MockGameObject.mock();
    const lamp: HangingLamp = new hanging_lamp();

    jest.spyOn(object, "get_hanging_lamp").mockImplementation(() => lamp);

    callXrEffect("turn_off_object", MockGameObject.mockActor(), object);

    expect(object.get_hanging_lamp().turn_off).toHaveBeenCalledTimes(1);
  });
});

describe("turn_on_and_force", () => {
  it("should turn on lamps and set force", () => {
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
});

describe("turn_off_and_force", () => {
  it("should turn off lamps and set force", () => {
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
});

describe("turn_on_object", () => {
  it("should turn on lamps", () => {
    const object: GameObject = MockGameObject.mock();
    const lamp: HangingLamp = new hanging_lamp();

    jest.spyOn(object, "get_hanging_lamp").mockImplementation(() => lamp);

    callXrEffect("turn_on_object", MockGameObject.mockActor(), object);

    expect(object.get_hanging_lamp().turn_on).toHaveBeenCalledTimes(1);
  });
});

describe("turn_on", () => {
  it("should turn on lamps", () => {
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
});

describe("set_weather", () => {
  it("should change game weather", () => {
    callXrEffect("set_weather", MockGameObject.mockActor(), MockGameObject.mock());
    expect(level.set_weather).not.toHaveBeenCalled();

    callXrEffect("set_weather", MockGameObject.mockActor(), MockGameObject.mock(), "test-weather-1");
    expect(level.set_weather).toHaveBeenCalledTimes(1);
    expect(level.set_weather).toHaveBeenCalledWith("test-weather-1", false);

    callXrEffect("set_weather", MockGameObject.mockActor(), MockGameObject.mock(), "test-weather-2", TRUE);
    expect(level.set_weather).toHaveBeenCalledTimes(2);
    expect(level.set_weather).toHaveBeenCalledWith("test-weather-2", true);
  });
});

describe("start_surge", () => {
  it("should stop sounds", () => {
    const surgeManager: SurgeManager = getManager(SurgeManager);
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(surgeManager, "requestSurgeStart").mockImplementation(jest.fn());

    callXrEffect("start_surge", MockGameObject.mockActor(), object);

    expect(surgeManager.requestSurgeStart).toHaveBeenCalledTimes(1);
  });
});

describe("stop_surge", () => {
  it("should stop sounds", () => {
    const surgeManager: SurgeManager = getManager(SurgeManager);
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(surgeManager, "requestSurgeStop").mockImplementation(jest.fn());

    callXrEffect("stop_surge", MockGameObject.mockActor(), object);

    expect(surgeManager.requestSurgeStop).toHaveBeenCalledTimes(1);
  });
});

describe("set_surge_mess_and_task", () => {
  it("should configure the surge message and optional task", () => {
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
});

describe("enable_anomaly", () => {
  it("should enable anomalies", () => {
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
});

describe("disable_anomaly", () => {
  it("should disable anomalies", () => {
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
});

describe("launch_signal_rocket", () => {
  it("should launch signal rockets", () => {
    expect(() => {
      callXrEffect("launch_signal_rocket", MockGameObject.mockActor(), MockGameObject.mock());
    }).toThrow("No signal rocket with name 'nil' on current level.");

    const rocket: SignalLightBinder = new SignalLightBinder(MockGameObject.mock());

    registerSignalLight(rocket);
    jest.spyOn(rocket, "startFly").mockImplementation(() => true);

    callXrEffect("launch_signal_rocket", MockGameObject.mockActor(), MockGameObject.mock(), rocket.object.name());
    expect(rocket.startFly).toHaveBeenCalledTimes(1);
  });
});

describe("create_cutscene_actor_with_weapon", () => {
  it("should spawn an actor and clone the active weapon at the patrol point", () => {
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

  it("should reject missing spawn section, missing path, and unknown path", () => {
    const actor: GameObject = MockGameObject.mockActor();
    const object: GameObject = MockGameObject.mock();

    registerSimulator();

    expect(() => callXrEffect("create_cutscene_actor_with_weapon", actor, object)).toThrow();
    expect(() => callXrEffect("create_cutscene_actor_with_weapon", actor, object, "cutscene_stalker")).toThrow();
    expect(() =>
      callXrEffect("create_cutscene_actor_with_weapon", actor, object, "cutscene_stalker", "missing-path")
    ).toThrow();
  });

  it("should set the torso yaw for a spawned stalker and the angle for anything else", () => {
    const { actor, weapon } = mockCutsceneSetup();
    const cutsceneStalker = MockAlifeHumanStalker.mock({ id: 511 });
    const cutsceneWeapon = MockAlifeItemWeapon.mock({ id: 512, section: "wpn_ak74" });

    jest.spyOn(actor, "active_slot").mockReturnValue(2);
    jest.spyOn(actor, "active_item").mockReturnValue(weapon);
    jest
      .spyOn(registry.simulator, "create")
      .mockImplementationOnce(() => cutsceneStalker)
      .mockImplementationOnce(() => cutsceneWeapon);

    callXrEffect(
      "create_cutscene_actor_with_weapon",
      actor,
      MockGameObject.mock(),
      "cutscene_stalker",
      "cutscene-path",
      0,
      180
    );

    expect(cutsceneStalker.o_torso()!.yaw).toBeCloseTo(Math.PI);
  });

  it("should do nothing when the active slot holds no weapon", () => {
    const { actor } = mockCutsceneSetup();

    jest.spyOn(actor, "active_slot").mockReturnValue(1);
    jest.spyOn(registry.simulator, "create").mockImplementationOnce(() => MockAlifeObject.mock({ id: 521 }));

    callXrEffect(
      "create_cutscene_actor_with_weapon",
      actor,
      MockGameObject.mock(),
      "cutscene_stalker",
      "cutscene-path"
    );

    expect(registry.simulator.create).toHaveBeenCalledTimes(1);
  });

  it("should take the weapon from an explicitly requested slot", () => {
    const { actor, weapon } = mockCutsceneSetup();
    const cutsceneWeapon = MockAlifeItemWeapon.mock({ id: 532, section: "wpn_ak74" });

    MockGameObject.asMock(actor).item_in_slot.mockImplementation(((slot: number) =>
      slot === 3 ? weapon : null) as never);
    jest
      .spyOn(registry.simulator, "create")
      .mockImplementationOnce(() => MockAlifeObject.mock({ id: 531 }))
      .mockImplementationOnce(() => cutsceneWeapon);

    callXrEffect(
      "create_cutscene_actor_with_weapon",
      actor,
      MockGameObject.mock(),
      "cutscene_stalker",
      "cutscene-path",
      0,
      0,
      3
    );

    expect(registry.simulator.create).toHaveBeenNthCalledWith(2, "wpn_ak74", actor.position(), 24, 42, 531);
  });

  it("should fall back to slot three and then slot two when the requested slot is empty", () => {
    for (const fallbackSlot of [3, 2]) {
      const { actor, weapon } = mockCutsceneSetup();
      const cutsceneWeapon = MockAlifeItemWeapon.mock({ id: 542, section: "wpn_ak74" });

      MockGameObject.asMock(actor).item_in_slot.mockImplementation(((slot: number) =>
        slot === fallbackSlot ? weapon : null) as never);

      const create = jest
        .spyOn(registry.simulator, "create")
        .mockReset()
        .mockImplementationOnce(() => MockAlifeObject.mock({ id: 541 }))
        .mockImplementationOnce(() => cutsceneWeapon);

      callXrEffect(
        "create_cutscene_actor_with_weapon",
        actor,
        MockGameObject.mock(),
        "cutscene_stalker",
        "cutscene-path",
        0,
        0,
        7
      );

      expect(create).toHaveBeenCalledTimes(2);
    }
  });

  it("should do nothing when the requested slot and both fallbacks are empty", () => {
    const { actor } = mockCutsceneSetup();

    MockGameObject.asMock(actor).item_in_slot.mockImplementation((() => null) as never);
    jest.spyOn(registry.simulator, "create").mockImplementationOnce(() => MockAlifeObject.mock({ id: 551 }));

    callXrEffect(
      "create_cutscene_actor_with_weapon",
      actor,
      MockGameObject.mock(),
      "cutscene_stalker",
      "cutscene-path",
      0,
      0,
      7
    );

    expect(registry.simulator.create).toHaveBeenCalledTimes(1);
  });

  it("should substitute the repaired gauss rifle and skip cloning its addons", () => {
    const { actor } = mockCutsceneSetup(questItems.pri_a17_gauss_rifle);
    const gaussRifle: GameObject = MockGameObject.mock({ section: questItems.pri_a17_gauss_rifle });
    const cutsceneWeapon = MockAlifeItemWeapon.mock({ id: 562, section: weapons.wpn_gauss });

    MockAlifeSimulator.addToRegistry(
      MockAlifeItemWeapon.mock({ id: gaussRifle.id(), section: questItems.pri_a17_gauss_rifle })
    );

    jest.spyOn(actor, "active_slot").mockReturnValue(2);
    jest.spyOn(actor, "active_item").mockReturnValue(gaussRifle);
    jest.spyOn(cutsceneWeapon, "clone_addons");
    jest
      .spyOn(registry.simulator, "create")
      .mockImplementationOnce(() => MockAlifeObject.mock({ id: 561 }))
      .mockImplementationOnce(() => cutsceneWeapon);

    callXrEffect(
      "create_cutscene_actor_with_weapon",
      actor,
      MockGameObject.mock(),
      "cutscene_stalker",
      "cutscene-path"
    );

    expect(registry.simulator.create).toHaveBeenNthCalledWith(2, weapons.wpn_gauss, actor.position(), 24, 42, 561);
    expect(cutsceneWeapon.clone_addons).not.toHaveBeenCalled();
  });
});

describe("stop_sr_cutscene", () => {
  it("should stop cutscenes", () => {
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
