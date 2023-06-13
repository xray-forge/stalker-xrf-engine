import { alife } from "xray16";

import { registry } from "@/engine/core/database";
import { SmartTerrain } from "@/engine/core/objects/server/smart_terrain/SmartTerrain";
import { ISchemeCombatIgnoreState } from "@/engine/core/schemes/combat_ignore";
import { isObjectEnemy } from "@/engine/core/utils/check/check";
import { LuaLogger } from "@/engine/core/utils/logging";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import { ClientObject, Optional, ServerCreatureObject, TCount, TNumberId, Vector } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class ActionProcessEnemy {
  public readonly object: ClientObject;
  public readonly state: ISchemeCombatIgnoreState;

  public constructor(object: ClientObject, state: ISchemeCombatIgnoreState) {
    this.object = object;
    this.state = state;
  }

  /**
   * todo: Description.
   */
  public onObjectEnemy(object: ClientObject, enemy: ClientObject): boolean {
    logger.info("On object enemy:", object.name(), enemy.name());

    if (enemy.id() === registry.actor.id()) {
      registry.actorCombat.set(object.id(), true);
    }

    const isEnemy: boolean = isObjectEnemy(object, enemy, this.state);

    if (isEnemy) {
      const seObject: Optional<ServerCreatureObject> = alife().object(object.id());

      /**
       * Set alarm if object is in smart zone.
       */
      if (seObject && seObject.m_smart_terrain_id !== MAX_U16) {
        const smartTerrain: SmartTerrain = alife().object<SmartTerrain>(seObject.m_smart_terrain_id)!;

        smartTerrain.startAlarm();

        if (enemy.id() === registry.actor.id() && smartTerrain.smartTerrainActorControl !== null) {
          smartTerrain.smartTerrainActorControl.onActorAttackSmartTerrain();
        }
      }

      const serverEnemyObject: Optional<ServerCreatureObject> = alife().object(enemy.id());

      if (seObject && serverEnemyObject) {
        if (
          seObject.group_id !== MAX_U16 &&
          registry.simulationObjects.get(seObject.group_id) !== null &&
          serverEnemyObject.group_id !== MAX_U16 &&
          registry.simulationObjects.get(serverEnemyObject.group_id) === null &&
          seObject.position.distance_to_sqr(serverEnemyObject.position) > 900
        ) {
          return false;
        }
      }
    }

    return isEnemy;
  }

  /**
   * todo: Description.
   */
  public hit_callback(
    object: ClientObject,
    amount: TCount,
    direction: Vector,
    who: ClientObject,
    boneId: TNumberId
  ): void {
    if (who === null || amount === 0) {
      return;
    }

    if (who.id() === registry.actor.id()) {
      if (!this.state.overrides?.combat_ignore_keep_when_attacked) {
        this.state.enabled = false;
      }
    }
  }
}
