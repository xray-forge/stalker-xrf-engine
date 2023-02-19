import {
  alife,
  anim,
  device,
  game,
  get_hud,
  hit,
  level,
  move,
  particles_object,
  patrol,
  vector,
  XR_cse_alife_item_weapon,
  XR_cse_alife_item_weapon_magazined,
  XR_cse_alife_object,
  XR_CUIGameCustom,
  XR_game_object,
  XR_patrol,
  XR_vector,
} from "xray16";

import { animations } from "@/mod/globals/animation/animations";
import { captions } from "@/mod/globals/captions";
import { info_portions, TInfoPortion } from "@/mod/globals/info_portions";
import { artefacts } from "@/mod/globals/items/artefacts";
import { drugs } from "@/mod/globals/items/drugs";
import { helmets } from "@/mod/globals/items/helmets";
import { misc } from "@/mod/globals/items/misc";
import { quest_items } from "@/mod/globals/items/quest_items";
import { weapons } from "@/mod/globals/items/weapons";
import { MAX_UNSIGNED_16_BIT, MAX_UNSIGNED_32_BIT } from "@/mod/globals/memory";
import { script_sounds } from "@/mod/globals/sound/script_sounds";
import { zones } from "@/mod/globals/zones";
import { AnyObject, LuaArray, Optional } from "@/mod/lib/types";
import { update_logic } from "@/mod/scripts/core/binders/StalkerBinder";
import { getActor, IStoredObject, noWeapZones, storage, zoneByName } from "@/mod/scripts/core/db";
import { SYSTEM_INI } from "@/mod/scripts/core/db/IniFiles";
import { pstor_retrieve, pstor_store } from "@/mod/scripts/core/db/pstor";
import { setCurrentHint } from "@/mod/scripts/core/inventory_upgrades";
import { AbuseManager } from "@/mod/scripts/core/logic/AbuseManager";
import { send_tip as sendPdaTip, TIcon } from "@/mod/scripts/core/NewsManager";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/schemes/trySwitchToAnotherSection";
import { ISimSquad } from "@/mod/scripts/se/SimSquad";
import { mapDisplayManager } from "@/mod/scripts/ui/game/MapDisplayManager";
import { giveInfo, hasAlifeInfo } from "@/mod/scripts/utils/actor";
import { getStoryObject, getStorySquad } from "@/mod/scripts/utils/alife";
import { isActorInZoneWithName, isStalker } from "@/mod/scripts/utils/checkers";
import { setInactiveInputTime } from "@/mod/scripts/utils/controls";
import { abort } from "@/mod/scripts/utils/debug";
import { createScenarioAutoSave } from "@/mod/scripts/utils/game_saves";
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

      const planner = npc.motivation_action_manager();

      planner.update();
      planner.update();
      planner.update();

      const state: IStoredObject = storage.get(npc.id());

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

      const state: IStoredObject = storage.get(obj.id());

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

  disable_actor_nightvision(actor, npc);
  disable_actor_torch(actor, npc);
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
  // --getActor().restore_weapon()

  if (!p || (p && p[0] !== "true")) {
    if (ui_active_slot !== 0 && actor.item_in_slot(ui_active_slot) !== null) {
      actor.activate_slot(ui_active_slot);
    }
  }

  ui_active_slot = 0;
  level.show_weapon(true);
  level.enable_input();
  level.show_indicators();
  enable_actor_nightvision(null, null);
  enable_actor_torch(null, null);
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

export function disable_actor_nightvision(actor: XR_game_object, npc: XR_game_object): void {
  const nightvision = actor.object(misc.device_torch);

  if (nightvision !== null && nightvision.night_vision_enabled()) {
    nightvision.enable_night_vision(false);
    actor_nightvision = true;
  }
}

export function enable_actor_nightvision(actor: XR_game_object, npc: XR_game_object): void {
  const nightvision = actor.object(misc.device_torch);

  if (nightvision !== null && !nightvision.night_vision_enabled() && actor_nightvision) {
    nightvision.enable_night_vision(true);
    actor_nightvision = false;
  }
}

export function disable_actor_torch(actor: XR_game_object, npc: XR_game_object): void {
  const torch = actor.object(misc.device_torch);

  if (torch !== null && torch.torch_enabled()) {
    torch.enable_torch(false);
    actor_torch = true;
  }
}

export function enable_actor_torch(actor: XR_game_object, npc: XR_game_object): void {
  const torch = actor.object(misc.device_torch);

  if (torch !== null && !torch.torch_enabled() && actor_torch) {
    torch.enable_torch(true);
    actor_torch = false;
  }
}

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

  const state = storage.get(cam_effector_playing_object_id);

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
      spawn_object(actor, null, ["jup_b32_ph_scanner", "jup_b32_scanner_place_" + i]);
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
    destroy_object(actor, npc, ["story", "jup_b206_plant_ph"]);
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
    spawn_object(actor, null, ["jup_b209_ph_scanner", "jup_b209_scanner_place_point"]);
  }
}

export function jup_b9_heli_1_searching(actor: XR_game_object, npc: XR_game_object): void {
  if (isActorInZoneWithName(zones.jup_b9_heli_1, actor)) {
    giveInfo(info_portions.jup_b9_heli_1_searching);
  }
}

export function pri_a18_use_idol(actor: XR_game_object, npc: XR_game_object): void {
  if ((isActorInZoneWithName(zones.pri_a18_use_idol_restrictor), actor)) {
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
    give_actor(getActor(), null, ["jup_b10_ufo_memory"]);
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
  const stateManager = storage.get(npc.id()).state_mgr!;

  if (stateManager === null) {
    return;
  }

  stateManager.animation.set_state(null, true);
  stateManager.animation.set_control();
  stateManager.animstate.set_state(null, true);
  stateManager.animstate.set_control();

  stateManager.set_state("idle", null, null, null, { fast_set = true });

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
export function give_item(actor: XR_game_object, npc: XR_game_object, p: [string, Optional<string>]) {
  logger.info("Give item");

  let npc_id = npc.id();

  if (p[1] !== null) {
    npc_id = getStoryObjectId(p[1])!;
  }

  const alifeNpc: XR_cse_alife_object = alife().object(npc_id)!;

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

  const t = storage.get(npc.id()).death!;

  if (t === null || t.killer === -1) {
    return;
  }

  const killer = storage.get(t.killer);

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

export function hit_npc_from_actor(actor: XR_game_object, npc: XR_game_object, p: [string]) {
  const h = new hit();
  let sid: Optional<XR_game_object> = null;

  h.draftsman = actor;
  h.type = hit.wound;

  if (p && p[0]) {
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
export function inc_counter(actor: XR_game_object, npc: XR_game_object, p: [string, number]) {
  if (p && p[0]) {
    const inc_value = p[1] || 1;
    const new_value = pstor_retrieve(actor, p[0], 0) + inc_value;

    pstor_store(actor, p[0], new_value);
  }
}

/**
 * todo;
 */
export function dec_counter(actor: XR_game_object, npc: XR_game_object, p: [string, number]) {
  if (p && p[0]) {
    const dec_value = p[1] || 1;
    let new_value = pstor_retrieve(actor, p[0], 0) - dec_value;

    if (new_value < 0) {
      new_value = 0;
    }

    pstor_store(actor, p[0], new_value);
  }
}

export function set_counter(actor: XR_game_object, npc: XR_game_object, params: [string, number]) {
  if (params && params[0]) {
    pstor_store(actor, params[0], params[1] || 0);
  }
}

export function actor_punch(npc: XR_game_object): void {
  const actor: XR_game_object = getActor() as XR_game_object;

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
  AbuseManager.clear_abuse(npc);
}

/**

export function turn_off_underpass_lamps(actor: XR_game_object, npc: XR_game_object): void {
  const lamps_table = {
    ["pas_b400_lamp_start_flash"] = true,
    ["pas_b400_lamp_start_red"] = true,
    ["pas_b400_lamp_elevator_green"] = true,
    ["pas_b400_lamp_elevator_flash"] = true,
    ["pas_b400_lamp_elevator_green_1"] = true,
    ["pas_b400_lamp_elevator_flash_1"] = true,
    ["pas_b400_lamp_track_green"] = true,
    ["pas_b400_lamp_track_flash"] = true,
    ["pas_b400_lamp_downstairs_green"] = true,
    ["pas_b400_lamp_downstairs_flash"] = true,
    ["pas_b400_lamp_tunnel_green"] = true,
    ["pas_b400_lamp_tunnel_flash"] = true,
    ["pas_b400_lamp_tunnel_green_1"] = true,
    ["pas_b400_lamp_tunnel_flash_1"] = true,
    ["pas_b400_lamp_control_down_green"] = true,
    ["pas_b400_lamp_control_down_flash"] = true,
    ["pas_b400_lamp_control_up_green"] = true,
    ["pas_b400_lamp_control_up_flash"] = true,
    ["pas_b400_lamp_hall_green"] = true,
    ["pas_b400_lamp_hall_flash"] = true,
    ["pas_b400_lamp_way_green"] = true,
    ["pas_b400_lamp_way_flash"] = true,
  }
  const obj
  for (const [k, v] of lamps_table) {
    obj = getStoryObject(k)

    if( obj ){
      obj.get_hanging_lamp().turn_off()
    }else{
      printf("function 'turn_off_underpass_lamps' lamp [%s] does ! exist", tostring(k))
      //--abort("function 'turn_off_underpass_lamps' lamp [%s] does ! exist", tostring(k))
    }
  }
}

//---���������� ������������ �������� (hanging_lamp)
export function turn_off(actor: XR_game_object, npc: XR_game_object, p: []){
  const obj
  for (const [k, v] of p) {
    obj = getStoryObject(v)

    if( ! obj ){
      abort("TURN_OFF. Target object with story_id [%s] does ! exist", v)
      return
    }
    obj.get_hanging_lamp().turn_off()
    //--printf("TURN_OFF. Target object with story_id [%s] turned off.", v)
  }
}

export function turn_off_object(actor: XR_game_object, npc: XR_game_object): void {
  npc.get_hanging_lamp().turn_off()
}

//---��������� ������������ �������� (hanging_lamp)
export function turn_on(actor: XR_game_object, npc: XR_game_object, p: []){
  const obj
  for (const [k, v] of p) {
    obj = getStoryObject(v)

    if( ! obj ){
      abort("TURN_ON [%s]. Target object does ! exist", npc.name())
      return
    }
    obj.get_hanging_lamp().turn_on()
  }
}

//---��������� � ������ ������������ �������� (hanging_lamp)
export function turn_on_and_force(actor: XR_game_object, npc: XR_game_object, p: []){
  const obj = getStoryObject(p[1])
  if( ! obj ){
    abort("TURN_ON_AND_FORCE. Target object does ! exist")
    return
  }
  if( p[2] === null ){
    p[2] = 55
  }
  if( p[3] === null ){
    p[3] = 14000
  }
  obj.set_const_force(vector().set(0, 1, 0), p[2], p[3])
  obj.start_particles("weapons\\light_signal", "link")
  obj.get_hanging_lamp().turn_on()
}

//---���������� ������������ �������� � ��������� (hanging_lamp)
export function turn_off_and_force(actor: XR_game_object, npc: XR_game_object, p: []){
  const obj = getStoryObject(p[1])
  if( ! obj ){
    abort("TURN_OFF [%s]. Target object does ! exist", npc.name())
    return
  }
  obj.stop_particles("weapons\\light_signal", "link")
  obj.get_hanging_lamp().turn_off()
}

export function turn_on_object(actor: XR_game_object, npc: XR_game_object): void {
  npc.get_hanging_lamp().turn_on()
}

export function turn_off_object(actor: XR_game_object, npc: XR_game_object): void {
  npc.get_hanging_lamp().turn_off()
}

//-- ����� ���� ������� �������� ���������� [combat] ��� ��� ���������.
//-- ������������ � �������, ����� ��� ����������� ��������, ����� ��� ������������ �� ������ ������,
//-- ��� ���������, � �������� ��������� �� �� ����� ��� ������ (� ������� ������ [combat] ����������� �� ������
//-- �������, ����� �������� � ���, ����, �������, �� ��������� ������� ���� �������).
export function disable_combat_handler(actor: XR_game_object, npc: XR_game_object): void {
  if( storage.get(npc.id()).combat ){
    storage.get(npc.id()).combat.enabled = false
  }

  if( storage.get(npc.id()).mob_combat ){
    storage.get(npc.id()).mob_combat.enabled = false
  }
}

//-- ����� ���� ������� �������� ���������� [combat_ignore] ��������� ��� ��� ���������.
export function disable_combat_ignore_handler(actor: XR_game_object, npc: XR_game_object): void {
  if( storage.get(npc.id()).combat_ignore ){
    storage.get(npc.id()).combat_ignore.enabled = false
  }
}

export function heli_start_flame(actor: XR_game_object, npc: XR_game_object): void {
  npc.get_helicopter().StartFlame()
}

export function heli_die(actor: XR_game_object, npc: XR_game_object): void {
  const heli = npc.get_helicopter()
  const st   = storage.get(npc.id())

  heli.Die()
  db.del_heli(npc)

  st.last_alt       = heli.GetRealAltitude()
  st.alt_check_time = time_global() + 1000
}

//--'//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//---
//--' ������� ��� ������ � ��������� ���������
//--'//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//---

//-- �������������� ��������� �������� �������
//-- =set_weather(<������ ������>.true) - ��������� ������ �����, false - ����� ��������� �����
//-- ����� �������������� �� ������ ���� ��� ������� � � ����� jup_b15 - ���� ����� ������ � �������
export function set_weather(actor: XR_game_object, npc: XR_game_object, p: []){
  logger.info("Set weather")

  if( (p[1]) ){
    if( (p[2] === "true") ){
      level.set_weather(p[1], true)
    }else{
      level.set_weather(p[1], false)
    }
  }
}

export function game_disconnect(actor: XR_game_object, npc: XR_game_object): void {
  logger.info("Game disconnect")
  const c = get_console()
  c.execute("disconnect")
  //--	c.execute_deferred("main_menu off")
  //--	c.execute_deferred("hide")
}

export function game_credits(actor: XR_game_object, npc: XR_game_object): void {
  logger.info("Game credits")

  db.gameover_credits_started = true
  game.start_tutorial("credits_seq")
}

export function game_over(actor: XR_game_object, npc: XR_game_object): void {
  logger.info("Game over")

  if( db.gameover_credits_started !== true ){
    return
  }
  const c = get_console()
  printf("main_menu on console command is executed")
  c.execute("main_menu on")
}

export function after_credits(actor: XR_game_object, npc: XR_game_object): void {
  get_console().execute("main_menu on")
}

export function before_credits(actor: XR_game_object, npc: XR_game_object): void {
  get_console().execute("main_menu off")
}

export function on_tutor_gameover_stop(){
  const c = get_console()
  printf("main_menu on console command is executed")
  c.execute("main_menu on")
}

export function on_tutor_gameover_quickload(){
  const c = get_console()
  c.execute("load_last_save")
}

//-- ��� ����� ������
export function get_stalker_for_new_job(actor: XR_game_object, npc: XR_game_object, p: []){
  gulagUtils.find_stalker_for_job(npc, p[1])
}
export function switch_to_desired_job(actor: XR_game_object, npc: XR_game_object, p: []){
  gulagUtils.switch_to_desired_job(npc)
}

//--'//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//---
//--' ������� ��� ������ � ����������
//--'//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//---
export function spawn_object(actor, obj, p){
  logger.info("Spawn object")
  //--' p[1] - ������ ���� ��������
  //--' p[2] - ��� ����������� ���� ��� ��� �����.
  const spawn_sect = p[1]
  if( spawn_sect === null ){
    abort("Wrong spawn section for 'spawn_object' function %s. For object %s", tostring(spawn_sect), obj.name())
  }

  const path_name = p[2]
  if( path_name === null ){
    abort("Wrong path_name for 'spawn_object' function %s. For object %s", tostring(path_name), obj.name())
  }

  if( ! level.patrol_path_exists(path_name) ){
    abort("Path %s doesnt exist. Function 'spawn_object' for object %s ", tostring(path_name), obj.name())
  }
  const ptr = patrol(path_name)
  const index = p[3] || 0
  const yaw = p[4] || 0

  //--' printf("Spawning %s at %s, %s", tostring(p[1]), tostring(p[2]), tostring(p[3]))
  const se_obj = alife().create(spawn_sect,
      ptr.point(index),
      ptr.level_vertex_id(0),
      ptr.game_vertex_id(0))
  if( IsStalker(null, se_obj.clsid()) ) {
    se_obj.o_torso().yaw = yaw * math.pi / 180
  }else if( se_obj.clsid() === clsid.script_phys ){
    se_obj.set_yaw(yaw * math.pi / 180)
  }
}

const jup_b219_position
const jup_b219_lvid
const jup_b219_gvid

export function jup_b219_save_pos(){
  const obj = getStoryObject("jup_b219_gate_id")
  if( obj && obj.position() ){
    jup_b219_position = obj.position()
    jup_b219_lvid = obj.level_vertex_id()
    jup_b219_gvid = obj.game_vertex_id()
  }else{
    return
  }
  sobj = alife().object(obj.id())
  if( sobj ){
    alife().release(sobj, true)
  }
}

export function jup_b219_restore_gate(){
  const yaw = 0
  const spawn_sect = "jup_b219_gate"
  if( jup_b219_position ){
    const se_obj = alife().create(spawn_sect,
        vector().set(jup_b219_position),
        jup_b219_lvid,
        jup_b219_gvid)
    se_obj.set_yaw(yaw * math.pi / 180)
  }
}

export function spawn_corpse(actor, obj, p){
  logger.info("Spawn corpse")

  //--' p[1] - ������ ���� ��������
  //--' p[2] - ��� ����������� ���� ��� ��������.
  const spawn_sect = p[1]
  if( spawn_sect === null ){
    abort("Wrong spawn section for 'spawn_corpse' function %s. For object %s", tostring(spawn_sect), obj.name())
  }

  const path_name = p[2]
  if( path_name === null ){
    abort("Wrong path_name for 'spawn_corpse' function %s. For object %s", tostring(path_name), obj.name())
  }

  if( ! level.patrol_path_exists(path_name) ){
    abort("Path %s doesnt exist. Function 'spawn_corpse' for object %s ", tostring(path_name), obj.name())
  }
  const ptr = patrol(path_name)
  const index = p[3] || 0

  const se_obj = alife().create(spawn_sect,
      ptr.point(index),
      ptr.level_vertex_id(0),
      ptr.game_vertex_id(0))
  se_obj.kill()
}

export function spawn_object_in(actor, obj, p){
  //--' p[1] - ������ ���� ��������
  //--' p[2] - ����� ���� ������� � ������� ��������
  const spawn_sect = p[1]
  if( spawn_sect === null ){
    abort("Wrong spawn section for 'spawn_object' function %s. For object %s", tostring(spawn_sect), obj.name())
  }
  if( p[2] === null ){
    abort("Wrong target_name for 'spawn_object_in' function %s. For object %s", tostring(target_name), obj.name())
  }
  //--	const box = alife().object(target_name)
  //--	if((box==null) ){

  printf("trying to find object %s", tostring(p[2]))

  const target_obj_id = getStoryObjectId(p[2])
  if( target_obj_id !== null ){
    box = alife().object(target_obj_id)
    if( box === null ){
      abort("There is no such object %s", p[2])
    }
    alife().create(spawn_sect, vector(), 0, 0, target_obj_id)
  }else{
    abort("object is null %s", tostring(p[2]))
  }
}

export function spawn_npc_in_zone(actor, obj, p){
  //--' p[1] - ������ ���� ��������
  //--' p[2] - ��� ���� � ������� ��������.
  const spawn_sect = p[1]
  if( spawn_sect === null ){
    abort("Wrong spawn section for 'spawn_object' function %s. For object %s", tostring(spawn_sect), obj.name())
  }
  const zone_name = p[2]
  if( zone_name === null ){
    abort("Wrong zone_name for 'spawn_object' function %s. For object %s", tostring(zone_name), obj.name())
  }
  if( db.zone_by_name[zone_name] === null ){
    abort("Zone %s doesnt exist. Function 'spawn_object' for object %s ", tostring(zone_name), obj.name())
  }
  const zone = db.zone_by_name[zone_name]
  //--	printf("spawn_npc_in_zone. spawning %s at zone %s, squad %s", tostring(p[1]), tostring(p[2]), tostring(p[3]))
  const spawned_obj = alife().create(spawn_sect,
      zone.position(),
      zone.level_vertex_id(),
      zone.game_vertex_id())
  spawned_obj.sim_forced_online = true
  spawned_obj.squad = 1 || p[3]
  db.script_ids[spawned_obj.id] = zone_name
}

export function destroy_object(actor, obj, p){
  const sobj
  if( p === null ){
    sobj = alife().object(obj.id())
  }else{
    if( p[1] === null || p[2] === null ){
      abort("Wrong parameters in destroy_object function!!!")
    }
    const target_str = null
    if( p[3] !== null ){
      target_str = p[1]..
      "|"..p[2]..
      ","..p[3]
    }else{
      target_str = p[1] + "|" + p[2]
    }
    const target_position, target_id, target_init = xr_remark.init_target(obj, target_str)
    if( target_id === null ){
      printf("You are trying to set non-existant target [%s] for object [%s] in section [%s]", target_str, npc.name(), storage.get(npc.id()).active_section)
    }
    sobj = alife().object(target_id)
  }
  if( sobj === null ){
    return
  }
  printf("releasing object [" + sobj.name() + "]")
  alife().release(sobj, true)
}

export function give_actor(actor: XR_game_object, npc: XR_game_object, p: []){
  for (const [k, v] of p) {
    alife().create(v,
        getActor().position(),
        getActor().level_vertex_id(),
        getActor().game_vertex_id(),
        getActor().id())
    NewsManager.relocate_item(getActor(), "in", v)
  }
}

export function activate_weapon_slot(actor: XR_game_object, npc: XR_game_object, p: []){
  getActor().activate_slot(p[1])
}

export function anim_obj_forward(actor: XR_game_object, npc: XR_game_object, p: []){
  for (const [k, v] of p) {
    if( v !== null ){
      db.anim_obj_by_name[v].anim_forward()
    }
  }
}

export function anim_obj_backward(actor: XR_game_object, npc: XR_game_object, p: []){
  if( p[1] !== null ){
    db.anim_obj_by_name[p[1]].anim_backward()
  }
}

export function anim_obj_stop(actor: XR_game_object, npc: XR_game_object, p: []){
  if( p[1] !== null ){
    db.anim_obj_by_name[p[1]].anim_stop()
  }
}

//--'//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//---
//--' ������� ��� ����������� �����
//--'//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//---
export function play_sound(actor, obj, p){
  logger.info("Play sound")

  const theme = p[1]
  const faction = p[2]
  const point = SimBoard.get_sim_board().smarts_by_names[p[3]]
  if( point !== null ) {
    point = point.id
  }else if( p[3] !== null ){
    point = p[3]
  }

  if( obj && IsStalker(obj) ){
    if( ! obj.alive() ){
      abort("Stalker [%s][%s] is dead, but you wants to say something for you. [%s]!", tostring(obj.id()), tostring(obj.name()), p[1])
    }
  }

  GlobalSound.set_sound_play(obj.id(), theme, faction, point)
}

export function play_sound_by_story(actor, obj, p){
  const story_obj = getStoryObjectId(p[1])
  const theme = p[2]
  const faction = p[3]
  const point = SimBoard.get_sim_board().smarts_by_names[p[4]]
  if( point !== null ) {
    point = point.id
  }else if( p[4] !== null ){
    point = p[4]
  }
  GlobalSound.set_sound_play(story_obj, theme, faction, point)
}

export function stop_sound(actor: XR_game_object, npc: XR_game_object): void {
  GlobalSound.stop_sounds_by_id(npc.id())
}

export function play_sound_looped(actor, obj, p){
  const theme = p[1]
  GlobalSound.play_sound_looped(obj.id(), theme)
}

export function stop_sound_looped(actor, obj){
  GlobalSound.stop_sound_looped(obj.id())
}

export function barrel_explode (actor: XR_game_object, npc: XR_game_object, p: []){
  const expl_obj = getStoryObject(p[1])
  if( expl_obj !== null ){
    expl_obj.explode(0)
  }
}

//--'//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//---
//--' Alife support
//--'//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//---

export function create_squad(actor, obj, p){
  if( obj !== null ){
    printf("pl.creating_squad from obj [%s] in section [%s]", tostring(obj.name()), tostring(storage[obj.id()].active_section))
  }
  const squad_id = p[1]
  if( squad_id === null ){
    abort("Wrong squad identificator [NIL] in create_squad function")
  }
  const smart_name = p[2]
  if( smart_name === null ){
    abort("Wrong smart name [NIL] in create_squad function")
  }

  if( ! iniFiles.SYSTEM_INI.section_exist(squad_id) ){
    abort("Wrong squad identificator [%s]. Squad descr doesnt exist.", tostring(squad_id))
  }

  const board = SimBoard.get_sim_board()
  const smart = board.smarts_by_names[smart_name]
  if( smart === null ){
    abort("Wrong smart_name [%s] for [%s] faction in create_squad function", tostring(smart_name), tostring(player_name))
  }

  const squad = board.create_squad(smart, squad_id)

  board.enter_smart(squad, smart.id)

  for k in squad.squad_members() {
    board.setup_squad_and_group(k.object)
  }

  squad.update()
}

export function create_squad_member(actor, obj, p){
  const squad_member_sect = p[1]
  const story_id = p[2]
  const position = null
  const level_vertex_id = null
  const game_vertex_id = null
  if( story_id === null ){
    abort("Wrong squad identificator [NIL] in 'create_squad_member' function")
  }
  const board = SimBoard.get_sim_board()
  const squad = getStorySquad(story_id)
  const squad_smart = board.smarts[squad.smart_id].smrt
  if( p[3] !== null ){
    const spawn_point
    if( p[3] === "simulation_point" ){
      spawn_point = configUtils.getConfigString(iniFiles.SYSTEM_INI, squad.section_name(), "spawn_point", obj, false, "")
      if( spawn_point === "" || spawn_point === null
      {
        spawn_point = configUtils.parseCondList(obj, "spawn_point", "spawn_point", squad_smart.spawn_point)
      }else{
        spawn_point = configUtils.parseCondList(obj, "spawn_point", "spawn_point", spawn_point)
      }
      spawn_point = configUtils.pickSectionFromCondList(getActor(), obj, spawn_point)
  }else{
      spawn_point = p[3]
    }
    position = patrol(spawn_point).point(0)
    level_vertex_id = patrol(spawn_point).level_vertex_id(0)
    game_vertex_id = patrol(spawn_point).game_vertex_id(0)
}else{
    const commander = alife().object(squad.commander_id())
    position = commander.position
    level_vertex_id = commander.m_level_vertex_id
    game_vertex_id = commander.m_game_vertex_id
  }
  const new_member_id = squad.add_squad_member(squad_member_sect, position, level_vertex_id, game_vertex_id)
  squad.assign_squad_member_to_smart(new_member_id, squad_smart)
  board.setup_squad_and_group(alife().object(new_member_id))
  //--squad_smart.refresh()
  squad.update()
}

export function remove_squad(actor, obj, p){
  const story_id = p[1]
  if( story_id === null ){
    abort("Wrong squad identificator [NIL] in remove_squad function")
  }
  const squad = getStorySquad(story_id)
  if( squad === null ){
    assert("Wrong squad identificator [%s]. squad doesnt exist", tostring(story_id))
    return
  }
  const board = SimBoard.get_sim_board()
  board.remove_squad(squad)
}

export function kill_squad(actor, obj, p){
  const story_id = p[1]
  if( story_id === null ){
    abort("Wrong squad identificator [NIL] in kill_squad function")
  }
  const squad = getStorySquad(story_id)
  if( squad === null ){
    return
  }
  const squad_npcs = {}
  for k in squad.squad_members() {
    squad_npcs[k.id] = true
  }

  for (const [k, v] of squad_npcs) {
    const cl_obj = storage[k] && storage[k].object
    if( cl_obj === null ){
      alife().object(tonumber(k)).kill()
    }else{
      cl_obj.kill(cl_obj)
    }
  }
}

export function heal_squad(actor, obj, p){
  const story_id = p[1]
  const health_mod = 1
  if( p[2] && p[2] !== null ){
    health_mod = math.ceil(p[2] / 100)
  }
  if( story_id === null ){
    abort("Wrong squad identificator [NIL] in heal_squad function")
  }
  const squad = getStorySquad(story_id)
  if( squad === null ){
    return
  }
  for k in squad.squad_members() {
    const cl_obj = storage[k.id] && storage[k.id].object
    if( cl_obj !== null ){
      cl_obj.health = health_mod
    }
  }
}

export function clear_smart_terrain(actor, obj, p){
  logger.info("Clear smart terrain")

  const smart_name = p[1]
  if( smart_name === null ){
    abort("Wrong squad identificator [NIL] in clear_smart_terrain function")
  }

  const board = SimBoard.get_sim_board()
  const smart = board.smarts_by_names[smart_name]
  const smart_id = smart.id
  for (const [k, v] of board.smarts[smart_id].squads) {
    if( p[2] && p[2] === "false" ){
      if( ! get_object_story_id(v.id) ){
        board.exit_smart(v, smart_id)
        board.remove_squad(v)
      }
    }else{
      board.exit_smart(v, smart_id)
      board.remove_squad(v)
    }
  }
}

//--'//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//---
//--' Quest support
//--'//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//---
export function give_task(actor, obj, p){
  logger.info("Give task")

  if( p[1] === null ){
    abort("No parameter in give_task function.")
  }
  TaskManager.get_task_manager().give_task(p[1])
}

export function set_active_task(actor: XR_game_object, npc: XR_game_object, p: []){
  logger.info("Set active task")

  if( (p[1]) ){
    const t = getActor().get_task(tostring(p[1]), true)
    if( (t) ){
      getActor().set_active_task(t)
    }
  }
}

//-- ������� ��� ������ � �����������

export function actor_friend(actor: XR_game_object, npc: XR_game_object): void {
  printf("_bp. xr_effects. actor_friend(). npc='%s'. time=%d", npc.name(), time_global())
  npc.force_set_goodwill(1000, actor)
}

export function actor_neutral(actor: XR_game_object, npc: XR_game_object): void {
  npc.force_set_goodwill(0, actor)
}

export function actor_enemy(actor: XR_game_object, npc: XR_game_object): void {
  npc.force_set_goodwill(-1000, actor)
}

export function set_squad_neutral_to_actor(actor: XR_game_object, npc: XR_game_object, p: []){
  const story_id = p[1]
  const squad = getStorySquad(story_id)
  if( squad === null ){
    printf("There is no squad with id[%s]", tostring(story_id))
    return
  }
  squad.set_squad_relation("neutral")
}

export function set_squad_friend_to_actor(actor: XR_game_object, npc: XR_game_object, p: []){
  const story_id = p[1]
  const squad = getStorySquad(story_id)
  if( squad === null ){
    printf("There is no squad with id[%s]", tostring(story_id))
    return
  }
  squad.set_squad_relation("friend")
}

//--������� ������ ������ � ������, ���������� ��� ������
export function set_squad_enemy_to_actor(actor: XR_game_object, npc: XR_game_object, p: []){
  const story_id = p[1]
  const squad = getStorySquad(story_id)
  if( squad === null ){
    printf("There is no squad with id[%s]", tostring(story_id))
    return
  }
  squad.set_squad_relation("enemy")
}

//--sets NPC relation to actor
//--set_npc_sympathy(number)
//--call only from npc`s logic
export function set_npc_sympathy(actor: XR_game_object, npc: XR_game_object, p: []){
  if( (p[1] !== null) ){
    game_relations.set_npc_sympathy(npc, p[1])
  }
}

//--sets SQUAD relation to actor
//--set_squad_goodwill(faction.number)
export function set_squad_goodwill(actor: XR_game_object, npc: XR_game_object, p: []){
  if( (p[1] !== null) && (p[2] !== null) ){
    game_relations.set_squad_goodwill(p[1], p[2])
  }
}

export function set_squad_goodwill_to_npc(actor: XR_game_object, npc: XR_game_object, p: []){
  if( (p[1] !== null) && (p[2] !== null) ){
    game_relations.set_squad_goodwill_to_npc(npc, p[1], p[2])
  }
}

export function inc_faction_goodwill_to_actor(actor: XR_game_object, npc: XR_game_object, p: []){
  const community = p[1]
  const delta = p[2]
  if( delta && community ){
    game_relations.change_factions_community_num(community, actor.id(), tonumber(delta))
  }else{
    abort("Wrong parameters in function 'inc_faction_goodwill_to_actor'")
  }
}

export function dec_faction_goodwill_to_actor(actor: XR_game_object, npc: XR_game_object, p: []){
  const community = p[1]
  const delta = p[2]
  if( delta && community ){
    game_relations.change_factions_community_num(community, actor.id(), -tonumber(delta))
  }else{
    abort("Wrong parameters in function 'dec_faction_goodwill_to_actor'")
  }
}

export function kill_actor(actor: XR_game_object, npc: XR_game_object): void {
  logger.info("Kill actor")
  getActor().kill(getActor())
}

//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//---
//--  Treasures support
//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//--//---
export function give_treasure (actor: XR_game_object, npc: XR_game_object, p: []){
  logger.info("Give treasure")

  if( p === null ){
    abort("Required parameter is [NIL]")
  }
  for (const [k, v] of p) {
    getTreasureManager().give_treasure(v)
  }
}

export function start_surge(actor: XR_game_object, npc: XR_game_object, p: []){
  logger.info("Start surge")
  SurgeManager.start_surge(p)
}

export function stop_surge(actor: XR_game_object, npc: XR_game_object, p: []){
  logger.info("Stop surge")
  SurgeManager.stop_surge()
}

export function set_surge_mess_and_task(actor: XR_game_object, npc: XR_game_object, p: []){
  if( (p) ){
    SurgeManager.set_surge_message(p[1])
    if( (p[2]) ){
      SurgeManager.set_surge_task(p[2])
    }
  }
}

export function set_level_faction_community(actor: XR_game_object, npc: XR_game_object, p: []){
  if( (p[1] !== null) && (p[2] !== null) && (p[3] !== null) ){
    const faction = SimBoard.get_sim_board().players[p[1]]
    const goodwill = 0
    if( (p[3] === "enemy") ) {
      goodwill = -3000
    }else if( (p[3] === "friend") ){
      goodwill = 1000
    }
    for (const [k, v] of faction.squads) {
      const squad_level = alife().level_name(game_graph().vertex(alife().object(v.commander_id()).m_game_vertex_id).level_id())
      if( (squad_level === p[2]) ){
        for kk in v.squad_members() {
          const npc = kk.object
          const tbl = game_relations.temp_goodwill_table
          if( (tbl.communities === null) ){
            tbl.communities = {}
          }
          if( (tbl.communities[p[1]] === null) ){
            tbl.communities[p[1]] = {}
          }
          tbl.communities[p[1]][npc.id] = goodwill
          if( (storage[npc.id] !== null) ){
            game_relations.set_level_faction_community(storage[npc.id].object)
          }
        }
      }
    }
  }
}

export function make_actor_visible_to_squad(actor: XR_game_object, npc: XR_game_object, p: []){
  const story_id = p && p[1]
  const squad = getStorySquad(story_id)
  if( squad === null ){
    abort("There is no squad with id[%s]", story_id)
  }
  for k in squad.squad_members() {
    const obj = level.object_by_id(k.id)
    if( obj !== null ){
      obj.make_object_visible_somewhen(getActor())
    }
  }
}

export function stop_sr_cutscene(actor: XR_game_object, npc: XR_game_object, p: []){
  const obj = storage.get(npc.id())
  if( (obj.active_scheme !== null) ){
    obj[obj.active_scheme].signals["cam_effector_stop"] = true
  }
}

//-- Anomal fields support
export function enable_anomaly(actor: XR_game_object, npc: XR_game_object, p: []){
  if( p[1] === null ){
    abort("Story id for enable_anomaly function is ! set")
  }

  const obj = getStoryObject(p[1])
  if( ! obj ){
    abort("There is no object with story_id %s for enable_anomaly function", tostring(p[1]))
  }
  obj.enable_anomaly()
}

export function disable_anomaly(actor: XR_game_object, npc: XR_game_object, p: []){
  if( p[1] === null ){
    abort("Story id for disable_anomaly function is ! set")
  }

  const obj = getStoryObject(p[1])
  if( ! obj ){
    abort("There is no object with story_id %s for disable_anomaly function", tostring(p[1]))
  }
  obj.disable_anomaly()
}

export function launch_signal_rocket(actor, obj, p){
  if( p === null ){
    abort("Signal rocket name is ! set!")
  }
  if( db.signal_light[p[1]] ){
    db.signal_light[p[1]].launch()
  }else{
    abort("No such signal rocket. [%s] on level", tostring(p[1]))
  }
}

export function add_cs_text(actor: XR_game_object, npc: XR_game_object, p: []){
  if( p[1] ){
    const hud = get_hud()
    const cs_text = hud.GetCustomStatic("text_on_screen_center")
    if( cs_text ){
      hud.RemoveCustomStatic("text_on_screen_center")
    }
    hud.AddCustomStatic("text_on_screen_center", true)
    cs_text = hud.GetCustomStatic("text_on_screen_center")
    cs_text.wnd().TextControl().SetText(game.translate_string(p[1]))
  }
}

export function del_cs_text(actor: XR_game_object, npc: XR_game_object, p: []){
  const hud = get_hud()
  cs_text = hud.GetCustomStatic("text_on_screen_center")
  if( cs_text ){
    hud.RemoveCustomStatic("text_on_screen_center")
  }
}

export function spawn_item_to_npc(actor: XR_game_object, npc: XR_game_object, p: []){
  const new_item = p[1]
  if( p[1] ){
    alife().create(new_item,
        npc.position(),
        npc.level_vertex_id(),
        npc.game_vertex_id(),
        npc.id())
  }
}

export function give_money_to_npc(actor: XR_game_object, npc: XR_game_object, p: []){
  const money = p[1]
  if( p[1] ){
    npc.give_money(money)
  }
}

export function seize_money_to_npc(actor: XR_game_object, npc: XR_game_object, p: []){
  const money = p[1]
  if( p[1] ){
    npc.give_money(-money)
  }
}

//-- �������� �������� �� ������ � ������
//-- relocate_item(item_name.story_id_from.story_id_to)
export function relocate_item(actor: XR_game_object, npc: XR_game_object, p: []){
  logger.info("Relocate item");

  const item = p && p[1]
  const from_obj = p && getStoryObject(p[2])
  const to_obj = p && getStoryObject(p[3])
  if( to_obj !== null ){
    if( from_obj !== null && from_obj.object(item) !== null ){
      from_obj.transfer_item(from_obj.object(item), to_obj)
    }else{
      alife().create(item,
          to_obj.position(),
          to_obj.level_vertex_id(),
          to_obj.game_vertex_id(),
          to_obj.id())
    }
}else{
    abort("Couldn't relocate item to NULL")
  }
}

//-- ������� ������ �������, ���������� ��� ������ set_squads_enemies(squad_name_1.squad_name_2)
export function set_squads_enemies(actor: XR_game_object, npc: XR_game_object, p: []){
  if( (p[1] === null || p[2] === null) ){
    abort("Wrong parameters in function set_squad_enemies")
    return
  }

  const squad_1 = getStorySquad(p[1])
  const squad_2 = getStorySquad(p[2])

  if( squad_1 === null ){
    assert("There is no squad with id[%s]", tostring(p[1]))
    return
  }
  if( squad_2 === null ){
    assert("There is no squad with id[%s]", tostring(p[2]))
    return
  }

  for k in squad_1.squad_members() {
    const npc_obj_1 = storage[k.id] && storage[k.id].object
    if( npc_obj_1 !== null ){
      for kk in squad_2.squad_members() {
        const npc_obj_2 = storage[kk.id] && storage[kk.id].object
        if( npc_obj_2 !== null ){
          npc_obj_1.set_relation(game_object.enemy, npc_obj_2)
          npc_obj_2.set_relation(game_object.enemy, npc_obj_1)
          printf("set_squads_enemies. %d.set_enemy(%d)", npc_obj_1.id(), npc_obj_2.id())
        }
      }
    }
  }
}

particles_table = null

export function jup_b16_play_particle_and_sound(actor: XR_game_object, npc: XR_game_object, p: []){
  if( particles_table === null ){
    particles_table = {
      [1] = { particle = particles_object("anomaly2\\teleport_out_00"), sound = sound_object("anomaly\\teleport_incoming") },
      [2] = { particle = particles_object("anomaly2\\teleport_out_00"), sound = sound_object("anomaly\\teleport_incoming") },
      [3] = { particle = particles_object("anomaly2\\teleport_out_00"), sound = sound_object("anomaly\\teleport_incoming") },
      [4] = { particle = particles_object("anomaly2\\teleport_out_00"), sound = sound_object("anomaly\\teleport_incoming") },
    }
  }

  particles_table[p[1]].particle.play_at_pos(patrol(npc.name() + "_particle").point(0))
  //--particles_table[p[1]].sound    .play_at_pos(actor, patrol(npc.name().."_particle").point(0), 0, sound_object.s3d)
}
//--������� ��������� ��������� ��������� ���������.
//-- ��������� ����� ���������� //--> story_id.visibility_state(����� �������� ������ ������) ��� visibility_state(���� ���������� �� ���������� ���������)
//--  visibility_state //-->
//--						0 - ���������
//--						1 - �����������
//--						2 - ��������� �������

export function set_bloodsucker_state(actor: XR_game_object, npc: XR_game_object, p: []){
  if( (p && p[1]) === null ){
    abort("Wrong parameters in function 'set_bloodsucker_state'!!!")
  }
  const state = p[1]
  if( p[2] !== null ){
    state = p[2]
    npc = getStoryObject(p[1])
  }
  if( npc !== null ){
    if( state === "default" ){
      npc.force_visibility_state(-1)
    }else{
      npc.force_visibility_state(tonumber(state))
    }
  }
}

//--������� ������� �������� � ������������ �����, ������ ��� ����� �57
export function drop_object_item_on_point(actor: XR_game_object, npc: XR_game_object, p: []){
  const drop_object = getActor().object(p[1])
  const drop_point = patrol(p[2]).point(0)
  getActor().drop_item_and_teleport(drop_object, drop_point)
}

//--������� ������� �������� � ������
export function remove_item(actor: XR_game_object, npc: XR_game_object, p: []){
  logger.info("Remove item");

  if( (p && p[1]) === null ){
    abort("Wrong parameters in function 'remove_item'!!!")
  }
  const item = p[1]

  const obj = getActor().object(item)
  if( obj !== null ){
    alife().release(alife().object(obj.id()), true)
  }else{
    abort("Actor has no such item!")
  }
  NewsManager.relocate_item(getActor(), "out", item)
}

//-- �������� ���������� � ������ ������
export function scenario_autosave(actor: XR_game_object, npc: XR_game_object, p: []){
  const save_name = p[1]

  if( save_name === null ){
    abort("You are trying to use scenario_autosave without save name")
  }

  if( IsImportantSave() ){
    const save_param = user_name()..
    " - "..game.translate_string(save_name)
    logger.info("Performing auto-save, detected as important.", save_name, save_param);

    get_console().execute("save "..save_param)
  }else{
    logger.info("Not important save, skip.", save_name);
  }
}

export function zat_b29_create_random_infop(actor: XR_game_object, npc: XR_game_object, p: []){
  if( p[2] === null ){
    abort("Not enough parameters for zat_b29_create_random_infop!")
  }

  const amount_needed = p[1]
  const current_infop = 0
  const total_infop = 0

  if( (! amount_needed || amount_needed === null) ){
    amount_needed = 1
  }

  for (const [k, v] of p) {
    if( k > 1 ){
      total_infop = total_infop + 1
      disable_info(v)
    }
  }

  if( amount_needed > total_infop ){
    amount_needed = total_infop
  }

  for (const i of $range(1, amount_needed {
    current_infop = math.random(1, total_infop)
    for (const [k, v] of p) {
      if( k > 1 ){
        if( (k === current_infop + 1 && (! hasAlifeInfo(v))) ){
          giveInfo(v)
          break
        }
      }
    }
  }
}

export function give_item_b29(actor: XR_game_object, npc: XR_game_object, p: []){
  //--	const story_object = p && getStoryObject(p[1])
  const az_name
  const az_table = {
    "zat_b55_anomal_zone",
    "zat_b54_anomal_zone",
    "zat_b53_anomal_zone",
    "zat_b39_anomal_zone",
    "zaton_b56_anomal_zone",
  }

  for (const i of $range(16, 23 {
    if( hasAlifeInfo(dialogs_zaton.zat_b29_infop_bring_table[i]) ){
      for (const [k, v] of az_table) {
        if( hasAlifeInfo(v) ){
          az_name = v
          disable_info(az_name)
          break
        }
      }
      pick_artefact_from_anomaly(null, null, { p[1], az_name, dialogs_zaton.zat_b29_af_table[i] })
      break
    }
  }
}

export function relocate_item_b29(actor: XR_game_object, npc: XR_game_object, p: []){
  const item
  for (const i of $range(16, 23 {
    if( hasAlifeInfo(dialogs_zaton.zat_b29_infop_bring_table[i]) ){
      item = dialogs_zaton.zat_b29_af_table[i]
      break
    }
  }
  const from_obj = p && getStoryObject(p[1])
  const to_obj = p && getStoryObject(p[2])
  if( to_obj !== null ){
    if( from_obj !== null && from_obj.object(item) !== null ){
      from_obj.transfer_item(from_obj.object(item), to_obj)
    }else{
      alife().create(item,
          to_obj.position(),
          to_obj.level_vertex_id(),
          to_obj.game_vertex_id(),
          to_obj.id())
    }
}else{
    abort("Couldn't relocate item to NULL")
  }
}

//-- ������� ������� ���������� �������� ���� � ������. by peacemaker, hein, redstain
export function reset_sound_npc(actor: XR_game_object, npc: XR_game_object, p: []){
  const obj_id = npc.id()
  if( obj_id && GlobalSound.sound_table && GlobalSound.sound_table[obj_id] ){
    GlobalSound.sound_table[obj_id].reset(obj_id)
  }
}

export function jup_b202_inventory_box_relocate(actor: XR_game_object, npc: XR_game_object): void {
  const inv_box_out = getStoryObject("jup_b202_actor_treasure")
  const inv_box_in = getStoryObject("jup_b202_snag_treasure")
  const items_to_relocate = {}
  const function relocate(inv_box_out, item)
    table.insert(items_to_relocate, item)
  }
  inv_box_out.iterate_inventory_box(relocate, inv_box_out)
  for (const [k, v] of items_to_relocate) {
    inv_box_out.transfer_item(v, inv_box_in)
  }
}

export function clear_box(actor: XR_game_object, npc: XR_game_object, p: []){
  logger.info("Clear box")

  if( (p && p[1]) === null ){
    abort("Wrong parameters in function 'clear_box'!!!")
  }

  const inv_box = getStoryObject(p[1])

  if( inv_box === null ){
    abort("There is no object with story_id [%s]", tostring(p[1]))
  }

  const items_table = {}

  const function add_items(inv_box, item)
    table.insert(items_table, item)
  }

  inv_box.iterate_inventory_box(add_items, inv_box)

  for (const [k, v] of items_table) {
    alife().release(alife().object(v.id()), true)
  }
}

export function activate_weapon(actor: XR_game_object, npc: XR_game_object, p: []){
  const object = actor.object(p[1])
  if( object === null ){
    assert("Actor has no such weapon! [%s]", p[1])
  }
  if( object !== null ){
    actor.make_item_active(object)
  }
}

export function set_game_time(actor: XR_game_object, npc: XR_game_object, p: []){
  logger.info("Set game time")

  const real_hours = level.get_time_hours()
  const real_minutes = level.get_time_minutes()
  const hours = tonumber(p[1])
  const minutes = tonumber(p[2])
  if( p[2] === null ){
    minutes = 0
  }
  const hours_to_change = hours - real_hours
  if( hours_to_change <= 0 ){
    hours_to_change = hours_to_change + 24
  }
  const minutes_to_change = minutes - real_minutes
  if( minutes_to_change <= 0 ) {
    minutes_to_change = minutes_to_change + 60
    hours_to_change = hours_to_change - 1
  }else if( hours === real_hours ){
    hours_to_change = hours_to_change - 24
  }
  level.change_game_time(0, hours_to_change, minutes_to_change)
  WeatherManager.get_weather_manager().forced_weather_change()
  SurgeManager.get_surge_manager().isTimeForwarded = true
  printf("set_game_time. time changed to [%d][%d]", hours_to_change, minutes_to_change)
}

export function forward_game_time(actor: XR_game_object, npc: XR_game_object, p: []){
  logger.info("Forward game time")

  if( ! p ){
    abort("Insufficient || invalid parameters in function 'forward_game_time'!")
  }

  const hours = tonumber(p[1])
  const minutes = tonumber(p[2])

  if( p[2] === null ){
    minutes = 0
  }
  level.change_game_time(0, hours, minutes)
  WeatherManager.get_weather_manager().forced_weather_change()
  SurgeManager.get_surge_manager().isTimeForwarded = true
  printf("forward_game_time. time forwarded on [%d][%d]", hours, minutes)
}

export function stop_tutorial(){
  printf("stop tutorial called")
  game.stop_tutorial()
}

export function jup_b10_spawn_drunk_dead_items(actor: XR_game_object, npc: XR_game_object, p: []){
  const items_all = {
    ["wpn_ak74"] = 1,
    ["ammo_5.45x39_fmj"] = 5,
    ["ammo_5.45x39_ap"] = 3,
    ["wpn_fort"] = 1,
    ["ammo_9x18_fmj"] = 3,
    ["ammo_12x70_buck"] = 5,
    ["ammo_11.43x23_hydro"] = 2,
    ["grenade_rgd5"] = 3,
    ["grenade_f1"] = 2,
    ["medkit_army"] = 2,
    ["medkit"] = 4,
    ["bandage"] = 4,
    ["antirad"] = 2,
    ["vodka"] = 3,
    ["energy_drink"] = 2,
    ["conserva"] = 1,
    ["jup_b10_ufo_memory_2"] = 1,
  }

  const items = {
    [2] = {
      ["wpn_sig550_luckygun"] = 1,
    },
    [1] = {
      ["ammo_5.45x39_fmj"] = 5,
      ["ammo_5.45x39_ap"] = 3,
      ["wpn_fort"] = 1,
      ["ammo_9x18_fmj"] = 3,
      ["ammo_12x70_buck"] = 5,
      ["ammo_11.43x23_hydro"] = 2,
      ["grenade_rgd5"] = 3,
      ["grenade_f1"] = 2,
    },
    [0] = {
      ["medkit_army"] = 2,
      ["medkit"] = 4,
      ["bandage"] = 4,
      ["antirad"] = 2,
      ["vodka"] = 3,
      ["energy_drink"] = 2,
      ["conserva"] = 1,
    },
  }

  if( p && p[1] !== null ){
    const cnt = pstor.pstor_retrieve(actor, "jup_b10_ufo_counter", 0)
    if( cnt > 2 ){
      return
    }
    for (const [k, v] of items[cnt]) {
      const target_obj_id = getStoryObjectId(p[1])
      if( target_obj_id !== null ){
        box = alife().object(target_obj_id)
        if( box === null ){
          abort("There is no such object %s", p[1])
        }
        for (const i of $range(1, v {
          alife().create(k, vector(), 0, 0, target_obj_id)
        }
      }else{
        abort("object is null %s", tostring(p[1]))
      }
    }
}else{
    for (const [k, v] of items_all) {
      for (const i of $range(1, v {
        alife().create(k,
            npc.position(),
            npc.level_vertex_id(),
            npc.game_vertex_id(),
            npc.id())
      }
    }
  }

}

export function pick_artefact_from_anomaly(actor: XR_game_object, npc: XR_game_object, p: []){
  logger.info("Pick artefact from anomaly")

  const npc
  const az_name = p && p[2]
  const af_name = p && p[3]
  const af_id
  const af_obj
  const anomal_zone = db.anomaly_by_name[az_name]

  if( p && p[1] ){
    //--		if( p[1] === "actor" ){
    //--			npc = getActor()
    //--		}else{
    //--			npc = getStoryObject(p[1])
    //--		}

    const npc_id = getStoryObjectId(p[1])
    if( npc_id === null ){
      abort("Couldn't relocate item to NULL in function 'pick_artefact_from_anomaly!'")
    }
    npc = alife().object(npc_id)
    if( npc && (! IsStalker(npc) || ! npc.alive()) ){
      abort("Couldn't relocate item to NULL (dead || ! stalker) in function 'pick_artefact_from_anomaly!'")
    }
  }

  if( anomal_zone === null ){
    abort("No such anomal zone in function 'pick_artefact_from_anomaly!'")
  }

  if( anomal_zone.spawned_count < 1 ){
    printf("No artefacts in anomal zone [%s]", az_name)
    return
  }

  for (const [k, v] of anomal_zone.artefact_ways_by_id) {
    if( alife().object(tonumber(k)) && af_name === alife().object(tonumber(k)).section_name() ){
      af_id = tonumber(k)
      af_obj = alife().object(tonumber(k))
      break
    }
    if( af_name === null ){
      af_id = tonumber(k)
      af_obj = alife().object(tonumber(k))
      af_name = af_obj.section_name()
      break
    }
  }

  if( af_id === null ){
    printf("No such artefact [%s] found in anomal zone [%s]", tostring(af_name), az_name)
    return
  }

  anomal_zone.onArtefactTaken(af_obj)

  alife().release(af_obj, true)
  give_item(getActor(), npc, { af_name, p[1] })
  //--	alife().create(af_name,
  //--		npc.position,
  //--		npc.level_vertex_id,
  //--		npc.game_vertex_id,
  //--		npc.id)
}

export function anomaly_turn_off (actor: XR_game_object, npc: XR_game_object, p: []){
  const anomal_zone = db.anomaly_by_name[p[1]]
  if( anomal_zone === null ){
    abort("No such anomal zone in function 'anomaly_turn_off!'")
  }
  anomal_zone.turn_off()
}

export function anomaly_turn_on (actor: XR_game_object, npc: XR_game_object, p: []){
  const anomal_zone = db.anomaly_by_name[p[1]]
  if( anomal_zone === null ){
    abort("No such anomal zone in function 'anomaly_turn_on!'")
  }
  if( p[2] ){
    anomal_zone.turn_on(true)
  }else{
    anomal_zone.turn_on(false)
  }
}

export function zat_b202_spawn_random_loot(actor: XR_game_object, npc: XR_game_object, p: []){
  const si_table = {}
  si_table[1] = {
    [1] = { item = { "bandage", "bandage", "bandage", "bandage", "bandage", "medkit", "medkit", "medkit", "conserva", "conserva" } },
    [2] = { item = { "medkit", "medkit", "medkit", "medkit", "medkit", "vodka", "vodka", "vodka", "kolbasa", "kolbasa" } },
    [3] = { item = { "antirad", "antirad", "antirad", "medkit", "medkit", "bandage", "kolbasa", "kolbasa", "conserva" } },
  }
  si_table[2] = {
    [1] = { item = { "grenade_f1", "grenade_f1", "grenade_f1" } },
    [2] = { item = { "grenade_rgd5", "grenade_rgd5", "grenade_rgd5", "grenade_rgd5", "grenade_rgd5" } }
  }
  si_table[3] = {
    [1] = { item = { "detector_elite" } },
    [2] = { item = { "detector_advanced" } }
  }
  si_table[4] = {
    [1] = { item = { "helm_hardhat" } },
    [2] = { item = { "helm_respirator" } }
  }
  si_table[5] = {
    [1] = { item = { "wpn_val", "ammo_9x39_ap", "ammo_9x39_ap", "ammo_9x39_ap" } },
    [2] = { item = { "wpn_spas12", "ammo_12x70_buck", "ammo_12x70_buck", "ammo_12x70_buck", "ammo_12x70_buck" } },
    [3] = { item = { "wpn_desert_eagle", "ammo_11.43x23_fmj", "ammo_11.43x23_fmj", "ammo_11.43x23_hydro", "ammo_11.43x23_hydro" } },
    [4] = { item = { "wpn_abakan", "ammo_5.45x39_ap", "ammo_5.45x39_ap" } },
    [5] = { item = { "wpn_sig550", "ammo_5.56x45_ap", "ammo_5.56x45_ap" } },
    [6] = { item = { "wpn_ak74", "ammo_5.45x39_fmj", "ammo_5.45x39_fmj" } },
    [7] = { item = { "wpn_l85", "ammo_5.56x45_ss190", "ammo_5.56x45_ss190" } }
  }
  si_table[6] = {
    [1] = { item = { "specops_outfit" } },
    [2] = { item = { "stalker_outfit" } }
  }
  weight_table = {}
  weight_table[1] = 2
  weight_table[2] = 2
  weight_table[3] = 2
  weight_table[4] = 2
  weight_table[5] = 4
  weight_table[6] = 4
  const spawned_item = {}
  const max_weight = 12
  repeat
    const n = 0
    repeat
      n = math.random(1, #weight_table)
      const prap = true
      for (const [k, v] of spawned_item) {
        if( v === n ){
          prap = false
          break
        }
      }
    until (prap) && ((max_weight - weight_table[n]) >= 0)
    max_weight = max_weight - weight_table[n]
    table.insert(spawned_item, n)
    const item = math.random(1, #si_table[n])
    for (const [k, v] of si_table[n][item].item) {
      spawn_object_in(actor, npc, { tostring(v), "jup_b202_snag_treasure" })
    }
  until max_weight <= 0
}

export function zat_a1_tutorial_end_give(actor: XR_game_object, npc: XR_game_object): void {
  //--	level.add_pp_effector("black.ppe", 1313, true) //---{ ! stop on r1 !
  giveInfo("zat_a1_tutorial_end")
}

export function oasis_heal(){
  const d_health = 0.005
  const d_power = 0.01
  const d_bleeding = 0.05
  const d_radiation = -0.05
  if( (getActor().health < 1) ){
    getActor().health = d_health
  }
  if( (getActor().power < 1) ){
    getActor().power = d_power
  }
  if( (getActor().radiation > 0) ){
    getActor().radiation = d_radiation
  }
  if( (getActor().bleeding > 0) ){
    getActor().bleeding = d_bleeding
  }
  getActor().satiety = 0.01
}

//--������� ��������� ������ ���� ��������, ������������ ��� ����� ���������� �����������. ��������� �������� [duty, freedom]
export function jup_b221_play_main(actor: XR_game_object, npc: XR_game_object, p: []){
  const info_table = {}
  const main_theme
  const reply_theme
  const info_need_reply
  const reachable_theme = {}
  const theme_to_play = 0

  if( (p && p[1]) === null ){
    abort("No such parameters in function 'jup_b221_play_main'")
  }
  //--���������� ������� ������������ ������������ ����������� ��� ��� ���� ����, ���������� �������� ����, ������ � �������, �������������� ��� ����� ��� ��� �������.
  if( tostring(p[1]) === "duty" ) {
    info_table = {
      [1] = "jup_b25_freedom_flint_gone",
      [2] = "jup_b25_flint_blame_done_to_duty",
      [3] = "jup_b4_monolith_squad_in_duty",
      [4] = "jup_a6_duty_leader_bunker_guards_work",
      [5] = "jup_a6_duty_leader_employ_work",
      [6] = "jup_b207_duty_wins"
    }
    main_theme = "jup_b221_duty_main_"
    reply_theme = "jup_b221_duty_reply_"
    info_need_reply = "jup_b221_duty_reply"
  }else if() tostring(p[1]) === "freedom"
    {
      info_table = {
        [1] = "jup_b207_freedom_know_about_depot",
        [2] = "jup_b46_duty_founder_pda_to_freedom",
        [3] = "jup_b4_monolith_squad_in_freedom",
        [4] = "jup_a6_freedom_leader_bunker_guards_work",
        [5] = "jup_a6_freedom_leader_employ_work",
        [6] = "jup_b207_freedom_wins"
      }
      main_theme = "jup_b221_freedom_main_"
      reply_theme = "jup_b221_freedom_reply_"
      info_need_reply = "jup_b221_freedom_reply"
    }else{
    abort("Wrong parameters in function 'jup_b221_play_main'")
  }
  //--���������� ������� ��������� ���(����� ������ ���).
  for (const [k, v] of info_table) {
    if( (hasAlifeInfo(v)) && (! hasAlifeInfo(main_theme + tostring(k) + "_played")) ){
      table.insert(reachable_theme, k)
      //--			printf("jup_b221_play_main. table reachable_theme //--//--//--//--//--//--//--//--//--//--//--//--//--//--//--> [%s]", tostring(k))
    }
  }
  //--���� ������� ��������� ��� ����� ������ �����. ���� �� ��� �� ����� ������ �������� ����. ���� ������ �������� ���� ������� �������� �������� ��� ���������� ���������� �������. ���� �������� �� �������.
  if( #reachable_theme !== 0 ){
    disable_info(info_need_reply)
    theme_to_play = reachable_theme[math.random(1, #reachable_theme)]
    //--		printf("jup_b221_play_main. variable theme_to_play //--//--//--//--//--//--//--//--//--//--//--//--//--//--//--> [%s]", tostring(theme_to_play))
    pstor.pstor_store(actor, "jup_b221_played_main_theme", tostring(theme_to_play))
    giveInfo(main_theme + tostring(theme_to_play) + "_played")
    if( theme_to_play !== 0 ){
      play_sound(actor, npc, {
        main_theme
        .
        . tostring(theme_to_play)
      })
    }else{
      abort("No such theme_to_play in function 'jup_b221_play_main'")
    }
}else{
    giveInfo(info_need_reply)
    theme_to_play = tonumber(pstor.pstor_retrieve(actor, "jup_b221_played_main_theme", 0))
    if( theme_to_play !== 0 ){
      play_sound(actor, npc, {
        reply_theme
        .
        . tostring(theme_to_play)
      })
    }else{
      abort("No such theme_to_play in function 'jup_b221_play_main'")
    }
    pstor.pstor_store(actor, "jup_b221_played_main_theme", "0")
  }
}

export function pas_b400_play_particle(actor: XR_game_object, npc: XR_game_object, p: []){
  getActor().start_particles("zones\\zone_acidic_idle", "bip01_head")
}

export function pas_b400_stop_particle(actor: XR_game_object, npc: XR_game_object, p: []){
  getActor().stop_particles("zones\\zone_acidic_idle", "bip01_head")
}

export function damage_actor_items_on_start(actor: XR_game_object, npc: XR_game_object): void {
  logger.info("Damage actor items on start")

  const actor = getActor()

  const obj = actor.object("helm_respirator")
  if( obj !== null ){
    obj.set_condition(0.8)
  }

  obj = actor.object("stalker_outfit")
  if( obj !== null ){
    obj.set_condition(0.76)
  }

  obj = actor.object("wpn_pm_actor")
  if( obj !== null ){
    obj.set_condition(0.9)
  }

  obj = actor.object("wpn_ak74u")
  if( obj !== null ){
    obj.set_condition(0.7)
  }

}

export function damage_pri_a17_gauss(){
  const obj = getStoryObject("pri_a17_gauss_rifle")
  //--const obj = npc.object("pri_a17_gauss_rifle")
  if( obj !== null ){
    obj.set_condition(0.0)
  }
}

export function pri_a17_hard_animation_reset(actor: XR_game_object, npc: XR_game_object, p: []){
  //--storage.get(npc.id()).state_mgr.set_state("pri_a17_fall_down", null, null, null, {fast_set = true})
  storage.get(npc.id()).state_mgr.set_state("pri_a17_fall_down")

  const stateManager = storage.get(npc.id()).state_mgr
  if( stateManager !== null ){
    stateManager.animation.set_state(null, true)
    stateManager.animation.set_state("pri_a17_fall_down")
    stateManager.animation.set_control()
  }
}

export function jup_b217_hard_animation_reset(actor: XR_game_object, npc: XR_game_object, p: []){
  storage.get(npc.id()).state_mgr.set_state("jup_b217_nitro_straight")

  const stateManager = storage.get(npc.id()).state_mgr
  if( stateManager !== null ){
    stateManager.animation.set_state(null, true)
    stateManager.animation.set_state("jup_b217_nitro_straight")
    stateManager.animation.set_control()
  }
}

export function sleep(actor: XR_game_object, npc: XR_game_object): void {
  logger.info("Sleep")

  const sleep_zones = {
    "zat_a2_sr_sleep",
    "jup_a6_sr_sleep",
    "pri_a16_sr_sleep",
    "actor_surge_hide_2"
  }

  for (const [k, v] of sleep_zones) {
    if( checkers.isNpcInZone(getActor(), db.zone_by_name[v]) ){
      SleepDialogger.sleep()
      giveInfo("sleep_active")
    }
  }

}

export function mech_discount(actor: XR_game_object, npc: XR_game_object, p: []){
  if( (p[1]) ){
    InventoryUpgrades.mech_discount(tonumber(p[1]))
  }
}

export function polter_actor_ignore(actor: XR_game_object, npc: XR_game_object, p: []){
  if( p[1] && p[1] === "true" ) {
    npc.poltergeist_set_actor_ignore(true)
  }else if( p[1] && p[1] === "false" ){
    npc.poltergeist_set_actor_ignore(false)
  }
}

export function burer_force_gravi_attack(actor: XR_game_object, npc: XR_game_object): void {
  npc.burer_set_force_gravi_attack(true)
}

export function burer_force_anti_aim(actor: XR_game_object, npc: XR_game_object): void {
  npc.set_force_anti_aim(true)
}

export function show_freeplay_dialog(actor: XR_game_object, npc: XR_game_object, p: []){
  if( p[1] && p[2] && p[2] === "true" ) {
    FreeplayDialogger.show("message_box_yes_no", p[1])
  }else if( p[1] ){
    FreeplayDialogger.show("message_box_ok", p[1])
  }
}

const detectors = { "detector_simple", "detector_advanced", "detector_elite", "detector_scientific" }

//-- ������ ��� state_mgr
export function get_best_detector(npc){
  for (const [k, v] of detectors) {
    const obj = npc.object(v)
    if( obj !== null ){
      obj.enable_attachable_item(true)
      return
    }
  }
}

export function hide_best_detector(npc){
  for (const [k, v] of detectors) {
    const obj = npc.object(v)
    if( obj !== null ){
      obj.enable_attachable_item(false)
      return
    }
  }
}

*/

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

  const actor: XR_game_object = getActor() as XR_game_object;
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
      play_sound(actor, zoneByName.get(zones.zat_b33_tutor), [script_sounds.pda_news]);
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
  actor_position_for_restore = getActor()!.position();
}

export function restore_actor_position(): void {
  getActor()!.set_actor_position(actor_position_for_restore!);
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
  const actor: XR_game_object = getActor() as XR_game_object;
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

  create_squad(getActor(), null, [squad_tbl.get(index), "pri_a28_heli"]);
}

export function eat_vodka_script() {
  const actor: XR_game_object = getActor() as XR_game_object;

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
