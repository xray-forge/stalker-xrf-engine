import { XR_game_object } from "xray16";

import { registry } from "@/engine/core/database";
import { SmartTerrain } from "@/engine/core/objects/server/smart_terrain/SmartTerrain";
import { EStalkerState } from "@/engine/core/objects/state";
import { IAnimpointAction } from "@/engine/core/schemes/animpoint/types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getObjectSmartTerrain } from "@/engine/core/utils/object";
import { misc } from "@/engine/lib/constants/items/misc";
import { LuaArray, Optional, TName, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
const eatable_visuals: LuaTable<TName, boolean> = $fromObject<TName, boolean>({
  ["actors\\stalker_hero\\stalker_hero_1"]: true,
  ["actors\\stalker_hero\\stalker_hero_novice_1"]: true,
  ["actors\\stalker_hero\\stalker_hero_stalker_1"]: true,
  ["actors\\stalker_hero\\stalker_hero_dolg_1"]: true,
  ["actors\\stalker_hero\\stalker_hero_dolg_2"]: true,
  ["actors\\stalker_hero\\stalker_hero_freedom_1"]: true,
  ["actors\\stalker_hero\\stalker_hero_freedom_2"]: true,
  ["actors\\stalker_hero\\stalker_hero_specops"]: true,
  ["actors\\stalker_hero\\stalker_hero_military"]: true,
  ["actors\\stalker_hero\\stalker_hero_neutral_nauchniy"]: true,
  ["actors\\stalker_hero\\stalker_hero_cs_heavy"]: true,
  ["actors\\stalker_hero\\stalker_hero_exo"]: true,
  ["actors\\stalker_bandit\\stalker_bandit_3"]: true,
  ["actors\\stalker_bandit\\stalker_bandit_3_face_1"]: true,
  ["actors\\stalker_bandit\\stalker_bandit_3_mask"]: true,
  ["actors\\stalker_bandit\\stalker_bandit_4"]: true,
  ["actors\\stalker_dolg\\stalker_dolg_2_face_1"]: true,
  ["actors\\stalker_dolg\\stalker_dolg_1_face_1"]: true,
  ["actors\\stalker_dolg\\stalker_dolg_3_face_1"]: true,
  ["actors\\stalker_freedom\\stalker_freedom_1_face_1"]: true,
  ["actors\\stalker_freedom\\stalker_freedom_2_face_1"]: true,
  ["actors\\stalker_freedom\\stalker_freedom_2_face_2"]: true,
  ["actors\\stalker_freedom\\stalker_freedom_3"]: true,
  ["actors\\stalker_freedom\\stalker_freedom_3_face_1"]: true,
  ["actors\\stalker_monolith\\stalker_monolith_1_face_1"]: true,
  ["actors\\stalker_nebo\\stalker_nebo_2_face_1"]: true,
  ["actors\\stalker_neutral\\stalker_neutral_1_face_1"]: true,
  ["actors\\stalker_neutral\\stalker_neutral_1_face_2"]: true,
  ["actors\\stalker_neutral\\stalker_neutral_1_face_3"]: true,
  ["actors\\stalker_bandit\\stalker_bandit_3_face_3"]: true,
  ["actors\\stalker_neutral\\stalker_neutral_2_face_1"]: true,
  ["actors\\stalker_neutral\\stalker_neutral_2_face_2"]: true,
  ["actors\\stalker_neutral\\stalker_neutral_2_face_3"]: true,
  ["actors\\stalker_neutral\\stalker_neutral_2_face_4"]: true,
  ["actors\\stalker_neutral\\stalker_neutral_2_face_5"]: true,
  ["actors\\stalker_neutral\\stalker_neutral_2_face_6"]: true,
  ["actors\\stalker_neutral\\stalker_neutral_2_face_7"]: true,
  ["actors\\stalker_bandit\\stalker_bandit_3_face_2"]: true,
  ["actors\\stalker_neutral\\stalker_neutral_3_face_1"]: true,
  ["actors\\stalker_neutral\\stalker_neutral_nauchniy_face_1"]: true,
  ["actors\\stalker_neutral\\stalker_neutral_nauchniy_face_3"]: true,
  ["actors\\stalker_soldier\\stalker_soldier_1"]: true,
  ["actors\\stalker_soldier\\stalker_soldier_1_face_1"]: true,
  ["actors\\stalker_soldier\\stalker_solider_2"]: true,
  ["actors\\stalker_soldier\\stalker_solider_2_face_1"]: true,
  ["actors\\stalker_soldier\\stalker_solider_3_face_1"]: true,
  ["actors\\stalker_soldier\\stalker_solider_ecolog_face_1"]: true,
  ["actors\\stalker_ucheniy\\stalker_ucheniy_1_face_1"]: true,
  ["actors\\stalker_ucheniy\\stalker_ucheniy_1_face_2"]: true,
  ["actors\\stalker_zombied\\stalker_zombied_1"]: true,
  ["actors\\stalker_zombied\\stalker_zombied_3"]: true,
  ["actors\\stalker_neutral\\stalker_neutral_nauchniy_face_2"]: true,
});

export type TEatableVisual = keyof typeof eatable_visuals;

const harmonica_visuals: LuaTable<TName, boolean> = $fromObject<TName, boolean>({
  ["actors\\stalker_hero\\stalker_hero_1"]: true,
  ["actors\\stalker_hero\\stalker_hero_novice_1"]: true,
  ["actors\\stalker_hero\\stalker_hero_stalker_1"]: true,
  ["actors\\stalker_hero\\stalker_hero_dolg_1"]: true,
  ["actors\\stalker_hero\\stalker_hero_dolg_2"]: true,
  ["actors\\stalker_hero\\stalker_hero_freedom_1"]: true,
  ["actors\\stalker_hero\\stalker_hero_freedom_2"]: true,
  ["actors\\stalker_hero\\stalker_hero_specops"]: true,
  ["actors\\stalker_hero\\stalker_hero_military"]: true,
  ["actors\\stalker_hero\\stalker_hero_neutral_nauchniy"]: true,
  ["actors\\stalker_hero\\stalker_hero_cs_heavy"]: true,
  ["actors\\stalker_hero\\stalker_hero_exo"]: true,
  ["actors\\stalker_bandit\\stalker_bandit_1"]: true,
  ["actors\\stalker_bandit\\stalker_bandit_2"]: true,
  ["actors\\stalker_bandit\\stalker_bandit_3"]: true,
  ["actors\\stalker_bandit\\stalker_bandit_3_face_1"]: true,
  ["actors\\stalker_bandit\\stalker_bandit_3_mask"]: true,
  ["actors\\stalker_bandit\\stalker_bandit_4"]: true,
  ["actors\\stalker_dolg\\stalker_dolg_2_face_1"]: true,
  ["actors\\stalker_dolg\\stalker_dolg_1_face_1"]: true,
  ["actors\\stalker_dolg\\stalker_dolg_2_mask"]: true,
  ["actors\\stalker_dolg\\stalker_dolg_3_face_1"]: true,
  ["actors\\stalker_freedom\\stalker_freedom_1_face_1"]: true,
  ["actors\\stalker_freedom\\stalker_freedom_2_face_1"]: true,
  ["actors\\stalker_freedom\\stalker_freedom_2_face_2"]: true,
  ["actors\\stalker_freedom\\stalker_freedom_2_mask"]: true,
  ["actors\\stalker_freedom\\stalker_freedom_3"]: true,
  ["actors\\stalker_freedom\\stalker_freedom_3_face_1"]: true,
  ["actors\\stalker_monolith\\stalker_monolith_1_face_1"]: true,
  ["actors\\stalker_nebo\\stalker_nebo_2_face_1"]: true,
  ["actors\\stalker_neutral\\stalker_neutral_1"]: true,
  ["actors\\stalker_neutral\\stalker_neutral_1_face_1"]: true,
  ["actors\\stalker_neutral\\stalker_neutral_1_face_2"]: true,
  ["actors\\stalker_neutral\\stalker_neutral_1_face_3"]: true,
  ["actors\\stalker_bandit\\stalker_bandit_3_face_3"]: true,
  ["actors\\stalker_neutral\\stalker_neutral_2_face_1"]: true,
  ["actors\\stalker_neutral\\stalker_neutral_2_face_2"]: true,
  ["actors\\stalker_neutral\\stalker_neutral_2_face_3"]: true,
  ["actors\\stalker_neutral\\stalker_neutral_2_face_4"]: true,
  ["actors\\stalker_neutral\\stalker_neutral_2_face_5"]: true,
  ["actors\\stalker_neutral\\stalker_neutral_2_face_6"]: true,
  ["actors\\stalker_neutral\\stalker_neutral_2_face_7"]: true,
  ["actors\\stalker_bandit\\stalker_bandit_3_face_2"]: true,
  ["actors\\stalker_neutral\\stalker_neutral_2_mask"]: true,
  ["actors\\stalker_neutral\\stalker_neutral_3_face_1"]: true,
  ["actors\\stalker_neutral\\stalker_neutral_nauchniy_face_1"]: true,
  ["actors\\stalker_neutral\\stalker_neutral_nauchniy_face_3"]: true,
  ["actors\\stalker_soldier\\stalker_soldier_1"]: true,
  ["actors\\stalker_soldier\\stalker_soldier_1_face_1"]: true,
  ["actors\\stalker_soldier\\stalker_solider_2"]: true,
  ["actors\\stalker_soldier\\stalker_solider_2_face_1"]: true,
  ["actors\\stalker_soldier\\stalker_solider_3_face_1"]: true,
  ["actors\\stalker_soldier\\stalker_solider_ecolog_face_1"]: true,
  ["actors\\stalker_ucheniy\\stalker_ucheniy_1_face_1"]: true,
  ["actors\\stalker_ucheniy\\stalker_ucheniy_1_face_2"]: true,
  ["actors\\stalker_zombied\\stalker_zombied_1"]: true,
  ["actors\\stalker_zombied\\stalker_zombied_2"]: true,
  ["actors\\stalker_zombied\\stalker_zombied_3"]: true,
  ["actors\\stalker_zombied\\stalker_zombied_4"]: true,
  ["actors\\stalker_neutral\\stalker_neutral_nauchniy_face_2"]: true,
});

/**
 * todo;
 */
function animpointPredicateAlways(): boolean {
  return true;
}

// todo: Optimize.
function animpoint_predicate_bread(npc_id: number): boolean {
  if (
    registry.objects.get(npc_id) &&
    registry.objects.get(npc_id).object &&
    eatable_visuals.get(registry.objects.get(npc_id).object!.get_visual_name()) &&
    registry.objects.get(npc_id).object!.object("bread")
  ) {
    return true;
  }

  return false;
}

/**
 * todo;
 */
function animpoint_predicate_kolbasa(npc_id: number): boolean {
  if (
    registry.objects.get(npc_id) &&
    registry.objects.get(npc_id).object &&
    eatable_visuals.get(registry.objects.get(npc_id).object!.get_visual_name()) &&
    registry.objects.get(npc_id).object!.object("kolbasa")
  ) {
    return true;
  }

  return false;
}

/**
 * todo;
 */
function animpoint_predicate_vodka(npc_id: number): boolean {
  if (
    registry.objects.get(npc_id) &&
    registry.objects.get(npc_id).object &&
    eatable_visuals.get(registry.objects.get(npc_id).object!.get_visual_name()) &&
    registry.objects.get(npc_id).object!.object("vodka")
  ) {
    return true;
  }

  return false;
}

/**
 * todo;
 */
function animpoint_predicate_energy(npc_id: number): boolean {
  if (
    registry.objects.get(npc_id) &&
    registry.objects.get(npc_id).object &&
    eatable_visuals.get(registry.objects.get(npc_id).object!.get_visual_name()) &&
    registry.objects.get(npc_id).object!.object("energy_drink")
  ) {
    return true;
  }

  return false;
}

/**
 * todo;
 */
function animpoint_predicate_guitar(npc_id: number, is_in_camp?: Optional<boolean>): boolean {
  if (
    is_in_camp === true &&
    registry.objects.get(npc_id) &&
    registry.objects.get(npc_id).object &&
    registry.objects.get(npc_id).object!.object(misc.guitar_a)
  ) {
    return true;
  }

  return false;
}

/**
 * todo;
 */
function animpoint_predicate_harmonica(npc_id: number, is_in_camp?: Optional<boolean>): boolean {
  if (
    is_in_camp === true &&
    registry.objects.get(npc_id) &&
    registry.objects.get(npc_id).object &&
    harmonica_visuals.get(registry.objects.get(npc_id).object!.get_visual_name()) &&
    registry.objects.get(npc_id).object!.object(misc.harmonica_a)
  ) {
    return true;
  }

  return false;
}

/**
 * todo;
 */
function animpointPredicateWeapon(objectId: TNumberId): boolean {
  const object: Optional<XR_game_object> = registry.objects.get(objectId)?.object;

  if (object !== null) {
    const smartTerrain: Optional<SmartTerrain> = getObjectSmartTerrain(object);

    if (smartTerrain) {
      for (const [index, smartTerrainName] of registry.noWeaponSmartTerrains) {
        if (smartTerrain.name() === smartTerrainName) {
          return false;
        }
      }
    }
  }

  return true;
}

/**
 * todo;
 */
export const associations: LuaTable<string, LuaArray<IAnimpointAction>> = $fromObject<
  string,
  LuaArray<IAnimpointAction>
>({
  animpoint_stay_wall: $fromArray<IAnimpointAction>([
    { name: EStalkerState.ANIMPOINT_STAY_WALL, predicate: animpointPredicateAlways },
    { name: EStalkerState.ANIMPOINT_STAY_WALL_EAT_BREAD, predicate: animpoint_predicate_bread },
    { name: EStalkerState.ANIMPOINT_STAY_WALL_EAT_KOLBASA, predicate: animpoint_predicate_kolbasa },
    { name: EStalkerState.ANIMPOINT_STAY_WALL_DRINK_VODKA, predicate: animpoint_predicate_vodka },
    { name: EStalkerState.ANIMPOINT_STAY_WALL_DRINK_ENERGY, predicate: animpoint_predicate_energy },
    // --  {name = "animpoint_stay_wall_guitar", predicate: animpoint_predicate_guitar},
    // --  {name = "animpoint_stay_wall_harmonica", predicate: animpoint_predicate_harmonica},
    { name: EStalkerState.ANIMPOINT_STAY_WALL_WEAPON, predicate: animpointPredicateWeapon },
  ]),
  animpoint_stay_table: $fromArray<IAnimpointAction>([
    { name: EStalkerState.ANIMPOINT_STAY_TABLE, predicate: animpointPredicateAlways },
    { name: EStalkerState.ANIMPOINT_STAY_TABLE_EAT_BREAD, predicate: animpoint_predicate_bread },
    { name: EStalkerState.ANIMPOINT_STAY_TABLE_EAT_KOLBASA, predicate: animpoint_predicate_kolbasa },
    { name: EStalkerState.ANIMPOINT_STAY_TABLE_DRINK_VODKA, predicate: animpoint_predicate_vodka },
    { name: EStalkerState.ANIMPOINT_STAY_TABLE_DRINK_ENERGY, predicate: animpoint_predicate_energy },
    // --  {name = "animpoint_stay_table_guitar", predicate: animpoint_predicate_guitar},
    // --  {name = "animpoint_stay_table_harmonica", predicate: animpoint_predicate_harmonica},
    { name: EStalkerState.ANIMPOINT_STAY_TABLE_WEAPON, predicate: animpointPredicateWeapon },
  ]),
  animpoint_sit_high: $fromArray<IAnimpointAction>([
    { name: EStalkerState.ANIMPOINT_SIT_HIGH, predicate: animpointPredicateAlways },
    { name: EStalkerState.ANIMPOINT_SIT_HIGH_EAT_BREAD, predicate: animpoint_predicate_bread },
    { name: EStalkerState.ANIMPOINT_SIT_HIGH_EAT_KOLBASA, predicate: animpoint_predicate_kolbasa },
    { name: EStalkerState.ANIMPOINT_SIT_HIGH_DRINK_VODKA, predicate: animpoint_predicate_vodka },
    { name: EStalkerState.ANIMPOINT_SIT_HIGH_DRINK_ENERGY, predicate: animpoint_predicate_energy },
    // --  {name = "animpoint_sit_high_guitar", predicate: animpoint_predicate_guitar},
    { name: EStalkerState.ANIMPOINT_SIT_HIGH_HARMONICA, predicate: animpoint_predicate_harmonica },
    // --  {name = "animpoint_sit_high_weapon", predicate: animpoint_predicate_weapon},
  ]),
  animpoint_sit_normal: $fromArray<IAnimpointAction>([
    { name: EStalkerState.ANIMPOINT_SIT_NORMAL, predicate: animpointPredicateAlways },
    { name: EStalkerState.ANIMPOINT_SIT_NORMAL_EAT_BREAD, predicate: animpoint_predicate_bread },
    { name: EStalkerState.ANIMPOINT_SIT_NORMAL_EAT_KOLBASA, predicate: animpoint_predicate_kolbasa },
    { name: EStalkerState.ANIMPOINT_SIT_NORMAL_DRINK_VODKA, predicate: animpoint_predicate_vodka },
    { name: EStalkerState.ANIMPOINT_SIT_NORMAL_DRINK_ENERGY, predicate: animpoint_predicate_energy },
    { name: EStalkerState.ANIMPOINT_SIT_NORMAL_GUITAR, predicate: animpoint_predicate_guitar },
    // --  {name = "animpoint_sit_normal_harmonica", predicate: animpoint_predicate_harmonica},
    // --  {name = "animpoint_sit_normal_weapon", predicate: animpoint_predicate_weapon},
  ]),
  animpoint_sit_low: $fromArray<IAnimpointAction>([
    { name: EStalkerState.ANIMPOINT_SIT_LOW, predicate: animpointPredicateAlways },
    { name: EStalkerState.ANIMPOINT_SIT_LOW_EAT_BREAD, predicate: animpoint_predicate_bread },
    { name: EStalkerState.ANIMPOINT_SIT_LOW_EAT_KOLBASA, predicate: animpoint_predicate_kolbasa },
    { name: EStalkerState.ANIMPOINT_SIT_LOW_DRINK_VODKA, predicate: animpoint_predicate_vodka },
    { name: EStalkerState.ANIMPOINT_SIT_LOW_DRINK_ENERGY, predicate: animpoint_predicate_energy },
    { name: EStalkerState.ANIMPOINT_SIT_LOW_GUITAR, predicate: animpoint_predicate_guitar },
    { name: EStalkerState.ANIMPOINT_SIT_LOW_HARMONICA, predicate: animpoint_predicate_harmonica },
    // --  {name = "animpoint_sit_low_weapon", predicate: animpoint_predicate_weapon},
  ]),
  walker_camp: $fromArray<IAnimpointAction>([
    { name: EStalkerState.PLAY_GUITAR, predicate: animpoint_predicate_guitar },
    { name: EStalkerState.PLAY_HARMONICA, predicate: animpoint_predicate_harmonica },
  ]),
});
