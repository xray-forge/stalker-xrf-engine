import { AbstractSchemeManager } from "@/engine/core/ai/scheme";
import { ILogicsOverrides, registry } from "@/engine/core/database";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain/SmartTerrain";
import { combatConfig } from "@/engine/core/schemes/stalker/combat/CombatConfig";
import { ISchemeCombatIgnoreState } from "@/engine/core/schemes/stalker/combat_ignore/index";
import { canObjectSelectAsEnemy } from "@/engine/core/schemes/stalker/danger/utils";
import { startTerrainAlarm } from "@/engine/core/utils/smart_terrain";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { MAX_ALIFE_ID } from "@/engine/lib/constants/memory";
import { GameObject, Nillable, ServerCreatureObject, TCount, TNumberId, Vector } from "@/engine/lib/types";

/**
 * Manager deciding whether an object should accept a potential enemy when the combat ignore scheme is active.
 */
export class CombatProcessEnemyManager extends AbstractSchemeManager<ISchemeCombatIgnoreState> {
  /**
   * Decide whether the object may treat the given object as an enemy, raising smart terrain alarms when it can.
   *
   * @param object - Game object evaluating the potential enemy.
   * @param enemy - Game object considered as an enemy.
   * @returns Whether the enemy may be selected for combat.
   */
  public onObjectEnemy(object: GameObject, enemy: GameObject): boolean {
    if (enemy.id() === ACTOR_ID) {
      registry.actorCombat.set(object.id(), true);
    }

    const canSelectEnemy: boolean = canObjectSelectAsEnemy(object, enemy);

    if (canSelectEnemy) {
      const serverObject: Nillable<ServerCreatureObject> = registry.simulator.object(object.id());

      /**
       * Set alarm if object is in smart zone.
       */
      if (serverObject && serverObject.m_smart_terrain_id !== MAX_ALIFE_ID) {
        const terrain: SmartTerrain = registry.simulator.object<SmartTerrain>(serverObject.m_smart_terrain_id)!;

        startTerrainAlarm(terrain);

        if (enemy.id() === ACTOR_ID && terrain.terrainControl) {
          terrain.terrainControl.onActorAttackSmartTerrain();
        }
      }

      const serverEnemyObject: Nillable<ServerCreatureObject> = registry.simulator.object(enemy.id());

      // todo: Do timer based.
      if (serverObject && serverEnemyObject) {
        if (serverObject.position.distance_to_sqr(serverEnemyObject.position) > combatConfig.ATTACK_DISTANCE_SQR) {
          return false;
        }
      }
    }

    return canSelectEnemy;
  }

  /**
   * Disable combat ignore when the object is hit by the actor unless overrides keep it active.
   *
   * @param object - Game object that was hit.
   * @param amount - Amount of damage dealt by the hit.
   * @param direction - Direction the hit came from.
   * @param who - Game object that caused the hit.
   * @param boneId - Identifier of the bone that was hit.
   */
  public override onHit(
    object: GameObject,
    amount: TCount,
    direction: Vector,
    who: Nillable<GameObject>,
    boneId: TNumberId
  ): void {
    if (!who || amount === 0) {
      return;
    }

    if (who.id() === ACTOR_ID) {
      const overrides: Nillable<ILogicsOverrides> = this.state.overrides;

      if (!overrides || !overrides.combatIgnoreKeepWhenAttacked) {
        this.state.enabled = false;
      }
    }
  }
}
