import { clsid } from "xray16";

import { IClassIdsGrouped } from "@/engine/lib/constants/class_ids";
import type { TClassId } from "@/engine/lib/types";

/**
 * todo;
 */
export function createClassIds(): IClassIdsGrouped {
  if (clsid === null) {
    return {
      artefact: new LuaTable(),
      monster: new LuaTable(),
      weapon: new LuaTable(),
      stalker: new LuaTable(),
    };
  }

  return {
    artefact: createArtefactClassIds(),
    monster: createMonsterClassIds(),
    weapon: createWeaponClassIds(),
    stalker: createStalkerClassIds(),
  };
}

/**
 * todo;
 */
export function updateClassIds(target: IClassIdsGrouped): void {
  target.artefact = createArtefactClassIds();
  target.monster = createMonsterClassIds();
  target.weapon = createWeaponClassIds();
  target.stalker = createStalkerClassIds();
}

/**
 * todo;
 */
export function createMonsterClassIds(): LuaTable<TClassId, boolean> {
  return $fromObject({
    [clsid.bloodsucker_s]: true,
    [clsid.boar_s]: true,
    [clsid.burer_s]: true,
    [clsid.chimera_s]: true,
    [clsid.controller_s]: true,
    [clsid.dog_s]: true,
    [clsid.flesh_s]: true,
    [clsid.gigant_s]: true,
    [clsid.poltergeist_s]: true,
    [clsid.pseudodog_s]: true,
    [clsid.psy_dog_phantom_s]: true,
    [clsid.psy_dog_s]: true,
    [clsid.snork_s]: true,
    [clsid.tushkano_s]: true,
  } as Record<TClassId, boolean>);
}

/**
 * todo;
 */
export function createStalkerClassIds(): LuaTable<TClassId, boolean> {
  return $fromObject({
    [clsid.script_actor]: true,
    [clsid.script_stalker]: true,
  } as Record<TClassId, boolean>);
}

/**
 * todo;
 */
export function createWeaponClassIds(): LuaTable<TClassId, boolean> {
  return $fromObject({
    [clsid.wpn_ak74]: true,
    [clsid.wpn_ak74_s]: true,
    [clsid.wpn_auto_shotgun_s]: true,
    [clsid.wpn_bm16]: true,
    [clsid.wpn_bm16_s]: true,
    [clsid.wpn_fn2000]: true,
    [clsid.wpn_fort]: true,
    [clsid.wpn_grenade_f1]: true,
    [clsid.wpn_grenade_f1_s]: true,
    [clsid.wpn_grenade_fake]: true,
    [clsid.wpn_grenade_launcher]: true,
    [clsid.wpn_grenade_launcher_s]: true,
    [clsid.wpn_grenade_rgd5]: true,
    [clsid.wpn_grenade_rgd5_s]: true,
    [clsid.wpn_grenade_rpg7]: true,
    [clsid.wpn_groza]: true,
    [clsid.wpn_groza_s]: true,
    [clsid.wpn_hpsa]: true,
    [clsid.wpn_hpsa_s]: true,
    [clsid.wpn_knife]: true,
    [clsid.wpn_knife_s]: true,
    [clsid.wpn_lr300]: true,
    [clsid.wpn_lr300_s]: true,
    [clsid.wpn_pm]: true,
    [clsid.wpn_pm_s]: true,
    [clsid.wpn_rg6]: true,
    [clsid.wpn_rg6_s]: true,
    [clsid.wpn_rpg7]: true,
    [clsid.wpn_rpg7_s]: true,
    [clsid.wpn_scope]: true,
    [clsid.wpn_scope_s]: true,
    [clsid.wpn_shotgun]: true,
    [clsid.wpn_shotgun_s]: true,
    [clsid.wpn_silencer]: true,
    [clsid.wpn_silencer_s]: true,
    [clsid.wpn_stat_mgun]: true,
    [clsid.wpn_svd]: true,
    [clsid.wpn_svd_s]: true,
    [clsid.wpn_svu]: true,
    [clsid.wpn_svu_s]: true,
    [clsid.wpn_usp45]: true,
    [clsid.wpn_usp45_s]: true,
    [clsid.wpn_val]: true,
    [clsid.wpn_val_s]: true,
    [clsid.wpn_vintorez]: true,
    [clsid.wpn_vintorez_s]: true,
    [clsid.wpn_walther]: true,
    [clsid.wpn_walther_s]: true,
    [clsid.wpn_wmagaz]: true,
    [clsid.wpn_wmaggl]: true,
  } as Record<TClassId, boolean>);
}

/**
 * todo;
 */
export function createArtefactClassIds(): LuaTable<TClassId, boolean> {
  return $fromObject({
    [clsid.art_bast_artefact]: true,
    [clsid.art_black_drops]: true,
    [clsid.art_dummy]: true,
    [clsid.art_electric_ball]: true,
    [clsid.art_faded_ball]: true,
    [clsid.art_galantine]: true,
    [clsid.art_gravi]: true,
    [clsid.art_gravi_black]: true,
    [clsid.art_mercury_ball]: true,
    [clsid.art_needles]: true,
    [clsid.art_rusty_hair]: true,
    [clsid.art_thorn]: true,
    [clsid.art_zuda]: true,
    [clsid.artefact]: true,
    [clsid.artefact_s]: true,
  } as Record<TClassId, boolean>);
}
