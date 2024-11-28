import { level, patrol } from "xray16";

import { SignalLightBinder } from "@/engine/core/binders/physic";
import type { AnomalyZoneBinder } from "@/engine/core/binders/zones";
import {
  getManager,
  getObjectByStoryId,
  getObjectIdByStoryId,
  IRegistryObjectState,
  registry,
} from "@/engine/core/database";
import { SimulationManager } from "@/engine/core/managers/simulation/SimulationManager";
import { AbstractPlayableSound } from "@/engine/core/managers/sounds/objects";
import { SoundManager } from "@/engine/core/managers/sounds/SoundManager";
import { soundsConfig } from "@/engine/core/managers/sounds/SoundsConfig";
import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import { SurgeManager } from "@/engine/core/managers/surge/SurgeManager";
import { WeatherManager } from "@/engine/core/managers/weather/WeatherManager";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { abort, assert } from "@/engine/core/utils/assertion";
import { extern } from "@/engine/core/utils/binding";
import { isStalker } from "@/engine/core/utils/class_ids";
import { LuaLogger } from "@/engine/core/utils/logging";
import { spawnItemsForObject } from "@/engine/core/utils/spawn";
import { TCommunity } from "@/engine/lib/constants/communities";
import { questItems } from "@/engine/lib/constants/items/quest_items";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { Y_VECTOR } from "@/engine/lib/constants/vectors";
import { TRUE } from "@/engine/lib/constants/words";
import {
  GameObject,
  Optional,
  Patrol,
  ServerArtefactItemObject,
  ServerHumanObject,
  ServerObject,
  ServerWeaponObject,
  TDuration,
  TIndex,
  TLabel,
  TName,
  TNumberId,
  TRate,
  TSection,
  TStringId,
  TStringifiedBoolean,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Should play sound based on provided parameters in smart terrain.
 *
 * Where:
 * - theme - name of sound theme to play
 * - faction - faction prefix for theme playing
 * - terrainNameOrId - name of smart terrain or ID to play sound in
 */
extern(
  "xr_effects.play_sound",
  (
    _: GameObject,
    object: GameObject,
    [theme, faction, terrainNameOrId]: [Optional<TName>, Optional<TCommunity>, Optional<TName | TNumberId>]
  ): void => {
    const terrain: Optional<SmartTerrain> = getManager(SimulationManager).getTerrainByName(terrainNameOrId as TName);
    const terrainId: TNumberId = terrain ? terrain.id : (terrainNameOrId as TNumberId);

    if (object && isStalker(object) && !object.alive()) {
      abort("Stalker '%s' is dead while trying to play theme sound '%s'.", object.name(), theme);
    }

    getManager(SoundManager).play(object.id(), theme, faction, terrainId);
  }
);

/**
 * Stop playing sound for an object.
 */
extern("xr_effects.stop_sound", (_: GameObject, object: GameObject): void => {
  getManager(SoundManager).stop(object.id());
});

/**
 * Start looped sound playback by theme name.
 *
 * Where:
 * - name - name of sound theme to play in loop
 */
extern("xr_effects.play_sound_looped", (_: GameObject, object: GameObject, [name]: [TName]): void => {
  getManager(SoundManager).playLooped(object.id(), name);
});

/**
 * Stop looped sound playback for an object.
 */
extern("xr_effects.stop_sound_looped", (_: GameObject, object: GameObject): void => {
  getManager(SoundManager).stopAllLooped(object.id());
});

/**
 * Play sound in smart terrain by object story ID.
 *
 * Where:
 * - storyId - story ID of object to play sound for
 * - theme - name of sound theme to play
 * - faction - name of faction prefix for sound theme
 * - terrainNameOrId - name or identifier of smart terrain to play in
 *
 * todo: Is it used with smart terrain ID at all?
 */
extern(
  "xr_effects.play_sound_by_story",
  (
    _: GameObject,
    __: GameObject,
    [storyId, theme, faction, terrainNameOrId]: [TStringId, TName, TName, TName | TNumberId]
  ): void => {
    const terrain: Optional<SmartTerrain> = getManager(SimulationManager).getTerrainByName(terrainNameOrId as TName);
    const terrainId: TNumberId = terrain ? terrain.id : (terrainNameOrId as TNumberId);

    getManager(SoundManager).play(getObjectIdByStoryId(storyId) as TNumberId, theme, faction, terrainId);
  }
);

/**
 * Reset sound playback for an object.
 */
extern("xr_effects.reset_sound_npc", (_: GameObject, object: GameObject): void => {
  const objectId: TNumberId = object.id();
  const sound: Optional<AbstractPlayableSound> = soundsConfig.playing.get(objectId) as Optional<AbstractPlayableSound>;

  // todo: Move to sound manager methods.
  if (sound) {
    sound.reset(objectId);
  }
});

/**
 * Explode game object by story id.
 *
 * Where:
 * - storyId - story ID of object to explode
 */
extern("xr_effects.barrel_explode", (_: GameObject, __: GameObject, [storyId]: [TStringId]) => {
  const storyObject: Optional<GameObject> = getObjectByStoryId(storyId);

  if (storyObject) {
    storyObject.explode(0);
  }
});

/**
 * todo;
 */
extern("xr_effects.set_game_time", (_: GameObject, __: GameObject, [hoursString, minutesString]: [string, string]) => {
  logger.info("Set game time: %s %s", hoursString, minutesString);

  const realHours = level.get_time_hours();
  const realMinutes = level.get_time_minutes();

  const hours: number = tonumber(hoursString)!;
  const minutes: number = tonumber(minutesString) ?? 0;

  let hoursToChange: number = hours - realHours;

  if (hoursToChange <= 0) {
    hoursToChange = hoursToChange + 24;
  }

  let minutesToChange = minutes - realMinutes;

  if (minutesToChange <= 0) {
    minutesToChange = minutesToChange + 60;
    hoursToChange = hoursToChange - 1;
  } else if (hours === realHours) {
    hoursToChange = hoursToChange - 24;
  }

  level.change_game_time(0, hoursToChange, minutesToChange);
  getManager(WeatherManager).forceWeatherChange();
  surgeConfig.IS_TIME_FORWARDED = true;
});

/**
 * todo;
 */
extern(
  "xr_effects.forward_game_time",
  (_: GameObject, __: GameObject, [hoursString, minutesString]: [string, string]): void => {
    logger.info("Forward game time");

    const hours: number = tonumber(hoursString)!;
    const minutes: number = tonumber(minutesString) ?? 0;

    level.change_game_time(0, hours, minutes);
    getManager(WeatherManager).forceWeatherChange();
    surgeConfig.IS_TIME_FORWARDED = true;
  }
);

// todo: Rework, looks bad
extern(
  "xr_effects.pick_artefact_from_anomaly",
  (
    _: GameObject,
    object: Optional<GameObject | ServerHumanObject>,
    params: [Optional<TStringId>, Optional<TName>, TName]
  ): void => {
    logger.info("Pick artefact from anomaly");

    const anomalyZoneName: Optional<TName> = params && params[1];
    let artefactSection: TSection = params && params[2];

    const anomalyZone: AnomalyZoneBinder = registry.anomalyZones.get(anomalyZoneName as TName);

    if (params && params[0]) {
      const objectId: Optional<TNumberId> = getObjectIdByStoryId(params[0]);

      if (objectId === null) {
        abort("Couldn't relocate item to NULL in function 'pick_artefact_from_anomaly!'");
      }

      object = registry.simulator.object(objectId) as ServerHumanObject;

      if (object && (!isStalker(object) || !object.alive())) {
        abort("Couldn't relocate item to NULL (dead || ! stalker) in function 'pick_artefact_from_anomaly!'");
      }
    }

    if (anomalyZone === null) {
      abort("No such anomal zone in function 'pick_artefact_from_anomaly!'");
    }

    if (anomalyZone.spawnedArtefactsCount < 1) {
      return;
    }

    let artefactObject: Optional<ServerArtefactItemObject> = null;

    for (const [artefactId] of anomalyZone.artefactPathsByArtefactId) {
      if (
        registry.simulator.object(artefactId) &&
        artefactSection === registry.simulator.object(artefactId)!.section_name()
      ) {
        artefactObject = registry.simulator.object(artefactId);
        break;
      }

      if (artefactSection === null) {
        artefactObject = registry.simulator.object(artefactId);
        artefactSection = artefactObject!.section_name();
        break;
      }
    }

    if (!artefactObject) {
      return;
    }

    anomalyZone.onArtefactTaken(artefactObject.id);
    registry.simulator.release(artefactObject!, true);
    spawnItemsForObject(object as GameObject, artefactSection);
  }
);

/**
 * Toggle anomaly zone enabled state as OFF.
 *
 * Where:
 * - zoneName - name of anomaly binding object to turn off
 */
extern("xr_effects.anomaly_turn_off", (_: GameObject, __: GameObject, [zoneName]: [TName]): void => {
  const zone: Optional<AnomalyZoneBinder> = registry.anomalyZones.get(zoneName);

  assert(zone, "No anomaly zone with name '%s' defined.", zoneName);

  zone.turnOff();
});

/**
 * Toggle anomaly zone enabled state as ON.
 *
 * Where:
 * - zoneName - name of anomaly binding object to turn on
 * - isForced - flag to determine whether artefacts should be respawned
 */
extern(
  "xr_effects.anomaly_turn_on",
  (_: GameObject, __: GameObject, [zoneName, isForced]: [TName, Optional<TStringifiedBoolean>]): void => {
    const zone: Optional<AnomalyZoneBinder> = registry.anomalyZones.get(zoneName);

    assert(zone, "No anomaly zone with name '%s' defined.", zoneName);

    zone.turnOn(isForced === TRUE);
  }
);

/**
 * todo;
 */
extern("xr_effects.turn_off_underpass_lamps", (_: GameObject, __: GameObject): void => {
  const lampsList = {
    ["pas_b400_lamp_start_flash"]: true,
    ["pas_b400_lamp_start_red"]: true,
    ["pas_b400_lamp_elevator_green"]: true,
    ["pas_b400_lamp_elevator_flash"]: true,
    ["pas_b400_lamp_elevator_green_1"]: true,
    ["pas_b400_lamp_elevator_flash_1"]: true,
    ["pas_b400_lamp_track_green"]: true,
    ["pas_b400_lamp_track_flash"]: true,
    ["pas_b400_lamp_downstairs_green"]: true,
    ["pas_b400_lamp_downstairs_flash"]: true,
    ["pas_b400_lamp_tunnel_green"]: true,
    ["pas_b400_lamp_tunnel_flash"]: true,
    ["pas_b400_lamp_tunnel_green_1"]: true,
    ["pas_b400_lamp_tunnel_flash_1"]: true,
    ["pas_b400_lamp_control_down_green"]: true,
    ["pas_b400_lamp_control_down_flash"]: true,
    ["pas_b400_lamp_control_up_green"]: true,
    ["pas_b400_lamp_control_up_flash"]: true,
    ["pas_b400_lamp_hall_green"]: true,
    ["pas_b400_lamp_hall_flash"]: true,
    ["pas_b400_lamp_way_green"]: true,
    ["pas_b400_lamp_way_flash"]: true,
  } as unknown as LuaTable<string, boolean>;

  for (const [storyId] of lampsList) {
    const object: Optional<GameObject> = getObjectByStoryId(storyId);

    if (object) {
      object.get_hanging_lamp().turn_off();
    } else {
      logger.info("function 'turn_off_underpass_lamps' lamp [%s] does ! exist", storyId);
    }
  }
});

/**
 * Turn off hanging lamp objects by story IDs.
 */
extern("xr_effects.turn_off", (_: GameObject, __: GameObject, parameters: Array<TStringId>): void => {
  for (const storyId of parameters) {
    const storyObject: Optional<GameObject> = getObjectByStoryId(storyId);

    assert(storyObject, "Object with story id '%s' does not exist.", storyId);

    storyObject.get_hanging_lamp().turn_off();
  }
});

/**
 * Turn off hanging lamp object.
 */
extern("xr_effects.turn_off_object", (_: GameObject, object: GameObject): void => {
  object.get_hanging_lamp().turn_off();
});

/**
 * Turn hanging lamp light on, apply force and start particles by story ID.
 */
extern(
  "xr_effects.turn_on_and_force",
  (
    _: GameObject,
    __: GameObject,
    [storyId, power, interval]: [TStringId, Optional<TRate>, Optional<TDuration>]
  ): void => {
    const storyObject: Optional<GameObject> = getObjectByStoryId(storyId);

    assert(storyObject, "Object with story id '%s' does not exist.", storyId);

    storyObject.set_const_force(Y_VECTOR, power ?? 55, interval ?? 14_000);
    storyObject.start_particles("weapons\\light_signal", "link");
    storyObject.get_hanging_lamp().turn_on();
  }
);

/**
 * Stop hanging lamp object and stop playback particles.
 */
extern("xr_effects.turn_off_and_force", (_: GameObject, __: GameObject, [storyId]: [TStringId]): void => {
  const storyObject: Optional<GameObject> = getObjectByStoryId(storyId);

  assert(storyObject, "Object with story id '%s' does not exist.", storyId);

  storyObject.stop_particles("weapons\\light_signal", "link");
  storyObject.get_hanging_lamp().turn_off();
});

/**
 * Turn on hanging lamp object.
 */
extern("xr_effects.turn_on_object", (_: GameObject, object: GameObject): void => {
  object.get_hanging_lamp().turn_on();
});

/**
 * Turn on hanging lamp objects by story IDs.
 */
extern("xr_effects.turn_on", (_: GameObject, __: GameObject, parameters: Array<TStringId>) => {
  for (const storyId of parameters) {
    const storyObject: Optional<GameObject> = getObjectByStoryId(storyId);

    assert(storyObject, "Object with story id '%s' does not exist.", storyId);

    storyObject.get_hanging_lamp().turn_on();
  }
});

/**
 * Set current game level weather.
 */
extern(
  "xr_effects.set_weather",
  (_: GameObject, __: GameObject, [weatherName, isForced]: [Optional<TName>, Optional<TStringifiedBoolean>]): void => {
    logger.info("Set weather: %s", weatherName);

    if (weatherName) {
      level.set_weather(weatherName, isForced === TRUE);
    }
  }
);

/**
 * Request start of surge.
 */
extern("xr_effects.start_surge", (): void => {
  getManager(SurgeManager).requestSurgeStart();
});

/**
 * Request stop of surge.
 */
extern("xr_effects.stop_surge", (): void => {
  getManager(SurgeManager).requestSurgeStop();
});

/**
 * todo;
 */
extern(
  "xr_effects.set_surge_mess_and_task",
  (_: GameObject, __: GameObject, [label, task]: [TLabel, Optional<TSection>]): void => {
    const surgeManager: SurgeManager = getManager(SurgeManager);

    surgeManager.setSurgeMessage(label);

    if (task) {
      surgeManager.setSurgeTask(task);
    }
  }
);

/**
 * Enable anomaly by story ID.
 *
 * Where:
 * - storyId - story ID of anomaly object to enable
 */
extern("xr_effects.enable_anomaly", (_: GameObject, __: GameObject, [storyId]: [Optional<TStringId>]) => {
  assert(storyId, "Story id for 'enable_anomaly' effect is not provided.");

  const storyObject: Optional<GameObject> = getObjectByStoryId(storyId);

  assert(storyObject, "There is no anomaly with story id '%s'.", storyId);

  storyObject.enable_anomaly();
});

/**
 * Disable anomaly by story ID.
 *
 * Where:
 * - storyId - story ID of anomaly object to disable
 */
extern("xr_effects.disable_anomaly", (_: GameObject, __: GameObject, [storyId]: [TStringId]): void => {
  assert(storyId, "Story id for 'disable_anomaly' effect is not provided.");

  const storyObject: Optional<GameObject> = getObjectByStoryId(storyId);

  if (storyObject) {
    storyObject.disable_anomaly();
  } else {
    abort("There is no anomaly with story id '%s'.", storyId);
  }
});

/**
 * Launch signal rocket by provided name.
 *
 * Where:
 * - name - name of signal light rocket object
 */
extern("xr_effects.launch_signal_rocket", (_: GameObject, __: GameObject, [name]: [TName]): void => {
  const rocket: Optional<SignalLightBinder> = registry.signalLights.get(name) as Optional<SignalLightBinder>;

  if (rocket) {
    rocket.startFly();
  } else {
    abort("No signal rocket with name '%s' on current level.", name);
  }
});

/**
 * todo;
 */
extern(
  "xr_effects.create_cutscene_actor_with_weapon",
  (
    actor: GameObject,
    object: GameObject,
    [spawnSection, pathName, index = 0, yaw = 0, slotOverride = 0]: [
      Optional<TSection>,
      Optional<TName>,
      TIndex,
      TRate,
      TIndex,
    ]
  ): void => {
    logger.info("Create cutscene actor with weapon");

    if (spawnSection === null) {
      abort("Wrong spawn section for 'spawn_object' function %s. For object %s", spawnSection, object.name());
    }

    if (pathName === null) {
      abort("Wrong path_name for 'spawn_object' function %s. For object %s", pathName, object.name());
    }

    if (!level.patrol_path_exists(pathName)) {
      abort("Path %s doesnt exist. Function 'spawn_object' for object %s ", pathName, object.name());
    }

    const ptr: Patrol = new patrol(pathName);

    const serverObject: ServerObject = registry.simulator.create(
      spawnSection,
      ptr.point(index),
      ptr.level_vertex_id(0),
      ptr.game_vertex_id(0)
    )!;

    if (isStalker(serverObject)) {
      serverObject.o_torso()!.yaw = (yaw * math.pi) / 180;
    } else {
      serverObject.angle.y = (yaw * math.pi) / 180;
    }

    let slot: TIndex;
    let activeItem: Optional<GameObject> = null;

    if (slotOverride === 0) {
      slot = actor.active_slot();
      if (slot !== 2 && slot !== 3) {
        return;
      }

      activeItem = actor.active_item();
    } else {
      if (actor.item_in_slot(slotOverride) !== null) {
        activeItem = actor.item_in_slot(slotOverride);
      } else {
        if (actor.item_in_slot(3) !== null) {
          activeItem = actor.item_in_slot(3);
        } else if (actor.item_in_slot(2) !== null) {
          activeItem = actor.item_in_slot(2);
        } else {
          return;
        }
      }
    }

    const actorWeapon: ServerWeaponObject = registry.simulator.object(activeItem!.id()) as ServerWeaponObject;
    let sectionName: TName = actorWeapon.section_name();

    if (sectionName === questItems.pri_a17_gauss_rifle) {
      sectionName = weapons.wpn_gauss;
    }

    if (activeItem) {
      const newWeapon: ServerWeaponObject = registry.simulator.create<ServerWeaponObject>(
        sectionName,
        ptr.point(index),
        ptr.level_vertex_id(0),
        ptr.game_vertex_id(0),
        serverObject.id
      );

      if (sectionName !== weapons.wpn_gauss) {
        newWeapon.clone_addons(actorWeapon);
      }
    }
  }
);

/**
 * Stop object camera effector.
 */
extern("xr_effects.stop_sr_cutscene", (_: GameObject, object: GameObject): void => {
  const state: IRegistryObjectState = registry.objects.get(object.id());

  if (state.activeScheme) {
    state[state.activeScheme]!.signals!.set("cam_effector_stop", true);
  }
});
