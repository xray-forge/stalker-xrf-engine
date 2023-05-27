import { stalker_ids, world_property } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { AbstractScheme, EActionId, EEvaluatorId } from "@/engine/core/schemes";
import { ActionSearchCorpse } from "@/engine/core/schemes/corpse_detection/actions";
import { EvaluatorCorpseDetect } from "@/engine/core/schemes/corpse_detection/evaluators";
import { ISchemeCorpseDetectionState } from "@/engine/core/schemes/corpse_detection/ISchemeCorpseDetectionState";
import { isLootableItem } from "@/engine/core/utils/check/is";
import { readIniBoolean } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ActionPlanner, ClientObject, IniFile, Optional, TNumberId } from "@/engine/lib/types";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeCorpseDetection extends AbstractScheme {
  public static override SCHEME_SECTION: EScheme = EScheme.CORPSE_DETECTION;
  public static override SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  /**
   * todo: Description.
   */
  public static override activate(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: Optional<TSection>
  ): void {
    AbstractScheme.assign(object, ini, scheme, section);
  }

  /**
   * todo: Description.
   */
  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeCorpseDetectionState
  ): void {
    const manager: ActionPlanner = object.motivation_action_manager();

    // Evaluators
    manager.add_evaluator(EEvaluatorId.IS_CORPSE_EXISTING, new EvaluatorCorpseDetect(state));

    // Actions
    const actionSearchCorpse: ActionSearchCorpse = new ActionSearchCorpse(state);

    actionSearchCorpse.add_precondition(new world_property(stalker_ids.property_alive, true));
    actionSearchCorpse.add_precondition(new world_property(stalker_ids.property_enemy, false));
    actionSearchCorpse.add_precondition(new world_property(stalker_ids.property_danger, false));
    actionSearchCorpse.add_precondition(new world_property(stalker_ids.property_anomaly, false));
    actionSearchCorpse.add_precondition(new world_property(stalker_ids.property_items, false));
    actionSearchCorpse.add_precondition(new world_property(EEvaluatorId.IS_CORPSE_EXISTING, true));
    actionSearchCorpse.add_precondition(new world_property(EEvaluatorId.IS_WOUNDED, false));
    actionSearchCorpse.add_precondition(new world_property(EEvaluatorId.IS_WOUNDED_EXISTING, false));
    actionSearchCorpse.add_effect(new world_property(EEvaluatorId.IS_CORPSE_EXISTING, false));

    manager.add_action(EActionId.SEARCH_CORPSE, actionSearchCorpse);

    manager.action(EActionId.ALIFE).add_precondition(new world_property(EEvaluatorId.IS_CORPSE_EXISTING, false));

    manager
      .action(EActionId.STATE_TO_IDLE_ALIFE)
      .add_precondition(new world_property(EEvaluatorId.IS_CORPSE_EXISTING, false));
  }

  /**
   * todo: Description.
   */
  public static override reset(
    object: ClientObject,
    scheme: EScheme,
    state: IRegistryObjectState,
    section: TSection
  ): void {
    (state[EScheme.CORPSE_DETECTION] as ISchemeCorpseDetectionState).corpse_detection_enabled = readIniBoolean(
      state.ini!,
      section,
      "corpse_detection_enabled",
      false,
      true
    );
  }

  /**
   * todo: Description.
   */
  public static isUnderCorpseDetection(object: ClientObject): boolean {
    const manager = object.motivation_action_manager();

    if (!manager.initialized()) {
      return false;
    }

    return manager.current_action_id() === EActionId.SEARCH_CORPSE;
  }

  /**
   * todo: Description.
   */
  public static getAllFromCorpse(object: ClientObject): void {
    const state: IRegistryObjectState = registry.objects.get(object.id());
    const corpseObjectId: Optional<TNumberId> = (state[EScheme.CORPSE_DETECTION] as ISchemeCorpseDetectionState)
      .selected_corpse_id;
    const corpseObject: Optional<ClientObject> =
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
      GlobalSoundManager.getInstance().playSound(object.id(), "corpse_loot_begin", null, null);
    } else {
      GlobalSoundManager.getInstance().playSound(object.id(), "corpse_loot_bad", null, null);
    }
  }
}
