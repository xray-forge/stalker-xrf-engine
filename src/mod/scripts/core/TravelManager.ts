import {
  XR_CPhrase,
  XR_CPhraseDialog,
  XR_CPhraseScript,
  XR_cse_alife_human_abstract,
  XR_cse_alife_object,
  XR_game_object,
  XR_ini_file,
  XR_patrol,
  alife,
  clsid,
  game,
  ini_file,
  level,
  patrol,
  relation_registry,
  time_global
} from "xray16";

import { post_processors } from "@/mod/globals/animation/post_processors";
import { communities } from "@/mod/globals/communities";
import { AnyCallable, AnyCallablesModule, Optional } from "@/mod/lib/types";
import { set_travel_func } from "@/mod/scripts/core/binders/ActorBinder";
import { getActor } from "@/mod/scripts/core/db";
import { ERelation } from "@/mod/scripts/core/game_relations";
import { relocate_money } from "@/mod/scripts/core/NewsManager";
import { SurgeManager } from "@/mod/scripts/core/SurgeManager";
import { get_sim_board, ISimBoard } from "@/mod/scripts/se/SimBoard";
import { ISimSquad } from "@/mod/scripts/se/SimSquad";
import { ISmartTerrain } from "@/mod/scripts/se/SmartTerrain";
import { getAlifeCharacterCommunity, getAlifeDistanceBetween, getObjectSquad } from "@/mod/scripts/utils/alife";
import { abort } from "@/mod/scripts/utils/debug";
import { getObjectStoryId } from "@/mod/scripts/utils/ids";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("TravelManager");

let init_time: Optional<number> = null;
let traveler_actor_path: Optional<string> = null;
let traveler_squad_path: Optional<string> = null;
let traveler_squad: Optional<ISimSquad> = null;
let traveler_distance: Optional<number> = null;
let teleport_flag: Optional<boolean> = null;
let traveler_smart_id: Optional<number> = null;

export interface ITravelRouteDescriptor {
  phrase_id: string;
  name: string;
  level: string;
  condlist: LuaTable;
}

export class TravelManager {
  public static instance: Optional<TravelManager> = null;

  public static getInstance(): TravelManager {
    if (!this.instance) {
      this.instance = new this();
    }

    return this.instance;
  }

  public smart_to_stringtables: LuaTable<string, string> = new LuaTable();
  public smart_travels: LuaTable<string, ITravelRouteDescriptor> = new LuaTable();
  public smart_by_phrase: LuaTable<string, string> = new LuaTable();

  public constructor() {
    log.info("Initialize new travel manager");

    const ini: XR_ini_file = new ini_file("misc\\travel_manager.ltx");

    for (const i of $range(0, ini.line_count("locations") - 1)) {
      const [temp1, id, value] = ini.r_line("locations", i, "", "");

      this.smart_to_stringtables.set(id, value);
    }

    for (const i of $range(0, ini.line_count("traveler") - 1)) {
      const [temp1, id, value] = ini.r_line("traveler", i, "", "");

      const descriptor: ITravelRouteDescriptor = {
        name: ini.r_string(id, "name"),
        level: ini.r_string(id, "level"),
        condlist: get_global<AnyCallable>("xr_logic.parse_condlist")(
          getActor(),
          id,
          "close_distance",
          ini.r_string(id, "condlist")
        ),
        phrase_id: tostring(1000 + i)
      };

      this.smart_travels.set(id, descriptor);
      this.smart_by_phrase.set(descriptor.phrase_id, id);
    }
  }

  public init_traveler_dialog(dialog: XR_CPhraseDialog): void {
    const npc_community = "stalker"; // -- npc:character_community()

    let actor_phrase: XR_CPhrase = dialog.AddPhrase("dm_traveler_what_are_you_doing", "0", "", -10000);
    let actor_script: XR_CPhraseScript = actor_phrase.GetPhraseScript();

    let npc_phrase = dialog.AddPhrase("if you see this - this is bad", "1", "0", -10000);
    let npc_phrase_script = npc_phrase.GetPhraseScript();

    npc_phrase_script.SetScriptText("travel_manager.squad_action_description");

    actor_phrase = dialog.AddPhrase("dm_traveler_can_i_go_with_you", "11", "1", -10000);
    actor_script = actor_phrase.GetPhraseScript();
    actor_script.AddPrecondition("travel_manager.squad_on_move");

    npc_phrase = dialog.AddPhrase("dm_traveler_" + npc_community + "_actor_companion_yes", "111", "11", -10000);
    npc_phrase_script = npc_phrase.GetPhraseScript();
    npc_phrase_script.AddPrecondition("travel_manager.squad_can_take_actor");

    actor_phrase = dialog.AddPhrase("dm_traveler_actor_go_with_squad", "1111", "111", -10000);
    actor_script = actor_phrase.GetPhraseScript();
    actor_script.AddAction("travel_manager.actor_go_with_squad");

    actor_phrase = dialog.AddPhrase("dm_traveler_actor_dont_go_with_squad", "1112", "111", -10000);

    npc_phrase = dialog.AddPhrase("dm_traveler_" + npc_community + "_actor_companion_no", "112", "11", -10000);
    npc_phrase_script = npc_phrase.GetPhraseScript();
    npc_phrase_script.AddPrecondition("travel_manager.squad_cannot_take_actor");

    actor_phrase = dialog.AddPhrase("dm_traveler_take_me_to", "12", "1", -10000);

    npc_phrase = dialog.AddPhrase("dm_traveler_" + npc_community + "_where_do_you_want", "121", "12", -10000);
    npc_phrase_script = npc_phrase.GetPhraseScript();
    npc_phrase_script.AddPrecondition("travel_manager.squad_can_travel");

    for (const [k, v] of this.smart_travels) {
      actor_phrase = dialog.AddPhrase(game.translate_string(v.name) + ".", v.phrase_id, "121", -10000);
      actor_script = actor_phrase.GetPhraseScript();
      actor_script.AddPrecondition("travel_manager.travel_condlist");

      npc_phrase = dialog.AddPhrase("if you see this - this is bad", v.phrase_id + "_1", v.phrase_id, -10000);
      npc_phrase_script = npc_phrase.GetPhraseScript();
      npc_phrase_script.SetScriptText("travel_manager.get_travel_cost");

      actor_phrase = dialog.AddPhrase("dm_traveler_actor_agree", v.phrase_id + "_11", v.phrase_id + "_1", -10000);
      actor_script = actor_phrase.GetPhraseScript();
      actor_script.AddAction("travel_manager.actor_travel_with_squad");
      actor_script.AddPrecondition("travel_manager.actor_have_money");

      actor_phrase = dialog.AddPhrase(
        "dm_traveler_actor_has_no_money",
        v.phrase_id + "_13",
        v.phrase_id + "_1",
        -10000
      );
      actor_script = actor_phrase.GetPhraseScript();
      actor_script.AddPrecondition("travel_manager.actor_have_not_money");

      actor_phrase = dialog.AddPhrase("dm_traveler_actor_refuse", v.phrase_id + "_14", v.phrase_id + "_1", -10000);
    }

    actor_phrase = dialog.AddPhrase("dm_traveler_actor_refuse", "1211", "121", -10000);

    npc_phrase = dialog.AddPhrase("dm_traveler_" + npc_community + "_i_cant_travel", "122", "12", -10000);
    npc_phrase_script = npc_phrase.GetPhraseScript();
    npc_phrase_script.AddPrecondition("travel_manager.squad_cannot_travel");

    actor_phrase = dialog.AddPhrase("dm_traveler_bye", "13", "1", -10000);
  }

  public uni_traveler_precond(actor: XR_game_object, npc: XR_game_object): boolean {
    const squad = getObjectSquad(npc);

    if (squad !== null && squad.commander_id() !== npc.id()) {
      return false;
    }

    if (npc.character_community() === communities.bandit) {
      return false;
    }

    if (npc.character_community() === communities.army) {
      return false;
    }

    const smart: ISmartTerrain = get_global("xr_gulag.get_npc_smart")(npc);

    if (smart !== null) {
      if (smart.name() === "jup_b41") {
        return false;
      }
    }

    return true;
  }

  public check_squad_for_enemies(squad_obj: ISimSquad): boolean {
    for (const k of squad_obj.squad_members()) {
      if (relation_registry.get_general_goodwill_between(k.id, alife().actor().id) <= ERelation.ENEMIES) {
        return true;
      }
    }

    return false;
  }

  public traveling(): void {
    // originally it was 3000.
    if (time_global() - init_time! < 1000) {
      return;
    }

    if (teleport_flag === false) {
      log.info(
        "trvelling_squad_path [%s] travelling_actor_path [%s]!!!",
        tostring(traveler_squad_path),
        tostring(traveler_actor_path)
      );

      const point: XR_patrol = new patrol(traveler_actor_path!);
      // -- const dir = vector():sub( point:point(0), point:point(1) ):getH()
      // -- const dir = vector():sub( point:point(1), point:point(0) ):normalize():getH()
      const dir = -point.point(1).sub(point.point(0)).getH();

      const board = get_sim_board();

      for (const [k, v] of board.smarts.get(traveler_smart_id!).squads) {
        if (getObjectStoryId(v.id) === null && this.check_squad_for_enemies(v)) {
          board.exit_smart(v, traveler_smart_id);
          board.remove_squad(v);
        }
      }

      const curr_smart_id = traveler_squad!.smart_id;

      if (curr_smart_id !== null) {
        board.assign_squad_to_smart(traveler_squad!, null);
        board.assign_squad_to_smart(traveler_squad!, curr_smart_id);
      }

      const position = new patrol(traveler_squad_path!).point(0);

      traveler_squad!.set_squad_position(position!);
      teleport_flag! = true;

      getActor()!.set_actor_direction(dir);
      getActor()!.set_actor_position(point.point(0));

      let minutes = traveler_distance! / 10;
      const hours = math.floor(minutes / 60);

      minutes = minutes - hours * 60;

      level.change_game_time(0, hours, minutes);
      SurgeManager.getInstance().isTimeForwarded = true;
      log.info("traveling: time forwarded on [%d][%d]", hours, minutes);
    }

    if (time_global() - init_time! < 6000) {
      return;
    }

    init_time = null;
    traveler_actor_path = null;
    traveler_squad_path = null;
    traveler_squad = null;
    traveler_distance = null;
    traveler_smart_id = null;

    set_travel_func(null);

    level.show_weapon(true);
    // -- get_console():execute("hud_weapon 1")
    level.enable_input();
    level.show_indicators();
  }

  public squad_action_description(
    actor: XR_game_object,
    npc: XR_game_object,
    dialog_id: string,
    phrase_id: string
  ): string {
    const npc_squad: ISimSquad = getObjectSquad(npc)!;

    if (npc_squad.current_action === null || npc_squad.current_action.name === "stay_point") {
      return "dm_" + "stalker" + "_doing_nothing_" + tostring(math.random(1, 3)); // -- npc:character_community()
    }

    const target_id = npc_squad.assigned_target_id;
    // --     if target_id === null then
    // --         return "dm_" + npc:character_community() .."_doing_nothing"
    // --     end

    const target_obj = alife().object(target_id!);

    if (target_obj === null) {
      abort("SIM TARGET NOT EXIST %s, action_name %s", tostring(target_id), tostring(npc_squad.current_action.name));
    }

    const target_clsid = target_obj.clsid();

    if (target_clsid === clsid.script_actor) {
      abort("Actor talking with squad, which chasing actor");
    } else if (target_clsid === clsid.online_offline_group_s) {
      return (
        "dm_" + "stalker" + "_chasing_squad_" + getAlifeCharacterCommunity(target_obj as XR_cse_alife_human_abstract)
      ); // --npc:character_community()
    } else if (target_clsid === clsid.smart_terrain) {
      const smart_name = target_obj.name();
      const desc = this.smart_to_stringtables.get(smart_name);

      if (desc === null) {
        abort("wrong smart name [%s] in travel_manager.ltx", tostring(smart_name));
      }

      return desc;
    }

    abort("wrong target clsid [%s]", tostring(target_clsid));
  }

  public squad_on_move(actor: XR_game_object, npc: XR_game_object, dialog_id: string, phrase_id: string): boolean {
    const npc_squad: ISimSquad = getObjectSquad(npc)!;

    if (npc_squad.current_action === null || npc_squad.current_action.name === "stay_point") {
      return false;
    }

    return true;
  }

  public squad_can_take_actor(
    npc: XR_game_object,
    actor: XR_game_object,
    dialog_id: string,
    phrase_id: string
  ): boolean {
    const npc_squad: ISimSquad = getObjectSquad(npc)!;
    const target_id: number = npc_squad.assigned_target_id!;
    const target_obj: XR_cse_alife_object = alife().object(target_id)!;
    const target_clsid: number = target_obj.clsid();

    if (target_clsid === clsid.smart_terrain) {
      return true;
    }

    return false;
  }

  public squad_cannot_take_actor(
    npc: XR_game_object,
    actor: XR_game_object,
    dialog_id: string,
    phrase_id: string
  ): boolean {
    return !this.squad_can_take_actor(npc, actor, dialog_id, phrase_id);
  }

  public actor_go_with_squad(actor: XR_game_object, npc: XR_game_object, dialog_id: string, phrase_id: string): void {
    get_global<AnyCallablesModule>("xr_effects").scenario_autosave(actor, npc, ["st_save_uni_travel_generic"]);

    const npc_squad = getObjectSquad(npc)!;

    const target_id = npc_squad.assigned_target_id;
    const smart = alife().object<ISmartTerrain>(target_id!)!;

    npc.stop_talk();
    // -- get_console():execute("hud_crosshair 0")
    // -- get_console():execute("hud_weapon 0")
    level.disable_input();
    level.hide_indicators_safe();
    level.add_pp_effector(post_processors.fade_in_out, 613, false);

    traveler_distance = getAlifeDistanceBetween(npc_squad, smart);
    traveler_actor_path = smart.traveler_actor_path;
    traveler_squad_path = smart.traveler_squad_path;
    traveler_smart_id = smart.id;
    traveler_squad = npc_squad;
    set_travel_func(() => this.traveling());
    init_time = time_global();
    teleport_flag = false;
  }

  public check_smart_availability(smart_name: string, smart_table: ITravelRouteDescriptor, squad: ISimSquad): boolean {
    const board = get_sim_board();
    const smart = board.get_smart_by_name(smart_name);

    if (smart === null) {
      abort("Error in travel manager. Smart [%s] doesnt exist.", tostring(smart_name));
    }

    if (
      get_global<AnyCallablesModule>("xr_logic").pick_section_from_condlist(getActor(), smart, smart_table.condlist) !==
      "true"
    ) {
      return false;
    }

    if (smart_table.level !== level.name()) {
      return false;
    }

    // --  �� �� ����� � ������� �����
    if (getAlifeDistanceBetween(squad, smart) < 50) {
      return false;
    }

    // --     const squad_count = SmartTerrain.smart_terrain_squad_count(board.smarts[smart.id].squads)
    // --     if squad_count !== null and (smart.max_population <= squad_count) then
    // --         return false
    // --     end

    return true;
  }

  public actor_travel_with_squad(
    actor: XR_game_object,
    npc: XR_game_object,
    dialog_id: string,
    phrase_id: string
  ): void {
    log.info("Actor travel with squad:", npc.name());

    get_global<AnyCallablesModule>("xr_effects").scenario_autosave(actor, npc, ["st_save_uni_travel_generic"]);

    const travel_phrase_id = string.sub(phrase_id, 1, string.len(phrase_id) - 3);

    npc.stop_talk();
    // -- get_console():execute("hud_crosshair 0")
    // -- get_console():execute("hud_weapon 0")
    level.disable_input();
    level.hide_indicators_safe();
    level.add_pp_effector(post_processors.fade_in_out, 613, false);

    const smart_name = this.smart_by_phrase.get(travel_phrase_id);
    const board = get_sim_board();
    const smart = board.get_smart_by_name(smart_name)!;
    const npc_squad = getObjectSquad(npc);

    const distance = getAlifeDistanceBetween(npc_squad!, smart);
    const price = this.get_price_by_distance(distance);

    actor.give_money(-price);
    relocate_money(actor, "out", price);

    traveler_actor_path = smart.traveler_actor_path;
    traveler_squad_path = smart.traveler_squad_path;
    traveler_smart_id = smart.id;
    traveler_squad = npc_squad;
    traveler_distance = distance;
    set_travel_func(() => this.traveling());
    init_time = time_global();
    teleport_flag = false;
  }

  public squad_can_travel(npc: XR_game_object, actor: XR_game_object, dialog_id: string, phrase_id: string): boolean {
    const npc_squad: ISimSquad = getObjectSquad(npc)!;

    for (const [id, smart_table] of pairs(this.smart_travels)) {
      if (this.check_smart_availability(id, smart_table, npc_squad)) {
        return true;
      }
    }

    return false;
  }

  public squad_cannot_travel(npc: XR_game_object, actor: XR_game_object, dialog_id: string, phrase_id: string) {
    return !this.squad_can_travel(npc, actor, dialog_id, phrase_id);
  }

  public travel_condlist(
    actor: XR_game_object,
    npc: XR_game_object,
    dialog_id: string,
    prev_phrase_id: string,
    phrase_id: string
  ): boolean {
    const smart_name = this.smart_by_phrase.get(phrase_id);

    if (smart_name === null) {
      abort("Error in travel manager %s", tostring(phrase_id));
    }

    return this.check_smart_availability(smart_name, this.smart_travels.get(smart_name), getObjectSquad(npc)!);
  }

  public get_price_by_distance(distance: number) {
    return math.ceil(distance / 50) * 50;
  }

  public get_travel_cost(actor: XR_game_object, npc: XR_game_object, dialog_id: string, phrase_id: string): string {
    const travel_phrase_id = string.sub(phrase_id, 1, string.len(phrase_id) - 2);
    const smart_name = this.smart_by_phrase.get(travel_phrase_id);
    const board = get_sim_board();
    const smart = board.get_smart_by_name(smart_name)!;
    const npc_squad = getObjectSquad(npc);

    // -- const distance = getAlifeDistanceBetween(npc_squad , smart)

    const squad_position = npc.position();
    const smart_position = smart.position;

    const distance = squad_position.distance_to(smart_position);

    const price = this.get_price_by_distance(distance);
    // -- printf("TRAVEL DISTANCE %s", distance)

    return game.translate_string("dm_traveler_travel_cost") + " " + tostring(price) + ".";
  }

  public actor_have_money(actor: XR_game_object, npc: XR_game_object, dialog_id: string, phrase_id: string): boolean {
    const travel_phrase_id: string = string.sub(phrase_id, 1, string.len(phrase_id) - 2);
    const smart_name: string = this.smart_by_phrase.get(travel_phrase_id);
    const board: ISimBoard = get_sim_board();
    const smart: Optional<ISmartTerrain> = board.get_smart_by_name(smart_name);

    const squad_position = npc.position();
    const smart_position = smart!.position;
    const distance = squad_position.distance_to(smart_position);
    const price = this.get_price_by_distance(distance);

    return price <= getActor()!.money();
  }

  public actor_have_not_money(
    actor: XR_game_object,
    npc: XR_game_object,
    dialog_id: string,
    phrase_id: string
  ): boolean {
    return !this.actor_have_money(actor, npc, dialog_id, phrase_id);
  }
}

export const travelManager: TravelManager = TravelManager.getInstance();
