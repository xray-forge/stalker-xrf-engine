import { createClassIds, EConfigClassId, type IClassIdsGrouped } from "xray16/lib";
import { $fromObject } from "xray16/macros";

/**
 * Set of grouped class IDs defined in the game engine.
 */
export const classIds: IClassIdsGrouped = createClassIds();

/**
 * Artefacts defining config classes.
 */
export const ARTEFACT_CONFIG_CLASSES: LuaTable<EConfigClassId, boolean> = $fromObject({
  [EConfigClassId.ARTEFACT]: true,
  [EConfigClassId.SCRPTART]: true,
} as Record<EConfigClassId, boolean>);

/**
 * Detectors defining config classes.
 */
export const DETECTOR_CONFIG_CLASSES: LuaTable<EConfigClassId, boolean> = $fromObject({
  [EConfigClassId.DET_ELIT]: true,
  [EConfigClassId.DET_SCIE]: true,
  [EConfigClassId.DET_SIMP]: true,
  [EConfigClassId.DET_ADVA]: true,
} as Record<EConfigClassId, boolean>);

/**
 * Ammo defining config classes.
 */
export const AMMO_CONFIG_CLASSES: LuaTable<EConfigClassId, boolean> = $fromObject({
  [EConfigClassId.AMMO_S]: true,
  [EConfigClassId.S_M209]: true,
  [EConfigClassId.S_OG7B]: true,
  [EConfigClassId.S_VOG25]: true,
} as Record<EConfigClassId, boolean>);

/**
 * Addons defining config classes.
 */
export const WEAPON_ADDONS_CONFIG_CLASSES: LuaTable<EConfigClassId, boolean> = $fromObject({
  [EConfigClassId.WP_GLAUN]: true,
  [EConfigClassId.WP_SCOPE]: true,
  [EConfigClassId.WP_SILEN]: true,
} as Record<EConfigClassId, boolean>);

/**
 * Weapons defining config classes.
 */
export const WEAPON_CONFIG_CLASSES: LuaTable<EConfigClassId, boolean> = $fromObject({
  [EConfigClassId.G_F1_S]: true,
  [EConfigClassId.G_RGD5_S]: true,
  [EConfigClassId.WP_AK74]: true,
  [EConfigClassId.WP_ASHTG]: true,
  [EConfigClassId.WP_BM16]: true,
  [EConfigClassId.WP_GROZA]: true,
  [EConfigClassId.WP_HPSA]: true,
  [EConfigClassId.WP_LR300]: true,
  [EConfigClassId.WP_PM]: true,
  [EConfigClassId.WP_RG6]: true,
  [EConfigClassId.WP_RPG7]: true,
  [EConfigClassId.WP_SVD]: true,
  [EConfigClassId.WP_SVU]: true,
  [EConfigClassId.WP_VAL]: true,
} as Record<EConfigClassId, boolean>);
