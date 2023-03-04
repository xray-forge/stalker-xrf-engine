import {
  cast_planner,
  danger_object,
  game_object,
  stalker_ids,
  TXR_danger_object,
  XR_action_base,
  XR_action_planner,
  XR_danger_object,
  XR_game_object,
  XR_ini_file,
} from "xray16";

import { communities } from "@/mod/globals/communities";
import { logicsConfig } from "@/mod/lib/configs/LogicsConfig";
import { EScheme, ESchemeType, Optional, TDistance, TSection } from "@/mod/lib/types";
import { IStoredObject, registry } from "@/mod/scripts/core/database";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base";
import { ActionProcessEnemy } from "@/mod/scripts/core/schemes/danger/actions/ActionProcessEnemy";
import { EvaluatorDanger } from "@/mod/scripts/core/schemes/danger/evaluators";
import { getCharacterCommunity } from "@/mod/scripts/utils/alife";
import { isHeavilyWounded } from "@/mod/scripts/utils/checkers/checkers";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("SchemeDanger");

/**
 * todo;
 */
export class SchemeDanger extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.DANGER;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: IStoredObject
  ): void {
    logger.info("Add to binder:", object.name());

    const manager: XR_action_planner = object.motivation_action_manager();
    const dangerAction: XR_action_base = manager.action(stalker_ids.action_danger_planner);
    const dangerActionPlanner: XR_action_planner = cast_planner(dangerAction);

    manager.remove_evaluator(stalker_ids.property_danger);
    manager.add_evaluator(stalker_ids.property_danger, new EvaluatorDanger(state, this));

    dangerActionPlanner.remove_evaluator(stalker_ids.property_danger);
    dangerActionPlanner.add_evaluator(stalker_ids.property_danger, new EvaluatorDanger(state, this));
  }

  public static setDanger(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    logger.info("Set danger:", object.name());

    assignStorageAndBind(object, ini, scheme, section);
    registry.objects.get(object.id()).danger_flag = false;
  }

  public static override resetScheme(
    object: XR_game_object,
    scheme: EScheme,
    state: IStoredObject,
    section: TSection
  ): void {}

  public static is_danger(object: XR_game_object): boolean {
    const bestDanger: Optional<XR_danger_object> = object.best_danger();

    if (bestDanger === null) {
      return false;
    }

    let bestDangerObject: Optional<XR_game_object> = bestDanger.object();
    const bestDangerType: TXR_danger_object = bestDanger.type();

    if (bestDangerType !== danger_object.grenade && bestDanger.dependent_object() !== null) {
      bestDangerObject = bestDanger.dependent_object();
    }

    if (bestDangerObject === null) {
      return false;
    }

    if (
      bestDangerType !== danger_object.entity_corpse &&
      bestDangerType !== danger_object.grenade &&
      object.relation(bestDangerObject) !== game_object.enemy
    ) {
      return false;
    }

    if (bestDangerType === danger_object.grenade) {
      if (getCharacterCommunity(object) === communities.zombied) {
        return false;
      }
    }

    // todo: Implement?
    if (bestDangerType === danger_object.entity_corpse) {
      return false;
      /**
       *  --const corpse_object = best_danger:object()
       *  --if time_global() - corpse_object:death_time() >= DANGER_INERTION_TIME then
       *  --    return false
       *  --end
       */
    }

    if (!ActionProcessEnemy.isEnemy(object, bestDangerObject, registry.objects.get(object.id()).combat_ignore!, true)) {
      // --printf("[%s] check danger COMBAT IGNORE", npc:name())
      return false;
    }

    const dangerDistanceSqrt: TDistance = bestDanger.position().distance_to_sqr(object.position());
    const ignoreDistanceByType: Optional<TDistance> = logicsConfig.DANGER_IGNORE_DISTANCE_BY_TYPE[bestDangerType];

    if (ignoreDistanceByType !== null) {
      if (dangerDistanceSqrt >= ignoreDistanceByType * ignoreDistanceByType) {
        return false;
      }
    } else if (
      dangerDistanceSqrt >=
      logicsConfig.DANGER_IGNORE_DISTANCE_GENERAL * logicsConfig.DANGER_IGNORE_DISTANCE_GENERAL
    ) {
      return false;
    }

    if (isHeavilyWounded(object.id())) {
      return false;
    }

    // todo: Update, originally incorrect.
    /**
      if (active_scheme === "camper" && bd_type !== danger_object.grenade) {
        return false;
      }
     */

    return true;
  }

  public static get_danger_name(best_danger: XR_danger_object): string {
    let best_danger_object: Optional<XR_game_object> = best_danger.object();
    const bd_type: TXR_danger_object = best_danger.type();

    if (bd_type !== danger_object.grenade && best_danger.dependent_object() !== null) {
      best_danger_object = best_danger.dependent_object();
    }

    return best_danger_object === null ? "none" : best_danger_object.name();
  }

  public static get_danger_time(danger: XR_danger_object): number {
    if (danger.type() === danger_object.entity_corpse) {
      return danger.object().death_time();
    }

    return danger.time();
  }
}
