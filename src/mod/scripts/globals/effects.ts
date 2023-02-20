import {
  alife,
  anim,
  clsid,
  device,
  game,
  game_graph,
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
  time_global,
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
  XR_CUIGameCustom,
  XR_game_object,
  XR_particles_object,
  XR_patrol,
  XR_sound_object,
  XR_vector,
} from "xray16";

import { animations } from "@/mod/globals/animation/animations";
import { captions } from "@/mod/globals/captions";
import { TCommunity } from "@/mod/globals/communities";
import { info_portions, TInfoPortion } from "@/mod/globals/info_portions";
import { ammo } from "@/mod/globals/items/ammo";
import { artefacts } from "@/mod/globals/items/artefacts";
import { detectors, TDetector } from "@/mod/globals/items/detectors";
import { drugs } from "@/mod/globals/items/drugs";
import { food } from "@/mod/globals/items/food";
import { helmets } from "@/mod/globals/items/helmets";
import { misc } from "@/mod/globals/items/misc";
import { outfits } from "@/mod/globals/items/outfits";
import { quest_items } from "@/mod/globals/items/quest_items";
import { weapons } from "@/mod/globals/items/weapons";
import { MAX_UNSIGNED_16_BIT } from "@/mod/globals/memory";
import { relations, TRelation } from "@/mod/globals/relations";
import { script_sounds } from "@/mod/globals/sound/script_sounds";
import { TZone, zones } from "@/mod/globals/zones";
import { AnyObject, LuaArray, Optional, TName } from "@/mod/lib/types";
import { ISimSquad } from "@/mod/scripts/core/alife/SimSquad";
import { ISmartTerrain } from "@/mod/scripts/core/alife/SmartTerrain";
import { IStalker } from "@/mod/scripts/core/alife/Stalker";
import { update_logic } from "@/mod/scripts/core/binders/StalkerBinder";
import {
  animObjByName,
  deleteHelicopter,
  IStoredObject,
  noWeapZones,
  registry,
  scriptIds,
  signalLight,
  zoneByName,
} from "@/mod/scripts/core/db";
import { SYSTEM_INI } from "@/mod/scripts/core/db/IniFiles";
import { pstor_retrieve, pstor_store } from "@/mod/scripts/core/db/pstor";
import { get_sim_board } from "@/mod/scripts/core/db/SimBoard";
import {
  change_factions_community_num,
  set_level_faction_community as setLevelFactionCommunity,
  set_npc_sympathy as setNpcSympathy,
  set_squad_goodwill as setSquadGoodwill,
  set_squad_goodwill_to_npc as setSquadGoodwillToNpc,
  temp_goodwill_table,
} from "@/mod/scripts/core/GameRelationsManager";
import { GlobalSound } from "@/mod/scripts/core/GlobalSound";
import { mech_discount as getMechDiscount, setCurrentHint } from "@/mod/scripts/core/inventory_upgrades";
import { mapDisplayManager } from "@/mod/scripts/core/managers/MapDisplayManager";
import { SurgeManager } from "@/mod/scripts/core/managers/SurgeManager";
import { WeatherManager } from "@/mod/scripts/core/managers/WeatherManager";
import { relocate_item as relocateItem, send_tip as sendPdaTip, TIcon } from "@/mod/scripts/core/NewsManager";
import { SchemeAbuse } from "@/mod/scripts/core/schemes/abuse/SchemeAbuse";
import { init_target } from "@/mod/scripts/core/schemes/remark/actions/ActionRemarkActivity";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/schemes/trySwitchToAnotherSection";
import { get_task_manager } from "@/mod/scripts/core/task/TaskManager";
import { getTreasureManager } from "@/mod/scripts/core/TreasureManager";
import { showFreeplayDialog } from "@/mod/scripts/ui/game/FreeplayDialog";
import { sleep as startSleeping } from "@/mod/scripts/ui/interaction/SleepDialog";
import { disableInfo, giveInfo, hasAlifeInfo } from "@/mod/scripts/utils/actor";
import { getStoryObject, getStorySquad } from "@/mod/scripts/utils/alife";
import { isActorInZoneWithName } from "@/mod/scripts/utils/checkers/checkers";
import { isStalker } from "@/mod/scripts/utils/checkers/is";
import { getConfigString, parseCondList, pickSectionFromCondList } from "@/mod/scripts/utils/configs";
import { setInactiveInputTime } from "@/mod/scripts/utils/controls";
import { abort } from "@/mod/scripts/utils/debug";
import { createScenarioAutoSave } from "@/mod/scripts/utils/game_saves";
import { find_stalker_for_job, switch_to_desired_job as switchToGulagDesiredJob } from "@/mod/scripts/utils/gulag";
import { getStoryObjectId } from "@/mod/scripts/utils/ids";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("effects");

/**
 * todo;
 */
export function update_npc_logic(actor: XR_game_object, object: XR_game_object, params: LuaArray<string>): void {
  for (const [k, v] of params) {
    const npc = getStoryObject(v);

    if (npc !== null) {
      logger.info("Update npc logic:", npc.id());
      update_logic(npc);

      const planner: XR_action_planner = npc.motivation_action_manager();

      planner.update();
      planner.update();
      planner.update();

      const state: IStoredObject = registry.objects.get(npc.id());

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
export function update_obj_logic(actor: XR_game_object, object: XR_game_object, params: LuaArray<string>): void {
  for (const [k, v] of params) {
    const obj = getStoryObject(v);

    if (obj !== null) {
      logger.info("Update object logic:", obj.id());

      const state: IStoredObject = registry.objects.get(obj.id());

      trySwitchToAnotherSection(obj, state[state.active_scheme!], actor);
    }
  }
}

let ui_active_slot = 0;

export function disable_ui(actor: XR_game_object, npc: XR_game_object, p: [string]) {
  logger.info("Disable UI");

  if (actor.is_talking()) {
    actor.stop_talk();
  }

  level.show_weapon(false);

  if (!p || (p && p[0] !== "true")) {
    const slot = actor.active_slot();

    if (slot !== 0) {
      ui_active_slot = slot;
      actor.activate_slot(0);
    }
  }

  level.disable_input();
  level.hide_indicators_safe();

  const hud: XR_CUIGameCustom = get_hud();

  hud.HideActorMenu();
  hud.HidePdaMenu();

  disable_actor_nightvision(actor);
  disable_actor_torch(actor);
}

export function disable_ui_only(actor: XR_game_object, npc: XR_game_object): void {
  logger.info("Disable UI only");

  if (actor.is_talking()) {
    actor.stop_talk();
  }

  level.show_weapon(false);

  const slot = actor.active_slot();

  if (slot !== 0) {
    ui_active_slot = slot;
    actor.activate_slot(0);
  }

  level.disable_input();
  level.hide_indicators_safe();

  const hud: XR_CUIGameCustom = get_hud();

  hud.HideActorMenu();
  hud.HidePdaMenu();
}

export function enable_ui(actor: XR_game_object, npc: XR_game_object, p: [string]) {
  logger.info("Enable UI");

  if (!p || (p && p[0] !== "true")) {
    if (ui_active_slot !== 0 && actor.item_in_slot(ui_active_slot) !== null) {
      actor.activate_slot(ui_active_slot);
    }
  }

  ui_active_slot = 0;
  level.show_weapon(true);
  level.enable_input();
  level.show_indicators();

  enable_actor_nightvision(actor);
  enable_actor_torch(actor);
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

let actor_nightvision: boolean = false;
let actor_torch: boolean = false;

/**
 * todo;
 */
export function disable_actor_nightvision(actor: XR_game_object): void {
  const nightvision = actor.object(misc.device_torch);

  if (nightvision !== null && nightvision.night_vision_enabled()) {
    nightvision.enable_night_vision(false);
    actor_nightvision = true;
  }
}

/**
 * todo;
 */
export function enable_actor_nightvision(actor: XR_game_object): void {
  const nightvision = actor.object(misc.device_torch);

  if (nightvision !== null && !nightvision.night_vision_enabled() && actor_nightvision) {
    nightvision.enable_night_vision(true);
    actor_nightvision = false;
  }
}

/**
 * todo;
 */
export function disable_actor_torch(actor: XR_game_object): void {
  const torch = actor.object(misc.device_torch);

  if (torch !== null && torch.torch_enabled()) {
    torch.enable_torch(false);
    actor_torch = true;
  }
}

/**
 * todo;
 */
export function enable_actor_torch(actor: XR_game_object): void {
  const torch = actor.object(misc.device_torch);

  if (torch !== null && !torch.torch_enabled() && actor_torch) {
    torch.enable_torch(true);
    actor_torch = false;
  }
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

export function cam_effector_callback() {
  logger.info("Run cam effector callback");

  if (cam_effector_playing_object_id === null) {
    return;
  }

  const state = registry.objects.get(cam_effector_playing_object_id);

  if (state === null || state.active_scheme === null) {
    return;
  }

  if (state.get(state.active_scheme).signals === null) {
    return;
  }

  state.get(state.active_scheme).signals["cameff_end"] = true;
}

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

export function stop_postprocess(actor: XR_game_object, npc: XR_game_object, p: [number]) {
  logger.info("Stop postprocess");

  if (p[0] && type(p[0]) === "number" && p[0] > 0) {
    level.remove_complex_effector(p[0]);
  }
}

export function run_tutorial(actor: XR_game_object, npc: XR_game_object, params: [string]) {
  logger.info("Run tutorial");
  game.start_tutorial(params[0]);
}

export function jup_b32_place_scanner(actor: XR_game_object, npc: XR_game_object): void {
  for (const i of $range(1, 5)) {
    if (
      isActorInZoneWithName("jup_b32_sr_scanner_place_" + i, actor) &&
      !hasAlifeInfo("jup_b32_scanner_" + i + "_placed")
    ) {
      giveInfo("jup_b32_scanner_" + i + "_placed");
      giveInfo(info_portions.jup_b32_tutorial_done);
      remove_item(actor, npc, ["jup_b32_scanner_device"]);
      spawn_object(actor, null, ["jup_b32_ph_scanner", "jup_b32_scanner_place_" + i, null, null]);
    }
  }
}

export function jup_b32_pda_check(actor: XR_game_object, npc: XR_game_object): void {
  mapDisplayManager.updateAnomaliesZones();
}

export function pri_b306_generator_start(actor: XR_game_object, npc: XR_game_object): void {
  if (isActorInZoneWithName(zones.pri_b306_sr_generator, actor)) {
    giveInfo(info_portions.pri_b306_lift_generator_used);
  }
}

export function jup_b206_get_plant(actor: XR_game_object, npc: XR_game_object): void {
  if (isActorInZoneWithName(zones.jup_b206_sr_quest_line, actor)) {
    giveInfo(info_portions.jup_b206_anomalous_grove_has_plant);
    give_actor(actor, npc, ["jup_b206_plant"]);
    destroy_object(actor, npc, ["story", "jup_b206_plant_ph", null]);
  }
}

export function pas_b400_switcher(actor: XR_game_object, npc: XR_game_object): void {
  if (isActorInZoneWithName(zones.pas_b400_sr_switcher, actor)) {
    giveInfo(info_portions.pas_b400_switcher_use);
  }
}

export function jup_b209_place_scanner(actor: XR_game_object, npc: XR_game_object): void {
  if (isActorInZoneWithName(zones.jup_b209_hypotheses)) {
    createScenarioAutoSave(captions.st_save_jup_b209_placed_mutant_scanner);
    giveInfo("jup_b209_scanner_placed");
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
    giveInfo("zat_b101_heli_5_searching");
  }
}

export function zat_b28_heli_3_searching(actor: XR_game_object, npc: XR_game_object): void {
  if (isActorInZoneWithName(zones.zat_b28_heli_3)) {
    giveInfo("zat_b28_heli_3_searching");
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

  for (const [k, v] of noWeapZones) {
    if (isActorInZoneWithName(k, actor)) {
      noWeapZones.set(k, true);
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

export function teleport_npc_by_story_id(actor: XR_game_object, npc: XR_game_object, p: [string, string, number]) {
  const story_id = p[0];
  const patrol_point = p[1];
  const patrol_point_index = p[2] || 0;

  if (story_id === null || patrol_point === null) {
    abort("Wrong parameters in 'teleport_npc_by_story_id' function!!!");
  }

  const position = new patrol(tostring(patrol_point)).point(patrol_point_index);
  const npc_id = getStoryObjectId(story_id);

  if (npc_id === null) {
    abort("There is no story object with id [%s]", story_id);
  }

  const cl_object = level.object_by_id(npc_id);

  if (cl_object) {
    reset_animation(cl_object);
    cl_object.set_npc_position(position);
  } else {
    alife().object(npc_id)!.position = position;
  }
}

export function teleport_squad(actor: XR_game_object, npc: XR_game_object, params: [string, string, number]) {
  const squad_story_id = params[0];
  const patrol_point = params[1];
  const patrol_point_index = params[2] || 0;

  if (squad_story_id === null || patrol_point === null) {
    abort("Wrong parameters in 'teleport_squad' function!!!");
  }

  const position: XR_vector = new patrol(patrol_point).point(patrol_point_index);
  const squad: Optional<ISimSquad> = getStorySquad(squad_story_id);

  if (squad === null) {
    abort("There is no squad with story id [%s]", squad_story_id);
  }

  squad.set_squad_position(position);
}

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
  const npc_id = p[1] === null ? (npc as XR_game_object).id() : getStoryObjectId(p[1])!;
  const alifeNpc: XR_cse_alife_object = alife().object(npc_id)!;

  logger.info("Give item:", npc_id, p[0]);

  alife().create(p[0], alifeNpc.position, alifeNpc.m_level_vertex_id, alifeNpc.m_game_vertex_id, alifeNpc.id);
}

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

export function send_tip(actor: XR_game_object, npc: XR_game_object, params: [string, string, string]): void {
  logger.info("Send tip");
  sendPdaTip(actor, params[0], null, params[1] as unknown as TIcon, null, params[2]);
}

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
    const hitter = getStoryObject(params[0]);

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

export function hit_obj(
  actor: XR_game_object,
  npc: XR_game_object,
  params: [string, string, number, number, string, string]
) {
  logger.info("Hit obj");

  const h = new hit();
  const obj = getStoryObject(params[0]);

  if (!obj) {
    return;
  }

  h.bone(params[1]);
  h.power = params[2];
  h.impulse = params[3];

  if (params[4]) {
    h.direction = new vector().sub(new patrol(params[4]).point(0), obj.position());
  } else {
    h.direction = new vector().sub(npc.position(), obj.position());
  }

  h.draftsman = npc;
  h.type = hit.wound;
  obj.hit(h);
}

export function hit_by_killer(actor: XR_game_object, npc: XR_game_object, p: [string, number, number]): void {
  if (!npc) {
    return;
  }

  const t = registry.objects.get(npc.id()).death!;

  if (t === null || t.killer === -1) {
    return;
  }

  const killer = registry.objects.get(t.killer);

  if (killer === null) {
    return;
  }

  const p1 = npc.position();
  const p2 = killer.position();

  const h = new hit();

  h.draftsman = npc;
  h.type = hit.wound;
  h.direction = new vector().set(p1).sub(p2);
  (h as AnyObject).bone = p[0];
  h.power = p[1];
  h.impulse = p[2];
  npc.hit(h);
}

export function hit_npc_from_actor(actor: XR_game_object, npc: XR_game_object, p: [Optional<string>]) {
  const h = new hit();
  let sid: Optional<XR_game_object> = null;

  h.draftsman = actor;
  h.type = hit.wound;

  if (p[0]) {
    sid = getStoryObject(p[0]);

    if (sid) {
      h.direction = actor.position().sub(sid.position());
    }

    if (!sid) {
      h.direction = actor.position().sub(npc.position());
    }
  } else {
    h.direction = actor.position().sub(npc.position());
    sid = npc;
  }

  h.bone("bip01_spine");
  h.power = 0.001;
  h.impulse = 0.001;

  sid!.hit(h);
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

  const h = new hit();
  let hitted_npc = npc;

  h.draftsman = getStoryObject(p[0]);

  if (p[1] !== null) {
    hitted_npc = getStoryObject(p[1])!;
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
  if (p[0] === "true") {
    npc.sniper_fire_mode(true);
  } else {
    npc.sniper_fire_mode(false);
  }
}

/**
 * todo;
 */
export function kill_npc(actor: XR_game_object, npc: Optional<XR_game_object>, p: [Optional<string>]) {
  if (p && p[0]) {
    npc = getStoryObject(p[0]);
  }

  if (npc !== null && npc.alive()) {
    npc.kill(npc);
  }
}

/**
 * todo;
 */
export function remove_npc(actor: XR_game_object, npc: XR_game_object, p: [Optional<string>]) {
  let npcId: Optional<number> = null;

  if (p && p[0]) {
    npcId = getStoryObjectId(p[0]);
  }

  if (npcId !== null) {
    alife().release(alife().object(npcId), true);
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

export function clearAbuse(npc: XR_game_object) {
  SchemeAbuse.clear_abuse(npc);
}

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
    const obj = getStoryObject(k);

    if (obj) {
      obj.get_hanging_lamp().turn_off();
    } else {
      logger.warn("function 'turn_off_underpass_lamps' lamp [%s] does ! exist", tostring(k));
    }
  }
}

export function turn_off(actor: XR_game_object, npc: XR_game_object, p: LuaArray<string>): void {
  for (const [k, v] of p) {
    const obj = getStoryObject(v);

    if (!obj) {
      abort("TURN_OFF. Target object with story_id [%s] does ! exist", v);
    }

    obj.get_hanging_lamp().turn_off();
  }
}

export function turn_off_object(actor: XR_game_object, npc: XR_game_object): void {
  npc.get_hanging_lamp().turn_off();
}

export function turn_on_and_force(actor: XR_game_object, npc: XR_game_object, params: [string, number, number]) {
  const obj = getStoryObject(params[0]);

  if (!obj) {
    abort("TURN_ON_AND_FORCE. Target object does ! exist");

    return;
  }

  if (params[1] === null) {
    params[1] = 55;
  }

  if (params[2] === null) {
    params[2] = 14000;
  }

  obj.set_const_force(new vector().set(0, 1, 0), params[1], params[2]);
  obj.start_particles("weapons\\light_signal", "link");
  obj.get_hanging_lamp().turn_on();
}

// ---���������� ������������ �������� � ��������� (hanging_lamp)
export function turn_off_and_force(actor: XR_game_object, npc: XR_game_object, p: [string]) {
  const obj = getStoryObject(p[0]);

  if (!obj) {
    abort("TURN_OFF [%s]. Target object does ! exist", npc.name());
  }

  obj.stop_particles("weapons\\light_signal", "link");
  obj.get_hanging_lamp().turn_off();
}

export function turn_on_object(actor: XR_game_object, npc: XR_game_object): void {
  npc.get_hanging_lamp().turn_on();
}

// ---��������� ������������ �������� (hanging_lamp)
export function turn_on(actor: XR_game_object, npc: XR_game_object, p: LuaArray<string>) {
  for (const [k, v] of p) {
    const obj = getStoryObject(v);

    if (!obj) {
      abort("TURN_ON [%s]. Target object does ! exist", npc.name());
    }

    obj.get_hanging_lamp().turn_on();
  }
}

export function disable_combat_handler(actor: XR_game_object, npc: XR_game_object): void {
  if (registry.objects.get(npc.id()).combat) {
    registry.objects.get(npc.id()).combat.enabled = false;
  }

  if (registry.objects.get(npc.id()).mob_combat) {
    registry.objects.get(npc.id()).mob_combat.enabled = false;
  }
}

// -- ����� ���� ������� �������� ���������� [combat_ignore] ��������� ��� ��� ���������.
export function disable_combat_ignore_handler(actor: XR_game_object, npc: XR_game_object): void {
  if (registry.objects.get(npc.id()).combat_ignore) {
    registry.objects.get(npc.id()).combat_ignore!.enabled = false;
  }
}

export function heli_start_flame(actor: XR_game_object, npc: XR_game_object): void {
  npc.get_helicopter().StartFlame();
}

export function heli_die(actor: XR_game_object, npc: XR_game_object): void {
  const heli = npc.get_helicopter();
  const st = registry.objects.get(npc.id());

  heli.Die();
  deleteHelicopter(npc);

  st.last_alt = heli.GetRealAltitude();
  st.alt_check_time = time_global() + 1000;
}

export function set_weather(actor: XR_game_object, npc: XR_game_object, p: [string, string]) {
  logger.info("Set weather:", p[0]);

  if (p[0]) {
    if (p[1] === "true") {
      level.set_weather(p[0], true);
    } else {
      level.set_weather(p[0], false);
    }
  }
}

export function game_disconnect(actor: XR_game_object, npc: XR_game_object): void {
  logger.info("Game disconnect");
  get_console().execute("disconnect");
}

let gameover_credits_started: boolean = false;

export function game_credits(actor: XR_game_object, npc: XR_game_object): void {
  logger.info("Game credits");

  gameover_credits_started = true;
  game.start_tutorial("credits_seq");
}

export function game_over(actor: XR_game_object, npc: XR_game_object): void {
  logger.info("Game over");

  if (gameover_credits_started !== true) {
    return;
  }

  get_console().execute("main_menu on");
}

export function after_credits(actor: XR_game_object, npc: XR_game_object): void {
  get_console().execute("main_menu on");
}

export function before_credits(actor: XR_game_object, npc: XR_game_object): void {
  get_console().execute("main_menu off");
}

export function on_tutor_gameover_stop() {
  get_console().execute("main_menu on");
}

export function on_tutor_gameover_quickload() {
  get_console().execute("load_last_save");
}

// -- ��� ����� ������
export function get_stalker_for_new_job(actor: XR_game_object, npc: XR_game_object, p: [string]) {
  find_stalker_for_job(npc, p[0]);
}

export function switch_to_desired_job(actor: XR_game_object, npc: XR_game_object, p: []) {
  switchToGulagDesiredJob(npc);
}

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

export function jup_b219_save_pos() {
  const obj = getStoryObject("jup_b219_gate_id");

  if (obj && obj.position()) {
    jup_b219_position = obj.position();
    jup_b219_lvid = obj.level_vertex_id();
    jup_b219_gvid = obj.game_vertex_id();
  } else {
    return;
  }

  const sobj = alife().object(obj.id());

  if (sobj) {
    alife().release(sobj, true);
  }
}

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

  const ptr: XR_patrol = new patrol(path_name);
  const index = params[2] || 0;

  const se_obj: XR_cse_alife_creature_abstract = alife().create(
    spawn_sect,
    ptr.point(index),
    ptr.level_vertex_id(0),
    ptr.game_vertex_id(0)
  );

  se_obj.kill();
}

export function spawn_object_in(actor: XR_game_object, obj: XR_game_object, p: [string, string]): void {
  const spawn_sect = p[0];

  if (spawn_sect === null) {
    abort("Wrong spawn section for 'spawn_object' function %s. For object %s", tostring(spawn_sect), obj.name());
  }

  if (p[1] === null) {
    abort("Wrong target_name for 'spawn_object_in' function %s. For object %s", tostring(p[1]), obj.name());
  }

  const target_obj_id = getStoryObjectId(p[1]);

  if (target_obj_id !== null) {
    const box = alife().object(target_obj_id);

    if (box === null) {
      abort("There is no such object %s", p[1]);
    }

    alife().create(spawn_sect, new vector(), 0, 0, target_obj_id);
  } else {
    abort("object is null %s", tostring(p[1]));
  }
}

export function spawn_npc_in_zone(actor: XR_game_object, obj: XR_game_object, params: [string, string]): void {
  const spawn_sect = params[0];

  if (spawn_sect === null) {
    abort("Wrong spawn section for 'spawn_object' function %s. For object %s", tostring(spawn_sect), obj.name());
  }

  const zone_name = params[1];

  if (zone_name === null) {
    abort("Wrong zone_name for 'spawn_object' function %s. For object %s", tostring(zone_name), obj.name());
  }

  if (zoneByName.get(zone_name) === null) {
    abort("Zone %s doesnt exist. Function 'spawn_object' for object %s ", tostring(zone_name), obj.name());
  }

  const zone = zoneByName.get(zone_name);
  const spawned_obj: IStalker = alife().create(
    spawn_sect,
    zone.position(),
    zone.level_vertex_id(),
    zone.game_vertex_id()
  );

  spawned_obj.sim_forced_online = true;
  spawned_obj.squad = 1;
  scriptIds.set(spawned_obj.id, zone_name);
}

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

export function give_actor(actor: XR_game_object, npc: Optional<XR_game_object>, p: Array<string>): void;
export function give_actor(
  actor: XR_game_object,
  npc: Optional<XR_game_object>,
  p: LuaArray<string> | Array<string>
): void {
  for (const [k, v] of p as LuaArray<string>) {
    alife().create(v, actor.position(), actor.level_vertex_id(), actor.game_vertex_id(), actor.id());
    relocateItem(actor, "in", v);
  }
}

export function activate_weapon_slot(actor: XR_game_object, npc: XR_game_object, p: [number]): void {
  actor.activate_slot(p[0]);
}

export function anim_obj_forward(actor: XR_game_object, npc: XR_game_object, p: LuaArray<string>): void {
  for (const [k, v] of p) {
    if (v !== null) {
      animObjByName.get(v).anim_forward();
    }
  }
}

export function anim_obj_backward(actor: XR_game_object, npc: XR_game_object, p: [string]): void {
  if (p[0] !== null) {
    animObjByName.get(p[0]).anim_backward();
  }
}

export function anim_obj_stop(actor: XR_game_object, npc: XR_game_object, p: [string]): void {
  if (p[0] !== null) {
    animObjByName.get(p[0]).anim_stop();
  }
}

/**
 * todo;
 */
export function play_sound(
  actor: XR_game_object,
  obj: XR_game_object,
  p: [Optional<string>, Optional<TCommunity>, Optional<string | number>]
): void {
  logger.info("Play sound");

  const theme = p[0];
  const faction: Optional<TCommunity> = p[1];
  const point: ISmartTerrain = get_sim_board().smarts_by_names.get(p[2] as string);
  const pointId = point !== null ? point.id : (p[2] as number);

  if (obj && isStalker(obj)) {
    if (!obj.alive()) {
      abort(
        "Stalker [%s][%s] is dead, but you wants to say something for you. [%s]!",
        tostring(obj.id()),
        tostring(obj.name()),
        p[0]
      );
    }
  }

  GlobalSound.set_sound_play(obj.id(), theme, faction, pointId);
}

export function stop_sound(actor: XR_game_object, npc: XR_game_object): void {
  GlobalSound.stop_sounds_by_id(npc.id());
}

/**
 * todo;
 */
export function play_sound_looped(actor: XR_game_object, obj: XR_game_object, params: [string]): void {
  GlobalSound.play_sound_looped(obj.id(), params[0]);
}

/**
 * todo;
 */
export function stop_sound_looped(actor: XR_game_object, obj: XR_game_object) {
  GlobalSound.stop_sound_looped(obj.id(), null);
}

export function play_sound_by_story(
  actor: XR_game_object,
  obj: XR_game_object,
  p: [string, string, string, string | number]
) {
  const story_obj = getStoryObjectId(p[0]);
  const theme = p[1];
  const faction = p[2];
  const point: ISmartTerrain = get_sim_board().smarts_by_names.get(p[3] as string);
  const pointId: number = point !== null ? point.id : (p[3] as number);

  GlobalSound.set_sound_play(story_obj as number, theme, faction, pointId);
}

export function barrel_explode(actor: XR_game_object, npc: XR_game_object, p: [string]) {
  const expl_obj = getStoryObject(p[0]);

  if (expl_obj !== null) {
    expl_obj.explode(0);
  }
}

export function create_squad(actor: XR_game_object, obj: Optional<XR_game_object>, params: [string, string]): void {
  const squad_id = params[0];

  if (squad_id === null) {
    abort("Wrong squad identificator [NIL] in create_squad function");
  }

  const smart_name = params[1];

  if (smart_name === null) {
    abort("Wrong smart name [NIL] in create_squad function");
  }

  if (!SYSTEM_INI.section_exist(squad_id)) {
    abort("Wrong squad identificator [%s]. Squad descr doesnt exist.", tostring(squad_id));
  }

  const board = get_sim_board();
  const smart = board.smarts_by_names.get(smart_name);

  if (smart === null) {
    abort("Wrong smart_name [%s] for faction in create_squad function", tostring(smart_name));
  }

  const squad = board.create_squad(smart, squad_id);

  board.enter_smart(squad, smart.id);

  for (const k of squad.squad_members()) {
    board.setup_squad_and_group(k.object);
  }

  squad.update();
}

export function create_squad_member(
  actor: XR_game_object,
  obj: XR_game_object,
  params: [string, string, string]
): void {
  const squad_member_sect = params[0];
  const story_id = params[1];

  let position = null;
  let level_vertex_id = null;
  let game_vertex_id = null;

  if (story_id === null) {
    abort("Wrong squad identificator [NIL] in 'create_squad_member' function");
  }

  const board = get_sim_board();
  const squad: ISimSquad = getStorySquad(story_id) as ISimSquad;
  const squad_smart = board.smarts.get(squad.smart_id as number).smrt;

  if (params[2] !== null) {
    let spawn_point: Optional<string> = null;

    if (params[2] === "simulation_point") {
      spawn_point = getConfigString(SYSTEM_INI, squad.section_name(), "spawn_point", obj, false, "");
      if (spawn_point === "" || spawn_point === null) {
        spawn_point = parseCondList(obj, "spawn_point", "spawn_point", squad_smart.spawn_point as string);
      } else {
        spawn_point = parseCondList(obj, "spawn_point", "spawn_point", spawn_point);
      }

      spawn_point = pickSectionFromCondList(actor, obj, spawn_point as any);
    } else {
      spawn_point = params[2];
    }

    const point = new patrol(spawn_point as string);

    position = point.point(0);
    level_vertex_id = point.level_vertex_id(0);
    game_vertex_id = point.game_vertex_id(0);
  } else {
    const commander: XR_cse_alife_human_abstract = alife().object(squad.commander_id()) as XR_cse_alife_human_abstract;

    position = commander.position;
    level_vertex_id = commander.m_level_vertex_id;
    game_vertex_id = commander.m_game_vertex_id;
  }

  const new_member_id = squad.add_squad_member(squad_member_sect, position, level_vertex_id, game_vertex_id);

  squad.assign_squad_member_to_smart(new_member_id, squad_smart, null);
  board.setup_squad_and_group(alife().object(new_member_id));
  // --squad_smart.refresh()
  squad.update();
}

export function remove_squad(actor: XR_game_object, obj: XR_game_object, p: [string]): void {
  const story_id = p[0];

  if (story_id === null) {
    abort("Wrong squad identificator [NIL] in remove_squad function");
  }

  const squad: Optional<ISimSquad> = getStorySquad(story_id);

  if (squad === null) {
    abort("Wrong squad identificator [%s]. squad doesnt exist", tostring(story_id));
  }

  get_sim_board().remove_squad(squad);
}

export function kill_squad(actor: XR_game_object, obj: XR_game_object, p: [string]): void {
  const story_id = p[0];

  if (story_id === null) {
    abort("Wrong squad identificator [NIL] in kill_squad function");
  }

  const squad = getStorySquad(story_id);

  if (squad === null) {
    return;
  }

  const squad_npcs: LuaTable<number, boolean> = new LuaTable();

  for (const k of squad.squad_members()) {
    squad_npcs.set(k.id, true);
  }

  for (const [k, v] of squad_npcs) {
    const cl_obj = registry.objects.get(k)?.object as Optional<XR_game_object>;

    if (cl_obj === null) {
      alife().object<XR_cse_alife_human_abstract>(tonumber(k)!)!.kill();
    } else {
      cl_obj.kill(cl_obj);
    }
  }
}

export function heal_squad(actor: XR_game_object, obj: XR_game_object, params: [string, number]) {
  const story_id = params[0];
  let health_mod = 1;

  if (params[1] && params[1] !== null) {
    health_mod = math.ceil(params[1] / 100);
  }

  if (story_id === null) {
    abort("Wrong squad identificator [NIL] in heal_squad function");
  }

  const squad = getStorySquad(story_id);

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

export function clear_smart_terrain(actor: XR_game_object, obj: XR_game_object, p: [string, string]) {
  logger.info("Clear smart terrain");

  const smart_name = p[0];

  if (smart_name === null) {
    abort("Wrong squad identificator [NIL] in clear_smart_terrain function");
  }

  const board = get_sim_board();
  const smart = board.smarts_by_names.get(smart_name);
  const smart_id = smart.id;

  for (const [k, v] of board.smarts.get(smart_id).squads) {
    if (p[1] && p[1] === "false") {
      if (!getStoryObjectId(v.id as unknown as string)) {
        board.exit_smart(v, smart_id);
        board.remove_squad(v);
      }
    } else {
      board.exit_smart(v, smart_id);
      board.remove_squad(v);
    }
  }
}

export function give_task(actor: XR_game_object, obj: XR_game_object, p: [Optional<string>]) {
  logger.info("Give task");

  if (p[0] === null) {
    abort("No parameter in give_task function.");
  }

  get_task_manager().give_task(p[0]);
}

export function set_active_task(actor: XR_game_object, npc: XR_game_object, p: [string]): void {
  logger.info("Set active task");

  if (p[0]) {
    const t: Optional<XR_CGameTask> = actor.get_task(tostring(p[0]), true);

    if (t) {
      actor.set_active_task(t);
    }
  }
}

export function actor_friend(actor: XR_game_object, npc: XR_game_object): void {
  npc.force_set_goodwill(1000, actor);
}

export function actor_neutral(actor: XR_game_object, npc: XR_game_object): void {
  npc.force_set_goodwill(0, actor);
}

export function actor_enemy(actor: XR_game_object, npc: XR_game_object): void {
  npc.force_set_goodwill(-1000, actor);
}

export function set_squad_neutral_to_actor(actor: XR_game_object, npc: XR_game_object, p: [string]): void {
  const squad: Optional<ISimSquad> = getStorySquad(p[0]);

  if (squad === null) {
    return;
  } else {
    squad.set_squad_relation(relations.neutral);
  }
}

export function set_squad_friend_to_actor(actor: XR_game_object, npc: XR_game_object, p: [string]): void {
  const squad: Optional<ISimSquad> = getStorySquad(p[0]);

  if (squad === null) {
    return;
  } else {
    squad.set_squad_relation(relations.friend);
  }
}

export function set_squad_enemy_to_actor(actor: XR_game_object, npc: XR_game_object, p: [string]): void {
  const squad: Optional<ISimSquad> = getStorySquad(p[0]);

  if (squad === null) {
    return;
  } else {
    squad.set_squad_relation("enemy");
  }
}

export function set_npc_sympathy(actor: XR_game_object, npc: XR_game_object, p: [number]): void {
  if (p[0] !== null) {
    setNpcSympathy(npc, p[0]);
  }
}

export function set_squad_goodwill(actor: XR_game_object, npc: XR_game_object, p: [string, TRelation]): void {
  if (p[0] !== null && p[1] !== null) {
    setSquadGoodwill(p[0], p[1]);
  }
}

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
    change_factions_community_num(community, actor.id(), tonumber(delta)!);
  } else {
    abort("Wrong parameters in function 'inc_faction_goodwill_to_actor'");
  }
}

export function dec_faction_goodwill_to_actor(
  actor: XR_game_object,
  npc: XR_game_object,
  params: [Optional<TCommunity>, Optional<number>]
): void {
  const community: Optional<TCommunity> = params[0];
  const delta: Optional<number> = params[1];

  if (delta && community) {
    change_factions_community_num(community, actor.id(), -tonumber(delta)!);
  } else {
    abort("Wrong parameters in function 'dec_faction_goodwill_to_actor'");
  }
}

export function kill_actor(actor: XR_game_object, npc: XR_game_object): void {
  logger.info("Kill actor");
  actor.kill(actor);
}

export function give_treasure(actor: XR_game_object, npc: XR_game_object, p: LuaArray<string>) {
  logger.info("Give treasure");

  if (p === null) {
    abort("Required parameter is [NIL]");
  }

  const treasureManager = getTreasureManager();

  for (const [k, v] of p) {
    treasureManager.give_treasure(v);
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

export function set_level_faction_community(
  actor: XR_game_object,
  npc: XR_game_object,
  params: [TCommunity, string, TRelation]
) {
  if (params[0] !== null && params[1] !== null && params[2] !== null) {
    const faction = get_sim_board().players!.get(params[0]);
    let goodwill = 0;

    if (params[2] === "enemy") {
      goodwill = -3000;
    } else if (params[2] === "friend") {
      goodwill = 1000;
    }

    for (const [k, v] of faction.squads) {
      const squad_level = alife().level_name(
        game_graph().vertex(alife().object(v.commander_id())!.m_game_vertex_id).level_id()
      );

      if (squad_level === params[1]) {
        for (const [kk] of v.squad_members()) {
          const npc = kk.object;
          const tbl = temp_goodwill_table;

          if (tbl.communities === null) {
            tbl.communities = new LuaTable();
          }

          if (tbl.communities.get(params[0]) === null) {
            tbl.communities.set(params[0], new LuaTable());
          }

          tbl.communities.get(params[0]).set(npc.id, goodwill);
          if (registry.objects.get(npc.id) !== null) {
            setLevelFactionCommunity(registry.objects.get(npc.id).object as XR_game_object);
          }
        }
      }
    }
  }
}

export function make_actor_visible_to_squad(actor: XR_game_object, npc: XR_game_object, p: [string]): void {
  const story_id = p && p[0];
  const squad = getStorySquad(story_id);

  if (squad === null) {
    abort("There is no squad with id[%s]", story_id);
  }

  for (const k of squad.squad_members()) {
    const obj = level.object_by_id(k.id);

    if (obj !== null) {
      obj.make_object_visible_somewhen(actor);
    }
  }
}

export function stop_sr_cutscene(actor: XR_game_object, npc: XR_game_object, p: []) {
  const obj: IStoredObject = registry.objects.get(npc.id());

  if (obj.active_scheme !== null) {
    obj[obj.active_scheme!].signals["cam_effector_stop"] = true;
  }
}

// -- Anomal fields support
export function enable_anomaly(actor: XR_game_object, npc: XR_game_object, p: [string]) {
  if (p[0] === null) {
    abort("Story id for enable_anomaly function is ! set");
  }

  const obj: Optional<XR_game_object> = getStoryObject(p[0]);

  if (!obj) {
    abort("There is no object with story_id %s for enable_anomaly function", tostring(p[0]));
  }

  obj.enable_anomaly();
}

export function disable_anomaly(actor: XR_game_object, npc: XR_game_object, p: [string]): void {
  if (p[0] === null) {
    abort("Story id for disable_anomaly function is ! set");
  }

  const obj = getStoryObject(p[0]);

  if (!obj) {
    abort("There is no object with story_id %s for disable_anomaly function", tostring(p[0]));
  }

  obj.disable_anomaly();
}

export function launch_signal_rocket(actor: XR_game_object, obj: XR_game_object, p: [string]): void {
  if (p === null) {
    abort("Signal rocket name is ! set!");
  }

  if (signalLight.get(p[0]) !== null) {
    signalLight.get(p[0]).launch();
  } else {
    abort("No such signal rocket. [%s] on level", tostring(p[0]));
  }
}

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

export function del_cs_text(actor: XR_game_object, npc: XR_game_object, p: []) {
  const hud = get_hud();
  const cs_text = hud.GetCustomStatic("text_on_screen_center");

  if (cs_text) {
    hud.RemoveCustomStatic("text_on_screen_center");
  }
}

export function spawn_item_to_npc(actor: XR_game_object, npc: XR_game_object, p: [Optional<string>]) {
  const new_item = p[0];

  if (new_item) {
    alife().create(new_item, npc.position(), npc.level_vertex_id(), npc.game_vertex_id(), npc.id());
  }
}

export function give_money_to_npc(actor: XR_game_object, npc: XR_game_object, p: [Optional<number>]) {
  const money = p[0];

  if (money) {
    npc.give_money(money);
  }
}

export function seize_money_to_npc(actor: XR_game_object, npc: XR_game_object, p: [Optional<number>]) {
  const money = p[0];

  if (money) {
    npc.give_money(-money);
  }
}

// -- relocate_item(item_name.story_id_from.story_id_to)
export function relocate_item(actor: XR_game_object, npc: XR_game_object, params: [string, string, string]) {
  logger.info("Relocate item");

  const item = params && params[0];
  const from_obj = params && getStoryObject(params[1]);
  const to_obj = params && getStoryObject(params[2]);

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

// -- ������� ������ �������, ���������� ��� ������ set_squads_enemies(squad_name_1.squad_name_2)
export function set_squads_enemies(actor: XR_game_object, npc: XR_game_object, p: [string, string]) {
  if (p[0] === null || p[1] === null) {
    abort("Wrong parameters in function set_squad_enemies");

    return;
  }

  const squad_1 = getStorySquad(p[0]);
  const squad_2 = getStorySquad(p[1]);

  if (squad_1 === null) {
    abort("There is no squad with id[%s]", tostring(p[0]));
  }

  if (squad_2 === null) {
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

export function set_bloodsucker_state(actor: XR_game_object, npc: XR_game_object, p: [string, string]): void {
  if ((p && p[0]) === null) {
    abort("Wrong parameters in function 'set_bloodsucker_state'!!!");
  }

  let state = p[0];

  if (p[1] !== null) {
    state = p[1];
    npc = getStoryObject(p[1]) as XR_game_object;
  }

  if (npc !== null) {
    if (state === "default") {
      npc.force_visibility_state(-1);
    } else {
      npc.force_visibility_state(tonumber(state)!);
    }
  }
}

export function drop_object_item_on_point(actor: XR_game_object, npc: XR_game_object, p: [number, string]) {
  const drop_object: XR_game_object = actor.object(p[0]) as XR_game_object;
  const drop_point: XR_vector = new patrol(p[1]).point(0);

  actor.drop_item_and_teleport(drop_object, drop_point);
}

// --������� ������� �������� � ������
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

  relocateItem(actor, "out", item);
}

// -- �������� ���������� � ������ ������
export function scenario_autosave(actor: XR_game_object, npc: XR_game_object, p: [string]) {
  const save_name = p[0];

  if (save_name === null) {
    abort("You are trying to use scenario_autosave without save name");
  }

  if (IsImportantSave()) {
    const save_param = user_name() + " - " + game.translate_string(save_name);

    logger.info("Performing auto-save, detected as important.", save_name, save_param);

    get_console().execute("save " + save_param);
  } else {
    logger.info("Not important save, skip.", save_name);
  }
}

export function zat_b29_create_random_infop(actor: XR_game_object, npc: XR_game_object, p: LuaArray<string>) {
  if (p.get(2) === null) {
    abort("Not enough parameters for zat_b29_create_random_infop!");
  }

  let amount_needed: number = p.get(1) as unknown as number;
  let current_infop: number = 0;
  let total_infop: number = 0;

  if (!amount_needed || amount_needed === null) {
    amount_needed = 1;
  }

  for (const [k, v] of p) {
    if (k > 1) {
      total_infop = total_infop + 1;
      disableInfo(v);
    }
  }

  if (amount_needed > total_infop) {
    amount_needed = total_infop;
  }

  for (const i of $range(1, amount_needed)) {
    current_infop = math.random(1, total_infop);
    for (const [k, v] of p) {
      if (k > 1) {
        if (k === current_infop + 1 && !hasAlifeInfo(v)) {
          giveInfo(v);
          break;
        }
      }
    }
  }
}

export function give_item_b29(actor: XR_game_object, npc: XR_game_object, p: [string]) {
  // --	const story_object = p && getStoryObject(p[1])
  const az_table = [
    "zat_b55_anomal_zone",
    "zat_b54_anomal_zone",
    "zat_b53_anomal_zone",
    "zat_b39_anomal_zone",
    "zaton_b56_anomal_zone",
  ];

  for (const i of $range(16, 23)) {
    if (hasAlifeInfo(get_global("dialogs_zaton").zat_b29_infop_bring_table[i])) {
      let az_name: Optional<string> = null;

      for (const [k, v] of az_table) {
        if (hasAlifeInfo(v)) {
          az_name = v;
          disableInfo(az_name);
          break;
        }
      }

      pick_artefact_from_anomaly(actor, null, [p[0], az_name, get_global("dialogs_zaton").zat_b29_af_table[i]]);
      break;
    }
  }
}

export function relocate_item_b29(actor: XR_game_object, npc: XR_game_object, p: [string, string]) {
  let item: Optional<string> = null;

  for (const i of $range(16, 23)) {
    if (hasAlifeInfo(get_global("dialogs_zaton").zat_b29_infop_bring_table[i])) {
      item = get_global("dialogs_zaton").zat_b29_af_table[i];
      break;
    }
  }

  const from_obj = p && getStoryObject(p[0]);
  const to_obj = p && getStoryObject(p[1]);

  if (to_obj !== null) {
    if (from_obj !== null && from_obj.object(item!) !== null) {
      from_obj.transfer_item(from_obj.object(item!)!, to_obj);
    } else {
      alife().create(item!, to_obj.position(), to_obj.level_vertex_id(), to_obj.game_vertex_id(), to_obj.id());
    }
  } else {
    abort("Couldn't relocate item to NULL");
  }
}

// -- ������� ������� ���������� �������� ���� � ������. by peacemaker, hein, redstain
export function reset_sound_npc(actor: XR_game_object, npc: XR_game_object, p: []) {
  const obj_id = npc.id();

  if (GlobalSound.sound_table.get(obj_id) !== null) {
    GlobalSound.sound_table.get(obj_id).reset(obj_id);
  }
}

export function jup_b202_inventory_box_relocate(actor: XR_game_object, npc: XR_game_object): void {
  const inv_box_out: XR_game_object = getStoryObject("jup_b202_actor_treasure") as XR_game_object;
  const inv_box_in: XR_game_object = getStoryObject("jup_b202_snag_treasure") as XR_game_object;
  const items_to_relocate: LuaArray<XR_game_object> = new LuaTable();

  inv_box_out.iterate_inventory_box((inv_box_out: XR_game_object, item: XR_game_object) => {
    table.insert(items_to_relocate, item);
  }, inv_box_out);

  for (const [k, v] of items_to_relocate) {
    inv_box_out.transfer_item(v, inv_box_in);
  }
}

export function clear_box(actor: XR_game_object, npc: XR_game_object, p: [string]) {
  logger.info("Clear box");

  if ((p && p[0]) === null) {
    abort("Wrong parameters in function 'clear_box'!!!");
  }

  const inv_box = getStoryObject(p[0]);

  if (inv_box === null) {
    abort("There is no object with story_id [%s]", tostring(p[0]));
  }

  const items_table: LuaArray<XR_game_object> = new LuaTable();

  inv_box.iterate_inventory_box((inv_box, item) => {
    table.insert(items_table, item);
  }, inv_box);

  for (const [k, v] of items_table) {
    alife().release(alife().object(v.id()), true);
  }
}

export function activate_weapon(actor: XR_game_object, npc: XR_game_object, p: [string]) {
  const object: Optional<XR_game_object> = actor.object(p[0]);

  if (object === null) {
    assert("Actor has no such weapon! [%s]", p[0]);
  }

  if (object !== null) {
    actor.make_item_active(object);
  }
}

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

export function stop_tutorial(): void {
  logger.info("Stop tutorial");
  game.stop_tutorial();
}

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
      const target_obj_id = getStoryObjectId(params[0]);

      if (target_obj_id !== null) {
        const box = alife().object(target_obj_id);

        if (box === null) {
          abort("There is no such object %s", params[0]);
        }

        for (const i of $range(1, v)) {
          alife().create(k, new vector(), 0, 0, target_obj_id);
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
  params: [Optional<string>, Optional<string>, TName]
) {
  logger.info("Pick artefact from anomaly");

  const az_name: Optional<string> = params && params[1];
  let af_name: string = params && params[2];

  const anomal_zone = registry.anomalies.get(az_name as TName);

  if (params && params[0]) {
    const npc_id = getStoryObjectId(params[0]);

    if (npc_id === null) {
      abort("Couldn't relocate item to NULL in function 'pick_artefact_from_anomaly!'");
    }

    npc = alife().object<XR_cse_alife_human_abstract>(npc_id);
    if (npc && (!isStalker(npc) || !npc.alive())) {
      abort("Couldn't relocate item to NULL (dead || ! stalker) in function 'pick_artefact_from_anomaly!'");
    }
  }

  if (anomal_zone === null) {
    abort("No such anomal zone in function 'pick_artefact_from_anomaly!'");
  }

  if (anomal_zone.spawnedArtefactsCount < 1) {
    return;
  }

  let af_id: Optional<number> = null;
  let af_obj: Optional<XR_cse_alife_item_artefact> = null;

  for (const [k, v] of anomal_zone.artefactWaysByArtefactId) {
    if (alife().object(tonumber(k)!) && af_name === alife().object(tonumber(k)!)!.section_name()) {
      af_id = tonumber(k)!;
      af_obj = alife().object(tonumber(k)!);
      break;
    }

    if (af_name === null) {
      af_id = tonumber(k)!;
      af_obj = alife().object(tonumber(k)!);
      af_name = af_obj!.section_name();
      break;
    }
  }

  if (af_id === null) {
    return;
  }

  anomal_zone.onArtefactTaken(af_obj as XR_cse_alife_item_artefact);

  alife().release(af_obj!, true);
  give_item(registry.actor, npc, [af_name, params[0]]);
}

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

export function jup_b221_play_main(actor: XR_game_object, npc: XR_game_object, p: [string]) {
  let info_table: LuaArray<string> = new LuaTable();
  let main_theme: string;
  let reply_theme: string;
  let info_need_reply: string;
  const reachable_theme: LuaTable = new LuaTable();

  if ((p && p[0]) === null) {
    abort("No such parameters in function 'jup_b221_play_main'");
  }

  if (tostring(p[0]) === "duty") {
    info_table = [
      "jup_b25_freedom_flint_gone",
      "jup_b25_flint_blame_done_to_duty",
      "jup_b4_monolith_squad_in_duty",
      "jup_a6_duty_leader_bunker_guards_work",
      "jup_a6_duty_leader_employ_work",
      "jup_b207_duty_wins",
    ] as unknown as LuaArray<string>;
    main_theme = "jup_b221_duty_main_";
    reply_theme = "jup_b221_duty_reply_";
    info_need_reply = "jup_b221_duty_reply";
  } else if (tostring(p[0]) === "freedom") {
    info_table = [
      "jup_b207_freedom_know_about_depot",
      "jup_b46_duty_founder_pda_to_freedom",
      "jup_b4_monolith_squad_in_freedom",
      "jup_a6_freedom_leader_bunker_guards_work",
      "jup_a6_freedom_leader_employ_work",
      "jup_b207_freedom_wins",
    ] as unknown as LuaArray<string>;
    main_theme = "jup_b221_freedom_main_";
    reply_theme = "jup_b221_freedom_reply_";
    info_need_reply = "jup_b221_freedom_reply";
  } else {
    abort("Wrong parameters in function 'jup_b221_play_main'");
  }

  for (const [k, v] of info_table) {
    if (hasAlifeInfo(v) && !hasAlifeInfo(main_theme + tostring(k) + "_played")) {
      table.insert(reachable_theme, k);
    }
  }

  if (reachable_theme.length() !== 0) {
    const theme_to_play = reachable_theme.get(math.random(1, reachable_theme.length()));

    disableInfo(info_need_reply);
    pstor_store(actor, "jup_b221_played_main_theme", tostring(theme_to_play));
    giveInfo(main_theme + tostring(theme_to_play) + "_played");

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
  const obj = getStoryObject(quest_items.pri_a17_gauss_rifle);

  // --const obj = npc.object("pri_a17_gauss_rifle")
  if (obj !== null) {
    obj.set_condition(0.0);
  }
}

export function pri_a17_hard_animation_reset(actor: XR_game_object, npc: XR_game_object, p: []) {
  // --registry.objects.get(npc.id()).state_mgr.set_state("pri_a17_fall_down", null, null, null, {fast_set = true})

  const stateManager = registry.objects.get(npc.id()).state_mgr!;

  stateManager.set_state("pri_a17_fall_down", null, null, null, null);
  stateManager.animation.set_state(null, true);
  stateManager.animation.set_state("pri_a17_fall_down", null);
  stateManager.animation.set_control();
}

export function jup_b217_hard_animation_reset(actor: XR_game_object, npc: XR_game_object): void {
  const stateManager = registry.objects.get(npc.id()).state_mgr!;

  stateManager.set_state("jup_b217_nitro_straight", null, null, null, null);
  stateManager.animation.set_state(null, true);
  stateManager.animation.set_state("jup_b217_nitro_straight", null);
  stateManager.animation.set_control();
}

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

export function mech_discount(actor: XR_game_object, npc: XR_game_object, p: [string]) {
  if (p[0]) {
    getMechDiscount(tonumber(p[0])!);
  }
}

export function polter_actor_ignore(actor: XR_game_object, npc: XR_game_object, p: [string]) {
  if (p[0] === "true") {
    npc.poltergeist_set_actor_ignore(true);
  } else if (p[0] === "false") {
    npc.poltergeist_set_actor_ignore(false);
  }
}

export function burer_force_gravi_attack(actor: XR_game_object, npc: XR_game_object): void {
  npc.burer_set_force_gravi_attack(true);
}

export function burer_force_anti_aim(actor: XR_game_object, npc: XR_game_object): void {
  npc.set_force_anti_aim(true);
}

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

// -- ������ ��� state_mgr
export function get_best_detector(npc: XR_game_object): void {
  for (const [k, v] of detectorsOrder) {
    const obj = npc.object(v);

    if (obj !== null) {
      obj.enable_attachable_item(true);

      return;
    }
  }
}

export function hide_best_detector(npc: XR_game_object): void {
  for (const [k, v] of detectorsOrder) {
    const item = npc.object(v);

    if (item !== null) {
      item.enable_attachable_item(false);

      return;
    }
  }
}
export function pri_a18_radio_start(actor: XR_game_object, npc: XR_game_object): void {
  giveInfo(info_portions.pri_a18_radio_start);
}

export function pri_a17_ice_climb_end(actor: XR_game_object, npc: XR_game_object): void {
  giveInfo(info_portions.pri_a17_ice_climb_end);
}

export function jup_b219_opening(actor: XR_game_object, npc: XR_game_object): void {
  giveInfo(info_portions.jup_b219_opening);
}

export function jup_b219_entering_underpass(actor: XR_game_object, npc: XR_game_object): void {
  giveInfo(info_portions.jup_b219_entering_underpass);
}

export function pri_a17_pray_start(actor: XR_game_object, npc: XR_game_object): void {
  giveInfo(info_portions.pri_a17_pray_start);
}

export function zat_b38_open_info(actor: XR_game_object, npc: XR_game_object): void {
  giveInfo(info_portions.zat_b38_open_info);
}

export function zat_b38_switch_info(actor: XR_game_object, npc: XR_game_object): void {
  giveInfo(info_portions.zat_b38_switch_info);
}

export function zat_b38_cop_dead(actor: XR_game_object, npc: XR_game_object): void {
  giveInfo(info_portions.zat_b38_cop_dead);
}

export function jup_b15_zulus_drink_anim_info(actor: XR_game_object, npc: XR_game_object): void {
  giveInfo(info_portions.jup_b15_zulus_drink_anim_info);
}

export function pri_a17_preacher_death(actor: XR_game_object, npc: XR_game_object): void {
  giveInfo(info_portions.pri_a17_preacher_death);
}

export function zat_b3_tech_surprise_anim_end(actor: XR_game_object, npc: XR_game_object): void {
  giveInfo(info_portions.zat_b3_tech_surprise_anim_end);
}

export function zat_b3_tech_waked_up(actor: XR_game_object, npc: XR_game_object): void {
  giveInfo(info_portions.zat_b3_tech_waked_up);
}

export function zat_b3_tech_drinked_out(actor: XR_game_object, npc: XR_game_object): void {
  giveInfo(info_portions.zat_b3_tech_drinked_out);
}

export function pri_a28_kirillov_hq_online(actor: XR_game_object, npc: XR_game_object): void {
  giveInfo(info_portions.pri_a28_kirillov_hq_online);
}

export function pri_a20_radio_start(actor: XR_game_object, npc: XR_game_object): void {
  giveInfo(info_portions.pri_a20_radio_start);
}

export function pri_a22_kovalski_speak(actor: XR_game_object, npc: XR_game_object): void {
  giveInfo(info_portions.pri_a22_kovalski_speak);
}

export function zat_b38_underground_door_open(actor: XR_game_object, npc: XR_game_object): void {
  giveInfo(info_portions.zat_b38_underground_door_open);
}

export function zat_b38_jump_tonnel_info(actor: XR_game_object, npc: XR_game_object): void {
  giveInfo(info_portions.zat_b38_jump_tonnel_info);
}

export function jup_a9_cam1_actor_anim_end(actor: XR_game_object, npc: XR_game_object): void {
  giveInfo(info_portions.jup_a9_cam1_actor_anim_end);
}

export function pri_a28_talk_ssu_video_end(actor: XR_game_object, npc: XR_game_object): void {
  giveInfo(info_portions.pri_a28_talk_ssu_video_end);
}

export function set_torch_state(actor: XR_game_object, npc: XR_game_object, p: [string, Optional<string>]) {
  if (p === null || p[1] === null) {
    abort("Not enough parameters in 'set_torch_state' function!");
  }

  const obj = getStoryObject(p[0]);

  if (obj === null) {
    return;
  }

  const torch = obj.object(misc.device_torch);

  if (torch) {
    if (p[1] === "on") {
      torch.enable_attachable_item(true);
    } else if (p[1] === "off") {
      torch.enable_attachable_item(false);
    }
  }
}

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

// -- ��������� ������ ���������� �������� ���(� ���������)
export function set_force_sleep_animation(actor: XR_game_object, npc: XR_game_object, p: [number]) {
  npc.force_stand_sleep_animation(tonumber(p[0])!);
}

// -- ������ ���������� �������� ���(� ���������)
export function release_force_sleep_animation(actor: XR_game_object, npc: XR_game_object): void {
  npc.release_stand_sleep_animation();
}

export function zat_b33_pic_snag_container(actor: XR_game_object, npc: XR_game_object): void {
  if (isActorInZoneWithName(zones.zat_b33_tutor)) {
    give_actor(actor, npc, [quest_items.zat_b33_safe_container]);
    giveInfo("zat_b33_find_package");
    if (!hasAlifeInfo(info_portions.zat_b33_safe_container)) {
      play_sound(actor, zoneByName.get(zones.zat_b33_tutor), [script_sounds.pda_news, null, null]);
    }
  }
}

export function set_visual_memory_enabled(actor: XR_game_object, npc: XR_game_object, p: [number]): void {
  if (p && p[0] && tonumber(p[0])! >= 0 && tonumber(p[0])! <= 1) {
    npc.set_visual_memory_enabled(tonumber(p[0]) === 1);
  }
}

export function disable_memory_object(actor: XR_game_object, npc: XR_game_object): void {
  const best_enemy = npc.best_enemy();

  if (best_enemy) {
    npc.enable_memory_object(best_enemy, false);
  }
}

export function zat_b202_spawn_b33_loot(actor: XR_game_object, npc: XR_game_object, p: []) {
  const info_table = [
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

  for (const [k, v] of info_table) {
    const obj_id = k === 1 || k === 3 ? "jup_b202_stalker_snag" : "jup_b202_snag_treasure";

    if (!hasAlifeInfo(tostring(v))) {
      for (const [l, m] of item_table.get(k)) {
        spawn_object_in(actor, npc, [tostring(m), tostring(obj_id)]);
      }
    }
  }
}

export function set_monster_animation(actor: XR_game_object, npc: XR_game_object, p: [string]) {
  if (!(p && p[0])) {
    abort("Wrong parameters in function 'set_monster_animation'!!!");
  }

  npc.set_override_animation(p[0]);
}

export function clear_monster_animation(actor: XR_game_object, npc: XR_game_object): void {
  npc.clear_override_animation();
}

let actor_position_for_restore: Optional<XR_vector> = null;

export function save_actor_position(): void {
  actor_position_for_restore = registry.actor.position();
}

export function restore_actor_position(): void {
  registry.actor.set_actor_position(actor_position_for_restore!);
}

export function upgrade_hint(actor: XR_game_object, npc: XR_game_object, p: Optional<LuaTable>): void {
  if (p) {
    setCurrentHint(p);
  }
}

export function force_obj(actor: XR_game_object, npc: XR_game_object, p: [string, Optional<number>, Optional<number>]) {
  logger.info("Force object");

  const obj = getStoryObject(p[0]);

  if (!obj) {
    abort("'force_obj' Target object does ! exist");

    return;
  }

  if (p[1] === null) {
    p[1] = 20;
  }

  if (p[2] === null) {
    p[2] = 100;
  }

  obj.set_const_force(new vector().set(0, 1, 0), p[1], p[2]);
}

export function pri_a28_check_zones(): void {
  const actor: XR_game_object = registry.actor;
  let story_obj_id: Optional<number> = null;
  let dist: number = 0;
  let index: number = 0;

  const zones_tbl = [
    "pri_a28_sr_mono_add_1",
    "pri_a28_sr_mono_add_2",
    "pri_a28_sr_mono_add_3",
  ] as unknown as LuaArray<string>;

  const info_tbl = [
    "pri_a28_wave_1_spawned",
    "pri_a28_wave_2_spawned",
    "pri_a28_wave_3_spawned",
  ] as unknown as LuaArray<string>;

  const squad_tbl = [
    "pri_a28_heli_mono_add_1",
    "pri_a28_heli_mono_add_2",
    "pri_a28_heli_mono_add_3",
  ] as unknown as LuaArray<string>;

  for (const [k, v] of zones_tbl) {
    story_obj_id = getStoryObjectId(v);

    if (story_obj_id) {
      const se_obj = alife().object(story_obj_id)!;
      const curr_dist = se_obj.position.distance_to(actor.position());

      if (index === 0) {
        dist = curr_dist;
        index = k;
      } else if (dist < curr_dist) {
        dist = curr_dist;
        index = k;
      }
    }
  }

  if (index === 0) {
    abort("Found no distance || zones in func 'pri_a28_check_zones'");
  }

  if (hasAlifeInfo(info_tbl.get(index))) {
    for (const [k, v] of info_tbl) {
      if (!hasAlifeInfo(info_tbl.get(k))) {
        giveInfo(info_tbl.get(k));
      }
    }
  } else {
    giveInfo(info_tbl.get(index));
  }

  create_squad(actor, null, [squad_tbl.get(index), "pri_a28_heli"]);
}

export function eat_vodka_script() {
  const actor: XR_game_object = registry.actor;

  if (actor.object("vodka_script") !== null) {
    actor.eat(actor.object("vodka_script")!);
  }
}

const mat_table = [
  "jup_b200_material_1",
  "jup_b200_material_2",
  "jup_b200_material_3",
  "jup_b200_material_4",
  "jup_b200_material_5",
  "jup_b200_material_6",
  "jup_b200_material_7",
  "jup_b200_material_8",
  "jup_b200_material_9",
] as unknown as LuaArray<string>;

/**
 * todo;
 */
export function jup_b200_count_found(actor: XR_game_object): void {
  let cnt = 0;

  for (const [k, v] of mat_table) {
    const material_obj: Optional<XR_game_object> = getStoryObject(v);

    if (material_obj !== null) {
      const parent = material_obj.parent();

      if (parent !== null) {
        const parent_id: number = parent.id();

        if (parent_id !== MAX_UNSIGNED_16_BIT && parent_id === actor.id()) {
          cnt = cnt + 1;
        }
      }
    }
  }

  cnt = cnt + pstor_retrieve(actor, "jup_b200_tech_materials_brought_counter", 0);
  pstor_store(actor, "jup_b200_tech_materials_found_counter", cnt);
}
