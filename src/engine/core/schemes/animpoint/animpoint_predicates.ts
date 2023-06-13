import { registry } from "@/engine/core/database";
import { EStalkerState } from "@/engine/core/objects/state";
import { IAnimpointAction, IStoryAnimationDescriptor } from "@/engine/core/schemes/animpoint/types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getObjectSmartTerrain } from "@/engine/core/utils/object/object_general";
import { food } from "@/engine/lib/constants/items/food";
import { misc } from "@/engine/lib/constants/items/misc";
import { ClientObject, LuaArray, Optional, TName, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export function animpointPredicateAlways(): boolean {
  return true;
}

/**
 * todo;
 */
function animpointPredicateBread(objectId: TNumberId): boolean {
  const object: Optional<ClientObject> = registry.objects.get(objectId)?.object;

  if (object && eatableVisuals.get(object.get_visual_name()) && object.object(food.bread)) {
    return true;
  }

  return false;
}

/**
 * todo;
 */
function animpointPredicateKolbasa(objectId: TNumberId): boolean {
  const object: Optional<ClientObject> = registry.objects.get(objectId)?.object;

  if (object && eatableVisuals.get(object.get_visual_name()) && object.object(food.kolbasa)) {
    return true;
  }

  return false;
}

/**
 * todo;
 */
function animpointPredicateVodka(objectId: TNumberId): boolean {
  const object: Optional<ClientObject> = registry.objects.get(objectId)?.object;

  if (object && eatableVisuals.get(object.get_visual_name()) && object.object(food.vodka)) {
    return true;
  }

  return false;
}

/**
 * todo;
 */
function animpointPredicateEnergy(objectId: TNumberId): boolean {
  const object: Optional<ClientObject> = registry.objects.get(objectId)?.object;

  if (object && eatableVisuals.get(object.get_visual_name()) && object.object(food.energy_drink)) {
    return true;
  }

  return false;
}

/**
 * todo;
 */
function animpointPredicateGuitar(objectId: TNumberId, isInCamp?: Optional<boolean>): boolean {
  const object: Optional<ClientObject> = registry.objects.get(objectId)?.object;

  if (isInCamp === true && object && object.object(misc.guitar_a)) {
    return true;
  }

  return false;
}

/**
 * todo;
 */
function animpointPredicateHarmonica(objectId: TNumberId, isInCamp?: Optional<boolean>): boolean {
  const object: Optional<ClientObject> = registry.objects.get(objectId)?.object;

  if (
    isInCamp === true &&
    object &&
    harmonicaVisuals.get(object.get_visual_name()) &&
    object.object(misc.harmonica_a)
  ) {
    return true;
  }

  return false;
}

/**
 * todo;
 */
function animpointPredicateWeapon(objectId: TNumberId): boolean {
  const object: Optional<ClientObject> = registry.objects.get(objectId)?.object;

  if (object !== null) {
    const smartTerrainName: Optional<TName> = getObjectSmartTerrain(object)?.name() as Optional<TName>;

    if (smartTerrainName && registry.noCombatSmartTerrains.get(smartTerrainName)) {
      return false;
    }
  }

  return true;
}

/**
 * todo;
 */
const eatableVisuals: LuaTable<TName, boolean> = $fromObject<TName, boolean>({
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

const harmonicaVisuals: LuaTable<TName, boolean> = $fromObject<TName, boolean>({
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
export const associativeTable: LuaTable<TName, IStoryAnimationDescriptor> = $fromObject<
  TName,
  IStoryAnimationDescriptor
>({
  idle: {
    director: $fromArray(["", "_eat_bread", "_eat_kolbasa", "_drink_vodka", "_drink_energy", "_weapon"]),
    listener: $fromArray(["", "_eat_bread", "_eat_kolbasa", "_drink_vodka", "_drink_energy", "_weapon"]),
  },
  harmonica: {
    director: $fromArray(["_harmonica"]),
    listener: $fromArray(["", "_eat_bread", "_eat_kolbasa", "_drink_vodka", "_drink_energy", "_weapon"]),
  },
  guitar: {
    director: $fromArray(["_guitar"]),
    listener: $fromArray(["", "_eat_bread", "_eat_kolbasa", "_drink_vodka", "_drink_energy", "_weapon"]),
  },
  story: {
    director: $fromArray(["", "_weapon"]),
    listener: $fromArray(["", "_eat_bread", "_eat_kolbasa", "_drink_vodka", "_drink_energy", "_weapon"]),
  },
});

/**
 * todo;
 */
export const associations: LuaTable<EStalkerState, LuaArray<IAnimpointAction>> = $fromObject<
  EStalkerState,
  LuaArray<IAnimpointAction>
>({
  [EStalkerState.ANIMPOINT_STAY_WALL]: $fromArray<IAnimpointAction>([
    { name: EStalkerState.ANIMPOINT_STAY_WALL, predicate: animpointPredicateAlways },
    { name: EStalkerState.ANIMPOINT_STAY_WALL_EAT_BREAD, predicate: animpointPredicateBread },
    { name: EStalkerState.ANIMPOINT_STAY_WALL_EAT_KOLBASA, predicate: animpointPredicateKolbasa },
    { name: EStalkerState.ANIMPOINT_STAY_WALL_DRINK_VODKA, predicate: animpointPredicateVodka },
    { name: EStalkerState.ANIMPOINT_STAY_WALL_DRINK_ENERGY, predicate: animpointPredicateEnergy },
    // --  {name = "animpoint_stay_wall_guitar", predicate: animpoint_predicate_guitar},
    // --  {name = "animpoint_stay_wall_harmonica", predicate: animpoint_predicate_harmonica},
    { name: EStalkerState.ANIMPOINT_STAY_WALL_WEAPON, predicate: animpointPredicateWeapon },
  ]),
  [EStalkerState.ANIMPOINT_STAY_TABLE]: $fromArray<IAnimpointAction>([
    { name: EStalkerState.ANIMPOINT_STAY_TABLE, predicate: animpointPredicateAlways },
    { name: EStalkerState.ANIMPOINT_STAY_TABLE_EAT_BREAD, predicate: animpointPredicateBread },
    { name: EStalkerState.ANIMPOINT_STAY_TABLE_EAT_KOLBASA, predicate: animpointPredicateKolbasa },
    { name: EStalkerState.ANIMPOINT_STAY_TABLE_DRINK_VODKA, predicate: animpointPredicateVodka },
    { name: EStalkerState.ANIMPOINT_STAY_TABLE_DRINK_ENERGY, predicate: animpointPredicateEnergy },
    // --  {name = "animpoint_stay_table_guitar", predicate: animpoint_predicate_guitar},
    // --  {name = "animpoint_stay_table_harmonica", predicate: animpoint_predicate_harmonica},
    { name: EStalkerState.ANIMPOINT_STAY_TABLE_WEAPON, predicate: animpointPredicateWeapon },
  ]),
  [EStalkerState.ANIMPOINT_SIT_HIGH]: $fromArray<IAnimpointAction>([
    { name: EStalkerState.ANIMPOINT_SIT_HIGH, predicate: animpointPredicateAlways },
    { name: EStalkerState.ANIMPOINT_SIT_HIGH_EAT_BREAD, predicate: animpointPredicateBread },
    { name: EStalkerState.ANIMPOINT_SIT_HIGH_EAT_KOLBASA, predicate: animpointPredicateKolbasa },
    { name: EStalkerState.ANIMPOINT_SIT_HIGH_DRINK_VODKA, predicate: animpointPredicateVodka },
    { name: EStalkerState.ANIMPOINT_SIT_HIGH_DRINK_ENERGY, predicate: animpointPredicateEnergy },
    // --  {name = "animpoint_sit_high_guitar", predicate: animpoint_predicate_guitar},
    { name: EStalkerState.ANIMPOINT_SIT_HIGH_HARMONICA, predicate: animpointPredicateHarmonica },
    // --  {name = "animpoint_sit_high_weapon", predicate: animpoint_predicate_weapon},
  ]),
  [EStalkerState.ANIMPOINT_SIT_NORMAL]: $fromArray<IAnimpointAction>([
    { name: EStalkerState.ANIMPOINT_SIT_NORMAL, predicate: animpointPredicateAlways },
    { name: EStalkerState.ANIMPOINT_SIT_NORMAL_EAT_BREAD, predicate: animpointPredicateBread },
    { name: EStalkerState.ANIMPOINT_SIT_NORMAL_EAT_KOLBASA, predicate: animpointPredicateKolbasa },
    { name: EStalkerState.ANIMPOINT_SIT_NORMAL_DRINK_VODKA, predicate: animpointPredicateVodka },
    { name: EStalkerState.ANIMPOINT_SIT_NORMAL_DRINK_ENERGY, predicate: animpointPredicateEnergy },
    { name: EStalkerState.ANIMPOINT_SIT_NORMAL_GUITAR, predicate: animpointPredicateGuitar },
    // --  {name = "animpoint_sit_normal_harmonica", predicate: animpoint_predicate_harmonica},
    // --  {name = "animpoint_sit_normal_weapon", predicate: animpoint_predicate_weapon},
  ]),
  [EStalkerState.ANIMPOINT_SIT_LOW]: $fromArray<IAnimpointAction>([
    { name: EStalkerState.ANIMPOINT_SIT_LOW, predicate: animpointPredicateAlways },
    { name: EStalkerState.ANIMPOINT_SIT_LOW_EAT_BREAD, predicate: animpointPredicateBread },
    { name: EStalkerState.ANIMPOINT_SIT_LOW_EAT_KOLBASA, predicate: animpointPredicateKolbasa },
    { name: EStalkerState.ANIMPOINT_SIT_LOW_DRINK_VODKA, predicate: animpointPredicateVodka },
    { name: EStalkerState.ANIMPOINT_SIT_LOW_DRINK_ENERGY, predicate: animpointPredicateEnergy },
    { name: EStalkerState.ANIMPOINT_SIT_LOW_GUITAR, predicate: animpointPredicateGuitar },
    { name: EStalkerState.ANIMPOINT_SIT_LOW_HARMONICA, predicate: animpointPredicateHarmonica },
    // --  {name = "animpoint_sit_low_weapon", predicate: animpoint_predicate_weapon},
  ]),
  [EStalkerState.WALKER_CAMP]: $fromArray<IAnimpointAction>([
    { name: EStalkerState.PLAY_GUITAR, predicate: animpointPredicateGuitar },
    { name: EStalkerState.PLAY_HARMONICA, predicate: animpointPredicateHarmonica },
  ]),
} as Record<EStalkerState, LuaArray<IAnimpointAction>>);
