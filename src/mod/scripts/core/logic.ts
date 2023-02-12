import {
  callback,
  clsid,
  game,
  game_object,
  ini_file,
  level,
  time_global,
  XR_game_object,
  XR_ini_file,
  XR_net_packet,
  XR_reader,
} from "xray16";

import { AnyArgs, AnyCallable, AnyObject, Maybe, Optional, StringOptional } from "@/mod/lib/types";
import { TScheme, TSection } from "@/mod/lib/types/configuration";
import { getActor, IStoredObject, offlineObjects, storage, zoneByName } from "@/mod/scripts/core/db";
import { pstor_load_all, pstor_save_all } from "@/mod/scripts/core/db/pstor";
import { Hear } from "@/mod/scripts/core/Hear";
import { AbuseManager } from "@/mod/scripts/core/logic/AbuseManager";
import { ActionCorpseDetect } from "@/mod/scripts/core/logic/ActionCorpseDetect";
import { ActionDanger } from "@/mod/scripts/core/logic/ActionDanger";
import { ActionDeath } from "@/mod/scripts/core/logic/ActionDeath";
import { ActionGatherItems } from "@/mod/scripts/core/logic/ActionGatherItems";
import { ActionOnHit } from "@/mod/scripts/core/logic/ActionOnHit";
import { ActionProcessHit } from "@/mod/scripts/core/logic/ActionProcessHit";
import { ActionSchemeCombat } from "@/mod/scripts/core/logic/ActionSchemeCombat";
import { ActionSchemeCombatIgnore } from "@/mod/scripts/core/logic/ActionSchemeCombatIgnore";
import { ActionSchemeHelpWounded } from "@/mod/scripts/core/logic/ActionSchemeHelpWounded";
import { ActionSchemeMeet } from "@/mod/scripts/core/logic/ActionSchemeMeet";
import { ActionSchemeReachTask } from "@/mod/scripts/core/logic/ActionSchemeReachTask";
import { ActionWoundManager } from "@/mod/scripts/core/logic/ActionWoundManager";
import { ActionMobCombat } from "@/mod/scripts/core/logic/mob/ActionMobCombat";
import { ActionMobDeath } from "@/mod/scripts/core/logic/mob/ActionMobDeath";
import { RestrictorManager } from "@/mod/scripts/core/RestrictorManager";
import { ESchemeType, schemes, stype_heli, stype_item, stype_mobile, stype_stalker } from "@/mod/scripts/core/schemes";
import { trade_init } from "@/mod/scripts/core/TradeManager";
import { mapDisplayManager } from "@/mod/scripts/ui/game/MapDisplayManager";
import {
  can_select_weapon,
  disable_invulnerability,
  reset_group,
  reset_invulnerability,
  reset_threshold,
  see_actor,
  send_to_nearest_accessible_vertex,
  set_npc_info,
  spawnDefaultNpcItems,
  take_items_enabled,
} from "@/mod/scripts/utils/alife";
import { isNpcInZone } from "@/mod/scripts/utils/checkers";
import {
  cfg_get_overrides,
  get_scheme_by_section,
  getConfigCondList,
  getConfigNumber,
  getConfigString,
  pickSectionFromCondList,
} from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { get_npc_smart, loadLtx } from "@/mod/scripts/utils/gulag";
import { getClsId } from "@/mod/scripts/utils/ids";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { getDistanceBetween } from "@/mod/scripts/utils/physics";
import { readCTimeFromPacket, writeCTimeToPacket } from "@/mod/scripts/utils/time";

const logger: LuaLogger = new LuaLogger("logic");

/**
 * todo;
 * todo;
 * todo;
 * todo;
 */
export function configure_schemes(
  npc: XR_game_object,
  ini: XR_ini_file,
  ini_filename: string,
  stype: ESchemeType,
  section_logic: TSection,
  gulag_name: string
): XR_ini_file {
  const npc_id = npc.id();
  const st = storage.get(npc_id);

  // -- ���� �����-�� ����� ���� �� ����� �������, �������������� �
  if (st.active_section) {
    issue_event(npc, st[st.active_scheme!], "deactivate", npc);
  }

  let actual_ini: XR_ini_file;
  let actual_ini_filename: string;

  if (!ini.section_exist(section_logic)) {
    if (gulag_name === "") {
      // -- ����� ����� ������ �������� � ��� logic:
      actual_ini_filename = ini_filename;
      actual_ini = ini; // -- �������� �� ����������� ������ ����� ������ logic
    } else {
      // -- ����� ��� �������� Gulag-� � ��� �� ������ ������:
      abort(
        "ERROR: object '%s': unable to find section '%s' in '%s'",
        npc.name(),
        section_logic,
        tostring(ini_filename)
      );
    }
  } else {
    const filename: Optional<string> = getConfigString(ini, section_logic, "cfg", npc, false, "");

    if (filename !== null) {
      actual_ini_filename = filename;
      actual_ini = new ini_file(filename);
      if (!actual_ini.section_exist(section_logic)) {
        abort("object '%s' configuration file [%s] !FOUND || section [logic] isn't assigned ", npc.name(), filename);
      }
      // --printf("_bp: enable_scripts: object '%s' has external configuration file '%s'", npc.name(), filename)
      // -- ���������� ���������� ���������������� ����, �� ������� ��������� ���� cfg

      return configure_schemes(npc, actual_ini, actual_ini_filename, stype, section_logic, gulag_name);
      /* --[[
      if (actual_ini.line_count(section_logic) === 0 ){
        abort("file '%s' does !exist || is empty, || has no section '%s'",
          filename, section_logic)
      }
    ]] --*/
    } else {
      if (stype === stype_stalker || stype === stype_mobile) {
        const current_smart = get_npc_smart(npc);

        if (current_smart !== null) {
          const t: any = current_smart.getJob(npc_id);

          if (t) {
            st.job_ini = t.ini_path;
          } else {
            st.job_ini = null;
          }
        }
      }

      actual_ini_filename = ini_filename;
      actual_ini = ini;
    }
  }

  // -- ��������� � ������ ��������� ����� ����� �������� ����� ������������� ����� �����, ����� �� ��� ���������:
  disable_generic_schemes(npc, stype);
  // -- �������� ��� ����� ����� (��������, ������� �� ��������� � �.�.):
  enable_generic_schemes(actual_ini, npc, stype, section_logic);

  st.active_section = null;
  st.active_scheme = null;
  st.gulag_name = gulag_name;

  st.stype = stype;
  st.ini = actual_ini;
  st.ini_filename = actual_ini_filename;
  st.section_logic = section_logic;
  // -- ������������� ��������
  if (stype === stype_stalker) {
    const trade_ini = getConfigString(
      actual_ini,
      section_logic,
      "trade",
      npc,
      false,
      "",
      "misc\\trade\\trade_generic.ltx"
    );

    trade_init(npc, trade_ini);
    spawnDefaultNpcItems(npc, st);
  }

  return st.ini;
}

/**
 * todo;
 * todo;
 * todo;
 * todo;
 */
export function determine_section_to_activate(
  npc: XR_game_object,
  ini: XR_ini_file,
  section_logic: TSection,
  actor: XR_game_object
): TSection {
  if (!ini.section_exist(section_logic)) {
    return "nil";
  }

  if (offlineObjects.get(npc.id()) && offlineObjects.get(npc.id()).active_section !== null) {
    const sect_to_retr = offlineObjects.get(npc.id()).active_section;

    offlineObjects.get(npc.id()).active_section = null;
    if (ini.section_exist(sect_to_retr)) {
      return sect_to_retr;
    }
  }

  const active_section_cond = getConfigCondList(ini, section_logic, "active", npc);

  if (active_section_cond) {
    const section = pickSectionFromCondList(actor, npc, active_section_cond.condlist);

    if (!section) {
      abort(
        "object '%s': section '%s': section 'active' has no conditionless }else{ clause",
        npc.name(),
        section_logic
      );
    }

    return section;
  } else {
    return "nil";
  }
}

/**
 * todo;
 * todo;
 * todo;
 */
function disable_generic_schemes(npc: XR_game_object, stype: ESchemeType): void {
  // todo: Switch-case
  if (stype === stype_stalker) {
    ActionSchemeCombat.disable_scheme(npc, "combat");
    ActionProcessHit.disable_scheme(npc, ActionProcessHit.SCHEME_SECTION);
    ActionSchemeMeet.disable_scheme(npc, "actor_dialogs");
    ActionSchemeCombatIgnore.disable_scheme(npc, "combat_ignore");
    disable_invulnerability(npc);
  } else if (stype === stype_mobile) {
    ActionMobCombat.disable_scheme(npc, "mob_combat");
    ActionSchemeCombatIgnore.disable_scheme(npc, "combat_ignore");
    disable_invulnerability(npc);
  } else if (stype === stype_item) {
    ActionOnHit.disable_scheme(npc, ActionOnHit.SCHEME_SECTION);
  } else if (stype === stype_heli) {
    ActionProcessHit.disable_scheme(npc, ActionProcessHit.SCHEME_SECTION);
  }
}

/**
 * todo
 * todo
 * todo
 * todo
 */
function enable_generic_schemes(ini: XR_ini_file, npc: XR_game_object, stype: ESchemeType, section: TSection): void {
  if (stype === stype_stalker) {
    // --xr_reactions.set_reactions(npc, ini, "reactions", section)
    ActionDanger.set_danger(npc, ini, ActionDanger.SCHEME_SECTION, "danger");
    ActionGatherItems.set_gather_items(npc, ini, ActionGatherItems.SCHEME_SECTION, "gather_items");

    const combat_section = getConfigString(ini, section, "on_combat", npc, false, "");

    ActionSchemeCombat.set_combat_checker(npc, ini, "combat", combat_section);

    reset_invulnerability(npc, ini, section);

    const info_section: Optional<string> = getConfigString(ini, section, "info", npc, false, "");

    if (info_section !== null) {
      set_npc_info(npc, ini, "info", info_section);
    }

    const hit_section: Optional<string> = getConfigString(ini, section, "on_hit", npc, false, "");

    if (hit_section !== null) {
      ActionProcessHit.set_hit_checker(npc, ini, ActionProcessHit.SCHEME_SECTION, hit_section);
    }

    /*
     * Originally unused.
     *
    const actor_dialogs_section = getConfigString(ini, section, "actor_dialogs", npc, false, "");

    if (actor_dialogs_section) {
      ActionSchemeMeet.set_actor_dialogs(npc, ini, "actor_dialogs", actor_dialogs_section);
    }
   */

    const wounded_section = getConfigString(ini, section, "wounded", npc, false, "");

    ActionWoundManager.set_wounded(npc, ini, "wounded", wounded_section);
    AbuseManager.set_abuse(npc, ini, "abuse", section);
    ActionSchemeHelpWounded.set_help_wounded(npc, ini, "help_wounded", null);
    ActionCorpseDetect.set_corpse_detection(npc, ini, "corpse_detection", null);

    const meet_section = getConfigString(ini, section, "meet", npc, false, "");

    ActionSchemeMeet.set_meet(npc, ini, "meet", meet_section);

    const death_section = getConfigString(ini, section, "on_death", npc, false, "");

    ActionDeath.set_death(npc, ini, "death", death_section);
    ActionSchemeCombatIgnore.set_combat_ignore_checker(npc, ini, "combat_ignore");
    ActionSchemeReachTask.set_reach_task(npc, ini, "reach_task");
  } else if (stype === stype_mobile) {
    const combat_section: Optional<string> = getConfigString(ini, section, "on_combat", npc, false, "");

    if (combat_section !== null) {
      ActionMobCombat.set_scheme(npc, ini, "mob_combat", combat_section);
    }

    const death_section: Optional<string> = getConfigString(ini, section, "on_death", npc, false, "");

    if (death_section !== null) {
      ActionMobDeath.set_scheme(npc, ini, "mob_death", death_section);
    }

    reset_invulnerability(npc, ini, section);

    const hit_section: Optional<string> = getConfigString(ini, section, "on_hit", npc, false, "");

    if (hit_section !== null) {
      ActionProcessHit.set_hit_checker(npc, ini, ActionProcessHit.SCHEME_SECTION, hit_section);
    }

    ActionSchemeCombatIgnore.set_combat_ignore_checker(npc, ini, "combat_ignore");
  } else if (stype === stype_item) {
    const hit_section: Optional<string> = getConfigString(ini, section, "on_hit", npc, false, "");

    if (hit_section !== null) {
      ActionOnHit.set_scheme(npc, ini, ActionOnHit.SCHEME_SECTION, hit_section);
    }
  } else if (stype === stype_heli) {
    const hit_section: Optional<string> = getConfigString(ini, section, "on_hit", npc, false, "");

    if (hit_section !== null) {
      ActionProcessHit.set_hit_checker(npc, ini, ActionProcessHit.SCHEME_SECTION, hit_section);
    }
  }
}

/**
 * todo
 * todo
 * todo
 * todo
 */
export function activate_by_section(
  npc: XR_game_object,
  ini: XR_ini_file,
  section: TSection,
  gulag_name: string,
  loading: boolean
): void {
  logger.info("Activate by section:", npc.name(), section, gulag_name);

  if (loading === null) {
    abort("core/logic: activate_by_section: loading field is null, true || false expected");
  }

  const npc_id = npc.id();

  if (!loading) {
    storage.get(npc_id).activation_time = time_global();
    // -- GAMETIME added by Stohe.
    storage.get(npc_id).activation_game_time = game.get_game_time();
  }

  if (section === "nil") {
    storage.get(npc_id).overrides = null;
    reset_generic_schemes_on_scheme_switch(npc, "nil", "nil");
    storage.get(npc_id).active_section = null;
    storage.get(npc_id).active_scheme = null;

    return;
  }

  if (section === null) {
    const current_gulag = get_npc_smart(npc);

    if (current_gulag === null) {
      abort("core/logic: activate_by_section: section is NIL && NPC !in gulag.");
    }

    const t = current_gulag.getJob(npc_id) as AnyObject;

    section = t.section;
  }

  if (!ini.section_exist(section)) {
    abort("object '%s': activate_by_section: section '%s' does !exist", npc.name(), section);
  }

  const scheme: Optional<TScheme> = get_scheme_by_section(section);

  if (scheme === null) {
    abort("object '%s': unable to determine scheme name from section name '%s'", npc.name(), section);
  }

  storage.get(npc_id).overrides = cfg_get_overrides(ini, section, npc) as any;

  reset_generic_schemes_on_scheme_switch(npc, scheme, section);

  const filenameOrHandler = schemes.get(scheme);

  if (filenameOrHandler === null) {
    abort("core/logic: scheme '%s' is !registered in modules.script", scheme);
  }

  logger.info("Set active scheme:", npc.name(), scheme, section, gulag_name);
  filenameOrHandler.set_scheme(npc, ini, scheme, section, gulag_name);

  storage.get(npc_id).active_section = section;
  storage.get(npc_id).active_scheme = scheme;

  if (storage.get(npc_id).stype === stype_stalker) {
    // -- ����� �������� ����������� �������� �� ���� ��� ��������� ������������
    send_to_nearest_accessible_vertex(npc, npc.level_vertex_id());

    issue_event(npc, storage.get(npc_id)[scheme], "activate_scheme", loading, npc);
  } else {
    issue_event(npc, storage.get(npc_id)[scheme], "reset_scheme", loading, npc);
  }
}

/**
 * todo;
 * todo;
 * todo;
 * todo;
 */
function reset_generic_schemes_on_scheme_switch(npc: XR_game_object, scheme: TScheme, section: TSection): void {
  const st: IStoredObject = storage.get(npc.id());

  st.exit_from_smartcover_initialized = null;

  if (!st.stype) {
    return;
  }

  if (st.stype === stype_stalker) {
    // --xr_reactions.reset_reactions(npc, scheme, st, section)
    ActionSchemeMeet.reset_meet(npc, scheme, st, section);
    ActionSchemeHelpWounded.reset_help_wounded(npc, scheme, st, section);
    ActionCorpseDetect.reset_corpse_detection(npc, scheme, st, section);
    AbuseManager.reset_abuse(npc, scheme, st, section);
    ActionWoundManager.reset_wounded(npc, scheme, st, section);
    ActionDeath.reset_death(npc, scheme, st, section);
    ActionDanger.reset_danger(npc, scheme, st, section);
    ActionGatherItems.reset_gather_items(npc, scheme, st, section);
    ActionSchemeCombatIgnore.reset_combat_ignore_checker(npc, scheme, st, section);

    mapDisplayManager.updateNpcSpot(npc, scheme, st, section);
    reset_threshold(npc, scheme, st, section);
    // --        utilsAlife.set_level_spot(npc, scheme, st, section)
    reset_invulnerability(npc, st.ini!, section);
    reset_group(npc, st.ini!, section);
    take_items_enabled(npc, scheme, st, section);
    can_select_weapon(npc, scheme, st, section);
    RestrictorManager.forNpc(npc).reset_restrictions(st, section);
    Hear.reset_hear_callback(st, section);
  } else if (st.stype === stype_mobile) {
    // --printf("_bp: disabling talk")
    // --npc.disable_talk() // -- ������ �������� � dialog_manager_reset
    mob_release(npc);
    if (getClsId(npc) === clsid.bloodsucker_s) {
      if (scheme === "nil") {
        npc.set_manual_invisibility(false);
      } else {
        npc.set_manual_invisibility(true);
        // -- ������� ��� ��� ���������� �����, ������� ������� ��� ��� ��������:
        // --npc.set_invisible(false)
      }
    }

    ActionSchemeCombatIgnore.reset_combat_ignore_checker(npc, scheme, st, section);
    reset_invulnerability(npc, st.ini!, section);
    RestrictorManager.forNpc(npc).reset_restrictions(st, section);
    Hear.reset_hear_callback(st, section);
  } else if (st.stype === stype_item) {
    npc.set_callback(callback.use_object, null);
    npc.set_nonscript_usable(true);
    if (getClsId(npc) === clsid.car) {
      // -- ������ ������� ��� ������ �� �������, ������� ��� ��� �� ���� ����������
      (npc as any).destroy_car();
      mob_release(npc);
    }
  }
}

/**
 * todo
 * todo
 * todo
 * todo
 */
export function assign_storage_and_bind(
  npc: XR_game_object,
  ini: XR_ini_file,
  scheme: TScheme,
  section: Optional<TSection>
): AnyObject {
  logger.info("Assign storage and bind:", npc.name(), "->", scheme, "->", section);

  const npc_id = npc.id();
  let st: AnyObject;

  if (!storage.get(npc_id)[scheme]) {
    storage.get(npc_id)[scheme] = {};
    st = storage.get(npc_id)[scheme];
    st["npc"] = npc;

    schemes.get(scheme).add_to_binder(npc, ini, scheme, section as TSection, st);
  } else {
    st = storage.get(npc_id)[scheme];
  }

  st["scheme"] = scheme;
  st["section"] = section;
  st["ini"] = ini;

  return st;
}

/**
 * todo
 * todo
 * todo
 * todo
 */
export function subscribe_action_for_events(npc: XR_game_object, storage: IStoredObject, new_action: object): void {
  if (!storage.actions) {
    storage.actions = new LuaTable();
  }

  storage.actions.set(new_action as any, true);
}

/**
 * todo
 * todo
 * todo
 * todo
 */
export function unsubscribe_action_from_events(npc: XR_game_object, storage: IStoredObject, new_action: any): void {
  if (storage.actions) {
    storage.actions.delete(new_action);
  } else {
    storage.actions = new LuaTable();
  }
}

/**
 * todo
 * todo
 * todo
 * todo
 */
export function issue_event(npc: XR_game_object, state: AnyObject, event_fn: string, ...rest: AnyArgs): void {
  if (!state || !state.actions) {
    return;
  }

  let activation_count: number = 0;

  for (const [action_ptr, is_active] of state.actions) {
    if (is_active && action_ptr.get(event_fn)) {
      action_ptr.get(event_fn)(action_ptr, ...rest);
      activation_count = activation_count + 1;
    }
  }
}

/**
 * todo
 * todo
 * todo
 * todo
 */
export function check_action(npc: XR_game_object, st: IStoredObject, event_fn: string, p: unknown) {
  if (!st || !st.actions) {
    return true;
  }

  for (const [action_ptr, is_active] of st.actions) {
    if (is_active && action_ptr.get(event_fn)) {
      return action_ptr.get(event_fn)(action_ptr, p);
    }
  }

  return true;
}

/**
 * todo
 * todo
 * todo
 * todo
 */
function cond_name(cond: string, etalon: string): boolean {
  return string.find(cond, "^" + etalon + "%d*$") !== null;
}

/**
 * todo
 * todo
 * todo
 * todo
 */
export function switch_to_section(npc: XR_game_object, ini: XR_ini_file, section: TSection): boolean {
  if (section === "" || section === null) {
    return false;
  }

  const npc_id = npc.id();
  const active_section = storage.get(npc_id).active_section;

  if (active_section === section) {
    return false;
  }

  if (active_section) {
    issue_event(npc, storage.get(npc_id)[storage.get(npc_id).active_scheme!], "deactivate", npc);
  }

  storage.get(npc_id).exit_from_smartcover_initialized = null;
  storage.get(npc_id).active_section = null;
  storage.get(npc_id).active_scheme = null;

  if (section === null) {
    return true;
  }

  activate_by_section(npc, ini, section, storage.get(npc_id).gulag_name, false);

  return true;
}

/**
 * todo;
 * todo;
 * todo;
 */
export function generic_scheme_overrides(npc: XR_game_object): Optional<LuaTable<string>> {
  return storage.get(npc.id()).overrides as unknown as LuaTable<string>;
}

/**
 * todo;
 * todo;
 * todo;
 */
export function mob_release(mob: XR_game_object) {
  if (mob.get_script()) {
    mob.script(false, get_global<AnyCallable>("script_name")());
  }
}

/**
 * todo;
 * todo;
 * todo;
 */
export function mob_capture(mob: XR_game_object, reset_actions: Maybe<boolean>): void {
  if (reset_actions === null) {
    abort("mob_capture: reset_actions parameter's value is !specified");
  }

  if (reset_actions !== null) {
    reset_action(mob, get_global<AnyCallable>("script_name")());
  } else {
    if (!mob.get_script()) {
      mob.script(true, get_global<AnyCallable>("script_name")());
    }
  }
}

/**
 * todo;
 * todo;
 * todo;
 */
function reset_action(npc: XR_game_object, script_name: string) {
  if (npc.get_script()) {
    npc.script(false, script_name);
  }

  npc.script(true, script_name);
}

/**
 * todo;
 * todo;
 * todo;
 */
export function mob_captured(object: XR_game_object): boolean {
  return object.get_script() !== null;
}

/**
 * todo;
 * todo;
 * todo;
 */
function save_logic(obj: XR_game_object, packet: XR_net_packet): void {
  const npc_id = obj.id();
  const cur_tm = time_global();

  let activation_time: number = storage.get(npc_id).activation_time;

  if (!activation_time) {
    activation_time = 0;
  }

  packet.w_s32(activation_time - cur_tm);

  // -- GAMETIME added by Stohe.
  writeCTimeToPacket(packet, storage.get(npc_id).activation_game_time);
}

/**
 * todo;
 * todo;
 * todo;
 */
function load_logic(obj: XR_game_object, reader: XR_reader): void {
  const npc_id = obj.id();
  const cur_tm = time_global();

  storage.get(npc_id).activation_time = reader.r_s32() + cur_tm;
  storage.get(npc_id).activation_game_time = readCTimeFromPacket(reader);
}

/**
 * todo;
 * todo;
 * todo;
 */
export function save_obj(obj: XR_game_object, packet: XR_net_packet): void {
  setSaveMarker(packet, false, "object" + obj.name());

  const npc_id = obj.id();
  const st = storage.get(npc_id);

  if (st.job_ini) {
    packet.w_stringZ(st.job_ini);
  } else {
    packet.w_stringZ("");
  }

  if (st.ini_filename) {
    packet.w_stringZ(st.ini_filename);
  } else {
    packet.w_stringZ("");
  }

  if (st.section_logic) {
    packet.w_stringZ(st.section_logic);
  } else {
    packet.w_stringZ("");
  }

  if (st.active_section) {
    packet.w_stringZ(st.active_section);
  } else {
    packet.w_stringZ("");
  }

  if (st.gulag_name) {
    packet.w_stringZ(st.gulag_name);
  } else {
    packet.w_stringZ("");
  }

  // --packet.w_s32(st.stype)

  save_logic(obj, packet);

  if (st.active_scheme) {
    issue_event(obj, storage.get(npc_id)[st.active_scheme], "save");
  }

  pstor_save_all(obj, packet);
  setSaveMarker(packet, true, "object" + obj.name());
}

/**
 * todo;
 * todo;
 * todo;
 */
export function load_obj(obj: XR_game_object, reader: XR_reader): void {
  setLoadMarker(reader, false, "object" + obj.name());

  const npc_id: number = obj.id();
  const st: IStoredObject = storage.get(npc_id);
  let job_ini: Optional<string> = reader.r_stringZ();

  if (job_ini === "") {
    job_ini = null;
  }

  let ini_filename: Optional<string> = reader.r_stringZ();

  if (ini_filename === "") {
    ini_filename = null;
  }

  let section_logic: Optional<string> = reader.r_stringZ();

  if (section_logic === "") {
    section_logic = null;
  }

  let active_section: StringOptional<string> = reader.r_stringZ();

  if (active_section === "") {
    active_section = "nil";
  }

  const gulag_name: string = reader.r_stringZ();

  // --const stype = reader.r_s32()
  st.job_ini = job_ini;
  st.loaded_ini_filename = ini_filename;
  st.loaded_section_logic = section_logic;
  st.loaded_active_section = active_section;
  // --st.loaded_active_scheme = active_scheme
  st.loaded_gulag_name = gulag_name;
  // --st.loaded_stype = stype

  load_logic(obj, reader);

  pstor_load_all(obj, reader);
  setLoadMarker(reader, true, "object" + obj.name());
}

function get_customdata_or_ini_file(npc: XR_game_object, filename: string): XR_ini_file {
  // --printf( "get_customdata_or_ini_file: filename=%s", filename )
  const st = storage.get(npc.id());

  if (filename === "<customdata>") {
    const ini: Optional<XR_ini_file> = npc.spawn_ini();

    return ini !== null ? ini : new ini_file();
  } else if ((string.find(filename, "*") as unknown as number) === 1) {
    if (st.job_ini !== null) {
      return new ini_file(st.job_ini);
    }

    return loadLtx(string.sub(filename, 2)) as unknown as XR_ini_file;
  } else {
    return new ini_file(filename);
  }
}

/**
 * todo;
 * todo;
 * todo;
 */
export function initialize_obj(
  obj: XR_game_object,
  st: IStoredObject,
  loaded: boolean,
  actor: XR_game_object,
  stype: ESchemeType
): void {
  if (!loaded) {
    const ini_filename: string = "<customdata>";
    let ini: XR_ini_file = get_customdata_or_ini_file(obj, ini_filename);

    ini = configure_schemes(obj, ini, ini_filename, stype, "logic", "");

    const sect = determine_section_to_activate(obj, ini, "logic", actor);

    activate_by_section(obj, ini, sect, st.gulag_name, false);

    const relation = getConfigString(ini, "logic", "relation", obj, false, "");

    if (relation !== null) {
      // todo: NO index of global?
      obj.set_relation((game_object as any)[relation], getActor()!);
    }

    const sympathy = getConfigNumber(ini, "logic", "sympathy", obj, false);

    if (sympathy !== null) {
      obj.set_sympathy(sympathy);
    }
  } else {
    const ini_filename = st.loaded_ini_filename;

    if (ini_filename) {
      let ini: XR_ini_file = get_customdata_or_ini_file(obj, ini_filename);

      ini = configure_schemes(obj, ini, ini_filename, stype, st.loaded_section_logic, st.loaded_gulag_name);
      activate_by_section(obj, ini, st.loaded_active_section, st.loaded_gulag_name, true);
    }
  }
}

/**
 * todo;
 * todo;
 * todo;
 */
export function try_switch_to_another_section(
  npc: XR_game_object,
  st: IStoredObject,
  actor: Optional<XR_game_object>
): boolean {
  const l = st.logic;
  const npc_id = npc.id();

  if (!actor) {
    abort("try_switch_to_another_section(): error in implementation of scheme '%s': actor is null", st.scheme);
  }

  if (!l) {
    abort("Can't find script switching information in storage, scheme '%s'", storage.get(npc.id()).active_scheme);
  }

  let switched: boolean = false;

  for (const [n, c] of l) {
    if (cond_name(c.name, "on_actor_dist_le")) {
      if (see_actor(npc) && getDistanceBetween(actor, npc) <= c.v1) {
        switched = switch_to_section(npc, st.ini!, pickSectionFromCondList(actor, npc, c.condlist)!);
      }
    } else if (cond_name(c.name, "on_actor_dist_le_nvis")) {
      if (getDistanceBetween(actor, npc) <= c.v1) {
        switched = switch_to_section(npc, st.ini!, pickSectionFromCondList(actor, npc, c.condlist)!);
      }
    } else if (cond_name(c.name, "on_actor_dist_ge")) {
      if (see_actor(npc) && getDistanceBetween(actor, npc) > c.v1) {
        switched = switch_to_section(npc, st.ini!, pickSectionFromCondList(actor, npc, c.condlist)!);
      }
    } else if (cond_name(c.name, "on_actor_dist_ge_nvis")) {
      if (getDistanceBetween(actor, npc) > c.v1) {
        switched = switch_to_section(npc, st.ini!, pickSectionFromCondList(actor, npc, c.condlist)!);
      }
    } else if (cond_name(c.name, "on_signal")) {
      if (st.signals && st.signals[c.v1]) {
        switched = switch_to_section(npc, st.ini!, pickSectionFromCondList(actor, npc, c.condlist)!);
      }
      // -- FIXME: �� ����������� ��� �����, �������� ���� on_info, �� ��������� ��������� ��� ����������� � ������
    } else if (cond_name(c.name, "on_info")) {
      switched = switch_to_section(npc, st.ini!, pickSectionFromCondList(actor, npc, c.condlist)!);
    } else if (cond_name(c.name, "on_timer")) {
      if (time_global() >= storage.get(npc_id).activation_time + c.v1) {
        switched = switch_to_section(npc, st.ini!, pickSectionFromCondList(actor, npc, c.condlist)!);
      }
    } else if (cond_name(c.name, "on_game_timer")) {
      if (game.get_game_time().diffSec(storage.get(npc_id).activation_game_time) >= c.v1) {
        switched = switch_to_section(npc, st.ini!, pickSectionFromCondList(actor, npc, c.condlist)!);
      }
    } else if (cond_name(c.name, "on_actor_in_zone")) {
      if (isNpcInZone(actor, zoneByName.get(c.v1))) {
        switched = switch_to_section(npc, st.ini!, pickSectionFromCondList(actor, npc, c.condlist)!);
      }
    } else if (cond_name(c.name, "on_actor_not_in_zone")) {
      if (!isNpcInZone(actor, zoneByName.get(c.v1))) {
        switched = switch_to_section(npc, st.ini!, pickSectionFromCondList(actor, npc, c.condlist)!);
      }
    } else if (cond_name(c.name, "on_npc_in_zone")) {
      if (isNpcInZone(level.object_by_id(c.npc_id), zoneByName.get(c.v2))) {
        switched = switch_to_section(npc, st.ini!, pickSectionFromCondList(actor, npc, c.condlist)!);
      }
    } else if (cond_name(c.name, "on_npc_not_in_zone")) {
      if (!isNpcInZone(level.object_by_id(c.npc_id), zoneByName.get(c.v2))) {
        switched = switch_to_section(npc, st.ini!, pickSectionFromCondList(actor, npc, c.condlist)!);
      }
    } else if (cond_name(c.name, "on_actor_inside")) {
      if (isNpcInZone(actor, npc)) {
        // --                printf("_bp: TRUE")
        switched = switch_to_section(npc, st.ini!, pickSectionFromCondList(actor, npc, c.condlist)!);
      }
    } else if (cond_name(c.name, "on_actor_outside")) {
      if (!isNpcInZone(actor, npc)) {
        switched = switch_to_section(npc, st.ini!, pickSectionFromCondList(actor, npc, c.condlist)!);
      }
    } else {
      abort(
        "WARNING: object '%s': try_switch_to_another_section: unknown condition '%s' encountered",
        npc.name(),
        c.name
      );
    }

    if (switched === true) {
      break;
    }
  }

  return switched;
}
