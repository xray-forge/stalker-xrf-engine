import { stalker_ids, world_property, XR_action_planner, XR_game_object, XR_ini_file } from "xray16";

import { Optional, TNumberId } from "@/mod/lib/types";
import { EScheme, ESchemeType, TSection } from "@/mod/lib/types/scheme";
import { IRegistryObjectState, registry } from "@/mod/scripts/core/database";
import { GlobalSoundManager } from "@/mod/scripts/core/managers/GlobalSoundManager";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base/AbstractScheme";
import { action_ids } from "@/mod/scripts/core/schemes/base/actions_id";
import { evaluators_id } from "@/mod/scripts/core/schemes/base/evaluators_id";
import { ActionSearchCorpse } from "@/mod/scripts/core/schemes/corpse_detection/actions";
import { EvaluatorCorpseDetect } from "@/mod/scripts/core/schemes/corpse_detection/evaluators";
import { ISchemeCorpseDetectionState } from "@/mod/scripts/core/schemes/corpse_detection/ISchemeCorpseDetectionState";
import { isLootableItem } from "@/mod/scripts/utils/check/is";
import { getConfigBoolean } from "@/mod/scripts/utils/config";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeCorpseDetection extends AbstractScheme {
  public static override SCHEME_SECTION: EScheme = EScheme.CORPSE_DETECTION;
  public static override SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  /**
   * todo;
   */
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeCorpseDetectionState
  ): void {
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

  /**
   * todo;
   */
  public static setCorpseDetection(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: Optional<TSection>
  ): void {
    AbstractScheme.assignStateAndBind(object, ini, scheme, section);
  }

  /**
   * todo;
   */
  public static override resetScheme(
    object: XR_game_object,
    scheme: EScheme,
    state: IRegistryObjectState,
    section: TSection
  ): void {
    (state[EScheme.CORPSE_DETECTION] as ISchemeCorpseDetectionState).corpse_detection_enabled = getConfigBoolean(
      state.ini!,
      section,
      "corpse_detection_enabled",
      object,
      false,
      true
    );
  }

  /**
   * todo;
   */
  public static isUnderCorpseDetection(object: XR_game_object): boolean {
    const manager = object.motivation_action_manager();

    if (!manager.initialized()) {
      return false;
    }

    return manager.current_action_id() === action_ids.corpse_exist;
  }

  /**
   * todo;
   */
  public static getAllFromCorpse(object: XR_game_object): void {
    const state: IRegistryObjectState = registry.objects.get(object.id());
    const corpseObjectId: Optional<TNumberId> = (state[EScheme.CORPSE_DETECTION] as ISchemeCorpseDetectionState)
      .selected_corpse_id;
    const corpseObject: Optional<XR_game_object> =
      corpseObjectId === null ? null : registry.objects.get(corpseObjectId)?.object;

    if (corpseObject === null) {
      return;
    }

    corpseObject.iterate_inventory((object, item) => {
      if (isLootableItem(item)) {
        object.transfer_item(item, object);
      }
    }, corpseObject);

    if (math.random(100) > 20) {
      GlobalSoundManager.getInstance().setSoundPlaying(object.id(), "corpse_loot_begin", null, null);
    } else {
      GlobalSoundManager.getInstance().setSoundPlaying(object.id(), "corpse_loot_bad", null, null);
    }
  }
}
