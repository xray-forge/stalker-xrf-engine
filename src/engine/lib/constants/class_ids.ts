/* eslint sort-keys-fix/sort-keys-fix: "error" */

import { createClassIds } from "@/engine/core/utils/class_ids_list";
import { TClassId } from "@/engine/lib/types";

/**
 * Definition of grouped class IDs used in the xray engine for object checks / comparison.
 */
export interface IClassIdsGrouped {
  artefact: LuaTable<TClassId, boolean>;
  monster: LuaTable<TClassId, boolean>;
  stalker: LuaTable<TClassId, boolean>;
  weapon: LuaTable<TClassId, boolean>;
}

/**
 * Set of grouped class IDs defined in the game engine.
 */
export const classIds: IClassIdsGrouped = createClassIds();

/**
 * List of possible game type class IDs.
 */
export const gameClassId = {
  CL_AHUNT: "CL_AHUNT",
  CL_CTA: "CL_CTA",
  CL_DM: "CL_DM",
  CL_SINGL: "CL_SINGL",
  CL_TDM: "CL_TDM",
  SV_AHUNT: "SV_AHUNT",
  SV_CTA: "SV_CTA",
  SV_DM: "SV_DM",
  SV_SINGL: "SV_SINGL",
  SV_TDM: "SV_TDM",
  UI_AHUNT: "UI_AHUNT",
  UI_CTA: "UI_CTA",
  UI_DM: "UI_DM",
  UI_SINGL: "UI_SINGL",
  UI_TDM: "UI_TDM",
} as const;

/**
 * Type definition of possible game class ID string.
 */
export type TGameClassId = (typeof gameClassId)[keyof typeof gameClassId];

/**
 * C++ declared class identifiers from client side.
 * Matches class names in C++ counterpart.
 */
export enum EGameObjectClass {
  CAI_Bloodsucker = "CAI_Bloodsucker",
  CAI_Boar = "CAI_Boar",
  CAI_Dog = "CAI_Dog",
  CAI_Flesh = "CAI_Flesh",
  CAI_PseudoDog = "CAI_PseudoDog",
  CAI_Stalker = "CAI_Stalker",
  CActor = "CActor",
  CAdvancedDetector = "CAdvancedDetector",
  CAntirad = "CAntirad",
  CBottleItem = "CBottleItem",
  CBurer = "CBurer",
  CCat = "CCat",
  CChimera = "CChimera",
  CController = "CController",
  CDestroyablePhysicsObject = "CDestroyablePhysicsObject",
  CElectricBall = "CElectricBall",
  CEliteDetector = "CEliteDetector",
  CExplosiveItem = "CExplosiveItem",
  CF1 = "CF1",
  CFoodItem = "CFoodItem",
  CFracture = "CFracture",
  CGrenadeLauncher = "CGrenadeLauncher",
  CHairsZone = "CHairsZone",
  CHelicopter = "CHelicopter",
  CHelmet = "CHelmet",
  CInventoryBox = "CInventoryBox",
  CLevelChanger = "CLevelChanger",
  CMedkit = "CMedkit",
  CMincer = "CMincer",
  CMosquitoBald = "CMosquitoBald",
  CPda = "CPda",
  CPhysicObject = "CPhysicObject",
  CPoltergeist = "CPoltergeist",
  CPseudoGigant = "CPseudoGigant",
  CPsyDog = "CPsyDog",
  CPsyDogPhantom = "CPsyDogPhantom",
  CRGD5 = "CRGD5",
  CRadioactiveZone = "CRadioactiveZone",
  CScientificDetector = "CScientificDetector",
  CScope = "CScope",
  CSilencer = "CSilencer",
  CSimpleDetector = "CSimpleDetector",
  CSnork = "CSnork",
  CStalkerOutfit = "CStalkerOutfit",
  CTorch = "CTorch",
  CTorridZone = "CTorridZone",
  CTushkano = "CTushkano",
  CWeaponAK74 = "CWeaponAK74",
  CWeaponAmmo = "CWeaponAmmo",
  CWeaponAutomaticShotgun = "CWeaponAutomaticShotgun",
  CWeaponBM16 = "CWeaponBM16",
  CWeaponGroza = "CWeaponGroza",
  CWeaponHPSA = "CWeaponHPSA",
  CWeaponKnife = "CWeaponKnife",
  CWeaponBinoculars = "CWeaponBinoculars",
  CWeaponLR300 = "CWeaponLR300",
  CWeaponPM = "CWeaponPM",
  CWeaponRG6 = "CWeaponRG6",
  CWeaponRPG7 = "CWeaponRPG7",
  CWeaponSVD = "CWeaponSVD",
  CWeaponSVU = "CWeaponSVU",
  CWeaponShotgun = "CWeaponShotgun",
  CWeaponUSP45 = "CWeaponUSP45",
  CWeaponVal = "CWeaponVal",
  CWeaponVintorez = "CWeaponVintorez",
  CWeaponWalther = "CWeaponWalther",
  CZombie = "CZombie",
  ce_smart_zone = "ce_smart_zone",
  hanging_lamp = "hanging_lamp",
  smart_cover_object = "smart_cover_object",
}

/**
 * Enumeration of class identifiers used in LTX configurations linking.
 */
export enum EConfigClassId {
  AI_STL_S = "AI_STL_S",
  AMMO_S = "AMMO_S",
  ARTEFACT = "ARTEFACT",
  C_HLCP_S = "C_HLCP_S",
  DET_ADVA = "DET_ADVA",
  DET_ELIT = "DET_ELIT",
  DET_SCIE = "DET_SCIE",
  DET_SIMP = "DET_SIMP",
  E_HLMET = "E_HLMET",
  E_STLK = "E_STLK",
  G_F1_S = "G_F1_S",
  G_RGD5_S = "G_RGD5_S",
  LVL_CHNG = "LVL_CHNG",
  MAIN_MNU = "MAIN_MNU",
  ON_OFF_S = "ON_OFF_S",
  O_DSTR_S = "O_DSTR_S",
  O_PHYS_S = "O_PHYS_S",
  SCRPTART = "SCRPTART",
  SMART_TERRAIN = "SMRTTRRN",
  SMRT_C_S = "SMRT_C_S",
  SM_BLOOD = "SM_BLOOD",
  SM_BOARW = "SM_BOARW",
  SM_BURER = "SM_BURER",
  SM_CAT_S = "SM_CAT_S",
  SM_CHIMS = "SM_CHIMS",
  SM_CONTR = "SM_CONTR",
  SM_DOG_F = "SM_DOG_F",
  SM_DOG_P = "SM_DOG_P",
  SM_DOG_S = "SM_DOG_S",
  SM_FLESH = "SM_FLESH",
  SM_GIANT = "SM_GIANT",
  SM_IZLOM = "SM_IZLOM",
  SM_POLTR = "SM_POLTR",
  SM_P_DOG = "SM_P_DOG",
  SM_SNORK = "SM_SNORK",
  SM_TUSHK = "SM_TUSHK",
  SM_ZOMBI = "SM_ZOMBI",
  SO_HLAMP = "SO_HLAMP",
  SPC_RS_S = "SPC_RS_S",
  S_ACTOR = "S_ACTOR",
  S_ANTIR = "S_ANTIR",
  S_BANDG = "S_BANDG",
  S_BOTTL = "S_BOTTL",
  S_EXPLO = "S_EXPLO",
  S_FOOD = "S_FOOD",
  S_INVBOX = "S_INVBOX",
  S_M209 = "S_M209",
  S_MEDKI = "S_MEDKI",
  S_OG7B = "S_OG7B",
  S_PDA = "S_PDA",
  S_VOG25 = "S_VOG25",
  TORCH_S = "TORCH_S",
  WP_AK74 = "WP_AK74",
  WP_ASHTG = "WP_ASHTG",
  WP_BINOC = "WP_BINOC",
  WP_BM16 = "WP_BM16",
  WP_GLAUN = "WP_GLAUN",
  WP_GROZA = "WP_GROZA",
  WP_HPSA = "WP_HPSA",
  WP_KNIFE = "WP_KNIFE",
  WP_LR300 = "WP_LR300",
  WP_PM = "WP_PM",
  WP_RG6 = "WP_RG6",
  WP_RPG7 = "WP_RPG7",
  WP_SCOPE = "WP_SCOPE",
  WP_SHOTG = "WP_SHOTG",
  WP_SILEN = "WP_SILEN",
  WP_SVD = "WP_SVD",
  WP_SVU = "WP_SVU",
  WP_USP45 = "WP_USP45",
  WP_VAL = "WP_VAL",
  WP_VINT = "WP_VINT",
  WP_WALTH = "WP_WALTH",
  ZS_BFUZZ = "ZS_BFUZZ",
  ZS_GALAN = "ZS_GALAN",
  ZS_MBALD = "ZS_MBALD",
  ZS_MINCE = "ZS_MINCE",
  ZS_RADIO = "ZS_RADIO",
  ZS_TORRD = "ZS_TORRD",
}

/**
 * Script class IDs for linking of serve-client side implementation.
 * Later can be got from game object.
 */
export enum EScriptClassId {
  ARTEFACT_S = "artefact_s",
  BLOODSUCKER_S = "bloodsucker_s",
  BOAR_S = "boar_s",
  BURER_S = "burer_s",
  CAT_S = "cat_s",
  CHIMERA_S = "chimera_s",
  CONTROLLER_S = "controller_s",
  DESTRPHYS_S = "destrphys_s",
  DETECTOR_ADVANCED_S = "detector_advanced_s",
  DETECTOR_ELITE_S = "detector_elite_s",
  DETECTOR_SCIENTIFIC_S = "detector_scientific_s",
  DETECTOR_SIMPLE_S = "detector_simple_s",
  DEVICE_TORCH_S = "device_torch_s",
  DOG_S = "dog_s",
  EQU_HELMET_S = "equ_helmet_s",
  EQU_STALKER_S = "equ_stalker_s",
  FLESH_S = "flesh_s",
  FRACTURE_S = "fracture_s",
  GIGANT_S = "gigant_s",
  HLAMP_S = "hlamp_s",
  INVENTORY_BOX_S = "inventory_box_s",
  LEVEL_CHANGER_S = "level_changer_s",
  MAIN_MENU = "main_menu",
  OBJ_ANTIRAD_S = "obj_antirad_s",
  OBJ_BANDAGE_S = "obj_bandage_s",
  OBJ_BOTTLE_S = "obj_bottle_s",
  OBJ_EXPLOSIVE_S = "obj_explosive_s",
  OBJ_FOOD_S = "obj_food_s",
  OBJ_MEDKIT_S = "obj_medkit_s",
  OBJ_PDA_S = "obj_pda_s",
  ONLINE_OFFLINE_GROUP_S = "online_offline_group_s",
  POLTERGEIST_S = "poltergeist_s",
  PSEUDODOG_S = "pseudodog_s",
  PSY_DOG_PHANTOM_S = "psy_dog_phantom_s",
  PSY_DOG_S = "psy_dog_s",
  SCRIPT_ACTOR = "script_actor",
  SCRIPT_HELI = "script_heli",
  SCRIPT_PHYS = "script_phys",
  SCRIPT_RESTRICTOR = "script_restr",
  SCRIPT_STALKER = "script_stalker",
  SMARTCOVER_S = "smartcover_s",
  SMART_TERRAIN = "smart_terrain",
  SNORK_S = "snork_s",
  TUSHKANO_S = "tushkano_s",
  WPN_AK74_S = "wpn_ak74_s",
  WPN_AMMO_M209_S = "wpn_ammo_m209_s",
  WPN_AMMO_OG7B_S = "wpn_ammo_og7b_s",
  WPN_AMMO_S = "wpn_ammo_s",
  WPN_AMMO_VOG25_S = "wpn_ammo_vog25_s",
  WPN_AUTO_SHOTGUN_S = "wpn_auto_shotgun_s",
  WPN_BINOCULAR_S = "wpn_binocular_s",
  WPN_BM16_S = "wpn_bm16_s",
  WPN_GRENADE_F1_S = "wpn_grenade_f1_s",
  WPN_GRENADE_LAUNCHER_S = "wpn_grenade_launcher_s",
  WPN_GRENADE_RGD5_S = "wpn_grenade_rgd5_s",
  WPN_GROZA_S = "wpn_groza_s",
  WPN_HPSA_S = "wpn_hpsa_s",
  WPN_KNIFE_S = "wpn_knife_s",
  WPN_LR300_S = "wpn_lr300_s",
  WPN_PM_S = "wpn_pm_s",
  WPN_RG6_S = "wpn_rg6_s",
  WPN_RPG7_S = "wpn_rpg7_s",
  WPN_SCOPE_S = "wpn_scope_s",
  WPN_SHOTGUN_S = "wpn_shotgun_s",
  WPN_SILENCER_S = "wpn_silencer_s",
  WPN_SVD_S = "wpn_svd_s",
  WPN_SVU_S = "wpn_svu_s",
  WPN_USP45_S = "wpn_usp45_s",
  WPN_VAL_S = "wpn_val_s",
  WPN_VINTOREZ_S = "wpn_vintorez_s",
  WPN_WALTHER_S = "wpn_walther_s",
  ZOMBIE_S = "zombie_s",
  ZONE_BFUZZ_S = "zone_bfuzz_s",
  ZONE_GALANT_S = "zone_galant_s",
  ZONE_MBALD_S = "zone_mbald_s",
  ZONE_MINCER_S = "zone_mincer_s",
  ZONE_RADIO_S = "zone_radio_s",
  ZONE_TORRID_S = "zone_torrid_s",
}

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
