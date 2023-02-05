import { stalker_ids, world_property, XR_action_planner, XR_game_object, XR_ini_file } from "xray16";

import { AnyCallablesModule, Optional } from "@/mod/lib/types";
import { IStoredObject, storage } from "@/mod/scripts/core/db";
import { AbstractSchemeAction } from "@/mod/scripts/core/logic/AbstractSchemeAction";
import { ActionSearchCorpse } from "@/mod/scripts/core/logic/ActionSearchCorpse";
import { EvaluatorCorpseDetect } from "@/mod/scripts/core/logic/evaluators/EvaluatorCorpseDetect";
import { GlobalSound } from "@/mod/scripts/core/logic/GlobalSound";
import { isLootableItem } from "@/mod/scripts/utils/checkers";
import { getConfigBoolean } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ActionCorpseDetect");

export class ActionCorpseDetect extends AbstractSchemeAction {
  public static SCHEME_SECTION: string = "corpse_detection";

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: string,
    section: string,
    state: IStoredObject
  ): void {
    logger.info("Add to binder:", object.name());

    const operators = {
      search_corpse: get_global("xr_actions_id.corpse_exist"),
      state_mgr_to_idle_alife: get_global("xr_actions_id.state_mgr") + 2
    };
    const properties = {
      corpse_exist: get_global("xr_evaluators_id.corpse_exist"),
      wounded: get_global("xr_evaluators_id.sidor_wounded_base")
    };

    const manager: XR_action_planner = object.motivation_action_manager();

    // Evaluators
    manager.add_evaluator(
      properties["corpse_exist"],
      create_xr_class_instance(EvaluatorCorpseDetect, "corpse_exist", state)
    );

    // Actions
    const action = create_xr_class_instance(ActionSearchCorpse, object.name(), "action_search_corpse", state);

    action.add_precondition(new world_property(stalker_ids.property_alive, true));
    action.add_precondition(new world_property(stalker_ids.property_enemy, false));
    action.add_precondition(new world_property(stalker_ids.property_danger, false));
    action.add_precondition(new world_property(stalker_ids.property_anomaly, false));
    action.add_precondition(new world_property(stalker_ids.property_items, false));
    action.add_precondition(new world_property(properties["corpse_exist"], true));
    action.add_precondition(new world_property(properties["wounded"], false));
    action.add_precondition(new world_property(get_global("xr_evaluators_id.wounded_exist"), false));
    action.add_effect(new world_property(properties["corpse_exist"], false));

    manager.add_action(operators["search_corpse"], action);

    const alifeAction = manager.action(get_global("xr_actions_id.alife"));

    alifeAction.add_precondition(new world_property(properties["corpse_exist"], false));

    const toIdleAction = manager.action(operators["state_mgr_to_idle_alife"]);

    toIdleAction.add_precondition(new world_property(properties["corpse_exist"], false));
  }

  public static set_corpse_detection(object: XR_game_object, ini: XR_ini_file, scheme: string, section: string): void {
    const st = get_global<AnyCallablesModule>("xr_logic").assign_storage_and_bind(object, ini, scheme, section);
  }

  public static reset_corpse_detection(
    npc: XR_game_object,
    scheme: string,
    state: IStoredObject,
    section: string
  ): void {
    state.corpse_detection.corpse_detection_enabled = getConfigBoolean(
      state.ini!,
      section,
      "corpse_detection_enabled",
      npc,
      false,
      true
    );
  }

  public static is_under_corpse_detection(object: XR_game_object): boolean {
    const mgr = object.motivation_action_manager();

    if (!mgr.initialized()) {
      return false;
    }

    return mgr.current_action_id() === get_global("xr_actions_id").corpse_exist;
  }

  public static get_all_from_corpse(object: XR_game_object): void {
    const corpse_npc_id: number = storage.get(object.id()).corpse_detection.selected_corpse_id;
    const corpse_npc: Optional<XR_game_object> = storage.get(corpse_npc_id) && storage.get(corpse_npc_id).object!;

    if (corpse_npc === null) {
      return;
    }

    corpse_npc.iterate_inventory((npc, item) => {
      if (isLootableItem(item)) {
        npc.transfer_item(item, object);
      }
    }, corpse_npc);

    if (math.random(100) > 20) {
      GlobalSound.set_sound_play(object.id(), "corpse_loot_begin", null, null);
    } else {
      GlobalSound.set_sound_play(object.id(), "corpse_loot_bad", null, null);
    }
  }
}
