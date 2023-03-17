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

import { communities } from "@/engine/globals/communities";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { EScheme, ESchemeType, Optional, TDistance, TSection } from "@/engine/lib/types";
import { IRegistryObjectState, registry } from "@/engine/scripts/core/database";
import { AbstractScheme } from "@/engine/scripts/core/schemes/base";
import { ISchemeCombatIgnoreState } from "@/engine/scripts/core/schemes/combat_ignore";
import { ActionProcessEnemy } from "@/engine/scripts/core/schemes/combat_ignore/actions/ActionProcessEnemy";
import { EvaluatorDanger } from "@/engine/scripts/core/schemes/danger/evaluators";
import { ISchemeDangerState } from "@/engine/scripts/core/schemes/danger/ISchemeDangerState";
import { getCharacterCommunity } from "@/engine/scripts/utils/alife";
import { isHeavilyWounded } from "@/engine/scripts/utils/check/check";
import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeDanger extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.DANGER;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  /**
   * todo;
   */
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeDangerState
  ): void {
    const actionPlanner: XR_action_planner = object.motivation_action_manager();
    const dangerAction: XR_action_base = actionPlanner.action(stalker_ids.action_danger_planner);
    const dangerActionPlanner: XR_action_planner = cast_planner(dangerAction);

    actionPlanner.remove_evaluator(stalker_ids.property_danger);
    actionPlanner.add_evaluator(stalker_ids.property_danger, new EvaluatorDanger(state, this));

    dangerActionPlanner.remove_evaluator(stalker_ids.property_danger);
    dangerActionPlanner.add_evaluator(stalker_ids.property_danger, new EvaluatorDanger(state, this));
  }

  /**
   * todo;
   */
  public static override setScheme(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
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
  ): void {}

  /**
   * todo;
   */
  public static isDangerObject(object: XR_game_object): boolean {
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

    if (
      !ActionProcessEnemy.isEnemy(
        object,
        bestDangerObject,
        registry.objects.get(object.id())[EScheme.COMBAT_IGNORE] as ISchemeCombatIgnoreState
      )
    ) {
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

  /**
   * todo;
   */
  public static get_danger_name(best_danger: XR_danger_object): string {
    let best_danger_object: Optional<XR_game_object> = best_danger.object();
    const bd_type: TXR_danger_object = best_danger.type();

    if (bd_type !== danger_object.grenade && best_danger.dependent_object() !== null) {
      best_danger_object = best_danger.dependent_object();
    }

    return best_danger_object === null ? "none" : best_danger_object.name();
  }

  /**
   * todo;
   */
  public static get_danger_time(danger: XR_danger_object): number {
    if (danger.type() === danger_object.entity_corpse) {
      return danger.object().death_time();
    }

    return danger.time();
  }
}
