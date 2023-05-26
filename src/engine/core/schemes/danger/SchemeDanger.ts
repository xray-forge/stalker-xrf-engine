import {
  action_base,
  action_planner,
  cast_planner,
  danger_object,
  game_object,
  ini_file,
  stalker_ids,
  TXR_danger_object,
} from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { AbstractScheme } from "@/engine/core/schemes/base";
import { ISchemeCombatIgnoreState } from "@/engine/core/schemes/combat_ignore";
import { ActionProcessEnemy } from "@/engine/core/schemes/combat_ignore/actions/ActionProcessEnemy";
import { EvaluatorDanger } from "@/engine/core/schemes/danger/evaluators";
import { ISchemeDangerState } from "@/engine/core/schemes/danger/ISchemeDangerState";
import { isHeavilyWounded } from "@/engine/core/utils/check/check";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getCharacterCommunity } from "@/engine/core/utils/object";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { communities } from "@/engine/lib/constants/communities";
import { EScheme, ESchemeType, Optional, TDistance, TName, TSection, TTimestamp } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeDanger extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.DANGER;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  /**
   * todo: Description.
   */
  public static override activate(object: game_object, ini: ini_file, scheme: EScheme, section: TSection): void {
    AbstractScheme.assign(object, ini, scheme, section);
  }

  /**
   * todo: Description.
   */
  public static override add(
    object: game_object,
    ini: ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeDangerState
  ): void {
    const actionPlanner: action_planner = object.motivation_action_manager();
    const dangerAction: action_base = actionPlanner.action(stalker_ids.action_danger_planner);
    const dangerActionPlanner: action_planner = cast_planner(dangerAction);

    actionPlanner.remove_evaluator(stalker_ids.property_danger);
    actionPlanner.add_evaluator(stalker_ids.property_danger, new EvaluatorDanger(state, this));

    dangerActionPlanner.remove_evaluator(stalker_ids.property_danger);
    dangerActionPlanner.add_evaluator(stalker_ids.property_danger, new EvaluatorDanger(state, this));
  }

  /**
   * todo: Description.
   */
  public static override reset(
    object: game_object,
    scheme: EScheme,
    state: IRegistryObjectState,
    section: TSection
  ): void {}

  /**
   * todo: Description.
   */
  public static isObjectFacingDanger(object: game_object): boolean {
    const bestDanger: Optional<danger_object> = object.best_danger();

    if (bestDanger === null) {
      return false;
    }

    let bestDangerObject: Optional<game_object> = bestDanger.object();
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
}
