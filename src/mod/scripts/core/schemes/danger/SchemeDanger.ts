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
import { AnyCallablesModule, EScheme, ESchemeType, Optional, TSection } from "@/mod/lib/types";
import { IStoredObject, registry } from "@/mod/scripts/core/database";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base";
import { ActionProcessEnemy } from "@/mod/scripts/core/schemes/danger/actions/ActionProcessEnemy";
import { getCharacterCommunity } from "@/mod/scripts/utils/alife";
import { isHeavilyWounded } from "@/mod/scripts/utils/checkers/checkers";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("SchemeDanger");

/**
 * todo;
 */
export class SchemeDanger extends AbstractScheme {
  public static readonly SCHEME_SECTION: EScheme = EScheme.DANGER;
  public static readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: IStoredObject
  ): void {
    logger.info("Add to binder:", object.name());

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { EvaluatorDanger } = require("@/mod/scripts/core/schemes/danger/evaluators/EvaluatorDanger");

    const manager = object.motivation_action_manager();
    const danger_action: XR_action_base = manager.action(stalker_ids.action_danger_planner);
    const danger_action_planner: XR_action_planner = cast_planner(danger_action);

    manager.remove_evaluator(stalker_ids.property_danger);
    manager.add_evaluator(
      stalker_ids.property_danger,
      create_xr_class_instance(EvaluatorDanger, object, "danger", state)
    );

    danger_action_planner.remove_evaluator(stalker_ids.property_danger);
    danger_action_planner.add_evaluator(
      stalker_ids.property_danger,
      create_xr_class_instance(EvaluatorDanger, object, "danger", state)
    );
  }

  public static set_danger(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: string): void {
    logger.info("Set danger:", object.name());

    assignStorageAndBind(object, ini, scheme, section);

    registry.objects.get(object.id()).danger_flag = false;
  }

  public static resetScheme(object: XR_game_object, scheme: EScheme, state: IStoredObject, section: TSection): void {}

  public static is_danger(npc: XR_game_object): boolean {
    const best_danger: Optional<XR_danger_object> = npc.best_danger();

    if (best_danger === null) {
      return false;
    }

    let best_danger_object: Optional<XR_game_object> = best_danger.object();
    const bd_type: TXR_danger_object = best_danger.type();

    if (bd_type !== danger_object.grenade && best_danger.dependent_object() !== null) {
      best_danger_object = best_danger.dependent_object();
    }

    if (best_danger_object === null) {
      return false;
    }

    if (
      bd_type !== danger_object.entity_corpse &&
      bd_type !== danger_object.grenade &&
      npc.relation(best_danger_object) !== game_object.enemy
    ) {
      return false;
    }

    if (bd_type === danger_object.grenade) {
      if (getCharacterCommunity(npc) === communities.zombied) {
        return false;
      }
    }

    // todo: Implement?
    if (bd_type === danger_object.entity_corpse) {
      return false;
      /**
       *  --const corpse_object = best_danger:object()
       *  --if time_global() - corpse_object:death_time() >= DANGER_INERTION_TIME then
       *  --    return false
       *  --end
       */
    }

    if (!ActionProcessEnemy.isEnemy(npc, best_danger_object, registry.objects.get(npc.id()).combat_ignore!, true)) {
      // --printf("[%s] check danger COMBAT IGNORE", npc:name())
      return false;
    }

    const danger_distance_sqr: number = best_danger.position().distance_to_sqr(npc.position());
    const ignore_distance_by_type: Optional<number> = logicsConfig.DANGER_IGNORE_DISTANCE_BY_TYPE[bd_type];

    if (ignore_distance_by_type !== null) {
      if (danger_distance_sqr >= ignore_distance_by_type * ignore_distance_by_type) {
        return false;
      }
    } else if (
      danger_distance_sqr >=
      logicsConfig.DANGER_IGNORE_DISTANCE_GENERAL * logicsConfig.DANGER_IGNORE_DISTANCE_GENERAL
    ) {
      return false;
    }

    const active_sector = registry.objects.get(npc.id()).active_sector;

    if (active_sector !== null) {
      // todo: Does not exist.
      if (
        get_global<AnyCallablesModule>("sr_danger").check_danger_position(best_danger.position(), active_sector) ===
        false
      ) {
        return false;
      }
    }

    if (isHeavilyWounded(npc.id())) {
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
      const corpse_object = danger.object();

      return corpse_object.death_time();
    }

    return danger.time();
  }
}
