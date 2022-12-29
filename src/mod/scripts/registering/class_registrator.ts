import { editor, TXR_ClsKey, XR_object_factory } from "xray16";

import { Actor } from "@/mod/scripts/se/Actor";
import { InventoryBox } from "@/mod/scripts/se/items/InvertoryBox";
import { Item } from "@/mod/scripts/se/items/Item";
import { ItemAmmo } from "@/mod/scripts/se/items/ItemAmmo";
import { ItemArtefact } from "@/mod/scripts/se/items/ItemArtefact";
import { ItemDetector } from "@/mod/scripts/se/items/ItemDetector";
import { ItemEatable } from "@/mod/scripts/se/items/ItemEatable";
import { ItemExplosive } from "@/mod/scripts/se/items/ItemExplosive";
import { ItemGrenade } from "@/mod/scripts/se/items/ItemGrenade";
import { ItemHelmet } from "@/mod/scripts/se/items/ItemHelmet";
import { ItemOutfit } from "@/mod/scripts/se/items/ItemOutfit";
import { ItemPda } from "@/mod/scripts/se/items/ItemPda";
import { ItemTorch } from "@/mod/scripts/se/items/ItemTorch";
import { ItemWeapon } from "@/mod/scripts/se/items/ItemWeapon";
import { ItemWeaponAutomaticShotgun } from "@/mod/scripts/se/items/ItemWeaponAutomaticShotgun";
import { ItemWeaponMagazined } from "@/mod/scripts/se/items/ItemWeaponMagazined";
import { ItemWeaponMagazinedWGl } from "@/mod/scripts/se/items/ItemWeaponMagazinedWGl";
import { ItemWeaponShotgun } from "@/mod/scripts/se/items/ItemWeaponShotgun";
import { ObjectHangingLamp } from "@/mod/scripts/se/items/ObjectHangingLamp";
import { ObjectPhysic } from "@/mod/scripts/se/items/ObjectPhysic";
import { Monster } from "@/mod/scripts/se/Monster";
import { MainMenu } from "@/mod/scripts/ui/menu/MainMenu";
import { LuaLogger } from "@/mod/scripts/utils/logging";

/**
 * client_object_class - class from C++ code
 * server_object_class - class from lua code
 * clsid - new definition for usage in configs
 * script_clsid - key value from ClsId registry
 */

const log: LuaLogger = new LuaLogger("class_registrator");

function clientServerRegister(
  factory: XR_object_factory,
  client_object_class: string,
  server_object_class: string,
  clsid: string,
  script_clsid: TXR_ClsKey
): void {
  log.info("[clientServerRegister] Registering:", client_object_class, server_object_class, clsid, script_clsid);
  factory.register(client_object_class, server_object_class, clsid, script_clsid);
}

function clientRegister(
  factory: XR_object_factory,
  client_object_class: string,
  clsid: string,
  script_clsid: string
): void {
  if (!editor()) {
    log.info("[clientRegister] Registering:", client_object_class, clsid, script_clsid);
    factory.register(client_object_class, clsid, script_clsid as TXR_ClsKey);
  }
}

function serverRegister(
  factory: XR_object_factory,
  server_object_class: string,
  clsid: string,
  script_clsid: TXR_ClsKey
): void {
  log.info("[serverRegister] Registering:", server_object_class, clsid, script_clsid);
  factory.register(server_object_class, clsid, script_clsid);
}

export function registerGameClasses(object_factory: XR_object_factory): void {
  log.info("Registering bindings:");

  // -- GENERAL --------------------------------------------------------------------------------------------------------
  clientRegister(object_factory, MainMenu.__class_name, "MAIN_MNU", "MainMenu");
  clientServerRegister(object_factory, "ce_smart_zone", "smart_terrain.se_smart_terrain", "SMRTTRRN", "smart_terrain");
  clientServerRegister(
    object_factory,
    "CLevelChanger",
    "se_level_changer.se_level_changer",
    "LVL_CHNG",
    "level_changer_s"
  );
  clientServerRegister(object_factory, "CActor", Actor.__class_name, "S_ACTOR", "script_actor");
  clientServerRegister(object_factory, "CAI_Stalker", "se_stalker.se_stalker", "AI_STL_S", "script_stalker");
  clientServerRegister(object_factory, "CHelicopter", "se_heli.se_heli", "C_HLCP_S", "script_heli");
  clientServerRegister(object_factory, "ce_smart_zone", "se_zones.se_restrictor", "SPC_RS_S", "script_restr");
  clientServerRegister(object_factory, "CPhysicObject", ObjectPhysic.__class_name, "O_PHYS_S", "script_phys");
  clientServerRegister(
    object_factory,
    "smart_cover_object",
    "se_smart_cover.se_smart_cover",
    "SMRT_C_S",
    "smartcover_s"
  );
  clientServerRegister(
    object_factory,
    "CDestroyablePhysicsObject",
    ObjectPhysic.__class_name,
    "O_DSTR_S",
    "destrphys_s"
  );
  clientServerRegister(object_factory, "hanging_lamp", ObjectHangingLamp.__class_name, "SO_HLAMP", "hlamp_s");

  // -- ARTEFACTS ------------------------------------------------------------------------------------------------------
  clientServerRegister(object_factory, "CElectricBall", ItemArtefact.__class_name, "SCRPTART", "artefact_s");

  // -- DEVICES --------------------------------------------------------------------------------------------------------
  clientServerRegister(object_factory, "CTorch", ItemTorch.__class_name, "TORCH_S", "device_torch_s");
  clientServerRegister(
    object_factory,
    "CScientificDetector",
    ItemDetector.__class_name,
    "DET_SCIE",
    "detector_scientific_s" as any
  );
  clientServerRegister(
    object_factory,
    "CEliteDetector",
    ItemDetector.__class_name,
    "DET_ELIT",
    "detector_elite_s" as any
  );
  clientServerRegister(
    object_factory,
    "CAdvancedDetector",
    ItemDetector.__class_name,
    "DET_ADVA",
    "detector_advanced_s" as any
  );
  clientServerRegister(
    object_factory,
    "CSimpleDetector",
    ItemDetector.__class_name,
    "DET_SIMP",
    "detector_simple_s" as any
  );
  clientServerRegister(object_factory, "CScope", Item.__class_name, "WP_SCOPE", "wpn_scope_s");
  clientServerRegister(object_factory, "CSilencer", Item.__class_name, "WP_SILEN", "wpn_silencer_s");
  clientServerRegister(object_factory, "CGrenadeLauncher", Item.__class_name, "WP_GLAUN", "wpn_grenade_launcher_s");

  // -- OUTFITS --------------------------------------------------------------------------------------------------------
  clientServerRegister(object_factory, "CStalkerOutfit", ItemOutfit.__class_name, "E_STLK", "equ_stalker_s");
  clientServerRegister(object_factory, "CHelmet", ItemHelmet.__class_name, "E_HLMET", "equ_helmet_s");

  // -- WEAPONS --------------------------------------------------------------------------------------------------------
  clientServerRegister(
    object_factory,
    "CWeaponBinoculars",
    ItemWeaponMagazined.__class_name,
    "WP_BINOC",
    "wpn_binocular_s"
  );
  clientServerRegister(object_factory, "CWeaponKnife", ItemWeapon.__class_name, "WP_KNIFE", "wpn_knife_s");
  clientServerRegister(object_factory, "CWeaponBM16", ItemWeaponShotgun.__class_name, "WP_BM16", "wpn_bm16_s");
  clientServerRegister(object_factory, "CWeaponRG6", ItemWeaponShotgun.__class_name, "WP_RG6", "wpn_rg6_s");
  clientServerRegister(object_factory, "CWeaponShotgun", ItemWeaponShotgun.__class_name, "WP_SHOTG", "wpn_shotgun_s");
  clientServerRegister(object_factory, "CWeaponGroza", ItemWeaponMagazinedWGl.__class_name, "WP_GROZA", "wpn_groza_s");
  clientServerRegister(object_factory, "CWeaponAK74", ItemWeaponMagazinedWGl.__class_name, "WP_AK74", "wpn_ak74_s");
  clientServerRegister(object_factory, "CWeaponSVD", ItemWeaponMagazined.__class_name, "WP_SVD", "wpn_svd_s");
  clientServerRegister(object_factory, "CWeaponLR300", ItemWeaponMagazined.__class_name, "WP_LR300", "wpn_lr300_s");
  clientServerRegister(object_factory, "CWeaponHPSA", ItemWeaponMagazined.__class_name, "WP_HPSA", "wpn_hpsa_s");
  clientServerRegister(object_factory, "CWeaponPM", ItemWeaponMagazined.__class_name, "WP_PM", "wpn_pm_s");
  clientServerRegister(object_factory, "CWeaponRPG7", ItemWeaponMagazined.__class_name, "WP_RPG7", "wpn_rpg7_s");
  clientServerRegister(
    object_factory,
    "CWeaponAutomaticShotgun",
    ItemWeaponAutomaticShotgun.__class_name,
    "WP_ASHTG",
    "wpn_auto_shotgun_s"
  );
  clientServerRegister(object_factory, "CWeaponSVU", ItemWeaponMagazined.__class_name, "WP_SVU", "wpn_svu_s");
  clientServerRegister(object_factory, "CWeaponUSP45", ItemWeaponMagazined.__class_name, "WP_USP45", "wpn_usp45_s");
  clientServerRegister(object_factory, "CWeaponVal", ItemWeaponMagazined.__class_name, "WP_VAL", "wpn_val_s");
  clientServerRegister(
    object_factory,
    "CWeaponVintorez",
    ItemWeaponMagazined.__class_name,
    "WP_VINT",
    "wpn_vintorez_s"
  );
  clientServerRegister(object_factory, "CWeaponWalther", ItemWeaponMagazined.__class_name, "WP_WALTH", "wpn_walther_s");
  // --cs_register(object_factory, "CWeaponStatMgun", "se_item.se_mgun", "W_STMGUN", "wpn_stat_mgun");
  // --cs_register(object_factory, "CWeaponMagazined", "se_item.se_weapon_magazined", "WP_MAGAZ", "wpn_magazined_s");
  clientServerRegister(object_factory, "CWeaponAmmo", ItemAmmo.__class_name, "AMMO_S", "wpn_ammo_s");
  clientServerRegister(object_factory, "CWeaponAmmo", ItemAmmo.__class_name, "S_VOG25", "wpn_ammo_vog25_s");
  clientServerRegister(object_factory, "CWeaponAmmo", ItemAmmo.__class_name, "S_OG7B", "wpn_ammo_og7b_s");
  clientServerRegister(object_factory, "CWeaponAmmo", ItemAmmo.__class_name, "S_M209", "wpn_ammo_m209_s");
  clientServerRegister(object_factory, "CF1", ItemGrenade.__class_name, "G_F1_S", "wpn_grenade_f1_s");
  clientServerRegister(object_factory, "CRGD5", ItemGrenade.__class_name, "G_RGD5_S", "wpn_grenade_rgd5_s");
  clientServerRegister(object_factory, "CMedkit", ItemEatable.__class_name, "S_MEDKI", "obj_medkit_s");
  clientServerRegister(object_factory, "CMedkit", ItemEatable.__class_name, "S_BANDG", "obj_bandage_s");
  clientServerRegister(object_factory, "CAntirad", ItemEatable.__class_name, "S_ANTIR", "obj_antirad_s");
  clientServerRegister(object_factory, "CFoodItem", ItemEatable.__class_name, "S_FOOD", "obj_food_s");
  clientServerRegister(object_factory, "CBottleItem", ItemEatable.__class_name, "S_BOTTL", "obj_bottle_s");
  clientServerRegister(object_factory, "CInventoryBox", InventoryBox.__class_name, "S_INVBOX", "inventory_box_s");
  clientServerRegister(object_factory, "CExplosiveItem", ItemExplosive.__class_name, "S_EXPLO", "obj_explosive_s");
  clientServerRegister(object_factory, "CPda", ItemPda.__class_name, "S_PDA", "obj_pda_s");
  serverRegister(object_factory, "sim_squad_scripted.sim_squad_scripted", "ON_OFF_S", "online_offline_group_s");
  // -- ANOMALY ZONES --------------------------------------------------------------------------------------------------

  clientServerRegister(object_factory, "CHairsZone", "se_zones.se_zone_visual", "ZS_BFUZZ", "zone_bfuzz_s");
  clientServerRegister(object_factory, "CMosquitoBald", "se_zones.se_zone_anom", "ZS_MBALD", "zone_mbald_s");
  clientServerRegister(object_factory, "CMincer", "se_zones.se_zone_anom", "ZS_GALAN", "zone_galant_s");
  clientServerRegister(object_factory, "CMincer", "se_zones.se_zone_anom", "ZS_MINCE", "zone_mincer_s");
  clientServerRegister(object_factory, "CRadioactiveZone", "se_zones.se_zone_anom", "ZS_RADIO", "zone_radio_s");
  clientServerRegister(object_factory, "CTorridZone", "se_zones.se_zone_torrid", "ZS_TORRD", "zone_torrid_s");

  // -- MONSTERS -------------------------------------------------------------------------------------------------------
  clientServerRegister(object_factory, "CAI_Bloodsucker", Monster.__class_name, "SM_BLOOD", "bloodsucker_s");
  clientServerRegister(object_factory, "CAI_Boar", Monster.__class_name, "SM_BOARW", "boar_s");
  clientServerRegister(object_factory, "CAI_Dog", Monster.__class_name, "SM_DOG_S", "dog_s");
  clientServerRegister(object_factory, "CAI_Flesh", Monster.__class_name, "SM_FLESH", "flesh_s");
  clientServerRegister(object_factory, "CAI_PseudoDog", Monster.__class_name, "SM_P_DOG", "pseudodog_s");
  clientServerRegister(object_factory, "CBurer", Monster.__class_name, "SM_BURER", "burer_s");
  clientServerRegister(object_factory, "CCat", Monster.__class_name, "SM_CAT_S", "cat_s");
  clientServerRegister(object_factory, "CChimera", Monster.__class_name, "SM_CHIMS", "chimera_s");
  clientServerRegister(object_factory, "CController", Monster.__class_name, "SM_CONTR", "controller_s");
  clientServerRegister(object_factory, "CFracture", Monster.__class_name, "SM_IZLOM", "fracture_s");
  clientServerRegister(object_factory, "CPoltergeist", Monster.__class_name, "SM_POLTR", "poltergeist_s");
  clientServerRegister(object_factory, "CPseudoGigant", Monster.__class_name, "SM_GIANT", "gigant_s");
  clientServerRegister(object_factory, "CZombie", Monster.__class_name, "SM_ZOMBI", "zombie_s");
  clientServerRegister(object_factory, "CSnork", Monster.__class_name, "SM_SNORK", "snork_s");
  clientServerRegister(object_factory, "CTushkano", Monster.__class_name, "SM_TUSHK", "tushkano_s");
  clientServerRegister(object_factory, "CPsyDog", Monster.__class_name, "SM_DOG_P", "psy_dog_s");
  clientServerRegister(object_factory, "CPsyDogPhantom", Monster.__class_name, "SM_DOG_F", "psy_dog_phantom_s");
}
