import { level, patrol } from "xray16";

import { getObjectByStoryId, getObjectIdByStoryId, IRegistryObjectState, registry } from "@/engine/core/database";
import { SimulationBoardManager } from "@/engine/core/managers/simulation/SimulationBoardManager";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { soundsConfig } from "@/engine/core/managers/sounds/SoundsConfig";
import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import { SurgeManager } from "@/engine/core/managers/surge/SurgeManager";
import { WeatherManager } from "@/engine/core/managers/weather/WeatherManager";
import { AnomalyZoneBinder } from "@/engine/core/objects/binders";
import { SmartTerrain } from "@/engine/core/objects/server/smart_terrain";
import { abort } from "@/engine/core/utils/assertion";
import { extern } from "@/engine/core/utils/binding";
import { isStalker } from "@/engine/core/utils/class_ids";
import { LuaLogger } from "@/engine/core/utils/logging";
import { spawnItemsForObject } from "@/engine/core/utils/spawn";
import { createVector } from "@/engine/core/utils/vector";
import { TCommunity } from "@/engine/lib/constants/communities";
import { questItems } from "@/engine/lib/constants/items/quest_items";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { TRUE } from "@/engine/lib/constants/words";
import {
  ClientObject,
  LuaArray,
  Optional,
  Patrol,
  ServerArtefactItemObject,
  ServerHumanObject,
  ServerObject,
  ServerWeaponObject,
  TIndex,
  TName,
  TNumberId,
  TRate,
  TSection,
  TStringId,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
extern(
  "xr_effects.play_sound",
  (
    actor: ClientObject,
    object: ClientObject,
    p: [Optional<TName>, Optional<TCommunity>, Optional<string | number>]
  ): void => {
    const theme: Optional<TName> = p[0];
    const faction: Optional<TCommunity> = p[1];
    const smartTerrain: SmartTerrain = SimulationBoardManager.getInstance().getSmartTerrainByName(
      p[2] as TName
    ) as SmartTerrain;
    const smartTerrainId: TNumberId = smartTerrain !== null ? smartTerrain.id : (p[2] as TNumberId);

    if (object && isStalker(object)) {
      if (!object.alive()) {
        abort(
          "Stalker [%s][%s] is dead, but you wants to say something for you. [%s]!",
          tostring(object.id()),
          tostring(object.name()),
          p[0]
        );
      }
    }

    GlobalSoundManager.getInstance().playSound(object.id(), theme, faction, smartTerrainId);
  }
);

/**
 * todo;
 */
extern("xr_effects.stop_sound", (actor: ClientObject, object: ClientObject): void => {
  GlobalSoundManager.getInstance().stopSoundByObjectId(object.id());
});

/**
 * todo;
 */
extern("xr_effects.play_sound_looped", (actor: ClientObject, object: ClientObject, params: [string]): void => {
  GlobalSoundManager.getInstance().playLoopedSound(object.id(), params[0]);
});

/**
 * todo;
 */
extern("xr_effects.stop_sound_looped", (actor: ClientObject, object: ClientObject) => {
  GlobalSoundManager.getInstance().stopLoopedSound(object.id(), null);
});

/**
 * todo;
 */
extern(
  "xr_effects.play_sound_by_story",
  (actor: ClientObject, object: ClientObject, p: [string, string, string, TName | number]) => {
    const storyObjectId: Optional<TNumberId> = getObjectIdByStoryId(p[0]);
    const theme: TName = p[1];
    const faction: TName = p[2];

    const smartTerrain: Optional<SmartTerrain> = SimulationBoardManager.getInstance().getSmartTerrainByName(
      p[3] as TName
    );
    const smartTerrainId: TNumberId = smartTerrain !== null ? smartTerrain.id : (p[3] as number);

    GlobalSoundManager.getInstance().playSound(storyObjectId as number, theme, faction, smartTerrainId);
  }
);

/**
 * todo;
 */
extern("xr_effects.reset_sound_npc", (actor: ClientObject, object: ClientObject): void => {
  const objectId: TNumberId = object.id();

  if (soundsConfig.generic.get(objectId) !== null) {
    soundsConfig.generic.get(objectId).reset(objectId);
  }
});

/**
 * todo;
 */
extern("xr_effects.barrel_explode", (actor: ClientObject, object: ClientObject, p: [TStringId]) => {
  const explodeObject: Optional<ClientObject> = getObjectByStoryId(p[0]);

  if (explodeObject !== null) {
    explodeObject.explode(0);
  }
});

/**
 * todo;
 */
extern("xr_effects.set_game_time", (actor: ClientObject, object: ClientObject, params: [string, string]) => {
  logger.info("Set game time:", params[0], params[1]);

  const realHours = level.get_time_hours();
  const realMinutes = level.get_time_minutes();

  const hours: number = tonumber(params[0])!;
  let minutes: number = tonumber(params[1])!;

  if (params[1] === null) {
    minutes = 0;
  }

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
  WeatherManager.getInstance().forceWeatherChange();
  surgeConfig.IS_TIME_FORWARDED = true;
});

/**
 * todo;
 */
extern("xr_effects.forward_game_time", (actor: ClientObject, object: ClientObject, p: [string, string]) => {
  logger.info("Forward game time");

  if (!p) {
    abort("Insufficient || invalid parameters in function 'forward_game_time'!");
  }

  const hours: number = tonumber(p[0])!;
  let minutes: number = tonumber(p[1])!;

  if (p[1] === null) {
    minutes = 0;
  }

  level.change_game_time(0, hours, minutes);
  WeatherManager.getInstance().forceWeatherChange();
  surgeConfig.IS_TIME_FORWARDED = true;
});

// todo: Rework, looks bad
extern(
  "xr_effects.pick_artefact_from_anomaly",
  (
    actor: ClientObject,
    object: Optional<ClientObject | ServerHumanObject>,
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

    let artefactId: Optional<TNumberId> = null;
    let artefactObject: Optional<ServerArtefactItemObject> = null;

    for (const [k, v] of anomalyZone.artefactWaysByArtefactId) {
      if (
        registry.simulator.object(tonumber(k)!) &&
        artefactSection === registry.simulator.object(tonumber(k)!)!.section_name()
      ) {
        artefactId = tonumber(k)!;
        artefactObject = registry.simulator.object(tonumber(k)!);
        break;
      }

      if (artefactSection === null) {
        artefactId = tonumber(k)!;
        artefactObject = registry.simulator.object(tonumber(k)!);
        artefactSection = artefactObject!.section_name();
        break;
      }
    }

    if (artefactId === null) {
      return;
    }

    anomalyZone.onArtefactTaken(artefactObject as ServerArtefactItemObject);

    registry.simulator.release(artefactObject!, true);
    spawnItemsForObject(object as ClientObject, artefactSection);
  }
);

/**
 * todo
 */
extern("xr_effects.anomaly_turn_off", (actor: ClientObject, object: ClientObject, p: [string]): void => {
  const anomalZone: Optional<AnomalyZoneBinder> = registry.anomalyZones.get(p[0]);

  if (anomalZone === null) {
    abort("No such anomal zone in function 'anomaly_turn_off!'");
  }

  anomalZone.turnOff();
});

/**
 * todo
 */
extern(
  "xr_effects.anomaly_turn_on",
  (actor: ClientObject, object: ClientObject, p: [string, Optional<string>]): void => {
    const anomalyZone: Optional<AnomalyZoneBinder> = registry.anomalyZones.get(p[0]);

    if (anomalyZone === null) {
      abort("No such anomal zone in function 'anomaly_turn_on!'");
    }

    if (p[1]) {
      anomalyZone.turnOn(true);
    } else {
      anomalyZone.turnOn(false);
    }
  }
);

/**
 * todo;
 */
extern("xr_effects.turn_off_underpass_lamps", (actor: ClientObject, object: ClientObject): void => {
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

  for (const [k, v] of lampsList) {
    const object: Optional<ClientObject> = getObjectByStoryId(k);

    if (object) {
      object.get_hanging_lamp().turn_off();
    } else {
      logger.warn("function 'turn_off_underpass_lamps' lamp [%s] does ! exist", tostring(k));
    }
  }
});

/**
 * todo;
 */
extern("xr_effects.turn_off", (actor: ClientObject, object: ClientObject, parameters: LuaArray<TStringId>): void => {
  for (const [index, storyId] of parameters) {
    const object: Optional<ClientObject> = getObjectByStoryId(storyId);

    if (!object) {
      abort("TURN_OFF. Target object with story_id [%s] does ! exist", storyId);
    }

    object.get_hanging_lamp().turn_off();
  }
});

/**
 * todo;
 */
extern("xr_effects.turn_off_object", (actor: ClientObject, object: ClientObject): void => {
  object.get_hanging_lamp().turn_off();
});

/**
 * todo;
 */
extern(
  "xr_effects.turn_on_and_force",
  (actor: ClientObject, object: ClientObject, params: [TStringId, number, number]): void => {
    const storyObject: Optional<ClientObject> = getObjectByStoryId(params[0]);

    if (!storyObject) {
      abort("TURN_ON_AND_FORCE. Target object does ! exist");

      return;
    }

    if (params[1] === null) {
      params[1] = 55;
    }

    if (params[2] === null) {
      params[2] = 14000;
    }

    storyObject.set_const_force(createVector(0, 1, 0), params[1], params[2]);
    storyObject.start_particles("weapons\\light_signal", "link");
    storyObject.get_hanging_lamp().turn_on();
  }
);

/**
 * todo;
 */
extern("xr_effects.turn_off_and_force", (actor: ClientObject, object: ClientObject, p: [TStringId]): void => {
  const storyObject: Optional<ClientObject> = getObjectByStoryId(p[0]);

  if (!storyObject) {
    abort("TURN_OFF [%s]. Target object does ! exist", p[0]);
  }

  storyObject.stop_particles("weapons\\light_signal", "link");
  storyObject.get_hanging_lamp().turn_off();
});

/**
 * todo;
 */
extern("xr_effects.turn_on_object", (actor: ClientObject, object: ClientObject): void => {
  object.get_hanging_lamp().turn_on();
});

/**
 * todo;
 */
extern("xr_effects.turn_on", (actor: ClientObject, object: ClientObject, parameters: LuaArray<TStringId>) => {
  for (const [index, storyId] of parameters) {
    const storyObject: Optional<ClientObject> = getObjectByStoryId(storyId);

    if (!storyObject) {
      abort("TURN_ON [%s]. Target object does ! exist", storyId);
    }

    storyObject.get_hanging_lamp().turn_on();
  }
});

/**
 * todo;
 */
extern(
  "xr_effects.set_weather",
  (actor: ClientObject, object: ClientObject, [weatherName, isForced]: [TName, string]): void => {
    logger.info("Set weather:", weatherName);

    if (weatherName !== null) {
      level.set_weather(weatherName, isForced === TRUE);
    }
  }
);

/**
 * todo;
 */
extern("xr_effects.start_surge", (): void => {
  logger.info("Start surge");
  SurgeManager.getInstance().requestSurgeStart();
});

/**
 * todo;
 */
extern("xr_effects.stop_surge", (): void => {
  logger.info("Stop surge");
  SurgeManager.getInstance().requestSurgeStop();
});

/**
 * todo;
 */
extern(
  "xr_effects.set_surge_mess_and_task",
  (actor: ClientObject, object: ClientObject, p: [string, Optional<string>]): void => {
    const surgeManager: SurgeManager = SurgeManager.getInstance();

    surgeManager.setSurgeMessage(p[0]);

    if (p[1]) {
      surgeManager.setSurgeTask(p[1]);
    }
  }
);

/**
 * todo;
 */
extern("xr_effects.enable_anomaly", (actor: ClientObject, object: ClientObject, p: [string]) => {
  if (p[0] === null) {
    abort("Story id for enable_anomaly function is ! set");
  }

  const storyObject: Optional<ClientObject> = getObjectByStoryId(p[0]);

  if (!storyObject) {
    abort("There is no object with story_id %s for enable_anomaly function", tostring(p[0]));
  }

  storyObject.enable_anomaly();
});

/**
 * todo;
 */
extern("xr_effects.disable_anomaly", (actor: ClientObject, object: ClientObject, p: [TStringId]): void => {
  if (p[0] === null) {
    abort("Story id for disable_anomaly function is ! set");
  }

  const storyObject: Optional<ClientObject> = getObjectByStoryId(p[0]);

  if (!storyObject) {
    abort("There is no object with story_id %s for disable_anomaly function", tostring(p[0]));
  }

  storyObject.disable_anomaly();
});

/**
 * todo;
 */
extern("xr_effects.launch_signal_rocket", (actor: ClientObject, obj: ClientObject, p: [string]): void => {
  if (p === null) {
    abort("Signal rocket name is ! set!");
  }

  if (registry.signalLights.get(p[0]) !== null) {
    registry.signalLights.get(p[0]).launch();
  } else {
    abort("No such signal rocket. [%s] on level", tostring(p[0]));
  }
});

/**
 * todo;
 */
extern(
  "xr_effects.create_cutscene_actor_with_weapon",
  (
    actor: ClientObject,
    object: ClientObject,
    params: [Optional<string>, Optional<string>, number, number, number]
  ): void => {
    logger.info("Create cutscene actor with weapon");

    const spawnSection: Optional<TSection> = params[0];

    if (spawnSection === null) {
      abort("Wrong spawn section for 'spawn_object' function %s. For object %s", tostring(spawnSection), object.name());
    }

    const pathName: Optional<TName> = params[1];

    if (pathName === null) {
      abort("Wrong path_name for 'spawn_object' function %s. For object %s", tostring(pathName), object.name());
    }

    if (!level.patrol_path_exists(pathName)) {
      abort("Path %s doesnt exist. Function 'spawn_object' for object %s ", tostring(pathName), object.name());
    }

    const ptr: Patrol = new patrol(pathName);
    const index: TIndex = params[2] || 0;
    const yaw: TRate = params[3] || 0;

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

    const slotOverride: TIndex = params[4] || 0;

    let slot: number;
    let activeItem: Optional<ClientObject> = null;

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
 * todo;
 */
extern("xr_effects.stop_sr_cutscene", (actor: ClientObject, object: ClientObject, parameters: []) => {
  const state: IRegistryObjectState = registry.objects.get(object.id());

  if (state.activeScheme !== null) {
    state[state.activeScheme]!.signals!.set("cam_effector_stop", true);
  }
});
