import { alife, XR_cse_alife_creature_abstract, XR_game_object, XR_vector } from "xray16";

import { MAX_UNSIGNED_16_BIT } from "@/mod/globals/memory";
import { Optional, TName } from "@/mod/lib/types";
import { ISmartTerrain } from "@/mod/scripts/core/alife/SmartTerrain";
import { ESmartTerrainStatus } from "@/mod/scripts/core/alife/SmartTerrainControl";
import { fighting_with_actor_npcs, IStoredObject, registry } from "@/mod/scripts/core/db";
import { get_sim_board } from "@/mod/scripts/core/db/SimBoard";
import { get_sim_obj_registry, ISimObjectsRegistry } from "@/mod/scripts/core/db/SimObjectsRegistry";
import { isObjectInZone } from "@/mod/scripts/utils/checkers/checkers";
import { pickSectionFromCondList } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ActionProcessEnemy");

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

export class ActionProcessEnemy {
  public static isEnemy(
    object: XR_game_object,
    enemy: XR_game_object,
    st: IStoredObject,
    not_check_sim: boolean
  ): boolean {
    if (!object.alive()) {
      return false;
    }

    if (object.critically_wounded()) {
      return true;
    }

    if (st.enabled === false) {
      return true;
    }

    const overrides = st.overrides;
    const obj_id = object.id();
    const state = registry.objects.get(obj_id);

    if (state === null) {
      return true;
    }

    state.enemy_id = enemy.id();

    const active_sector = state.active_sector;

    if (active_sector !== null) {
      // todo: Does not exist.
      // if (sr_danger.check_danger_position(enemy.position(), active_sector) == false) {
      //  return false;
      // }
    }

    if (enemy.id() !== registry.actor.id()) {
      for (const [k, v] of smarts_by_no_assault_zones) {
        const zone = registry.zones.get(k);

        if (zone && (isObjectInZone(object, zone) || isObjectInZone(enemy, zone))) {
          const smart = get_sim_board().get_smart_by_name(v);

          if (
            smart &&
            smart.base_on_actor_control !== null &&
            smart.base_on_actor_control.status !== ESmartTerrainStatus.ALARM
          ) {
            return false;
          }
        }
      }
    }

    const se_enemy = alife().object<XR_cse_alife_creature_abstract>(enemy.id());

    if (se_enemy !== null && se_enemy.m_smart_terrain_id !== null && se_enemy.m_smart_terrain_id !== 65535) {
      const enemy_smart: ISmartTerrain = alife().object<ISmartTerrain>(se_enemy.m_smart_terrain_id) as ISmartTerrain;
      const smart_name: string = enemy_smart.name();

      if (ignored_smart.get(smart_name) === true) {
        // --            obj:enable_memory_object( enemy, false )
        return false;
      }
    }

    if (overrides && overrides.combat_ignore) {
      const ret_value = pickSectionFromCondList(enemy, object, overrides.combat_ignore.condlist);

      if (ret_value === "true") {
        return false;
      }

      return true;
    }

    return true;
  }

  public readonly object: XR_game_object;
  public readonly state: IStoredObject;

  public constructor(object: XR_game_object, state: IStoredObject) {
    this.object = object;
    this.state = state;
  }

  public enemy_callback(object: XR_game_object, enemy: XR_game_object): boolean {
    if (enemy.id() === registry.actor.id()) {
      fighting_with_actor_npcs.set(object.id(), true);
    }

    const isObjectEnemy: boolean = ActionProcessEnemy.isEnemy(object, enemy, this.state, false);

    if (isObjectEnemy) {
      const seObject: Optional<XR_cse_alife_creature_abstract> = alife().object<XR_cse_alife_creature_abstract>(
        object.id()
      );

      /**
       * Set alarm if object is in smart zone.
       */
      if (seObject && seObject.m_smart_terrain_id !== MAX_UNSIGNED_16_BIT) {
        const smartTerrain: ISmartTerrain = alife().object<ISmartTerrain>(seObject.m_smart_terrain_id)!;

        smartTerrain.set_alarm();

        if (enemy.id() === registry.actor.id() && smartTerrain.base_on_actor_control !== null) {
          smartTerrain.base_on_actor_control.actor_attack();
        }
      }

      const seEnemy: Optional<XR_cse_alife_creature_abstract> = alife().object<XR_cse_alife_creature_abstract>(
        enemy.id()
      );

      if (seObject && seEnemy) {
        const sim_obj_registry: ISimObjectsRegistry = get_sim_obj_registry();

        if (
          seObject.group_id !== MAX_UNSIGNED_16_BIT &&
          sim_obj_registry.objects.get(seObject.group_id) !== null &&
          seEnemy.group_id !== MAX_UNSIGNED_16_BIT &&
          sim_obj_registry.objects.get(seEnemy.group_id) === null &&
          seObject.position.distance_to_sqr(seEnemy.position) > 900
        ) {
          return false;
        }
      }
    }

    return isObjectEnemy;
  }

  public hit_callback(
    object: XR_game_object,
    amount: number,
    direction: XR_vector,
    who: XR_game_object,
    boneId: number
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
