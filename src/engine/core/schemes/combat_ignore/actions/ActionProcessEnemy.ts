import { alife, XR_cse_alife_creature_abstract, XR_game_object, XR_vector } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { SimulationBoardManager } from "@/engine/core/managers/interaction/SimulationBoardManager";
import { SmartTerrain } from "@/engine/core/objects/alife/smart/SmartTerrain";
import { ESmartTerrainStatus } from "@/engine/core/objects/alife/smart/SmartTerrainControl";
import { ISchemeCombatIgnoreState } from "@/engine/core/schemes/combat_ignore";
import { isObjectInZone } from "@/engine/core/utils/check/check";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import { TRUE } from "@/engine/lib/constants/words";
import { AnyObject, Optional, TCount, TName, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

const smarts_by_no_assault_zones: LuaTable<TName, string> = {
  ["zat_a2_sr_no_assault"]: "zat_stalker_base_smart",
  ["jup_a6_sr_no_assault"]: "jup_a6",
  ["jup_b41_sr_no_assault"]: "jup_b41",
} as unknown as LuaTable<TName, string>;

const ignored_smart = {
  zat_stalker_base_smart: true,
  jup_b41: true,
  jup_a6: true,
  pri_a16: true,
} as unknown as LuaTable<string, boolean>;

/**
 * todo;
 */
export class ActionProcessEnemy {
  public static isEnemy(object: XR_game_object, enemy: XR_game_object, state: ISchemeCombatIgnoreState): boolean {
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
      for (const [k, v] of smarts_by_no_assault_zones) {
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

    const se_enemy = alife().object<XR_cse_alife_creature_abstract>(enemy.id());

    if (se_enemy !== null && se_enemy.m_smart_terrain_id !== null && se_enemy.m_smart_terrain_id !== 65535) {
      const enemy_smart: SmartTerrain = alife().object<SmartTerrain>(se_enemy.m_smart_terrain_id) as SmartTerrain;
      const smart_name: string = enemy_smart.name();

      if (ignored_smart.get(smart_name) === true) {
        // --            obj:enable_memory_object( enemy, false )
        return false;
      }
    }

    if (overrides && overrides.combat_ignore) {
      const ret_value = pickSectionFromCondList(enemy, object, overrides.combat_ignore.condlist);

      if (ret_value === TRUE) {
        return false;
      }

      return true;
    }

    return true;
  }

  public readonly object: XR_game_object;
  public readonly state: ISchemeCombatIgnoreState;

  /**
   * todo: Description.
   */
  public constructor(object: XR_game_object, state: ISchemeCombatIgnoreState) {
    this.object = object;
    this.state = state;
  }

  /**
   * todo: Description.
   */
  public enemy_callback(object: XR_game_object, enemy: XR_game_object): boolean {
    if (enemy.id() === registry.actor.id()) {
      registry.actorCombat.set(object.id(), true);
    }

    const isObjectEnemy: boolean = ActionProcessEnemy.isEnemy(object, enemy, this.state);

    if (isObjectEnemy) {
      const seObject: Optional<XR_cse_alife_creature_abstract> = alife().object<XR_cse_alife_creature_abstract>(
        object.id()
      );

      /**
       * Set alarm if object is in smart zone.
       */
      if (seObject && seObject.m_smart_terrain_id !== MAX_U16) {
        const smartTerrain: SmartTerrain = alife().object<SmartTerrain>(seObject.m_smart_terrain_id)!;

        smartTerrain.set_alarm();

        if (enemy.id() === registry.actor.id() && smartTerrain.smartTerrainActorControl !== null) {
          smartTerrain.smartTerrainActorControl.actor_attack();
        }
      }

      const serverEnemyObject: Optional<XR_cse_alife_creature_abstract> =
        alife().object<XR_cse_alife_creature_abstract>(enemy.id());

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
    object: XR_game_object,
    amount: TCount,
    direction: XR_vector,
    who: XR_game_object,
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
