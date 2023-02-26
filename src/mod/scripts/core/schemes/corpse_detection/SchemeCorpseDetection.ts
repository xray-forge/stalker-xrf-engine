import { stalker_ids, world_property, XR_action_planner, XR_game_object, XR_ini_file } from "xray16";

import { Optional } from "@/mod/lib/types";
import { EScheme, ESchemeType, TSection } from "@/mod/lib/types/scheme";
import { IStoredObject, registry } from "@/mod/scripts/core/database";
import { GlobalSound } from "@/mod/scripts/core/GlobalSound";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base/AbstractScheme";
import { action_ids } from "@/mod/scripts/core/schemes/base/actions_id";
import { evaluators_id } from "@/mod/scripts/core/schemes/base/evaluators_id";
import { ActionSearchCorpse } from "@/mod/scripts/core/schemes/corpse_detection/actions";
import { EvaluatorCorpseDetect } from "@/mod/scripts/core/schemes/corpse_detection/evaluators";
import { isLootableItem } from "@/mod/scripts/utils/checkers/is";
import { getConfigBoolean } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("SchemeCorpseDetection");

/**
 * todo;
 */
export class SchemeCorpseDetection extends AbstractScheme {
  public static SCHEME_SECTION: EScheme = EScheme.CORPSE_DETECTION;
  public static SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: string,
    section: string,
    state: IStoredObject
  ): void {
    logger.info("Add to binder:", object.name());

    const operators = {
      search_corpse: action_ids.corpse_exist,
      state_mgr_to_idle_alife: action_ids.state_mgr + 2,
    };
    const properties = {
      corpse_exist: evaluators_id.corpse_exist,
      wounded: evaluators_id.sidor_wounded_base,
    };

    const manager: XR_action_planner = object.motivation_action_manager();

    // Evaluators
    manager.add_evaluator(properties.corpse_exist, new EvaluatorCorpseDetect(state));

    // Actions
    const actionSearchCorpse: ActionSearchCorpse = new ActionSearchCorpse(state);

    actionSearchCorpse.add_precondition(new world_property(stalker_ids.property_alive, true));
    actionSearchCorpse.add_precondition(new world_property(stalker_ids.property_enemy, false));
    actionSearchCorpse.add_precondition(new world_property(stalker_ids.property_danger, false));
    actionSearchCorpse.add_precondition(new world_property(stalker_ids.property_anomaly, false));
    actionSearchCorpse.add_precondition(new world_property(stalker_ids.property_items, false));
    actionSearchCorpse.add_precondition(new world_property(properties.corpse_exist, true));
    actionSearchCorpse.add_precondition(new world_property(properties.wounded, false));
    actionSearchCorpse.add_precondition(new world_property(evaluators_id.wounded_exist, false));
    actionSearchCorpse.add_effect(new world_property(properties.corpse_exist, false));

    manager.add_action(operators.search_corpse, actionSearchCorpse);

    manager.action(action_ids.alife).add_precondition(new world_property(properties.corpse_exist, false));

    manager
      .action(operators.state_mgr_to_idle_alife)
      .add_precondition(new world_property(properties.corpse_exist, false));
  }

  public static set_corpse_detection(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: Optional<TSection>
  ): void {
    assignStorageAndBind(object, ini, scheme, section);
  }

  public static resetScheme(npc: XR_game_object, scheme: EScheme, state: IStoredObject, section: TSection): void {
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

    return mgr.current_action_id() === action_ids.corpse_exist;
  }

  public static get_all_from_corpse(object: XR_game_object): void {
    const corpse_npc_id: number = registry.objects.get(object.id()).corpse_detection.selected_corpse_id;
    const corpse_npc: Optional<XR_game_object> =
      registry.objects.get(corpse_npc_id) && registry.objects.get(corpse_npc_id).object!;

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
