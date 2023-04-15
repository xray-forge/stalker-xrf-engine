import {
  alife,
  anim,
  clsid,
  game,
  game_object,
  get_console,
  get_hud,
  hit,
  level,
  move,
  particles_object,
  patrol,
  vector,
  XR_action_planner,
  XR_CGameTask,
  XR_cse_alife_creature_abstract,
  XR_cse_alife_human_abstract,
  XR_cse_alife_item_artefact,
  XR_cse_alife_item_weapon,
  XR_cse_alife_object,
  XR_cse_alife_object_physic,
  XR_game_object,
  XR_hit,
  XR_patrol,
  XR_vector,
} from "xray16";

import {
  getObjectByStoryId,
  getObjectIdByStoryId,
  getServerObjectByStoryId,
  IRegistryObjectState,
  registry,
  SYSTEM_INI,
  unregisterHelicopter,
} from "@/engine/core/database";
import { portableStoreGet, portableStoreSet } from "@/engine/core/database/portable_store";
import { GlobalSoundManager } from "@/engine/core/managers/GlobalSoundManager";
import { ItemUpgradesManager } from "@/engine/core/managers/ItemUpgradesManager";
import { ENotificationDirection, NotificationManager, TNotificationIcon } from "@/engine/core/managers/notifications";
import { SimulationBoardManager } from "@/engine/core/managers/SimulationBoardManager";
import { SleepManager } from "@/engine/core/managers/SleepManager";
import { SurgeManager } from "@/engine/core/managers/SurgeManager";
import { TaskManager } from "@/engine/core/managers/tasks";
import { TreasureManager } from "@/engine/core/managers/TreasureManager";
import { WeatherManager } from "@/engine/core/managers/WeatherManager";
import { SmartTerrain } from "@/engine/core/objects/alife/smart/SmartTerrain";
import { Squad } from "@/engine/core/objects/alife/squad/Squad";
import { Stalker } from "@/engine/core/objects/alife/Stalker";
import { update_logic } from "@/engine/core/objects/binders/StalkerBinder";
import { EStalkerState } from "@/engine/core/objects/state";
import { SchemeAbuse } from "@/engine/core/schemes/abuse/SchemeAbuse";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/base/utils";
import { ISchemeCombatState } from "@/engine/core/schemes/combat";
import { ISchemeCombatIgnoreState } from "@/engine/core/schemes/combat_ignore";
import { ISchemeMobCombatState } from "@/engine/core/schemes/mob/combat";
import { init_target } from "@/engine/core/schemes/remark/actions/ActionRemarkActivity";
import { abort } from "@/engine/core/utils/assertion";
import { isActorInZoneWithName } from "@/engine/core/utils/check/check";
import { isStalker } from "@/engine/core/utils/check/is";
import { setInactiveInputTime } from "@/engine/core/utils/control";
import { createAutoSave } from "@/engine/core/utils/game_save";
import { find_stalker_for_job, switch_to_desired_job as switchToGulagDesiredJob } from "@/engine/core/utils/gulag";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { readIniString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { IConfigSwitchCondition, parseConditionsList } from "@/engine/core/utils/parse";
import {
  increaseNumberRelationBetweenCommunityAndId,
  setObjectSympathy,
  setSquadGoodwill,
  setSquadGoodwillToNpc,
} from "@/engine/core/utils/relation";
import { animations } from "@/engine/lib/constants/animation/animations";
import { TCaption } from "@/engine/lib/constants/captions/captions";
import { TCommunity } from "@/engine/lib/constants/communities";
import { detectors, TDetector } from "@/engine/lib/constants/items/detectors";
import { helmets } from "@/engine/lib/constants/items/helmets";
import { misc } from "@/engine/lib/constants/items/misc";
import { outfits } from "@/engine/lib/constants/items/outfits";
import { quest_items } from "@/engine/lib/constants/items/quest_items";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { relations, TRelation } from "@/engine/lib/constants/relations";
import { TTreasure } from "@/engine/lib/constants/treasures";
import { FALSE, TRUE } from "@/engine/lib/constants/words";
import { TZone, zones } from "@/engine/lib/constants/zones";
import { EScheme, LuaArray, Optional, TCount, TIndex, TName, TNumberId, TSection, TStringId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export function update_npc_logic(actor: XR_game_object, npc: XR_game_object, params: LuaArray<TStringId>): void {
  for (const [index, storyId] of params) {
    const object: Optional<XR_game_object> = getObjectByStoryId(storyId);

    if (object !== null) {
      update_logic(object);

      const planner: XR_action_planner = object.motivation_action_manager();

      planner.update();
      planner.update();
      planner.update();

      const state: IRegistryObjectState = registry.objects.get(object.id());

      // todo: Is it ok? Why?
      state.stateManager!.update();
      state.stateManager!.update();
      state.stateManager!.update();
      state.stateManager!.update();
      state.stateManager!.update();
      state.stateManager!.update();
      state.stateManager!.update();
    }
  }
}

/**
 * todo;
 */
export function update_obj_logic(actor: XR_game_object, npc: XR_game_object, params: LuaArray<TStringId>): void {
  for (const [index, storyId] of params) {
    const object: Optional<XR_game_object> = getObjectByStoryId(storyId);

    if (object !== null) {
      logger.info("Update object logic:", object.id());

      const state: IRegistryObjectState = registry.objects.get(object.id());

      trySwitchToAnotherSection(object, state[state.active_scheme!]!, actor);
    }
  }
}

/**
 * todo;
 */
export function teleport_actor(actor: XR_game_object, npc: XR_game_object, params: [string, string]) {
  const point: XR_patrol = new patrol(params[0]);

  if (params[1] !== null) {
    const look: XR_patrol = new patrol(params[1]);
    const dir: number = -look.point(0).sub(point.point(0)).getH();

    actor.set_actor_direction(dir);
  }

  for (const [k, v] of registry.noWeaponZones) {
    if (isActorInZoneWithName(k, actor)) {
      registry.noWeaponZones.set(k, true);
    }
  }

  if (npc && npc.name() !== null) {
    logger.info("Teleporting actor from:", tostring(npc.name()));
  }

  actor.set_actor_position(point.point(0));
}

/**
 * todo;
 */
function reset_animation(npc: XR_game_object): void {
  const stateManager = registry.objects.get(npc.id()).stateManager!;

  if (stateManager === null) {
    return;
  }

  stateManager.animation.setState(null, true);
  stateManager.animation.setControl();
  stateManager.animstate.setState(null, true);
  stateManager.animstate.setControl();

  stateManager.setState(EStalkerState.IDLE, null, null, null, { isForced: true });

  stateManager.update();
  stateManager.update();
  stateManager.update();
  stateManager.update();
  stateManager.update();
  stateManager.update();
  stateManager.update();

  npc.set_body_state(move.standing);
  npc.set_mental_state(anim.free);
}

/**
 * todo;
 */
export function teleport_npc(actor: XR_game_object, npc: XR_game_object, p: [string, number]) {
  const patrol_point = p[0];
  const patrol_point_index = p[1] || 0;

  if (patrol_point === null) {
    abort("Wrong parameters in 'teleport_npc' function!!!");
  }

  const position: XR_vector = new patrol(patrol_point).point(patrol_point_index);

  reset_animation(npc);

  npc.set_npc_position(position);
}

/**
 * todo;
 */
export function teleport_npc_by_story_id(actor: XR_game_object, npc: XR_game_object, p: [TStringId, string, number]) {
  const storyId: Optional<TStringId> = p[0];
  const patrolPoint: Optional<TName> = p[1];
  const patrolPointIndex: TIndex = p[2] || 0;

  if (storyId === null || patrolPoint === null) {
    abort("Wrong parameters in 'teleport_npc_by_story_id' function!!!");
  }

  const position: XR_vector = new patrol(tostring(patrolPoint)).point(patrolPointIndex);
  const objectId: Optional<TNumberId> = getObjectIdByStoryId(storyId);

  if (objectId === null) {
    abort("There is no story object with id [%s]", storyId);
  }

  const cl_object = level.object_by_id(objectId);

  if (cl_object) {
    reset_animation(cl_object);
    cl_object.set_npc_position(position);
  } else {
    alife().object(objectId)!.position = position;
  }
}

/**
 * todo;
 */
export function teleport_squad(actor: XR_game_object, npc: XR_game_object, params: [TStringId, string, number]): void {
  const squadStoryId: Optional<TStringId> = params[0];
  const patrolPoint: TStringId = params[1];
  const patrolPointIndex: TIndex = params[2] || 0;

  if (squadStoryId === null || patrolPoint === null) {
    abort("Wrong parameters in 'teleport_squad' function!!!");
  }

  const position: XR_vector = new patrol(patrolPoint).point(patrolPointIndex);
  const squad: Optional<Squad> = getServerObjectByStoryId(squadStoryId);

  if (squad === null) {
    abort("There is no squad with story id [%s]", squadStoryId);
  }

  squad.set_squad_position(position);
}

/**
 * todo;
 */
export function give_items(actor: XR_game_object, npc: XR_game_object, params: Array<string>): void;
export function give_items(actor: XR_game_object, npc: XR_game_object, params: LuaArray<string> | Array<string>): void {
  for (const [i, itemSection] of params as LuaArray<string>) {
    logger.info("Give item to object:", npc.id(), itemSection);
    alife().create(itemSection, npc.position(), npc.level_vertex_id(), npc.game_vertex_id(), npc.id());
  }
}

// todo: Probably simplify, why accessing alife?
export function give_item(
  actor: XR_game_object,
  npc: Optional<XR_game_object> | XR_cse_alife_human_abstract,
  p: [string, Optional<string>]
) {
  const objectId: TNumberId = p[1] === null ? (npc as XR_game_object).id() : getObjectIdByStoryId(p[1])!;
  const serverObject: XR_cse_alife_object = alife().object(objectId)!;

  logger.info("Give item:", objectId, p[0]);

  alife().create(
    p[0],
    serverObject.position,
    serverObject.m_level_vertex_id,
    serverObject.m_game_vertex_id,
    serverObject.id
  );
}

/**
 * todo;
 */
export function play_particle_on_path(actor: XR_game_object, npc: XR_game_object, p: [string, string, number]) {
  const name = p[0];
  const path = p[1];
  let point_prob = p[2];

  if (name === null || path === null) {
    return;
  }

  if (point_prob === null) {
    point_prob = 100;
  }

  const patrolObject: XR_patrol = new patrol(path);
  const count = patrolObject.count();

  for (const a of $range(0, count - 1)) {
    const particle = new particles_object(name);

    if (math.random(100) <= point_prob) {
      particle.play_at_pos(patrolObject.point(a));
    }
  }
}

/**
 * todo;
 */
export function send_tip(actor: XR_game_object, npc: XR_game_object, params: [string, string, string]): void {
  logger.info("Send tip");
  NotificationManager.getInstance().sendTipNotification(
    params[0],
    params[1] as unknown as TNotificationIcon,
    0,
    null,
    params[2]
  );
}

/**
 * todo;
 */
export function hit_npc(
  actor: XR_game_object,
  npc: XR_game_object,
  params: [string, string, string, number, number, string]
): void {
  logger.info("Hit npc");

  const h = new hit();
  const rev = params[5] && params[5] === TRUE;

  h.draftsman = npc;
  h.type = hit.wound;
  if (params[0] !== "self") {
    const hitter: Optional<XR_game_object> = getObjectByStoryId(params[0]);

    if (!hitter) {
      return;
    }

    if (rev) {
      h.draftsman = hitter;
      h.direction = hitter.position().sub(npc.position());
    } else {
      h.direction = npc.position().sub(hitter.position());
    }
  } else {
    if (rev) {
      h.draftsman = null;
      h.direction = npc.position().sub(new patrol(params[1]).point(0));
    } else {
      h.direction = new patrol(params[1]).point(0).sub(npc.position());
    }
  }

  h.bone(params[2]);
  h.power = params[3];
  h.impulse = params[4];

  npc.hit(h);
}

/**
 * todo;
 */
export function hit_obj(
  actor: XR_game_object,
  npc: XR_game_object,
  params: [string, string, number, number, string, string]
) {
  logger.info("Hit obj");

  const h: XR_hit = new hit();
  const object: Optional<XR_game_object> = getObjectByStoryId(params[0]);

  if (!object) {
    return;
  }

  h.bone(params[1]);
  h.power = params[2];
  h.impulse = params[3];

  if (params[4]) {
    h.direction = new vector().sub(new patrol(params[4]).point(0), object.position());
  } else {
    h.direction = new vector().sub(npc.position(), object.position());
  }

  h.draftsman = npc;
  h.type = hit.wound;
  object.hit(h);
}

/**
 * todo;
 */
export function hit_npc_from_actor(actor: XR_game_object, npc: XR_game_object, p: [Optional<TStringId>]): void {
  const h: XR_hit = new hit();
  let storyObject: Optional<XR_game_object> = null;

  h.draftsman = actor;
  h.type = hit.wound;

  if (p[0]) {
    storyObject = getObjectByStoryId(p[0]);

    if (storyObject) {
      h.direction = actor.position().sub(storyObject.position());
    }

    if (!storyObject) {
      h.direction = actor.position().sub(npc.position());
    }
  } else {
    h.direction = actor.position().sub(npc.position());
    storyObject = npc;
  }

  h.bone("bip01_spine");
  h.power = 0.001;
  h.impulse = 0.001;

  storyObject!.hit(h);
}

/**
 * todo;
 */
export function restore_health(actor: XR_game_object, npc: XR_game_object): void {
  npc.health = 1;
}

/**
 * todo;
 */
export function make_enemy(actor: XR_game_object, npc: XR_game_object, p: [string, string]) {
  if (p === null) {
    abort("Invalid parameter in function 'hit_npc_from_npc'!!!!");
  }

  const h: XR_hit = new hit();
  let hitted_npc = npc;

  h.draftsman = getObjectByStoryId(p[0]);

  if (p[1] !== null) {
    hitted_npc = getObjectByStoryId(p[1])!;
  }

  h.type = hit.wound;
  h.direction = h.draftsman!.position().sub(hitted_npc.position());
  h.bone("bip01_spine");
  h.power = 0.03;
  h.impulse = 0.03;
  hitted_npc.hit(h);
}

/**
 * todo;
 */
export function sniper_fire_mode(actor: XR_game_object, npc: XR_game_object, p: [string]): void {
  if (p[0] === TRUE) {
    npc.sniper_fire_mode(true);
  } else {
    npc.sniper_fire_mode(false);
  }
}

/**
 * todo;
 */
export function kill_npc(actor: XR_game_object, npc: Optional<XR_game_object>, p: [Optional<TStringId>]) {
  if (p && p[0]) {
    npc = getObjectByStoryId(p[0]);
  }

  if (npc !== null && npc.alive()) {
    npc.kill(npc);
  }
}

/**
 * todo;
 */
export function remove_npc(actor: XR_game_object, npc: XR_game_object, p: [Optional<TStringId>]) {
  let objectId: Optional<TNumberId> = null;

  if (p && p[0]) {
    objectId = getObjectIdByStoryId(p[0]);
  }

  if (objectId !== null) {
    alife().release(alife().object(objectId), true);
  }
}

/**
 * todo;
 */
export function inc_counter(actor: XR_game_object, npc: XR_game_object, p: [Optional<string>, number]) {
  if (p[0]) {
    const inc_value = p[1] || 1;
    const new_value = portableStoreGet(actor, p[0], 0) + inc_value;

    portableStoreSet(actor, p[0], new_value);
  }
}

/**
 * todo;
 */
export function dec_counter(actor: XR_game_object, npc: XR_game_object, p: [Optional<string>, number]) {
  if (p[0]) {
    const dec_value = p[1] || 1;
    let new_value = portableStoreGet(actor, p[0], 0) - dec_value;

    if (new_value < 0) {
      new_value = 0;
    }

    portableStoreSet(actor, p[0], new_value);
  }
}

/**
 * todo;
 */
export function set_counter(
  actor: XR_game_object,
  npc: XR_game_object,
  params: [Optional<string>, Optional<number>]
): void {
  if (params[0]) {
    portableStoreSet(actor, params[0], params[1] || 0);
  }
}

/**
 * todo;
 */
export function actor_punch(npc: XR_game_object): void {
  const actor: XR_game_object = registry.actor;

  if (actor.position().distance_to_sqr(npc.position()) > 4) {
    return;
  }

  setInactiveInputTime(30);
  level.add_cam_effector(animations.camera_effects_fusker, 999, false, "");

  const active_slot = actor.active_slot();

  if (active_slot !== 2 && active_slot !== 3) {
    return;
  }

  const active_item = actor.active_item();

  if (active_item) {
    actor.drop_item(active_item);
  }
}

/**
 * todo;
 */
export function clearAbuse(npc: XR_game_object) {
  SchemeAbuse.clearAbuse(npc);
}

/**
 * todo;
 */
export function turn_off_underpass_lamps(actor: XR_game_object, npc: XR_game_object): void {
  const lamps_table = {
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

  for (const [k, v] of lamps_table) {
    const object: Optional<XR_game_object> = getObjectByStoryId(k);

    if (object) {
      object.get_hanging_lamp().turn_off();
    } else {
      logger.warn("function 'turn_off_underpass_lamps' lamp [%s] does ! exist", tostring(k));
    }
  }
}

/**
 * todo;
 */
export function turn_off(actor: XR_game_object, npc: XR_game_object, parameters: LuaArray<TStringId>): void {
  for (const [index, storyId] of parameters) {
    const object: Optional<XR_game_object> = getObjectByStoryId(storyId);

    if (!object) {
      abort("TURN_OFF. Target object with story_id [%s] does ! exist", storyId);
    }

    object.get_hanging_lamp().turn_off();
  }
}

/**
 * todo;
 */
export function turn_off_object(actor: XR_game_object, npc: XR_game_object): void {
  npc.get_hanging_lamp().turn_off();
}

/**
 * todo;
 */
export function turn_on_and_force(
  actor: XR_game_object,
  npc: XR_game_object,
  params: [TStringId, number, number]
): void {
  const object: Optional<XR_game_object> = getObjectByStoryId(params[0]);

  if (!object) {
    abort("TURN_ON_AND_FORCE. Target object does ! exist");

    return;
  }

  if (params[1] === null) {
    params[1] = 55;
  }

  if (params[2] === null) {
    params[2] = 14000;
  }

  object.set_const_force(new vector().set(0, 1, 0), params[1], params[2]);
  object.start_particles("weapons\\light_signal", "link");
  object.get_hanging_lamp().turn_on();
}

/**
 * todo;
 */
export function turn_off_and_force(actor: XR_game_object, npc: XR_game_object, p: [TStringId]): void {
  const object: Optional<XR_game_object> = getObjectByStoryId(p[0]);

  if (!object) {
    abort("TURN_OFF [%s]. Target object does ! exist", npc.name());
  }

  object.stop_particles("weapons\\light_signal", "link");
  object.get_hanging_lamp().turn_off();
}

/**
 * todo;
 */
export function turn_on_object(actor: XR_game_object, npc: XR_game_object): void {
  npc.get_hanging_lamp().turn_on();
}

/**
 * todo;
 */
export function turn_on(actor: XR_game_object, npc: XR_game_object, parameters: LuaArray<TStringId>) {
  for (const [index, storyId] of parameters) {
    const object: Optional<XR_game_object> = getObjectByStoryId(storyId);

    if (!object) {
      abort("TURN_ON [%s]. Target object does ! exist", npc.name());
    }

    object.get_hanging_lamp().turn_on();
  }
}

/**
 * todo;
 */
export function disable_combat_handler(actor: XR_game_object, npc: XR_game_object): void {
  const state: IRegistryObjectState = registry.objects.get(npc.id());

  if (state[EScheme.COMBAT]) {
    (state[EScheme.COMBAT] as ISchemeCombatState).enabled = false;
  }

  if (state[EScheme.MOB_COMBAT]) {
    (state[EScheme.MOB_COMBAT] as ISchemeMobCombatState).enabled = false;
  }
}

/**
 * todo;
 */
export function disable_combat_ignore_handler(actor: XR_game_object, npc: XR_game_object): void {
  const state: IRegistryObjectState = registry.objects.get(npc.id());

  if (state[EScheme.COMBAT_IGNORE]) {
    (state[EScheme.COMBAT_IGNORE] as ISchemeCombatIgnoreState).enabled = false;
  }
}

/**
 * todo;
 */
export function heli_start_flame(actor: XR_game_object, npc: XR_game_object): void {
  npc.get_helicopter().StartFlame();
}

/**
 * todo;
 */
export function heli_die(actor: XR_game_object, npc: XR_game_object): void {
  npc.get_helicopter().Die();
  unregisterHelicopter(npc);
}

/**
 * todo;
 */
export function set_weather(actor: XR_game_object, npc: XR_game_object, p: [string, string]) {
  logger.info("Set weather:", p[0]);

  if (p[0]) {
    if (p[1] === TRUE) {
      level.set_weather(p[0], true);
    } else {
      level.set_weather(p[0], false);
    }
  }
}

/**
 * todo;
 */
export function game_disconnect(actor: XR_game_object, npc: XR_game_object): void {
  logger.info("Game disconnect");
  get_console().execute("disconnect");
}

let gameover_credits_started: boolean = false;

/**
 * todo;
 */
export function game_credits(actor: XR_game_object, npc: XR_game_object): void {
  logger.info("Game credits");

  gameover_credits_started = true;
  game.start_tutorial("credits_seq");
}

/**
 * todo;
 */
export function game_over(actor: XR_game_object, npc: XR_game_object): void {
  logger.info("Game over");

  if (gameover_credits_started !== true) {
    return;
  }

  get_console().execute("main_menu on");
}

/**
 * todo;
 */
export function after_credits(actor: XR_game_object, npc: XR_game_object): void {
  get_console().execute("main_menu on");
}

/**
 * todo;
 */
export function before_credits(actor: XR_game_object, npc: XR_game_object): void {
  get_console().execute("main_menu off");
}

/**
 * todo;
 */
export function on_tutor_gameover_stop() {
  get_console().execute("main_menu on");
}

/**
 * todo;
 */
export function on_tutor_gameover_quickload() {
  get_console().execute("load_last_save");
}

/**
 * todo;
 */
export function get_stalker_for_new_job(actor: XR_game_object, npc: XR_game_object, p: [string]) {
  find_stalker_for_job(npc, p[0]);
}

/**
 * todo;
 */
export function switch_to_desired_job(actor: XR_game_object, npc: XR_game_object, p: []) {
  switchToGulagDesiredJob(npc);
}

/**
 * todo;
 */
export function spawn_object(
  actor: XR_game_object,
  obj: Optional<XR_game_object>,
  params: [string, string, Optional<number>, Optional<number>]
): void {
  logger.info("Spawn object");

  const spawn_sect = params[0];

  if (spawn_sect === null) {
    abort("Wrong spawn section for 'spawn_object' function %s. For object %s", tostring(spawn_sect), obj?.name());
  }

  const path_name = params[1];

  if (path_name === null) {
    abort("Wrong path_name for 'spawn_object' function %s. For object %s", tostring(path_name), obj?.name());
  }

  if (!level.patrol_path_exists(path_name)) {
    abort("Path %s doesnt exist. Function 'spawn_object' for object %s ", tostring(path_name), obj?.name());
  }

  const ptr = new patrol(path_name);
  const index = params[2] || 0;
  const yaw = params[3] || 0;

  // --' printf("Spawning %s at %s, %s", tostring(p[1]), tostring(p[2]), tostring(p[3]))
  const serverObject = alife().create<XR_cse_alife_object_physic>(
    spawn_sect,
    ptr.point(index),
    ptr.level_vertex_id(0),
    ptr.game_vertex_id(0)
  );

  if (isStalker(serverObject)) {
    serverObject.o_torso().yaw = (yaw * math.pi) / 180;
  } else if (serverObject.clsid() === clsid.script_phys) {
    serverObject.set_yaw((yaw * math.pi) / 180);
  }
}

/**
 * todo;
 */
export function spawn_corpse(actor: XR_game_object, obj: XR_game_object, params: [string, string, number]): void {
  logger.info("Spawn corpse:", params[0]);

  const spawn_sect = params[0];

  if (spawn_sect === null) {
    abort("Wrong spawn section for 'spawn_corpse' function %s. For object %s", tostring(spawn_sect), obj.name());
  }

  const path_name = params[1];

  if (path_name === null) {
    abort("Wrong path_name for 'spawn_corpse' function %s. For object %s", tostring(path_name), obj.name());
  }

  if (!level.patrol_path_exists(path_name)) {
    abort("Path %s doesnt exist. Function 'spawn_corpse' for object %s ", tostring(path_name), obj.name());
  }

  const patrolObject: XR_patrol = new patrol(path_name);
  const index: TIndex = params[2] || 0;

  const serverObject: XR_cse_alife_creature_abstract = alife().create(
    spawn_sect,
    patrolObject.point(index),
    patrolObject.level_vertex_id(0),
    patrolObject.game_vertex_id(0)
  );

  serverObject.kill();
}

/**
 * todo;
 */
export function spawn_object_in(actor: XR_game_object, obj: XR_game_object, p: [string, string]): void {
  const spawn_sect = p[0];

  if (spawn_sect === null) {
    abort("Wrong spawn section for 'spawn_object' function %s. For object %s", tostring(spawn_sect), obj.name());
  }

  if (p[1] === null) {
    abort("Wrong target_name for 'spawn_object_in' function %s. For object %s", tostring(p[1]), obj.name());
  }

  const targetObjectId: Optional<TNumberId> = getObjectIdByStoryId(p[1]);

  if (targetObjectId !== null) {
    const box = alife().object(targetObjectId);

    if (box === null) {
      abort("There is no such object %s", p[1]);
    }

    alife().create(spawn_sect, new vector(), 0, 0, targetObjectId);
  } else {
    abort("object is null %s", tostring(p[1]));
  }
}

/**
 * todo;
 */
export function spawn_npc_in_zone(actor: XR_game_object, obj: XR_game_object, params: [string, TName]): void {
  const spawn_sect = params[0];

  if (spawn_sect === null) {
    abort("Wrong spawn section for 'spawn_object' function %s. For object %s", tostring(spawn_sect), obj.name());
  }

  const zone_name = params[1];

  if (zone_name === null) {
    abort("Wrong zone_name for 'spawn_object' function %s. For object %s", tostring(zone_name), obj.name());
  }

  if (registry.zones.get(zone_name) === null) {
    abort("Zone %s doesnt exist. Function 'spawn_object' for object %s ", tostring(zone_name), obj.name());
  }

  const zone = registry.zones.get(zone_name);
  const spawned_obj: Stalker = alife().create(
    spawn_sect,
    zone.position(),
    zone.level_vertex_id(),
    zone.game_vertex_id()
  );

  spawned_obj.sim_forced_online = true;
  spawned_obj.squad = 1;
  registry.scriptSpawned.set(spawned_obj.id, zone_name);
}

/**
 * todo;
 */
export function destroy_object(
  actor: XR_game_object,
  obj: XR_game_object,
  p: [string, string, Optional<string>]
): void {
  let sobj: Optional<XR_cse_alife_object> = null;

  if (p === null) {
    sobj = alife().object(obj.id());
  } else {
    if (p[0] === null || p[1] === null) {
      abort("Wrong parameters in destroy_object function!!!");
    }

    const target_str = p[2] !== null ? [0] + "|" + p[1] + "," + p[2] : p[0] + "|" + p[1];

    const [target_position, target_id, target_init] = init_target(obj, target_str);

    if (target_id === null) {
      logger.info(
        "You are trying to set non-existant target [%s] for object [%s] in section [%s]:",
        target_str,
        target_id,
        registry.objects.get(obj.id()).active_section
      );
    }

    sobj = alife().object(target_id as number);
  }

  if (sobj === null) {
    return;
  }

  alife().release(sobj, true);
}

/**
 * todo;
 */
export function give_actor(actor: XR_game_object, npc: Optional<XR_game_object>, p: Array<string>): void;
export function give_actor(
  actor: XR_game_object,
  npc: Optional<XR_game_object>,
  p: LuaArray<string> | Array<string>
): void {
  for (const [k, v] of p as LuaArray<string>) {
    alife().create(v, actor.position(), actor.level_vertex_id(), actor.game_vertex_id(), actor.id());
    NotificationManager.getInstance().sendItemRelocatedNotification(ENotificationDirection.IN, v);
  }
}

/**
 * todo;
 */
export function activate_weapon_slot(actor: XR_game_object, npc: XR_game_object, p: [number]): void {
  actor.activate_slot(p[0]);
}

/**
 * todo;
 */
export function anim_obj_forward(actor: XR_game_object, npc: XR_game_object, p: LuaArray<string>): void {
  for (const [k, v] of p) {
    if (v !== null) {
      registry.animatedDoors.get(v).anim_forward();
    }
  }
}

/**
 * todo;
 */
export function anim_obj_backward(actor: XR_game_object, npc: XR_game_object, p: [string]): void {
  if (p[0] !== null) {
    registry.animatedDoors.get(p[0]).anim_backward();
  }
}

/**
 * todo;
 */
export function anim_obj_stop(actor: XR_game_object, npc: XR_game_object, p: [string]): void {
  if (p[0] !== null) {
    registry.animatedDoors.get(p[0]).anim_stop();
  }
}

/**
 * todo;
 */
export function play_sound(
  actor: XR_game_object,
  object: XR_game_object,
  p: [Optional<string>, Optional<TCommunity>, Optional<string | number>]
): void {
  const theme = p[0];
  const faction: Optional<TCommunity> = p[1];
  const smartTerrain: SmartTerrain = SimulationBoardManager.getInstance().getSmartTerrainByName(
    p[2] as TName
  ) as SmartTerrain;
  const smartTerrainId = smartTerrain !== null ? smartTerrain.id : (p[2] as TNumberId);

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

/**
 * todo;
 */
export function stop_sound(actor: XR_game_object, npc: XR_game_object): void {
  GlobalSoundManager.getInstance().stopSoundByObjectId(npc.id());
}

/**
 * todo;
 */
export function play_sound_looped(actor: XR_game_object, obj: XR_game_object, params: [string]): void {
  GlobalSoundManager.getInstance().playLoopedSound(obj.id(), params[0]);
}

/**
 * todo;
 */
export function stop_sound_looped(actor: XR_game_object, obj: XR_game_object) {
  GlobalSoundManager.getInstance().stopLoopedSound(obj.id(), null);
}

/**
 * todo;
 */
export function play_sound_by_story(
  actor: XR_game_object,
  obj: XR_game_object,
  p: [string, string, string, TName | number]
) {
  const storyObjectId: Optional<TNumberId> = getObjectIdByStoryId(p[0]);
  const theme = p[1];
  const faction = p[2];

  const smartTerrain: Optional<SmartTerrain> = SimulationBoardManager.getInstance().getSmartTerrainByName(
    p[3] as TName
  );
  const smartTerrainId: TNumberId = smartTerrain !== null ? smartTerrain.id : (p[3] as number);

  GlobalSoundManager.getInstance().playSound(storyObjectId as number, theme, faction, smartTerrainId);
}

/**
 * todo;
 */
export function barrel_explode(actor: XR_game_object, npc: XR_game_object, p: [TStringId]) {
  const explodeObject: Optional<XR_game_object> = getObjectByStoryId(p[0]);

  if (explodeObject !== null) {
    explodeObject.explode(0);
  }
}

/**
 * todo;
 */
export function create_squad(actor: XR_game_object, obj: Optional<XR_game_object>, params: [TStringId, TName]): void {
  const squadId: Optional<TStringId> = params[0];

  if (squadId === null) {
    abort("Wrong squad identificator [NIL] in create_squad function");
  }

  const smartTerrainName: Optional<TName> = params[1];

  if (smartTerrainName === null) {
    abort("Wrong smart name [NIL] in create_squad function");
  }

  if (!SYSTEM_INI.section_exist(squadId)) {
    abort("Wrong squad identificator [%s]. Squad descr doesnt exist.", tostring(squadId));
  }

  const simulationBoardManager: SimulationBoardManager = SimulationBoardManager.getInstance();
  const smartTerrain: Optional<SmartTerrain> = simulationBoardManager.getSmartTerrainByName(smartTerrainName);

  if (smartTerrain === null) {
    abort("Wrong smart_name [%s] for faction in create_squad function", tostring(smartTerrainName));
  }

  const squad: Squad = simulationBoardManager.createSmartSquad(smartTerrain, squadId);

  simulationBoardManager.enterSmartTerrain(squad, smartTerrain.id);

  for (const squadMember of squad.squad_members()) {
    simulationBoardManager.setupObjectSquadAndGroup(squadMember.object);
  }

  squad.update();
}

/**
 * todo;
 */
export function create_squad_member(
  actor: XR_game_object,
  object: XR_game_object,
  params: [TSection, TStringId, string]
): void {
  const squad_member_sect = params[0];
  const storyId: Optional<TStringId> = params[1];

  let position = null;
  let level_vertex_id = null;
  let game_vertex_id = null;

  if (storyId === null) {
    abort("Wrong squad identificator [NIL] in 'create_squad_member' function");
  }

  const simulationBoardManager: SimulationBoardManager = SimulationBoardManager.getInstance();
  const squad: Squad = getServerObjectByStoryId(storyId) as Squad;
  const squadSmartTerrain: Optional<SmartTerrain> = simulationBoardManager.getSmartTerrainDescriptorById(
    squad.smart_id as TNumberId
  )!.smartTerrain;

  if (params[2] !== null) {
    let spawn_point: TStringId;

    if (params[2] === "simulation_point") {
      const data: string = readIniString(SYSTEM_INI, squad.section_name(), "spawn_point", false, "");
      const condlist: LuaArray<IConfigSwitchCondition> =
        data === "" || data === null
          ? parseConditionsList(squadSmartTerrain.spawnPointName as string)
          : parseConditionsList(data);

      spawn_point = pickSectionFromCondList(actor, object, condlist) as TStringId;
    } else {
      spawn_point = params[2];
    }

    const point = new patrol(spawn_point);

    position = point.point(0);
    level_vertex_id = point.level_vertex_id(0);
    game_vertex_id = point.game_vertex_id(0);
  } else {
    const commander: XR_cse_alife_human_abstract = alife().object(squad.commander_id()) as XR_cse_alife_human_abstract;

    position = commander.position;
    level_vertex_id = commander.m_level_vertex_id;
    game_vertex_id = commander.m_game_vertex_id;
  }

  const newSquadMemberId: TNumberId = squad.addSquadMember(
    squad_member_sect,
    position,
    level_vertex_id,
    game_vertex_id
  );

  squad.assign_squad_member_to_smart(newSquadMemberId, squadSmartTerrain, null);
  simulationBoardManager.setupObjectSquadAndGroup(alife().object(newSquadMemberId) as XR_cse_alife_creature_abstract);
  // --squad_smart.refresh()
  squad.update();
}

/**
 * todo;
 */
export function remove_squad(actor: XR_game_object, obj: XR_game_object, p: [string]): void {
  const story_id = p[0];

  if (story_id === null) {
    abort("Wrong squad identificator [NIL] in remove_squad function");
  }

  const squad: Optional<Squad> = getServerObjectByStoryId(story_id);

  if (squad === null) {
    abort("Wrong squad identificator [%s]. squad doesnt exist", tostring(story_id));
  }

  SimulationBoardManager.getInstance().onRemoveSquad(squad);
}

/**
 * todo;
 */
export function kill_squad(actor: XR_game_object, obj: XR_game_object, p: [Optional<TStringId>]): void {
  const storyId: Optional<TStringId> = p[0];

  if (storyId === null) {
    abort("Wrong squad identificator [NIL] in kill_squad function");
  }

  const squad: Optional<Squad> = getServerObjectByStoryId(storyId);

  if (squad === null) {
    return;
  }

  const squadObjects: LuaTable<TNumberId, boolean> = new LuaTable();

  for (const k of squad.squad_members()) {
    squadObjects.set(k.id, true);
  }

  for (const [k, v] of squadObjects) {
    const clientObject: Optional<XR_game_object> = registry.objects.get(k)?.object;

    if (clientObject === null) {
      alife().object<XR_cse_alife_human_abstract>(tonumber(k)!)!.kill();
    } else {
      clientObject.kill(clientObject);
    }
  }
}

/**
 * todo;
 */
export function heal_squad(actor: XR_game_object, obj: XR_game_object, params: [TStringId, number]) {
  const storyId: Optional<TStringId> = params[0];
  let health_mod = 1;

  if (params[1] && params[1] !== null) {
    health_mod = math.ceil(params[1] / 100);
  }

  if (storyId === null) {
    abort("Wrong squad identificator [NIL] in heal_squad function");
  }

  const squad: Optional<Squad> = getServerObjectByStoryId(storyId);

  if (squad === null) {
    return;
  }

  for (const k of squad.squad_members()) {
    const cl_obj = registry.objects.get(k.id)?.object as Optional<XR_game_object>;

    if (cl_obj !== null) {
      cl_obj.health = health_mod;
    }
  }
}

/**
 * todo;
 */
export function clear_smart_terrain(actor: XR_game_object, object: XR_game_object, p: [string, string]) {
  logger.info("Clear smart terrain");

  const smartTerrainname: TName = p[0];

  if (smartTerrainname === null) {
    abort("Wrong squad identificator [NIL] in clear_smart_terrain function");
  }

  const simulationBoardManager: SimulationBoardManager = SimulationBoardManager.getInstance();
  const smartTerrain: SmartTerrain = simulationBoardManager.getSmartTerrainByName(smartTerrainname) as SmartTerrain;
  const smartTerrainId: TNumberId = smartTerrain.id;

  for (const [k, v] of simulationBoardManager.getSmartTerrainDescriptorById(smartTerrainId)!.assignedSquads) {
    if (p[1] && p[1] === FALSE) {
      // todo: Probably unreachable condition / cast
      if (!getObjectIdByStoryId(v.id as unknown as string)) {
        simulationBoardManager.exitSmartTerrain(v, smartTerrainId);
        simulationBoardManager.onRemoveSquad(v);
      }
    } else {
      simulationBoardManager.exitSmartTerrain(v, smartTerrainId);
      simulationBoardManager.onRemoveSquad(v);
    }
  }
}

/**
 * todo;
 */
export function give_task(actor: XR_game_object, obj: XR_game_object, p: [Optional<string>]) {
  if (p[0] === null) {
    abort("No parameter in give_task effect.");
  }

  TaskManager.getInstance().giveTask(p[0]);
}

/**
 * todo;
 */
export function set_active_task(actor: XR_game_object, npc: XR_game_object, p: [string]): void {
  logger.info("Set active task:", p[0]);

  if (p[0]) {
    const task: Optional<XR_CGameTask> = actor.get_task(tostring(p[0]), true);

    if (task) {
      actor.set_active_task(task);
    }
  }
}

/**
 * todo;
 */
export function actor_friend(actor: XR_game_object, npc: XR_game_object): void {
  npc.force_set_goodwill(1000, actor);
}

/**
 * todo;
 */
export function actor_neutral(actor: XR_game_object, npc: XR_game_object): void {
  npc.force_set_goodwill(0, actor);
}

/**
 * todo;
 */
export function actor_enemy(actor: XR_game_object, npc: XR_game_object): void {
  npc.force_set_goodwill(-1000, actor);
}

/**
 * todo;
 */
export function set_squad_neutral_to_actor(actor: XR_game_object, npc: XR_game_object, p: [TStringId]): void {
  const squad: Optional<Squad> = getServerObjectByStoryId(p[0]);

  if (squad === null) {
    return;
  } else {
    squad.updateSquadRelationToActor(relations.neutral);
  }
}

/**
 * todo;
 */
export function set_squad_friend_to_actor(actor: XR_game_object, npc: XR_game_object, p: [TStringId]): void {
  const squad: Optional<Squad> = getServerObjectByStoryId(p[0]);

  if (squad === null) {
    return;
  } else {
    squad.updateSquadRelationToActor(relations.friend);
  }
}

/**
 * todo;
 */
export function set_squad_enemy_to_actor(actor: XR_game_object, npc: XR_game_object, p: [TStringId]): void {
  const squad: Optional<Squad> = getServerObjectByStoryId(p[0]);

  if (squad === null) {
    return;
  } else {
    squad.updateSquadRelationToActor(relations.enemy);
  }
}

/**
 * todo;
 */
export function set_npc_sympathy(actor: XR_game_object, npc: XR_game_object, p: [number]): void {
  if (p[0] !== null) {
    setObjectSympathy(npc, p[0]);
  }
}

/**
 * todo;
 */
export function set_squad_goodwill(actor: XR_game_object, npc: XR_game_object, p: [string, TRelation]): void {
  if (p[0] !== null && p[1] !== null) {
    setSquadGoodwill(p[0], p[1]);
  }
}

/**
 * todo;
 */
export function set_squad_goodwill_to_npc(actor: XR_game_object, npc: XR_game_object, p: [string, TRelation]): void {
  if (p[0] !== null && p[1] !== null) {
    setSquadGoodwillToNpc(npc, p[0], p[1]);
  }
}

/**
 * todo;
 */
export function inc_faction_goodwill_to_actor(
  actor: XR_game_object,
  npc: XR_game_object,
  p: [Optional<TCommunity>, Optional<number>]
): void {
  const community = p[0];
  const delta = p[1];

  if (delta && community) {
    increaseNumberRelationBetweenCommunityAndId(community, actor.id(), tonumber(delta)!);
  } else {
    abort("Wrong parameters in function 'inc_faction_goodwill_to_actor'");
  }
}

/**
 * todo;
 */
export function dec_faction_goodwill_to_actor(
  actor: XR_game_object,
  npc: XR_game_object,
  params: [Optional<TCommunity>, Optional<TCount>]
): void {
  const community: Optional<TCommunity> = params[0];
  const delta: Optional<TCount> = params[1];

  if (delta && community) {
    increaseNumberRelationBetweenCommunityAndId(community, actor.id(), -tonumber(delta)!);
  } else {
    abort("Wrong parameters in function 'dec_faction_goodwill_to_actor'");
  }
}

/**
 * todo;
 */
export function kill_actor(actor: XR_game_object, npc: XR_game_object): void {
  logger.info("Kill actor");
  actor.kill(actor);
}

/**
 * todo;
 */
export function give_treasure(actor: XR_game_object, npc: XR_game_object, parameters: LuaArray<TTreasure>): void {
  logger.info("Give treasure");

  if (parameters === null) {
    abort("Required parameter is [NIL].");
  }

  const treasureManager: TreasureManager = TreasureManager.getInstance();

  for (const [index, value] of parameters) {
    treasureManager.giveActorTreasureCoordinates(value);
  }
}

/**
 * todo;
 */
export function start_surge(actor: XR_game_object, npc: XR_game_object, p: []): void {
  logger.info("Start surge");
  SurgeManager.getInstance().requestSurgeStart();
}

/**
 * todo;
 */
export function stop_surge(actor: XR_game_object, npc: XR_game_object, p: []): void {
  logger.info("Stop surge");
  SurgeManager.getInstance().requestSurgeStop();
}

/**
 * todo;
 */
export function set_surge_mess_and_task(
  actor: XR_game_object,
  npc: XR_game_object,
  p: [string, Optional<string>]
): void {
  const surgeManager: SurgeManager = SurgeManager.getInstance();

  surgeManager.setSurgeMessage(p[0]);

  if (p[1]) {
    surgeManager.setSurgeTask(p[1]);
  }
}

/**
 * todo;
 */
export function make_actor_visible_to_squad(actor: XR_game_object, npc: XR_game_object, p: [TStringId]): void {
  const storyId: Optional<TStringId> = p && p[0];
  const squad: Optional<Squad> = getServerObjectByStoryId(storyId);

  if (squad === null) {
    abort("There is no squad with id[%s]", storyId);
  }

  for (const k of squad.squad_members()) {
    const obj = level.object_by_id(k.id);

    if (obj !== null) {
      obj.make_object_visible_somewhen(actor);
    }
  }
}

/**
 * todo;
 */
export function stop_sr_cutscene(actor: XR_game_object, npc: XR_game_object, parameters: []) {
  const state: IRegistryObjectState = registry.objects.get(npc.id());

  if (state.active_scheme !== null) {
    state[state.active_scheme]!.signals!.set("cam_effector_stop", true);
  }
}

/**
 * todo;
 */
export function enable_anomaly(actor: XR_game_object, npc: XR_game_object, p: [string]) {
  if (p[0] === null) {
    abort("Story id for enable_anomaly function is ! set");
  }

  const object: Optional<XR_game_object> = getObjectByStoryId(p[0]);

  if (!object) {
    abort("There is no object with story_id %s for enable_anomaly function", tostring(p[0]));
  }

  object.enable_anomaly();
}

/**
 * todo;
 */
export function disable_anomaly(actor: XR_game_object, npc: XR_game_object, p: [TStringId]): void {
  if (p[0] === null) {
    abort("Story id for disable_anomaly function is ! set");
  }

  const object: Optional<XR_game_object> = getObjectByStoryId(p[0]);

  if (!object) {
    abort("There is no object with story_id %s for disable_anomaly function", tostring(p[0]));
  }

  object.disable_anomaly();
}

/**
 * todo;
 */
export function launch_signal_rocket(actor: XR_game_object, obj: XR_game_object, p: [string]): void {
  if (p === null) {
    abort("Signal rocket name is ! set!");
  }

  if (registry.signalLights.get(p[0]) !== null) {
    registry.signalLights.get(p[0]).launch();
  } else {
    abort("No such signal rocket. [%s] on level", tostring(p[0]));
  }
}

/**
 * todo;
 */
export function add_cs_text(actor: XR_game_object, npc: XR_game_object, p: [string]) {
  if (p[0]) {
    const hud = get_hud();
    let cs_text = hud.GetCustomStatic("text_on_screen_center");

    if (cs_text) {
      hud.RemoveCustomStatic("text_on_screen_center");
    }

    hud.AddCustomStatic("text_on_screen_center", true);
    cs_text = hud.GetCustomStatic("text_on_screen_center");
    cs_text!.wnd().TextControl().SetText(game.translate_string(p[0]));
  }
}

/**
 * todo;
 */
export function del_cs_text(actor: XR_game_object, npc: XR_game_object, p: []) {
  const hud = get_hud();
  const cs_text = hud.GetCustomStatic("text_on_screen_center");

  if (cs_text) {
    hud.RemoveCustomStatic("text_on_screen_center");
  }
}

/**
 * todo;
 */
export function spawn_item_to_npc(actor: XR_game_object, npc: XR_game_object, p: [Optional<string>]) {
  const new_item = p[0];

  if (new_item) {
    alife().create(new_item, npc.position(), npc.level_vertex_id(), npc.game_vertex_id(), npc.id());
  }
}

/**
 * todo;
 */
export function give_money_to_npc(actor: XR_game_object, npc: XR_game_object, p: [Optional<number>]) {
  const money = p[0];

  if (money) {
    npc.give_money(money);
  }
}

/**
 * todo;
 */
export function seize_money_to_npc(actor: XR_game_object, npc: XR_game_object, p: [Optional<number>]) {
  const money = p[0];

  if (money) {
    npc.give_money(-money);
  }
}

/**
 * todo;
 */
export function relocate_item(actor: XR_game_object, npc: XR_game_object, params: [string, string, string]) {
  logger.info("Relocate item");

  const item = params && params[0];
  const from_obj = params && getObjectByStoryId(params[1]);
  const to_obj = params && getObjectByStoryId(params[2]);

  if (to_obj !== null) {
    if (from_obj !== null && from_obj.object(item) !== null) {
      from_obj.transfer_item(from_obj.object(item)!, to_obj);
    } else {
      alife().create(item, to_obj.position(), to_obj.level_vertex_id(), to_obj.game_vertex_id(), to_obj.id());
    }
  } else {
    abort("Couldn't relocate item to NULL");
  }
}

/**
 * todo;
 */
export function set_squads_enemies(actor: XR_game_object, npc: XR_game_object, p: [string, string]) {
  if (p[0] === null || p[1] === null) {
    abort("Wrong parameters in function set_squad_enemies");

    return;
  }

  const squad_1: Optional<Squad> = getServerObjectByStoryId(p[0]);
  const squad_2: Optional<Squad> = getServerObjectByStoryId(p[1]);

  if (squad_1 === null) {
    abort("There is no squad with id[%s]", tostring(p[0]));
  } else if (squad_2 === null) {
    abort("There is no squad with id[%s]", tostring(p[1]));
  }

  for (const k of squad_1.squad_members()) {
    const npc_obj_1 = registry.objects.get(k.id)?.object as Optional<XR_game_object>;

    if (npc_obj_1 !== null) {
      for (const kk of squad_2.squad_members()) {
        const npc_obj_2 = registry.objects.get(kk.id).object as Optional<XR_game_object>;

        if (npc_obj_2 !== null) {
          npc_obj_1.set_relation(game_object.enemy, npc_obj_2);
          npc_obj_2.set_relation(game_object.enemy, npc_obj_1);
        }
      }
    }
  }
}

/**
 * todo;
 */
export function set_bloodsucker_state(actor: XR_game_object, npc: XR_game_object, p: [string, string]): void {
  if ((p && p[0]) === null) {
    abort("Wrong parameters in function 'set_bloodsucker_state'!!!");
  }

  let state = p[0];

  if (p[1] !== null) {
    state = p[1];
    npc = getObjectByStoryId(p[1]) as XR_game_object;
  }

  if (npc !== null) {
    if (state === "default") {
      npc.force_visibility_state(-1);
    } else {
      npc.force_visibility_state(tonumber(state)!);
    }
  }
}

/**
 * todo;
 */
export function drop_object_item_on_point(actor: XR_game_object, npc: XR_game_object, p: [number, string]) {
  const drop_object: XR_game_object = actor.object(p[0]) as XR_game_object;
  const drop_point: XR_vector = new patrol(p[1]).point(0);

  actor.drop_item_and_teleport(drop_object, drop_point);
}

/**
 * todo;
 */
export function remove_item(actor: XR_game_object, npc: XR_game_object, p: [string]) {
  logger.info("Remove item");

  if ((p && p[0]) === null) {
    abort("Wrong parameters in function 'remove_item'!!!");
  }

  const item = p[0];

  const obj = actor.object(item);

  if (obj !== null) {
    alife().release(alife().object(obj.id()), true);
  } else {
    abort("Actor has no such item!");
  }

  NotificationManager.getInstance().sendItemRelocatedNotification(ENotificationDirection.OUT, item);
}

/**
 * todo;
 */
export function scenario_autosave(actor: XR_game_object, npc: XR_game_object, p: [TName]): void {
  createAutoSave(p[0] as TName);
}

/**
 * todo;
 */
export function reset_sound_npc(actor: XR_game_object, npc: XR_game_object): void {
  const objectId: TNumberId = npc.id();

  if (registry.sounds.generic.get(objectId) !== null) {
    registry.sounds.generic.get(objectId).reset(objectId);
  }
}

/**
 * todo;
 */
export function clear_box(actor: XR_game_object, npc: XR_game_object, p: [string]) {
  logger.info("Clear box");

  if ((p && p[0]) === null) {
    abort("Wrong parameters in function 'clear_box'!!!");
  }

  const inventoryBox: Optional<XR_game_object> = getObjectByStoryId(p[0]);

  if (inventoryBox === null) {
    abort("There is no object with story_id [%s]", tostring(p[0]));
  }

  const items_table: LuaArray<XR_game_object> = new LuaTable();

  inventoryBox.iterate_inventory_box((inv_box: XR_game_object, item: XR_game_object) => {
    table.insert(items_table, item);
  }, inventoryBox);

  for (const [k, v] of items_table) {
    alife().release(alife().object(v.id()), true);
  }
}

/**
 * todo;
 */
export function activate_weapon(actor: XR_game_object, npc: XR_game_object, p: [string]) {
  const object: Optional<XR_game_object> = actor.object(p[0]);

  if (object === null) {
    assert("Actor has no such weapon! [%s]", p[0]);
  }

  if (object !== null) {
    actor.make_item_active(object);
  }
}

/**
 * todo;
 */
export function set_game_time(actor: XR_game_object, npc: XR_game_object, params: [string, string]) {
  logger.info("Set game time:", params[0], params[1]);

  const real_hours = level.get_time_hours();
  const real_minutes = level.get_time_minutes();

  const hours: number = tonumber(params[0])!;
  let minutes: number = tonumber(params[1])!;

  if (params[1] === null) {
    minutes = 0;
  }

  let hours_to_change: number = hours - real_hours;

  if (hours_to_change <= 0) {
    hours_to_change = hours_to_change + 24;
  }

  let minutes_to_change = minutes - real_minutes;

  if (minutes_to_change <= 0) {
    minutes_to_change = minutes_to_change + 60;
    hours_to_change = hours_to_change - 1;
  } else if (hours === real_hours) {
    hours_to_change = hours_to_change - 24;
  }

  level.change_game_time(0, hours_to_change, minutes_to_change);
  WeatherManager.getInstance().forceWeatherChange();
  SurgeManager.getInstance().isTimeForwarded = true;
}

/**
 * todo;
 */
export function forward_game_time(actor: XR_game_object, npc: XR_game_object, p: [string, string]) {
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
  SurgeManager.getInstance().isTimeForwarded = true;
}

/**
 * todo;
 */
export function stop_tutorial(): void {
  logger.info("Stop tutorial");
  game.stop_tutorial();
}

// todo: Rework, looks bad
export function pick_artefact_from_anomaly(
  actor: XR_game_object,
  npc: Optional<XR_game_object | XR_cse_alife_human_abstract>,
  params: [Optional<string>, Optional<TName>, TName]
) {
  logger.info("Pick artefact from anomaly");

  const anomalyZoneName: Optional<TName> = params && params[1];
  let artefactName: TName = params && params[2];

  const anomalyZone = registry.anomalies.get(anomalyZoneName as TName);

  if (params && params[0]) {
    const objectId: Optional<TNumberId> = getObjectIdByStoryId(params[0]);

    if (objectId === null) {
      abort("Couldn't relocate item to NULL in function 'pick_artefact_from_anomaly!'");
    }

    npc = alife().object<XR_cse_alife_human_abstract>(objectId);
    if (npc && (!isStalker(npc) || !npc.alive())) {
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
  let artefactObject: Optional<XR_cse_alife_item_artefact> = null;

  for (const [k, v] of anomalyZone.artefactWaysByArtefactId) {
    if (alife().object(tonumber(k)!) && artefactName === alife().object(tonumber(k)!)!.section_name()) {
      artefactId = tonumber(k)!;
      artefactObject = alife().object(tonumber(k)!);
      break;
    }

    if (artefactName === null) {
      artefactId = tonumber(k)!;
      artefactObject = alife().object(tonumber(k)!);
      artefactName = artefactObject!.section_name();
      break;
    }
  }

  if (artefactId === null) {
    return;
  }

  anomalyZone.onArtefactTaken(artefactObject as XR_cse_alife_item_artefact);

  alife().release(artefactObject!, true);
  give_item(registry.actor, npc, [artefactName, params[0]]);
}

/**
 * todo
 */
export function anomaly_turn_off(actor: XR_game_object, npc: XR_game_object, p: [string]): void {
  const anomal_zone = registry.anomalies.get(p[0]);

  if (anomal_zone === null) {
    abort("No such anomal zone in function 'anomaly_turn_off!'");
  }

  anomal_zone.turn_off();
}

/**
 * todo
 */
export function anomaly_turn_on(actor: XR_game_object, npc: XR_game_object, p: [string, Optional<string>]): void {
  const anomal_zone = registry.anomalies.get(p[0]);

  if (anomal_zone === null) {
    abort("No such anomal zone in function 'anomaly_turn_on!'");
  }

  if (p[1]) {
    anomal_zone.turn_on(true);
  } else {
    anomal_zone.turn_on(false);
  }
}

// todo: To be more generic, pick items from slots and add randomization.
export function damage_actor_items_on_start(actor: XR_game_object, npc: XR_game_object): void {
  logger.info("Damage actor items on start");

  actor.object(helmets.helm_respirator)?.set_condition(0.8);
  actor.object(outfits.stalker_outfit)?.set_condition(0.76);
  actor.object(weapons.wpn_pm_actor)?.set_condition(0.9);
  actor.object(weapons.wpn_ak74u)?.set_condition(0.7);
}

/**
 * todo;
 */
export function sleep(actor: XR_game_object, npc: XR_game_object): void {
  logger.info("Sleep effect");

  const sleepZones = [
    zones.zat_a2_sr_sleep,
    zones.jup_a6_sr_sleep,
    zones.pri_a16_sr_sleep,
    zones.actor_surge_hide_2,
  ] as unknown as LuaArray<TZone>;

  for (const [k, v] of sleepZones) {
    if (isActorInZoneWithName(v, actor)) {
      SleepManager.getInstance().showSleepDialog();
      break;
    }
  }
}

/**
 * todo;
 */
export function mech_discount(actor: XR_game_object, npc: XR_game_object, p: [string]) {
  if (p[0]) {
    ItemUpgradesManager.getInstance().setCurrentPriceDiscount(tonumber(p[0])!);
  }
}

/**
 * todo;
 */
export function polter_actor_ignore(actor: XR_game_object, npc: XR_game_object, p: [string]) {
  if (p[0] === "true") {
    npc.poltergeist_set_actor_ignore(true);
  } else if (p[0] === "false") {
    npc.poltergeist_set_actor_ignore(false);
  }
}

/**
 * todo;
 */
export function burer_force_gravi_attack(actor: XR_game_object, npc: XR_game_object): void {
  npc.burer_set_force_gravi_attack(true);
}

/**
 * todo;
 */
export function burer_force_anti_aim(actor: XR_game_object, npc: XR_game_object): void {
  npc.set_force_anti_aim(true);
}

const detectorsOrder = [
  detectors.detector_simple,
  detectors.detector_advanced,
  detectors.detector_elite,
  detectors.detector_scientific,
] as unknown as LuaArray<TDetector>;

/**
 * todo;
 */
export function get_best_detector(npc: XR_game_object): void {
  for (const [k, v] of detectorsOrder) {
    const obj = npc.object(v);

    if (obj !== null) {
      obj.enable_attachable_item(true);

      return;
    }
  }
}

/**
 * todo;
 */
export function hide_best_detector(npc: XR_game_object): void {
  for (const [k, v] of detectorsOrder) {
    const item = npc.object(v);

    if (item !== null) {
      item.enable_attachable_item(false);

      return;
    }
  }
}

/**
 * todo;
 */
export function set_torch_state(actor: XR_game_object, npc: XR_game_object, p: [string, Optional<string>]) {
  if (p === null || p[1] === null) {
    abort("Not enough parameters in 'set_torch_state' function!");
  }

  const object: Optional<XR_game_object> = getObjectByStoryId(p[0]);

  if (object === null) {
    return;
  }

  const torch = object.object(misc.device_torch);

  if (torch) {
    if (p[1] === "on") {
      torch.enable_attachable_item(true);
    } else if (p[1] === "off") {
      torch.enable_attachable_item(false);
    }
  }
}

/**
 * todo;
 */
export function create_cutscene_actor_with_weapon(
  first: XR_game_object,
  second: XR_game_object,
  params: [Optional<string>, Optional<string>, number, number, number]
): void {
  logger.info("Create cutscene actor with weapon");

  const spawn_sect: Optional<string> = params[0];

  if (spawn_sect === null) {
    abort("Wrong spawn section for 'spawn_object' function %s. For object %s", tostring(spawn_sect), second.name());
  }

  const path_name = params[1];

  if (path_name === null) {
    abort("Wrong path_name for 'spawn_object' function %s. For object %s", tostring(path_name), second.name());
  }

  if (!level.patrol_path_exists(path_name)) {
    abort("Path %s doesnt exist. Function 'spawn_object' for object %s ", tostring(path_name), second.name());
  }

  const ptr = new patrol(path_name);
  const index = params[2] || 0;
  const yaw = params[3] || 0;

  const npc = alife().create(spawn_sect, ptr.point(index), ptr.level_vertex_id(0), ptr.game_vertex_id(0))!;

  if (isStalker(npc)) {
    npc.o_torso()!.yaw = (yaw * math.pi) / 180;
  } else {
    npc.angle.y = (yaw * math.pi) / 180;
  }

  const slot_override = params[4] || 0;

  const actor: XR_game_object = registry.actor;
  let slot: number;
  let active_item: Optional<XR_game_object> = null;

  if (slot_override === 0) {
    slot = actor.active_slot();
    if (slot !== 2 && slot !== 3) {
      return;
    }

    active_item = actor.active_item();
  } else {
    if (actor.item_in_slot(slot_override) !== null) {
      active_item = actor.item_in_slot(slot_override);
    } else {
      if (actor.item_in_slot(3) !== null) {
        active_item = actor.item_in_slot(3);
      } else if (actor.item_in_slot(2) !== null) {
        active_item = actor.item_in_slot(2);
      } else {
        return;
      }
    }
  }

  const actor_weapon = alife().object(active_item!.id()) as XR_cse_alife_item_weapon;
  let section_name = actor_weapon.section_name();

  if (section_name === quest_items.pri_a17_gauss_rifle) {
    section_name = weapons.wpn_gauss;
  }

  if (active_item) {
    const new_weapon = alife().create<XR_cse_alife_item_weapon>(
      section_name,
      ptr.point(index),
      ptr.level_vertex_id(0),
      ptr.game_vertex_id(0),
      npc.id
    );

    if (section_name !== weapons.wpn_gauss) {
      new_weapon.clone_addons(actor_weapon);
    }
  }
}

/**
 * todo;
 */
export function set_force_sleep_animation(actor: XR_game_object, npc: XR_game_object, p: [number]) {
  npc.force_stand_sleep_animation(tonumber(p[0])!);
}

/**
 * todo;
 */
export function release_force_sleep_animation(actor: XR_game_object, npc: XR_game_object): void {
  npc.release_stand_sleep_animation();
}

/**
 * todo;
 */
export function set_visual_memory_enabled(actor: XR_game_object, npc: XR_game_object, p: [number]): void {
  if (p && p[0] && tonumber(p[0])! >= 0 && tonumber(p[0])! <= 1) {
    npc.set_visual_memory_enabled(tonumber(p[0]) === 1);
  }
}

/**
 * todo;
 */
export function disable_memory_object(actor: XR_game_object, npc: XR_game_object): void {
  const best_enemy = npc.best_enemy();

  if (best_enemy) {
    npc.enable_memory_object(best_enemy, false);
  }
}

/**
 * todo;
 */
export function set_monster_animation(actor: XR_game_object, npc: XR_game_object, p: [string]) {
  if (!(p && p[0])) {
    abort("Wrong parameters in function 'set_monster_animation'!!!");
  }

  npc.set_override_animation(p[0]);
}

/**
 * todo;
 */
export function clear_monster_animation(actor: XR_game_object, npc: XR_game_object): void {
  npc.clear_override_animation();
}

let actor_position_for_restore: Optional<XR_vector> = null;

/**
 * todo;
 */
export function save_actor_position(): void {
  actor_position_for_restore = registry.actor.position();
}

/**
 * todo;
 */
export function restore_actor_position(): void {
  registry.actor.set_actor_position(actor_position_for_restore!);
}

/**
 * todo;
 */
export function upgrade_hint(
  actor: XR_game_object,
  npc: XR_game_object,
  parameters: Optional<LuaArray<TCaption>>
): void {
  if (parameters) {
    ItemUpgradesManager.getInstance().setCurrentHints(parameters);
  }
}

/**
 * todo;
 */
export function force_obj(actor: XR_game_object, npc: XR_game_object, p: [string, Optional<number>, Optional<number>]) {
  logger.info("Force object");

  const object: Optional<XR_game_object> = getObjectByStoryId(p[0]);

  if (!object) {
    abort("'force_obj' Target object does ! exist");
  }

  if (p[1] === null) {
    p[1] = 20;
  }

  if (p[2] === null) {
    p[2] = 100;
  }

  object.set_const_force(new vector().set(0, 1, 0), p[1], p[2]);
}
