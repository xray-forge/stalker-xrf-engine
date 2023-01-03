import { editor, TXR_cls_key, XR_object_factory } from "xray16";

import { Actor } from "@/mod/scripts/se/Actor";
import { AnomalousZone } from "@/mod/scripts/se/anomal_zones/AnomalousZone";
import { ZoneRestrictor } from "@/mod/scripts/se/anomal_zones/ZoneRestrictor";
import { ZoneTorrid } from "@/mod/scripts/se/anomal_zones/ZoneTorrid";
import { ZoneVisual } from "@/mod/scripts/se/anomal_zones/ZoneVisual";
import { Heli } from "@/mod/scripts/se/Heli";
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
import { LevelChanger } from "@/mod/scripts/se/LevelChanger";
import { Monster } from "@/mod/scripts/se/Monster";
import { SimSquad } from "@/mod/scripts/se/SimSquad";
import { SmartCover } from "@/mod/scripts/se/SmartCover";
import { SmartTerrain } from "@/mod/scripts/se/SmartTerrain";
import { Stalker } from "@/mod/scripts/se/Stalker";
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
  script_clsid: TXR_cls_key
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
    factory.register(client_object_class, clsid, script_clsid as TXR_cls_key);
  }
}

function serverRegister(
  factory: XR_object_factory,
  server_object_class: string,
  clsid: string,
  script_clsid: TXR_cls_key
): void {
  log.info("[serverRegister] Registering:", server_object_class, clsid, script_clsid);
  factory.register(server_object_class, clsid, script_clsid);
}

export function registerGameClasses(object_factory: XR_object_factory): void {
  log.info("Registering bindings:");

  // -- GENERAL --------------------------------------------------------------------------------------------------------
  clientRegister(object_factory, MainMenu.__name, "MAIN_MNU", "MainMenu");
  clientServerRegister(object_factory, "ce_smart_zone", SmartTerrain.__name, "SMRTTRRN", "smart_terrain");
  clientServerRegister(object_factory, "CLevelChanger", LevelChanger.__name, "LVL_CHNG", "level_changer_s");
  clientServerRegister(object_factory, "CActor", Actor.__name, "S_ACTOR", "script_actor");
  clientServerRegister(object_factory, "CAI_Stalker", Stalker.__name, "AI_STL_S", "script_stalker");
  clientServerRegister(object_factory, "CHelicopter", Heli.__name, "C_HLCP_S", "script_heli");
  clientServerRegister(object_factory, "ce_smart_zone", ZoneRestrictor.__name, "SPC_RS_S", "script_restr");
  clientServerRegister(object_factory, "CPhysicObject", ObjectPhysic.__name, "O_PHYS_S", "script_phys");
  clientServerRegister(object_factory, "smart_cover_object", SmartCover.__name, "SMRT_C_S", "smartcover_s");
  clientServerRegister(object_factory, "CDestroyablePhysicsObject", ObjectPhysic.__name, "O_DSTR_S", "destrphys_s");
  clientServerRegister(object_factory, "hanging_lamp", ObjectHangingLamp.__name, "SO_HLAMP", "hlamp_s");

  // -- ARTEFACTS ------------------------------------------------------------------------------------------------------
  clientServerRegister(object_factory, "CElectricBall", ItemArtefact.__name, "SCRPTART", "artefact_s");

  // -- DEVICES --------------------------------------------------------------------------------------------------------
  clientServerRegister(object_factory, "CTorch", ItemTorch.__name, "TORCH_S", "device_torch_s");
  clientServerRegister(
    object_factory,
    "CScientificDetector",
    ItemDetector.__name,
    "DET_SCIE",
    "detector_scientific_s" as any
  );
  clientServerRegister(object_factory, "CEliteDetector", ItemDetector.__name, "DET_ELIT", "detector_elite_s" as any);
  clientServerRegister(
    object_factory,
    "CAdvancedDetector",
    ItemDetector.__name,
    "DET_ADVA",
    "detector_advanced_s" as any
  );
  clientServerRegister(object_factory, "CSimpleDetector", ItemDetector.__name, "DET_SIMP", "detector_simple_s" as any);
  clientServerRegister(object_factory, "CScope", Item.__name, "WP_SCOPE", "wpn_scope_s");
  clientServerRegister(object_factory, "CSilencer", Item.__name, "WP_SILEN", "wpn_silencer_s");
  clientServerRegister(object_factory, "CGrenadeLauncher", Item.__name, "WP_GLAUN", "wpn_grenade_launcher_s");

  // -- OUTFITS --------------------------------------------------------------------------------------------------------
  clientServerRegister(object_factory, "CStalkerOutfit", ItemOutfit.__name, "E_STLK", "equ_stalker_s");
  clientServerRegister(object_factory, "CHelmet", ItemHelmet.__name, "E_HLMET", "equ_helmet_s");

  // -- WEAPONS --------------------------------------------------------------------------------------------------------
  clientServerRegister(object_factory, "CWeaponBinoculars", ItemWeaponMagazined.__name, "WP_BINOC", "wpn_binocular_s");
  clientServerRegister(object_factory, "CWeaponKnife", ItemWeapon.__name, "WP_KNIFE", "wpn_knife_s");
  clientServerRegister(object_factory, "CWeaponBM16", ItemWeaponShotgun.__name, "WP_BM16", "wpn_bm16_s");
  clientServerRegister(object_factory, "CWeaponRG6", ItemWeaponShotgun.__name, "WP_RG6", "wpn_rg6_s");
  clientServerRegister(object_factory, "CWeaponShotgun", ItemWeaponShotgun.__name, "WP_SHOTG", "wpn_shotgun_s");
  clientServerRegister(object_factory, "CWeaponGroza", ItemWeaponMagazinedWGl.__name, "WP_GROZA", "wpn_groza_s");
  clientServerRegister(object_factory, "CWeaponAK74", ItemWeaponMagazinedWGl.__name, "WP_AK74", "wpn_ak74_s");
  clientServerRegister(object_factory, "CWeaponSVD", ItemWeaponMagazined.__name, "WP_SVD", "wpn_svd_s");
  clientServerRegister(object_factory, "CWeaponLR300", ItemWeaponMagazined.__name, "WP_LR300", "wpn_lr300_s");
  clientServerRegister(object_factory, "CWeaponHPSA", ItemWeaponMagazined.__name, "WP_HPSA", "wpn_hpsa_s");
  clientServerRegister(object_factory, "CWeaponPM", ItemWeaponMagazined.__name, "WP_PM", "wpn_pm_s");
  clientServerRegister(object_factory, "CWeaponRPG7", ItemWeaponMagazined.__name, "WP_RPG7", "wpn_rpg7_s");
  clientServerRegister(object_factory, "CWeaponSVU", ItemWeaponMagazined.__name, "WP_SVU", "wpn_svu_s");
  clientServerRegister(object_factory, "CWeaponUSP45", ItemWeaponMagazined.__name, "WP_USP45", "wpn_usp45_s");
  clientServerRegister(object_factory, "CWeaponVal", ItemWeaponMagazined.__name, "WP_VAL", "wpn_val_s");
  clientServerRegister(object_factory, "CWeaponVintorez", ItemWeaponMagazined.__name, "WP_VINT", "wpn_vintorez_s");
  clientServerRegister(object_factory, "CWeaponWalther", ItemWeaponMagazined.__name, "WP_WALTH", "wpn_walther_s");
  // --cs_register(object_factory, "CWeaponStatMgun", "se_item.se_mgun", "W_STMGUN", "wpn_stat_mgun");
  // --cs_register(object_factory, "CWeaponMagazined", "se_item.se_weapon_magazined", "WP_MAGAZ", "wpn_magazined_s");
  clientServerRegister(object_factory, "CWeaponAmmo", ItemAmmo.__name, "AMMO_S", "wpn_ammo_s");
  clientServerRegister(object_factory, "CWeaponAmmo", ItemAmmo.__name, "S_VOG25", "wpn_ammo_vog25_s");
  clientServerRegister(object_factory, "CWeaponAmmo", ItemAmmo.__name, "S_OG7B", "wpn_ammo_og7b_s");
  clientServerRegister(object_factory, "CWeaponAmmo", ItemAmmo.__name, "S_M209", "wpn_ammo_m209_s");
  clientServerRegister(object_factory, "CF1", ItemGrenade.__name, "G_F1_S", "wpn_grenade_f1_s");
  clientServerRegister(object_factory, "CRGD5", ItemGrenade.__name, "G_RGD5_S", "wpn_grenade_rgd5_s");
  clientServerRegister(object_factory, "CMedkit", ItemEatable.__name, "S_MEDKI", "obj_medkit_s");
  clientServerRegister(object_factory, "CMedkit", ItemEatable.__name, "S_BANDG", "obj_bandage_s");
  clientServerRegister(object_factory, "CAntirad", ItemEatable.__name, "S_ANTIR", "obj_antirad_s");
  clientServerRegister(object_factory, "CFoodItem", ItemEatable.__name, "S_FOOD", "obj_food_s");
  clientServerRegister(object_factory, "CBottleItem", ItemEatable.__name, "S_BOTTL", "obj_bottle_s");
  clientServerRegister(object_factory, "CInventoryBox", InventoryBox.__name, "S_INVBOX", "inventory_box_s");
  clientServerRegister(object_factory, "CExplosiveItem", ItemExplosive.__name, "S_EXPLO", "obj_explosive_s");
  clientServerRegister(object_factory, "CPda", ItemPda.__name, "S_PDA", "obj_pda_s");
  clientServerRegister(
    object_factory,
    "CWeaponAutomaticShotgun",
    ItemWeaponAutomaticShotgun.__name,
    "WP_ASHTG",
    "wpn_auto_shotgun_s"
  );
  serverRegister(object_factory, SimSquad.__name, "ON_OFF_S", "online_offline_group_s");

  // -- ANOMALY ZONES --------------------------------------------------------------------------------------------------
  clientServerRegister(object_factory, "CHairsZone", ZoneVisual.__name, "ZS_BFUZZ", "zone_bfuzz_s");
  clientServerRegister(object_factory, "CMosquitoBald", AnomalousZone.__name, "ZS_MBALD", "zone_mbald_s");
  clientServerRegister(object_factory, "CMincer", AnomalousZone.__name, "ZS_GALAN", "zone_galant_s");
  clientServerRegister(object_factory, "CMincer", AnomalousZone.__name, "ZS_MINCE", "zone_mincer_s");
  clientServerRegister(object_factory, "CRadioactiveZone", AnomalousZone.__name, "ZS_RADIO", "zone_radio_s");
  clientServerRegister(object_factory, "CTorridZone", ZoneTorrid.__name, "ZS_TORRD", "zone_torrid_s");

  // -- MONSTERS -------------------------------------------------------------------------------------------------------
  clientServerRegister(object_factory, "CAI_Bloodsucker", Monster.__name, "SM_BLOOD", "bloodsucker_s");
  clientServerRegister(object_factory, "CAI_Boar", Monster.__name, "SM_BOARW", "boar_s");
  clientServerRegister(object_factory, "CAI_Dog", Monster.__name, "SM_DOG_S", "dog_s");
  clientServerRegister(object_factory, "CAI_Flesh", Monster.__name, "SM_FLESH", "flesh_s");
  clientServerRegister(object_factory, "CAI_PseudoDog", Monster.__name, "SM_P_DOG", "pseudodog_s");
  clientServerRegister(object_factory, "CBurer", Monster.__name, "SM_BURER", "burer_s");
  clientServerRegister(object_factory, "CCat", Monster.__name, "SM_CAT_S", "cat_s");
  clientServerRegister(object_factory, "CChimera", Monster.__name, "SM_CHIMS", "chimera_s");
  clientServerRegister(object_factory, "CController", Monster.__name, "SM_CONTR", "controller_s");
  clientServerRegister(object_factory, "CFracture", Monster.__name, "SM_IZLOM", "fracture_s");
  clientServerRegister(object_factory, "CPoltergeist", Monster.__name, "SM_POLTR", "poltergeist_s");
  clientServerRegister(object_factory, "CPseudoGigant", Monster.__name, "SM_GIANT", "gigant_s");
  clientServerRegister(object_factory, "CZombie", Monster.__name, "SM_ZOMBI", "zombie_s");
  clientServerRegister(object_factory, "CSnork", Monster.__name, "SM_SNORK", "snork_s");
  clientServerRegister(object_factory, "CTushkano", Monster.__name, "SM_TUSHK", "tushkano_s");
  clientServerRegister(object_factory, "CPsyDog", Monster.__name, "SM_DOG_P", "psy_dog_s");
  clientServerRegister(object_factory, "CPsyDogPhantom", Monster.__name, "SM_DOG_F", "psy_dog_phantom_s");
}
