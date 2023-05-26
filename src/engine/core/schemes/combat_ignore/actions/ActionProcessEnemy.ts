import { alife, cse_alife_creature_abstract, game_object, vector } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { SimulationBoardManager } from "@/engine/core/managers/interaction/SimulationBoardManager";
import { SmartTerrain } from "@/engine/core/objects/server/smart_terrain/SmartTerrain";
import { ESmartTerrainStatus } from "@/engine/core/objects/server/smart_terrain/types";
import { ISchemeCombatIgnoreState } from "@/engine/core/schemes/combat_ignore";
import { isObjectInZone } from "@/engine/core/utils/check/check";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import { TRUE } from "@/engine/lib/constants/words";
import { AnyObject, Optional, TCount, TName, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

const ignoreSmartTerrains: LuaTable<TName, boolean> = $fromObject<TName, boolean>({
  zat_stalker_base_smart: true,
  jup_b41: true,
  jup_a6: true,
  pri_a16: true,
});

/**
 * todo;
 */
export class ActionProcessEnemy {
  public static isEnemy(object: game_object, enemy: game_object, state: ISchemeCombatIgnoreState): boolean {
    if (!object.alive()) {
      return false;
    }

    if (object.critically_wounded()) {
      return true;
    }

    if (state.enabled === false) {
      return true;
    }

    const overrides: Optional<AnyObject> = state.overrides;
    const objectId: TNumberId = object.id();
    const objectState: IRegistryObjectState = registry.objects.get(objectId);

    if (objectState === null) {
      return true;
    }

    objectState.enemy_id = enemy.id();

    if (enemy.id() !== registry.actor.id()) {
      for (const [k, v] of registry.noCombatZones) {
        const zone = registry.zones.get(k);

        if (zone && (isObjectInZone(object, zone) || isObjectInZone(enemy, zone))) {
          const smart = SimulationBoardManager.getInstance().getSmartTerrainByName(v);

          if (
            smart &&
            smart.smartTerrainActorControl !== null &&
            smart.smartTerrainActorControl.status !== ESmartTerrainStatus.ALARM
          ) {
            return false;
          }
        }
      }
    }

    const serverObject: Optional<cse_alife_creature_abstract> = alife().object<cse_alife_creature_abstract>(enemy.id());

    if (
      serverObject !== null &&
      serverObject.m_smart_terrain_id !== null &&
      serverObject.m_smart_terrain_id !== 65535
    ) {
      const enemy_smart: SmartTerrain = alife().object<SmartTerrain>(serverObject.m_smart_terrain_id) as SmartTerrain;
      const smart_name: string = enemy_smart.name();

      if (ignoreSmartTerrains.get(smart_name)) {
        return false;
      }
    }

    if (overrides && overrides.combat_ignore) {
      return pickSectionFromCondList(enemy, object, overrides.combat_ignore.condlist) !== TRUE;
    }

    return true;
  }

  public readonly object: game_object;
  public readonly state: ISchemeCombatIgnoreState;

  /**
   * todo: Description.
   */
  public constructor(object: game_object, state: ISchemeCombatIgnoreState) {
    this.object = object;
    this.state = state;
  }

  /**
   * todo: Description.
   */
  public enemy_callback(object: game_object, enemy: game_object): boolean {
    if (enemy.id() === registry.actor.id()) {
      registry.actorCombat.set(object.id(), true);
    }

    const isObjectEnemy: boolean = ActionProcessEnemy.isEnemy(object, enemy, this.state);

    if (isObjectEnemy) {
      const seObject: Optional<cse_alife_creature_abstract> = alife().object<cse_alife_creature_abstract>(object.id());

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

      const serverEnemyObject: Optional<cse_alife_creature_abstract> = alife().object<cse_alife_creature_abstract>(
        enemy.id()
      );

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

    return isObjectEnemy;
  }

  /**
   * todo: Description.
   */
  public hit_callback(
    object: game_object,
    amount: TCount,
    direction: vector,
    who: game_object,
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
