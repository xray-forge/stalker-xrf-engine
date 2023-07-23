import { alife } from "xray16";

import { registry } from "@/engine/core/database";
import { SmartTerrain } from "@/engine/core/objects/server/smart_terrain/SmartTerrain";
import { AbstractSchemeManager } from "@/engine/core/schemes";
import { ISchemeCombatIgnoreState } from "@/engine/core/schemes/combat_ignore/index";
import { LuaLogger } from "@/engine/core/utils/logging";
import { canObjectSelectAsEnemy } from "@/engine/core/utils/object";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import { AnyObject, ClientObject, Optional, ServerCreatureObject, TCount, TNumberId, Vector } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class CombatProcessEnemyManager extends AbstractSchemeManager<ISchemeCombatIgnoreState> {
  /**
   * todo: Description.
   */
  public onObjectEnemy(object: ClientObject, enemy: ClientObject): boolean {
    if (enemy.id() === ACTOR_ID) {
      registry.actorCombat.set(object.id(), true);
    }

    const canSelectEnemy: boolean = canObjectSelectAsEnemy(object, enemy);

    if (canSelectEnemy) {
      const serverObject: Optional<ServerCreatureObject> = alife().object(object.id());

      /**
       * Set alarm if object is in smart zone.
       */
      if (serverObject && serverObject.m_smart_terrain_id !== MAX_U16) {
        const smartTerrain: SmartTerrain = alife().object<SmartTerrain>(serverObject.m_smart_terrain_id)!;

        smartTerrain.startAlarm();

        if (enemy.id() === registry.actor.id() && smartTerrain.smartTerrainActorControl !== null) {
          smartTerrain.smartTerrainActorControl.onActorAttackSmartTerrain();
        }
      }

      const serverEnemyObject: Optional<ServerCreatureObject> = alife().object(enemy.id());

      // todo: Do timer based.
      if (serverObject && serverEnemyObject) {
        if (
          serverObject.position.distance_to_sqr(serverEnemyObject.position) > logicsConfig.COMBAT.ATTACK_DISTANCE_SQR
        ) {
          return false;
        }
      }
    }

    return canSelectEnemy;
  }

  /**
   * todo: Description.
   */
  public override onHit(
    object: ClientObject,
    amount: TCount,
    direction: Vector,
    who: ClientObject,
    boneId: TNumberId
  ): void {
    if (who === null || amount === 0) {
      return;
    }

    if (who.id() === ACTOR_ID) {
      const overrides: Optional<AnyObject> = this.state.overrides;

      if (!overrides || !overrides.combat_ignore_keep_when_attacked) {
        this.state.enabled = false;
      }
    }
  }
}
