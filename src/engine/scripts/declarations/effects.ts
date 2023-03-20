import {
  alife,
  anim,
  clsid,
  device,
  game,
  game_object,
  get_console,
  get_hud,
  hit,
  IsImportantSave,
  level,
  move,
  particles_object,
  patrol,
  sound_object,
  user_name,
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
  XR_particles_object,
  XR_patrol,
  XR_sound_object,
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
import { pstor_retrieve, pstor_store } from "@/engine/core/database/portable_store";
import { GlobalSoundManager } from "@/engine/core/managers/GlobalSoundManager";
import { ItemUpgradesManager } from "@/engine/core/managers/ItemUpgradesManager";
import { MapDisplayManager } from "@/engine/core/managers/map/MapDisplayManager";
import { NotificationManager, TNotificationIcon } from "@/engine/core/managers/notifications";
import { SimulationBoardManager } from "@/engine/core/managers/SimulationBoardManager";
import { SurgeManager } from "@/engine/core/managers/SurgeManager";
import { TaskManager } from "@/engine/core/managers/tasks";
import { TreasureManager } from "@/engine/core/managers/TreasureManager";
import { WeatherManager } from "@/engine/core/managers/WeatherManager";
import { SmartTerrain } from "@/engine/core/objects/alife/smart/SmartTerrain";
import { Squad } from "@/engine/core/objects/alife/Squad";
import { Stalker } from "@/engine/core/objects/alife/Stalker";
import { update_logic } from "@/engine/core/objects/binders/StalkerBinder";
import { SchemeAbuse } from "@/engine/core/schemes/abuse/SchemeAbuse";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/base/trySwitchToAnotherSection";
import { ISchemeCombatState } from "@/engine/core/schemes/combat";
import { ISchemeCombatIgnoreState } from "@/engine/core/schemes/combat_ignore";
import { ISchemeMobCombatState } from "@/engine/core/schemes/mob/combat";
import { init_target } from "@/engine/core/schemes/remark/actions/ActionRemarkActivity";
import { showFreeplayDialog } from "@/engine/core/ui/game/FreeplayDialog";
import { sleep as startSleeping } from "@/engine/core/ui/interaction/SleepDialog";
import { isActorInZoneWithName } from "@/engine/core/utils/check/check";
import { isStalker } from "@/engine/core/utils/check/is";
import { executeConsoleCommand } from "@/engine/core/utils/console";
import {
  disableActorNightVision,
  disableActorTorch,
  disableGameUi,
  disableGameUiOnly,
  enableActorNightVision,
  enableActorTorch,
  enableGameUi,
  setInactiveInputTime,
} from "@/engine/core/utils/control";
import { abort } from "@/engine/core/utils/debug";
import { createScenarioAutoSave } from "@/engine/core/utils/game_save";
import { find_stalker_for_job, switch_to_desired_job as switchToGulagDesiredJob } from "@/engine/core/utils/gulag";
import { disableInfo, giveInfo, hasAlifeInfo } from "@/engine/core/utils/info_portion";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { getConfigString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { IConfigSwitchCondition, parseConditionsList } from "@/engine/core/utils/parse";
import {
  increaseNumberRelationBetweenCommunityAndId,
  setObjectSympathy,
  setSquadGoodwill,
  setSquadGoodwillToNpc,
} from "@/engine/core/utils/relation";
import { animations } from "@/engine/lib/constants/animation/animations";
import { captions, TCaption } from "@/engine/lib/constants/captions";
import { TCommunity } from "@/engine/lib/constants/communities";
import { console_commands } from "@/engine/lib/constants/console_commands";
import { info_portions, TInfoPortion } from "@/engine/lib/constants/info_portions";
import { ammo } from "@/engine/lib/constants/items/ammo";
import { artefacts } from "@/engine/lib/constants/items/artefacts";
import { detectors, TDetector } from "@/engine/lib/constants/items/detectors";
import { drugs } from "@/engine/lib/constants/items/drugs";
import { food } from "@/engine/lib/constants/items/food";
import { helmets } from "@/engine/lib/constants/items/helmets";
import { misc } from "@/engine/lib/constants/items/misc";
import { outfits } from "@/engine/lib/constants/items/outfits";
import { quest_items } from "@/engine/lib/constants/items/quest_items";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { MAX_UNSIGNED_16_BIT } from "@/engine/lib/constants/memory";
import { relations, TRelation } from "@/engine/lib/constants/relations";
import { script_sounds } from "@/engine/lib/constants/sound/script_sounds";
import { TTreasure } from "@/engine/lib/constants/treasures";
import { FALSE, TRUE } from "@/engine/lib/constants/words";
import { TZone, zones } from "@/engine/lib/constants/zones";
import {
  EScheme,
  LuaArray,
  Optional,
  TCount,
  TDistance,
  TIndex,
  TName,
  TNumberId,
  TSection,
  TStringId,
} from "@/engine/lib/types";
import { zat_b29_af_table, zat_b29_infop_bring_table } from "@/engine/scripts/declarations/dialogs/dialogs_zaton";

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
      state.state_mgr!.update();
      state.state_mgr!.update();
      state.state_mgr!.update();
      state.state_mgr!.update();
      state.state_mgr!.update();
      state.state_mgr!.update();
      state.state_mgr!.update();
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
export function disable_ui(actor: XR_game_object, npc: XR_game_object, p: [string]) {
  disableGameUi(actor, !p || (p && p[0] !== "true"));
}

/**
 * todo;
 */
export function disable_ui_only(actor: XR_game_object, npc: XR_game_object): void {
  disableGameUiOnly(actor);
}

/**
 * todo;
 */
export function enable_ui(actor: XR_game_object, npc: XR_game_object, p: [string]) {
  enableGameUi(!p || (p && p[0] !== "true"));
}

let cam_effector_playing_object_id: Optional<number> = null;

export function run_cam_effector(actor: XR_game_object, npc: XR_game_object, p: [string, number, string]) {
  logger.info("Run cam effector");

  if (p[0]) {
    let loop: boolean = false;
    let num: number = 1000 + math.random(100);

    if (p[1] && type(p[1]) === "number" && p[1] > 0) {
      num = p[1];
    }

    if (p[2] && p[2] === "true") {
      loop = true;
    }

    // --level.add_pp_effector(p[1] + ".ppe", num, loop)
    level.add_cam_effector("camera_effects\\" + p[0] + ".anm", num, loop, "xr_effects.cam_effector_callback");
    cam_effector_playing_object_id = npc.id();
  }
}

export function stop_cam_effector(actor: XR_game_object, npc: XR_game_object, p: [Optional<number>]): void {
  logger.info("Stop cam effector:", p);

  if (p[0] && type(p[0]) === "number" && p[0] > 0) {
    level.remove_cam_effector(p[0]);
  }
}

/**
 * todo;
 */
export function disable_actor_nightvision(actor: XR_game_object): void {
  disableActorNightVision(actor);
}

/**
 * todo;
 */
export function enable_actor_nightvision(actor: XR_game_object): void {
  enableActorNightVision(actor);
}

/**
 * todo;
 */
export function disable_actor_torch(actor: XR_game_object): void {
  disableActorTorch(actor);
}

/**
 * todo;
 */
export function enable_actor_torch(actor: XR_game_object): void {
  enableActorTorch(actor);
}

/**
 * todo;
 */
export function run_cam_effector_global(
  actor: XR_game_object,
  npc: XR_game_object,
  params: [string, Optional<number>, Optional<number>]
) {
  logger.info("Run cam effector global");

  let num = 1000 + math.random(100);
  let fov = device().fov;

  if (params[1] && type(params[1]) === "number" && params[1] > 0) {
    num = params[1];
  }

  if (params[2] !== null && type(params[2]) === "number") {
    fov = params[2];
  }

  level.add_cam_effector2("camera_effects\\" + params[0] + ".anm", num, false, "xr_effects.cam_effector_callback", fov);
  cam_effector_playing_object_id = npc.id();
}

/**
 * todo;
 */
export function cam_effector_callback() {
  logger.info("Run cam effector callback");

  if (cam_effector_playing_object_id === null) {
    return;
  }

  const state = registry.objects.get(cam_effector_playing_object_id);

  if (state === null || state.active_scheme === null) {
    return;
  }

  if (state[state.active_scheme!]!.signals === null) {
    return;
  }

  state[state.active_scheme!]!.signals!.set("cameff_end", true);
}

/**
 * todo;
 */
export function run_postprocess(actor: XR_game_object, npc: XR_game_object, p: [string, number]) {
  logger.info("Run postprocess");

  if (p[0]) {
    if (SYSTEM_INI.section_exist(p[0])) {
      let num = 2000 + math.random(100);

      if (p[1] && type(p[1]) === "number" && p[1] > 0) {
        num = p[1];
      }

      level.add_complex_effector(p[0], num);
    } else {
      abort("Complex effector section is no set! [%s]", tostring(p[1]));
    }
  }
}

/**
 * todo;
 */
export function stop_postprocess(actor: XR_game_object, npc: XR_game_object, p: [number]) {
  logger.info("Stop postprocess");

  if (p[0] && type(p[0]) === "number" && p[0] > 0) {
    level.remove_complex_effector(p[0]);
  }
}

/**
 * todo;
 */
export function run_tutorial(actor: XR_game_object, npc: XR_game_object, params: [string]) {
  logger.info("Run tutorial");
  game.start_tutorial(params[0]);
}

/**
 * todo;
 */
export function jup_b32_place_scanner(actor: XR_game_object, npc: XR_game_object): void {
  for (const i of $range(1, 5)) {
    if (
      isActorInZoneWithName("jup_b32_sr_scanner_place_" + i, actor) &&
      !hasAlifeInfo(("jup_b32_scanner_" + i + "_placed") as TInfoPortion)
    ) {
      giveInfo(("jup_b32_scanner_" + i + "_placed") as TInfoPortion);
      giveInfo(info_portions.jup_b32_tutorial_done);
      remove_item(actor, npc, ["jup_b32_scanner_device"]);
      spawn_object(actor, null, ["jup_b32_ph_scanner", "jup_b32_scanner_place_" + i, null, null]);
    }
  }
}

/**
 * todo;
 */
export function jup_b32_pda_check(actor: XR_game_object, npc: XR_game_object): void {
  MapDisplayManager.getInstance().updateAnomalyZonesDisplay();
}

/**
 * todo;
 */
export function pri_b306_generator_start(actor: XR_game_object, npc: XR_game_object): void {
  if (isActorInZoneWithName(zones.pri_b306_sr_generator, actor)) {
    giveInfo(info_portions.pri_b306_lift_generator_used);
  }
}

/**
 * todo;
 */
export function jup_b206_get_plant(actor: XR_game_object, npc: XR_game_object): void {
  if (isActorInZoneWithName(zones.jup_b206_sr_quest_line, actor)) {
    giveInfo(info_portions.jup_b206_anomalous_grove_has_plant);
    give_actor(actor, npc, ["jup_b206_plant"]);
    destroy_object(actor, npc, ["story", "jup_b206_plant_ph", null]);
  }
}

/**
 * todo;
 */
export function pas_b400_switcher(actor: XR_game_object, npc: XR_game_object): void {
  if (isActorInZoneWithName(zones.pas_b400_sr_switcher, actor)) {
    giveInfo(info_portions.pas_b400_switcher_use);
  }
}

/**
 * todo;
 */
export function jup_b209_place_scanner(actor: XR_game_object, npc: XR_game_object): void {
  if (isActorInZoneWithName(zones.jup_b209_hypotheses)) {
    createScenarioAutoSave(captions.st_save_jup_b209_placed_mutant_scanner);
    giveInfo(info_portions.jup_b209_scanner_placed);
    remove_item(actor, npc, ["jup_b209_monster_scanner"]);
    spawn_object(actor, null, ["jup_b209_ph_scanner", "jup_b209_scanner_place_point", null, null]);
  }
}

export function jup_b9_heli_1_searching(actor: XR_game_object, npc: XR_game_object): void {
  if (isActorInZoneWithName(zones.jup_b9_heli_1, actor)) {
    giveInfo(info_portions.jup_b9_heli_1_searching);
  }
}

export function pri_a18_use_idol(actor: XR_game_object, npc: XR_game_object): void {
  if (isActorInZoneWithName(zones.pri_a18_use_idol_restrictor, actor)) {
    giveInfo(info_portions.pri_a18_run_cam);
  }
}

export function jup_b8_heli_4_searching(actor: XR_game_object, npc: XR_game_object): void {
  if (isActorInZoneWithName(zones.jup_b8_heli_4)) {
    giveInfo(info_portions.jup_b8_heli_4_searching);
  }
}

export function jup_b10_ufo_searching(actor: XR_game_object, npc: XR_game_object): void {
  if (isActorInZoneWithName(zones.jup_b10_ufo_restrictor)) {
    giveInfo(info_portions.jup_b10_ufo_memory_started);
    give_actor(actor, null, ["jup_b10_ufo_memory"]);
  }
}

export function zat_b101_heli_5_searching(actor: XR_game_object, npc: XR_game_object): void {
  if (isActorInZoneWithName(zones.zat_b101_heli_5)) {
    giveInfo(info_portions.zat_b101_heli_5_searching);
  }
}

export function zat_b28_heli_3_searching(actor: XR_game_object, npc: XR_game_object): void {
  if (isActorInZoneWithName(zones.zat_b28_heli_3)) {
    giveInfo(info_portions.zat_b28_heli_3_searching);
  }
}

export function zat_b100_heli_2_searching(actor: XR_game_object, npc: XR_game_object): void {
  if (isActorInZoneWithName(zones.zat_b100_heli_2)) {
    giveInfo("zat_b100_heli_2_searching");
  }
}

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

function reset_animation(npc: XR_game_object): void {
  const stateManager = registry.objects.get(npc.id()).state_mgr!;

  if (stateManager === null) {
    return;
  }

  stateManager.animation.set_state(null, true);
  stateManager.animation.set_control();
  stateManager.animstate.set_state(null, true);
  stateManager.animstate.set_control();

  stateManager.set_state("idle", null, null, null, { fast_set: true });

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
export function jup_teleport_actor(actor: XR_game_object, npc: XR_game_object): void {
  const point_in = new patrol("jup_b16_teleport_in").point(0);
  const point_out = new patrol("jup_b16_teleport_out").point(0);
  const actor_position = actor.position();
  const out_position = new vector().set(
    actor_position.x - point_in.x + point_out.x,
    actor_position.y - point_in.y + point_out.y,
    actor_position.z - point_in.z + point_out.z
  );

  actor.set_actor_position(out_position);
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
    actor,
    params[0],
    null,
    params[1] as unknown as TNotificationIcon,
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
  const rev = params[5] && params[5] === "true";

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
    const new_value = pstor_retrieve(actor, p[0], 0) + inc_value;

    pstor_store(actor, p[0], new_value);
  }
}

/**
 * todo;
 */
export function dec_counter(actor: XR_game_object, npc: XR_game_object, p: [Optional<string>, number]) {
  if (p[0]) {
    const dec_value = p[1] || 1;
    let new_value = pstor_retrieve(actor, p[0], 0) - dec_value;

    if (new_value < 0) {
      new_value = 0;
    }

    pstor_store(actor, p[0], new_value);
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
    pstor_store(actor, params[0], params[1] || 0);
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
  const se_obj = alife().create<XR_cse_alife_object_physic>(
    spawn_sect,
    ptr.point(index),
    ptr.level_vertex_id(0),
    ptr.game_vertex_id(0)
  );

  if (isStalker(se_obj, se_obj.clsid())) {
    se_obj.o_torso().yaw = (yaw * math.pi) / 180;
  } else if (se_obj.clsid() === clsid.script_phys) {
    se_obj.set_yaw((yaw * math.pi) / 180);
  }
}

let jup_b219_position: Optional<XR_vector> = null;
let jup_b219_lvid: Optional<number> = null;
let jup_b219_gvid: Optional<number> = null;

/**
 * todo;
 */
export function jup_b219_save_pos(): void {
  const object: Optional<XR_game_object> = getObjectByStoryId("jup_b219_gate_id");

  if (object && object.position()) {
    jup_b219_position = object.position();
    jup_b219_lvid = object.level_vertex_id();
    jup_b219_gvid = object.game_vertex_id();
  } else {
    return;
  }

  const serverObject: Optional<XR_cse_alife_object> = alife().object(object.id());

  if (serverObject) {
    alife().release(serverObject, true);
  }
}

/**
 * todo;
 */
export function jup_b219_restore_gate() {
  const yaw = 0;
  const spawn_sect = "jup_b219_gate";

  if (jup_b219_position) {
    const se_obj = alife().create<XR_cse_alife_object_physic>(
      spawn_sect,
      new vector().set(jup_b219_position),
      jup_b219_lvid!,
      jup_b219_gvid!
    );

    se_obj.set_yaw((yaw * math.pi) / 180);
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
    NotificationManager.getInstance().sendItemRelocatedNotification(actor, "in", v);
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
  logger.info("Play sound");

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

  GlobalSoundManager.getInstance().setSoundPlaying(object.id(), theme, faction, smartTerrainId);
}

/**
 * todo;
 */
export function stop_sound(actor: XR_game_object, npc: XR_game_object): void {
  GlobalSoundManager.getInstance().stopSoundsByObjectId(npc.id());
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

  GlobalSoundManager.getInstance().setSoundPlaying(storyObjectId as number, theme, faction, smartTerrainId);
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
      const data: string = getConfigString(SYSTEM_INI, squad.section_name(), "spawn_point", object, false, "");
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

let particles_table: Optional<LuaArray<{ particle: XR_particles_object; sound: XR_sound_object }>> = null;

/**
 * todo;
 */
export function jup_b16_play_particle_and_sound(actor: XR_game_object, npc: XR_game_object, p: [number]) {
  if (particles_table === null) {
    particles_table = [
      {
        particle: new particles_object("anomaly2\\teleport_out_00"),
        sound: new sound_object("anomaly\\teleport_incoming"),
      },
      {
        particle: new particles_object("anomaly2\\teleport_out_00"),
        sound: new sound_object("anomaly\\teleport_incoming"),
      },
      {
        particle: new particles_object("anomaly2\\teleport_out_00"),
        sound: new sound_object("anomaly\\teleport_incoming"),
      },
      {
        particle: new particles_object("anomaly2\\teleport_out_00"),
        sound: new sound_object("anomaly\\teleport_incoming"),
      },
    ] as unknown as LuaArray<any>;
  }

  particles_table.get(p[0]).particle.play_at_pos(new patrol(npc.name() + "_particle").point(0));
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

  NotificationManager.getInstance().sendItemRelocatedNotification(actor, "out", item);
}

/**
 * todo;
 */
export function scenario_autosave(actor: XR_game_object, npc: XR_game_object, p: [TName]): void {
  createScenarioAutoSave(p[0] as TName);
}

/**
 * todo;
 */
export function zat_b29_create_random_infop(
  actor: XR_game_object,
  npc: XR_game_object,
  parameters: LuaArray<TInfoPortion>
): void {
  if (parameters.get(2) === null) {
    abort("Not enough parameters for zat_b29_create_random_infop!");
  }

  let amountNeeded: number = parameters.get(1) as unknown as number;
  let current_infop: number = 0;
  let total_infop: number = 0;

  if (!amountNeeded || amountNeeded === null) {
    amountNeeded = 1;
  }

  for (const [index, infoPortion] of parameters) {
    if (index > 1) {
      total_infop = total_infop + 1;
      disableInfo(infoPortion);
    }
  }

  if (amountNeeded > total_infop) {
    amountNeeded = total_infop;
  }

  for (const it of $range(1, amountNeeded)) {
    current_infop = math.random(1, total_infop);
    for (const [k, v] of parameters) {
      if (k > 1) {
        if (k === current_infop + 1 && !hasAlifeInfo(v)) {
          giveInfo(v);
          break;
        }
      }
    }
  }
}

/**
 * todo;
 */
export function give_item_b29(actor: XR_game_object, npc: XR_game_object, p: [string]) {
  // --	const story_object = p && getStoryObject(p[1])
  const anomalyZonesList = [
    "zat_b55_anomal_zone",
    "zat_b54_anomal_zone",
    "zat_b53_anomal_zone",
    "zat_b39_anomal_zone",
    "zaton_b56_anomal_zone",
  ] as unknown as LuaArray<TName>;

  for (const it of $range(16, 23)) {
    if (hasAlifeInfo(zat_b29_infop_bring_table.get(it))) {
      let anomalyZoneName: Optional<TName> = null;

      for (const [index, name] of anomalyZonesList) {
        if (hasAlifeInfo(name as TInfoPortion)) {
          anomalyZoneName = name;
          disableInfo(anomalyZoneName as TInfoPortion);
          break;
        }
      }

      pick_artefact_from_anomaly(actor, null, [p[0], anomalyZoneName, zat_b29_af_table.get(it)]);
      break;
    }
  }
}

/**
 * todo;
 */
export function relocate_item_b29(actor: XR_game_object, npc: XR_game_object, p: [string, string]) {
  let item: Optional<string> = null;

  for (const it of $range(16, 23)) {
    if (hasAlifeInfo(zat_b29_infop_bring_table.get(it))) {
      item = zat_b29_af_table.get(it);
      break;
    }
  }

  const fromObject: Optional<XR_game_object> = p && getObjectByStoryId(p[0]);
  const toObject: Optional<XR_game_object> = p && getObjectByStoryId(p[1]);

  if (toObject !== null) {
    if (fromObject !== null && fromObject.object(item!) !== null) {
      fromObject.transfer_item(fromObject.object(item!)!, toObject);
    } else {
      alife().create(item!, toObject.position(), toObject.level_vertex_id(), toObject.game_vertex_id(), toObject.id());
    }
  } else {
    abort("Couldn't relocate item to NULL");
  }
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
export function jup_b202_inventory_box_relocate(actor: XR_game_object, npc: XR_game_object): void {
  const inventoryBoxOut: Optional<XR_game_object> = getObjectByStoryId("jup_b202_actor_treasure");
  const inventoryBoxIn: Optional<XR_game_object> = getObjectByStoryId("jup_b202_snag_treasure");
  const itemsToRelocate: LuaArray<XR_game_object> = new LuaTable();

  if (!inventoryBoxIn || !inventoryBoxOut) {
    abort("No inventory boxes detected to relocate items.");
  }

  inventoryBoxOut.iterate_inventory_box((inv_box_out: XR_game_object, item: XR_game_object) => {
    table.insert(itemsToRelocate, item);
  }, inventoryBoxOut);

  for (const [k, v] of itemsToRelocate) {
    inventoryBoxOut.transfer_item(v, inventoryBoxIn);
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
  WeatherManager.getInstance().forced_weather_change();
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
  WeatherManager.getInstance().forced_weather_change();
  SurgeManager.getInstance().isTimeForwarded = true;
}

/**
 * todo;
 */
export function stop_tutorial(): void {
  logger.info("Stop tutorial");
  game.stop_tutorial();
}

/**
 * todo;
 */
export function jup_b10_spawn_drunk_dead_items(actor: XR_game_object, npc: XR_game_object, params: [string]): void {
  const items_all = {
    [weapons.wpn_ak74]: 1,
    [weapons.wpn_fort]: 1,
    [ammo["ammo_5.45x39_fmj"]]: 5,
    [ammo["ammo_5.45x39_ap"]]: 3,
    [ammo.ammo_9x18_fmj]: 3,
    [ammo.ammo_12x70_buck]: 5,
    [ammo["ammo_11.43x23_hydro"]]: 2,
    [weapons.grenade_rgd5]: 3,
    [weapons.grenade_f1]: 2,
    [drugs.medkit_army]: 2,
    [drugs.medkit]: 4,
    [drugs.bandage]: 4,
    [drugs.antirad]: 2,
    [food.vodka]: 3,
    [food.energy_drink]: 2,
    [food.conserva]: 1,
    [quest_items.jup_b10_ufo_memory_2]: 1,
  } as unknown as LuaTable<string, number>;

  const items = {
    [2]: {
      [weapons.wpn_sig550_luckygun]: 1,
    },
    [1]: {
      [ammo["ammo_5.45x39_fmj"]]: 5,
      [ammo["ammo_5.45x39_ap"]]: 3,
      [weapons.wpn_fort]: 1,
      [ammo.ammo_9x18_fmj]: 3,
      [ammo.ammo_12x70_buck]: 5,
      [ammo["ammo_11.43x23_hydro"]]: 2,
      [weapons.grenade_rgd5]: 3,
      [weapons.grenade_f1]: 2,
    },
    [0]: {
      [drugs.medkit_army]: 2,
      [drugs.medkit]: 4,
      [drugs.bandage]: 4,
      [drugs.antirad]: 2,
      [food.vodka]: 3,
      [food.energy_drink]: 2,
      [food.conserva]: 1,
    },
  } as unknown as LuaArray<LuaTable<string, number>>;

  if (params && params[0] !== null) {
    const cnt = pstor_retrieve(actor, "jup_b10_ufo_counter", 0);

    if (cnt > 2) {
      return;
    }

    for (const [k, v] of items.get(cnt)) {
      const targetObjectId: Optional<TNumberId> = getObjectIdByStoryId(params[0]);

      if (targetObjectId !== null) {
        const box = alife().object(targetObjectId);

        if (box === null) {
          abort("There is no such object %s", params[0]);
        }

        for (const i of $range(1, v)) {
          alife().create(k, new vector(), 0, 0, targetObjectId);
        }
      } else {
        abort("object is null %s", tostring(params[0]));
      }
    }
  } else {
    for (const [k, v] of items_all) {
      for (const i of $range(1, v)) {
        alife().create(k, npc.position(), npc.level_vertex_id(), npc.game_vertex_id(), npc.id());
      }
    }
  }
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
 * todo;
 */
export function zat_b202_spawn_random_loot(actor: XR_game_object, npc: XR_game_object, p: []) {
  const si_table = [
    [
      {
        item: [
          "bandage",
          "bandage",
          "bandage",
          "bandage",
          "bandage",
          "medkit",
          "medkit",
          "medkit",
          "conserva",
          "conserva",
        ],
      },
      { item: ["medkit", "medkit", "medkit", "medkit", "medkit", "vodka", "vodka", "vodka", "kolbasa", "kolbasa"] },
      { item: ["antirad", "antirad", "antirad", "medkit", "medkit", "bandage", "kolbasa", "kolbasa", "conserva"] },
    ],
    [
      { item: ["grenade_f1", "grenade_f1", "grenade_f1"] },
      { item: ["grenade_rgd5", "grenade_rgd5", "grenade_rgd5", "grenade_rgd5", "grenade_rgd5"] },
    ],
    [{ item: ["detector_elite"] }, { item: ["detector_advanced"] }],
    [{ item: ["helm_hardhat"] }, { item: ["helm_respirator"] }],
    [
      { item: ["wpn_val", "ammo_9x39_ap", "ammo_9x39_ap", "ammo_9x39_ap"] },
      { item: ["wpn_spas12", "ammo_12x70_buck", "ammo_12x70_buck", "ammo_12x70_buck", "ammo_12x70_buck"] },
      {
        item: [
          "wpn_desert_eagle",
          "ammo_11.43x23_fmj",
          "ammo_11.43x23_fmj",
          "ammo_11.43x23_hydro",
          "ammo_11.43x23_hydro",
        ],
      },
      { item: ["wpn_abakan", "ammo_5.45x39_ap", "ammo_5.45x39_ap"] },
      { item: ["wpn_sig550", "ammo_5.56x45_ap", "ammo_5.56x45_ap"] },
      { item: ["wpn_ak74", "ammo_5.45x39_fmj", "ammo_5.45x39_fmj"] },
      { item: ["wpn_l85", "ammo_5.56x45_ss190", "ammo_5.56x45_ss190"] },
    ],
    [{ item: ["specops_outfit"] }, { item: ["stalker_outfit"] }],
  ] as unknown as LuaArray<LuaArray<{ item: LuaArray<string> }>>;

  const weight_table = [2, 2, 2, 2, 4, 4] as unknown as LuaArray<number>;

  const spawned_item = new LuaTable();
  let max_weight = 12;

  // todo: Simplify, seems like too complex...
  while (max_weight > 0) {
    let n: number = 0;
    let prap: boolean = true;

    do {
      prap = true;
      n = math.random(1, weight_table.length());

      for (const [k, v] of spawned_item) {
        if (v === n) {
          prap = false;
          break;
        }
      }
    } while (!(prap && max_weight - weight_table.get(n) >= 0));

    max_weight = max_weight - weight_table.get(n);
    table.insert(spawned_item, n);

    const item = math.random(1, si_table.get(n).length());

    for (const [k, v] of si_table.get(n).get(item).item) {
      spawn_object_in(actor, npc, [tostring(v), "jup_b202_snag_treasure"]);
    }
  }
}

/**
 * todo;
 */
export function jup_b221_play_main(actor: XR_game_object, npc: XR_game_object, p: [string]) {
  let infoPortionsList: LuaArray<TInfoPortion> = new LuaTable();
  let main_theme: string;
  let reply_theme: string;
  let info_need_reply: TInfoPortion;
  const reachable_theme: LuaTable = new LuaTable();

  if ((p && p[0]) === null) {
    abort("No such parameters in function 'jup_b221_play_main'");
  }

  if (tostring(p[0]) === "duty") {
    infoPortionsList = [
      info_portions.jup_b25_freedom_flint_gone,
      info_portions.jup_b25_flint_blame_done_to_duty,
      info_portions.jup_b4_monolith_squad_in_duty,
      info_portions.jup_a6_duty_leader_bunker_guards_work,
      info_portions.jup_a6_duty_leader_employ_work,
      info_portions.jup_b207_duty_wins,
    ] as unknown as LuaArray<TInfoPortion>;
    main_theme = "jup_b221_duty_main_";
    reply_theme = "jup_b221_duty_reply_";
    info_need_reply = info_portions.jup_b221_duty_reply;
  } else if (tostring(p[0]) === "freedom") {
    infoPortionsList = [
      info_portions.jup_b207_freedom_know_about_depot,
      info_portions.jup_b46_duty_founder_pda_to_freedom,
      info_portions.jup_b4_monolith_squad_in_freedom,
      info_portions.jup_a6_freedom_leader_bunker_guards_work,
      info_portions.jup_a6_freedom_leader_employ_work,
      info_portions.jup_b207_freedom_wins,
    ] as unknown as LuaArray<TInfoPortion>;
    main_theme = "jup_b221_freedom_main_";
    reply_theme = "jup_b221_freedom_reply_";
    info_need_reply = info_portions.jup_b221_freedom_reply;
  } else {
    abort("Wrong parameters in function 'jup_b221_play_main'");
  }

  for (const [k, v] of infoPortionsList) {
    if (hasAlifeInfo(v) && !hasAlifeInfo((main_theme + tostring(k) + "_played") as TInfoPortion)) {
      table.insert(reachable_theme, k);
    }
  }

  if (reachable_theme.length() !== 0) {
    const theme_to_play = reachable_theme.get(math.random(1, reachable_theme.length()));

    disableInfo(info_need_reply);
    pstor_store(actor, "jup_b221_played_main_theme", tostring(theme_to_play));
    giveInfo((main_theme + tostring(theme_to_play) + "_played") as TInfoPortion);

    if (theme_to_play !== 0) {
      play_sound(actor, npc, [main_theme + tostring(theme_to_play), null, null]);
    } else {
      abort("No such theme_to_play in function 'jup_b221_play_main'");
    }
  } else {
    const theme_to_play = tonumber(pstor_retrieve(actor, "jup_b221_played_main_theme", 0))!;

    giveInfo(info_need_reply);

    if (theme_to_play !== 0) {
      play_sound(actor, npc, [reply_theme + tostring(theme_to_play), null, null]);
    } else {
      abort("No such theme_to_play in function 'jup_b221_play_main'");
    }

    pstor_store(actor, "jup_b221_played_main_theme", "0");
  }
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

/**
 * todo
 */
export function zat_a1_tutorial_end_give(actor: XR_game_object, npc: XR_game_object): void {
  // --	level.add_pp_effector("black.ppe", 1313, true) //---{ ! stop on r1 !
  giveInfo(info_portions.zat_a1_tutorial_end);
}

// todo: Fix if used, should increment values probably with +=.
export function oasis_heal(): void {
  const actor: XR_game_object = registry.actor;

  const d_health = 0.005;
  const d_power = 0.01;
  const d_bleeding = 0.05;
  const d_radiation = -0.05;

  // todo: Maybe increment?
  if (actor.health < 1) {
    actor.health = d_health;
  }

  if (actor.power < 1) {
    actor.power = d_power;
  }

  if (actor.radiation > 0) {
    actor.radiation = d_radiation;
  }

  if (actor.bleeding > 0) {
    actor.bleeding = d_bleeding;
  }

  actor.satiety = 0.01;
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
 * todo
 */
export function pas_b400_play_particle(actor: XR_game_object, npc: XR_game_object, p: []) {
  registry.actor.start_particles("zones\\zone_acidic_idle", "bip01_head");
}

/**
 * todo
 */
export function pas_b400_stop_particle(actor: XR_game_object, npc: XR_game_object, p: []) {
  registry.actor.stop_particles("zones\\zone_acidic_idle", "bip01_head");
}

/**
 * todo
 */
export function damage_pri_a17_gauss() {
  const object: Optional<XR_game_object> = getObjectByStoryId(quest_items.pri_a17_gauss_rifle);

  if (object !== null) {
    object.set_condition(0.0);
  }
}

/**
 * todo;
 */
export function pri_a17_hard_animation_reset(actor: XR_game_object, npc: XR_game_object, p: []) {
  const stateManager = registry.objects.get(npc.id()).state_mgr!;

  stateManager.set_state("pri_a17_fall_down", null, null, null, null);
  stateManager.animation.set_state(null, true);
  stateManager.animation.set_state("pri_a17_fall_down", null);
  stateManager.animation.set_control();
}

/**
 * todo;
 */
export function jup_b217_hard_animation_reset(actor: XR_game_object, npc: XR_game_object): void {
  const stateManager = registry.objects.get(npc.id()).state_mgr!;

  stateManager.set_state("jup_b217_nitro_straight", null, null, null, null);
  stateManager.animation.set_state(null, true);
  stateManager.animation.set_state("jup_b217_nitro_straight", null);
  stateManager.animation.set_control();
}

/**
 * todo;
 */
export function sleep(actor: XR_game_object, npc: XR_game_object): void {
  logger.info("Sleep effect");

  const sleep_zones = [
    zones.zat_a2_sr_sleep,
    zones.jup_a6_sr_sleep,
    zones.pri_a16_sr_sleep,
    zones.actor_surge_hide_2,
  ] as unknown as LuaArray<TZone>;

  for (const [k, v] of sleep_zones) {
    if (isActorInZoneWithName(v, actor)) {
      startSleeping();
      giveInfo(info_portions.sleep_active);
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

/**
 * todo;
 */
export function show_freeplay_dialog(actor: XR_game_object, npc: XR_game_object, p: [string, Optional<"true">]) {
  if (p[0] && p[1] && p[1] === "true") {
    showFreeplayDialog("message_box_yes_no", p[0]);
  } else if (p[0]) {
    showFreeplayDialog("message_box_ok", p[0]);
  }
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
export function pri_a18_radio_start(actor: XR_game_object, npc: XR_game_object): void {
  giveInfo(info_portions.pri_a18_radio_start);
}

/**
 * todo;
 */
export function pri_a17_ice_climb_end(actor: XR_game_object, npc: XR_game_object): void {
  giveInfo(info_portions.pri_a17_ice_climb_end);
}

/**
 * todo;
 */
export function jup_b219_opening(actor: XR_game_object, npc: XR_game_object): void {
  giveInfo(info_portions.jup_b219_opening);
}

/**
 * todo;
 */
export function jup_b219_entering_underpass(actor: XR_game_object, npc: XR_game_object): void {
  giveInfo(info_portions.jup_b219_entering_underpass);
}

/**
 * todo;
 */
export function pri_a17_pray_start(actor: XR_game_object, npc: XR_game_object): void {
  giveInfo(info_portions.pri_a17_pray_start);
}

/**
 * todo;
 */
export function zat_b38_open_info(actor: XR_game_object, npc: XR_game_object): void {
  giveInfo(info_portions.zat_b38_open_info);
}

/**
 * todo;
 */
export function zat_b38_switch_info(actor: XR_game_object, npc: XR_game_object): void {
  giveInfo(info_portions.zat_b38_switch_info);
}

/**
 * todo;
 */
export function zat_b38_cop_dead(actor: XR_game_object, npc: XR_game_object): void {
  giveInfo(info_portions.zat_b38_cop_dead);
}

/**
 * todo;
 */
export function jup_b15_zulus_drink_anim_info(actor: XR_game_object, npc: XR_game_object): void {
  giveInfo(info_portions.jup_b15_zulus_drink_anim_info);
}

/**
 * todo;
 */
export function pri_a17_preacher_death(actor: XR_game_object, npc: XR_game_object): void {
  giveInfo(info_portions.pri_a17_preacher_death);
}

/**
 * todo;
 */
export function zat_b3_tech_surprise_anim_end(actor: XR_game_object, npc: XR_game_object): void {
  giveInfo(info_portions.zat_b3_tech_surprise_anim_end);
}

/**
 * todo;
 */
export function zat_b3_tech_waked_up(actor: XR_game_object, npc: XR_game_object): void {
  giveInfo(info_portions.zat_b3_tech_waked_up);
}

/**
 * todo;
 */
export function zat_b3_tech_drinked_out(actor: XR_game_object, npc: XR_game_object): void {
  giveInfo(info_portions.zat_b3_tech_drinked_out);
}

/**
 * todo;
 */
export function pri_a28_kirillov_hq_online(actor: XR_game_object, npc: XR_game_object): void {
  giveInfo(info_portions.pri_a28_kirillov_hq_online);
}

/**
 * todo;
 */
export function pri_a20_radio_start(actor: XR_game_object, npc: XR_game_object): void {
  giveInfo(info_portions.pri_a20_radio_start);
}

/**
 * todo;
 */
export function pri_a22_kovalski_speak(actor: XR_game_object, npc: XR_game_object): void {
  giveInfo(info_portions.pri_a22_kovalski_speak);
}

/**
 * todo;
 */
export function zat_b38_underground_door_open(actor: XR_game_object, npc: XR_game_object): void {
  giveInfo(info_portions.zat_b38_underground_door_open);
}

/**
 * todo;
 */
export function zat_b38_jump_tonnel_info(actor: XR_game_object, npc: XR_game_object): void {
  giveInfo(info_portions.zat_b38_jump_tonnel_info);
}

/**
 * todo;
 */
export function jup_a9_cam1_actor_anim_end(actor: XR_game_object, npc: XR_game_object): void {
  giveInfo(info_portions.jup_a9_cam1_actor_anim_end);
}

/**
 * todo;
 */
export function pri_a28_talk_ssu_video_end(actor: XR_game_object, npc: XR_game_object): void {
  giveInfo(info_portions.pri_a28_talk_ssu_video_end);
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

  if (isStalker(npc, npc.clsid())) {
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
export function zat_b33_pic_snag_container(actor: XR_game_object, npc: XR_game_object): void {
  if (isActorInZoneWithName(zones.zat_b33_tutor)) {
    give_actor(actor, npc, [quest_items.zat_b33_safe_container]);
    giveInfo(info_portions.zat_b33_find_package);
    if (!hasAlifeInfo(info_portions.zat_b33_safe_container)) {
      play_sound(actor, registry.zones.get(zones.zat_b33_tutor), [script_sounds.pda_news, null, null]);
    }
  }
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
export function zat_b202_spawn_b33_loot(actor: XR_game_object, npc: XR_game_object, p: []) {
  const infoPortionsList = [
    info_portions.zat_b33_first_item_gived,
    info_portions.zat_b33_second_item_gived,
    info_portions.zat_b33_third_item_gived,
    info_portions.zat_b33_fourth_item_gived,
    info_portions.zat_b33_fifth_item_gived,
  ] as unknown as LuaArray<TInfoPortion>;

  const item_table = [
    [weapons.wpn_fort_snag],
    [
      drugs.medkit_scientic,
      drugs.medkit_scientic,
      drugs.medkit_scientic,
      drugs.antirad,
      drugs.antirad,
      drugs.antirad,
      drugs.bandage,
      drugs.bandage,
      drugs.bandage,
      drugs.bandage,
      drugs.bandage,
    ],
    [weapons.wpn_ak74u_snag],
    [artefacts.af_soul],
    [helmets.helm_hardhat_snag],
  ] as unknown as LuaArray<LuaArray<string>>;

  for (const [index, infoPortion] of infoPortionsList) {
    const objectId: TStringId = index === 1 || index === 3 ? "jup_b202_stalker_snag" : "jup_b202_snag_treasure";

    if (!hasAlifeInfo(infoPortion)) {
      for (const [l, m] of item_table.get(index)) {
        spawn_object_in(actor, npc, [tostring(m), tostring(objectId)]);
      }
    }
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

/**
 * todo;
 */
export function pri_a28_check_zones(): void {
  const actor: XR_game_object = registry.actor;
  let dist: TDistance = 0;
  let index: TIndex = 0;

  const zonesList: LuaArray<TStringId> = [
    "pri_a28_sr_mono_add_1",
    "pri_a28_sr_mono_add_2",
    "pri_a28_sr_mono_add_3",
  ] as unknown as LuaArray<TStringId>;

  const infoList: LuaArray<TInfoPortion> = [
    info_portions.pri_a28_wave_1_spawned,
    info_portions.pri_a28_wave_2_spawned,
    info_portions.pri_a28_wave_3_spawned,
  ] as unknown as LuaArray<TInfoPortion>;

  const squadsList: LuaArray<TStringId> = [
    "pri_a28_heli_mono_add_1",
    "pri_a28_heli_mono_add_2",
    "pri_a28_heli_mono_add_3",
  ] as unknown as LuaArray<TStringId>;

  for (const [itIndex, it] of zonesList) {
    const storyObjectId: Optional<TNumberId> = getObjectIdByStoryId(it);

    if (storyObjectId) {
      const serverObject: Optional<XR_cse_alife_object> = alife().object(storyObjectId)!;
      const distance: TDistance = serverObject.position.distance_to(actor.position());

      if (index === 0) {
        dist = distance;
        index = itIndex;
      } else if (dist < distance) {
        dist = distance;
        index = itIndex;
      }
    }
  }

  if (index === 0) {
    abort("Found no distance || zones in func 'pri_a28_check_zones'");
  }

  if (hasAlifeInfo(infoList.get(index))) {
    for (const [k, v] of infoList) {
      if (!hasAlifeInfo(infoList.get(k))) {
        giveInfo(infoList.get(k));
      }
    }
  } else {
    giveInfo(infoList.get(index));
  }

  create_squad(actor, null, [squadsList.get(index), "pri_a28_heli"]);
}

/**
 * todo;
 */
export function eat_vodka_script() {
  const actor: XR_game_object = registry.actor;

  if (actor.object("vodka_script") !== null) {
    actor.eat(actor.object("vodka_script")!);
  }
}

const materialsTable: LuaArray<TStringId> = [
  "jup_b200_material_1",
  "jup_b200_material_2",
  "jup_b200_material_3",
  "jup_b200_material_4",
  "jup_b200_material_5",
  "jup_b200_material_6",
  "jup_b200_material_7",
  "jup_b200_material_8",
  "jup_b200_material_9",
] as unknown as LuaArray<TStringId>;

/**
 * todo;
 */
export function jup_b200_count_found(actor: XR_game_object): void {
  let cnt = 0;

  for (const [index, materialId] of materialsTable) {
    const materialObject: Optional<XR_game_object> = getObjectByStoryId(materialId);

    if (materialObject !== null) {
      const parent = materialObject.parent();

      if (parent !== null) {
        const parentId: TNumberId = parent.id();

        if (parentId !== MAX_UNSIGNED_16_BIT && parentId === actor.id()) {
          cnt = cnt + 1;
        }
      }
    }
  }

  cnt = cnt + pstor_retrieve(actor, "jup_b200_tech_materials_brought_counter", 0);
  pstor_store(actor, "jup_b200_tech_materials_found_counter", cnt);
}
