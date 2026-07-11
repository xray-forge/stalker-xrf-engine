import { level, patrol } from "xray16";
import {
  GameObject,
  Patrol,
  ServerArtefactItemObject,
  ServerHumanObject,
  ServerObject,
  ServerWeaponObject,
} from "xray16/alias";
import {
  abort,
  assert,
  extern,
  Nillable,
  TDuration,
  TIndex,
  TLabel,
  TName,
  TNumberId,
  TRate,
  TRUE,
  TSection,
  TStringId,
  TStringifiedBoolean,
  Y_VECTOR,
} from "xray16/lib";
import { $filename, $isNil, $isNotNil } from "xray16/macros";

import { SignalLightBinder } from "@/engine/core/binders/physic";
import type { AnomalyZoneBinder } from "@/engine/core/binders/zones";
import {
  getManager,
  getObjectByStoryId,
  getObjectIdByStoryId,
  IRegistryObjectState,
  registry,
} from "@/engine/core/database";
import { getSimulationTerrainByName } from "@/engine/core/managers/simulation/utils";
import { AbstractPlayableSound } from "@/engine/core/managers/sounds/objects";
import { SoundManager } from "@/engine/core/managers/sounds/SoundManager";
import { soundsConfig } from "@/engine/core/managers/sounds/SoundsConfig";
import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import { SurgeManager } from "@/engine/core/managers/surge/SurgeManager";
import { WeatherManager } from "@/engine/core/managers/weather/WeatherManager";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { isStalker } from "@/engine/core/utils/class_ids";
import { LuaLogger } from "@/engine/core/utils/logging";
import { spawnItemsForObject } from "@/engine/core/utils/spawn";
import { TCommunity } from "@/engine/lib/constants/communities";
import { questItems } from "@/engine/lib/constants/items/quest_items";
import { weapons } from "@/engine/lib/constants/items/weapons";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Should play sound based on provided parameters in smart terrain.
 *
 * Where:
 * - theme - name of sound theme to play
 * - faction - faction prefix for theme playing
 * - terrainNameOrId - name of smart terrain or ID to play sound in.
 */
extern(
  "xr_effects.play_sound",
  (
    _: GameObject,
    object: GameObject,
    [theme, faction, terrainNameOrId]: [Nillable<TName>, Nillable<TCommunity>, Nillable<TName | TNumberId>]
  ): void => {
    const terrain: Nillable<SmartTerrain> = getSimulationTerrainByName(terrainNameOrId as TName);
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
 * - name - name of sound theme to play in loop.
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
 * - terrainNameOrId - name or identifier of smart terrain to play in.
 *
 * Todo: Is it used with smart terrain ID at all?
 */
extern(
  "xr_effects.play_sound_by_story",
  (
    _: GameObject,
    __: GameObject,
    [storyId, theme, faction, terrainNameOrId]: [TStringId, TName, TName, TName | TNumberId]
  ): void => {
    const terrain: Nillable<SmartTerrain> = getSimulationTerrainByName(terrainNameOrId as TName);
    const terrainId: TNumberId = terrain ? terrain.id : (terrainNameOrId as TNumberId);

    getManager(SoundManager).play(getObjectIdByStoryId(storyId) as TNumberId, theme, faction, terrainId);
  }
);

/**
 * Reset sound playback for an object.
 */
extern("xr_effects.reset_sound_npc", (_: GameObject, object: GameObject): void => {
  const objectId: TNumberId = object.id();
  const sound: Nillable<AbstractPlayableSound> = soundsConfig.playing.get(objectId) as Nillable<AbstractPlayableSound>;

  // todo: Move to sound manager methods.
  if (sound) {
    sound.reset(objectId);
  }
});

/**
 * Explode game object by story id.
 *
 * Where:
 * - storyId - story ID of object to explode.
 */
extern("xr_effects.barrel_explode", (_: GameObject, __: GameObject, [storyId]: [TStringId]) => {
  const storyObject: Nillable<GameObject> = getObjectByStoryId(storyId);

  if (storyObject) {
    storyObject.explode(0);
  }
});

/**
 * Advance the in-game clock to the provided hours and minutes and force a weather change.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object owning the logics scheme.
 * @param hoursString - Target hour of day to set the game time to.
 * @param minutesString - Target minute of the hour to set the game time to.
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
 * Forward the in-game clock by the provided hours and minutes and force a weather change.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object owning the logics scheme.
 * @param hoursString - Number of hours to advance the game time by.
 * @param minutesString - Number of minutes to advance the game time by.
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
    object: Nillable<GameObject | ServerHumanObject>,
    params: [Nillable<TStringId>, Nillable<TName>, TName]
  ): void => {
    logger.info("Pick artefact from anomaly");

    const anomalyZoneName: Nillable<TName> = params && params[1];
    let artefactSection: TSection = params && params[2];

    const anomalyZone: Nillable<AnomalyZoneBinder> = registry.anomalyZones.get(anomalyZoneName as TName);

    if (params && params[0]) {
      const objectId: Nillable<TNumberId> = getObjectIdByStoryId(params[0]);

      if ($isNil(objectId)) {
        abort("Couldn't relocate item to NULL in function 'pick_artefact_from_anomaly!'");
      }

      object = registry.simulator.object(objectId) as ServerHumanObject;

      if (object && (!isStalker(object) || !object.alive())) {
        abort("Couldn't relocate item to NULL (dead || ! stalker) in function 'pick_artefact_from_anomaly!'");
      }
    }

    if ($isNil(anomalyZone)) {
      abort("No such anomal zone in function 'pick_artefact_from_anomaly!'");
    }

    if (anomalyZone.spawnedArtefactsCount < 1) {
      return;
    }

    let artefactObject: Nillable<ServerArtefactItemObject> = null;

    for (const [artefactId] of anomalyZone.artefactPathsByArtefactId) {
      if (
        registry.simulator.object(artefactId) &&
        artefactSection === registry.simulator.object(artefactId)!.section_name()
      ) {
        artefactObject = registry.simulator.object(artefactId);
        break;
      }

      if ($isNil(artefactSection)) {
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
 * - zoneName - name of anomaly binding object to turn off.
 */
extern("xr_effects.anomaly_turn_off", (_: GameObject, __: GameObject, [zoneName]: [TName]): void => {
  const zone: Nillable<AnomalyZoneBinder> = registry.anomalyZones.get(zoneName);

  assert(zone, "No anomaly zone with name '%s' defined.", zoneName);

  zone.turnOff();
});

/**
 * Toggle anomaly zone enabled state as ON.
 *
 * Where:
 * - zoneName - name of anomaly binding object to turn on
 * - isForced - flag to determine whether artefacts should be respawned.
 */
extern(
  "xr_effects.anomaly_turn_on",
  (_: GameObject, __: GameObject, [zoneName, isForced]: [TName, Nillable<TStringifiedBoolean>]): void => {
    const zone: Nillable<AnomalyZoneBinder> = registry.anomalyZones.get(zoneName);

    assert(zone, "No anomaly zone with name '%s' defined.", zoneName);

    zone.turnOn(isForced === TRUE);
  }
);

/**
 * Turn off the hanging lamps of all predefined Pripyat underpass lamp objects.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object owning the logics scheme.
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
    const object: Nillable<GameObject> = getObjectByStoryId(storyId);

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
    const storyObject: Nillable<GameObject> = getObjectByStoryId(storyId);

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
    [storyId, power, interval]: [TStringId, Nillable<TRate>, Nillable<TDuration>]
  ): void => {
    const storyObject: Nillable<GameObject> = getObjectByStoryId(storyId);

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
  const storyObject: Nillable<GameObject> = getObjectByStoryId(storyId);

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
    const storyObject: Nillable<GameObject> = getObjectByStoryId(storyId);

    assert(storyObject, "Object with story id '%s' does not exist.", storyId);

    storyObject.get_hanging_lamp().turn_on();
  }
});

/**
 * Set current game level weather.
 */
extern(
  "xr_effects.set_weather",
  (_: GameObject, __: GameObject, [weatherName, isForced]: [Nillable<TName>, Nillable<TStringifiedBoolean>]): void => {
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
 * Set the surge notification message and Nillablely the surge task.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object owning the logics scheme.
 * @param label - Label used as the surge notification message.
 * @param task - Nillable task section assigned for the surge.
 */
extern(
  "xr_effects.set_surge_mess_and_task",
  (_: GameObject, __: GameObject, [label, task]: [TLabel, Nillable<TSection>]): void => {
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
 * - storyId - story ID of anomaly object to enable.
 */
extern("xr_effects.enable_anomaly", (_: GameObject, __: GameObject, [storyId]: [Nillable<TStringId>]) => {
  assert(storyId, "Story id for 'enable_anomaly' effect is not provided.");

  const storyObject: Nillable<GameObject> = getObjectByStoryId(storyId);

  assert(storyObject, "There is no anomaly with story id '%s'.", storyId);

  storyObject.enable_anomaly();
});

/**
 * Disable anomaly by story ID.
 *
 * Where:
 * - storyId - story ID of anomaly object to disable.
 */
extern("xr_effects.disable_anomaly", (_: GameObject, __: GameObject, [storyId]: [TStringId]): void => {
  assert(storyId, "Story id for 'disable_anomaly' effect is not provided.");

  const storyObject: Nillable<GameObject> = getObjectByStoryId(storyId);

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
 * - name - name of signal light rocket object.
 */
extern("xr_effects.launch_signal_rocket", (_: GameObject, __: GameObject, [name]: [TName]): void => {
  const rocket: Nillable<SignalLightBinder> = registry.signalLights.get(name) as Nillable<SignalLightBinder>;

  if (rocket) {
    rocket.startFly();
  } else {
    abort("No signal rocket with name '%s' on current level.", name);
  }
});

/**
 * Spawn a cutscene actor at a patrol path and equip it with a clone of the actor's active weapon.
 *
 * @param actor - Actor game object whose active weapon is cloned for the cutscene actor.
 * @param object - Game object owning the logics scheme.
 * @param spawnSection - Section of the cutscene actor to spawn.
 * @param pathName - Patrol path used as the spawn location.
 * @param index - Patrol point index used for positioning the spawned actor.
 * @param yaw - Yaw angle in degrees applied to the spawned actor.
 * @param slotOverride - Nillable inventory slot used to pick the weapon instead of the active slot.
 */
extern(
  "xr_effects.create_cutscene_actor_with_weapon",
  (
    actor: GameObject,
    object: GameObject,
    [spawnSection, pathName, index = 0, yaw = 0, slotOverride = 0]: [
      Nillable<TSection>,
      Nillable<TName>,
      TIndex,
      TRate,
      TIndex,
    ]
  ): void => {
    logger.info("Create cutscene actor with weapon");

    if (!spawnSection) {
      abort("Wrong spawn section for 'spawn_object' function %s. For object %s", spawnSection, object.name());
    }

    if (!pathName) {
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
    let activeItem: Nillable<GameObject> = null;

    if (slotOverride === 0) {
      slot = actor.active_slot();
      if (slot !== 2 && slot !== 3) {
        return;
      }

      activeItem = actor.active_item();
    } else {
      if ($isNotNil(actor.item_in_slot(slotOverride))) {
        activeItem = actor.item_in_slot(slotOverride);
      } else {
        if ($isNotNil(actor.item_in_slot(3))) {
          activeItem = actor.item_in_slot(3);
        } else if ($isNotNil(actor.item_in_slot(2))) {
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
  const state: Nillable<IRegistryObjectState> = registry.objects.get(object.id());

  if (state?.activeScheme) {
    state[state.activeScheme]!.signals!.set("cam_effector_stop", true);
  }
});
