import { editor, TXR_class_key, XR_object_factory } from "xray16";

import {
  Actor,
  AnomalousZone,
  Helicopter,
  InventoryBox,
  Item,
  ItemAmmo,
  ItemArtefact,
  ItemDetector,
  ItemEatable,
  ItemExplosive,
  ItemGrenade,
  ItemHelmet,
  ItemOutfit,
  ItemPda,
  ItemTorch,
  ItemWeapon,
  ItemWeaponAutomaticShotgun,
  ItemWeaponMagazined,
  ItemWeaponMagazinedWGl,
  ItemWeaponShotgun,
  LevelChanger,
  Monster,
  ObjectHangingLamp,
  ObjectPhysic,
  SmartCover,
  SmartTerrain,
  Squad,
  Stalker,
  ZoneRestrictor,
  ZoneTorrid,
  ZoneVisual,
} from "@/engine/core/objects";
import { MainMenu } from "@/engine/core/ui/menu";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EClientObjectClass, EConfigClassId } from "@/engine/lib/constants/class_ids";
import { inventory_objects } from "@/engine/lib/constants/items/inventory_objects";
import { misc } from "@/engine/lib/constants/items/misc";
import { weapons } from "@/engine/lib/constants/items/weapons";

/**
 * client_object_class - class from C++ code
 * server_object_class - class from lua code
 * clsid - new definition for usage in configs
 * script_clsid - key value from ClsId registry
 */

const logger: LuaLogger = new LuaLogger($filename);

/**
 * @noSelf
 * src/xrServerEntities/clsid_game.h
 */
export function registerGameClasses(factory: XR_object_factory): void {
  logger.info("Registering game classes bindings");

  if (!editor()) {
    logger.info("Registering main menu:", MainMenu.__name);
    factory.register(MainMenu.__name, "MAIN_MNU", "main_menu");
  }

  factory.register(Squad.__name, "ON_OFF_S", "online_offline_group_s");

  // General:
  factory.register(
    EClientObjectClass.ce_smart_zone,
    SmartTerrain.__name,
    EConfigClassId.SMART_TERRAIN,
    "smart_terrain"
  );
  factory.register(EClientObjectClass.ce_smart_zone, ZoneRestrictor.__name, "SPC_RS_S", "script_restr");
  factory.register(EClientObjectClass.CLevelChanger, LevelChanger.__name, "LVL_CHNG", "level_changer_s");
  factory.register(EClientObjectClass.CActor, Actor.__name, "S_ACTOR", "script_actor");
  factory.register(EClientObjectClass.CAI_Stalker, Stalker.__name, "AI_STL_S", "script_stalker");
  factory.register(EClientObjectClass.CHelicopter, Helicopter.__name, "C_HLCP_S", "script_heli");

  factory.register(EClientObjectClass.CPhysicObject, ObjectPhysic.__name, "O_PHYS_S", "script_phys");
  factory.register(EClientObjectClass.smart_cover_object, SmartCover.__name, "SMRT_C_S", "smartcover_s");
  factory.register(EClientObjectClass.CDestroyablePhysicsObject, ObjectPhysic.__name, "O_DSTR_S", "destrphys_s");
  factory.register(EClientObjectClass.hanging_lamp, ObjectHangingLamp.__name, "SO_HLAMP", "hlamp_s");

  // Artefacts:
  factory.register(EClientObjectClass.CElectricBall, ItemArtefact.__name, "SCRPTART", "artefact_s");

  // Devices:
  factory.register(EClientObjectClass.CTorch, ItemTorch.__name, "TORCH_S", misc.device_torch_s);
  factory.register(EClientObjectClass.CScientificDetector, ItemDetector.__name, "DET_SCIE", "detector_scientific_s");
  factory.register(
    EClientObjectClass.CEliteDetector,
    ItemDetector.__name,
    "DET_ELIT",
    "detector_elite_s" as TXR_class_key
  );
  factory.register(
    EClientObjectClass.CAdvancedDetector,
    ItemDetector.__name,
    "DET_ADVA",
    "detector_advanced_s" as TXR_class_key
  );
  factory.register(
    EClientObjectClass.CSimpleDetector,
    ItemDetector.__name,
    "DET_SIMP",
    "detector_simple_s" as TXR_class_key
  );
  factory.register(EClientObjectClass.CScope, Item.__name, "WP_SCOPE", weapons.wpn_scope_s);
  factory.register(EClientObjectClass.CSilencer, Item.__name, "WP_SILEN", weapons.wpn_silencer_s);
  factory.register(EClientObjectClass.CGrenadeLauncher, Item.__name, "WP_GLAUN", "wpn_grenade_launcher_s");

  // Outfits:
  factory.register(EClientObjectClass.CStalkerOutfit, ItemOutfit.__name, "E_STLK", "equ_stalker_s");
  factory.register(EClientObjectClass.CHelmet, ItemHelmet.__name, "E_HLMET", "equ_helmet_s");

  // Weapons:
  factory.register(
    EClientObjectClass.CWeaponBinoculars,
    ItemWeaponMagazined.__name,
    "WP_BINOC",
    weapons.wpn_binocular_s
  );
  factory.register(EClientObjectClass.CWeaponKnife, ItemWeapon.__name, "WP_KNIFE", weapons.wpn_knife_s);
  factory.register(EClientObjectClass.CWeaponBM16, ItemWeaponShotgun.__name, "WP_BM16", weapons.wpn_bm16_s);
  factory.register(EClientObjectClass.CWeaponRG6, ItemWeaponShotgun.__name, "WP_RG6", weapons.wpn_rg6_s);
  factory.register(EClientObjectClass.CWeaponShotgun, ItemWeaponShotgun.__name, "WP_SHOTG", weapons.wpn_shotgun_s);
  factory.register(EClientObjectClass.CWeaponGroza, ItemWeaponMagazinedWGl.__name, "WP_GROZA", weapons.wpn_groza_s);
  factory.register(EClientObjectClass.CWeaponAK74, ItemWeaponMagazinedWGl.__name, "WP_AK74", weapons.wpn_ak74_s);
  factory.register(EClientObjectClass.CWeaponSVD, ItemWeaponMagazined.__name, "WP_SVD", weapons.wpn_svd_s);
  factory.register(EClientObjectClass.CWeaponLR300, ItemWeaponMagazined.__name, "WP_LR300", weapons.wpn_lr300_s);
  factory.register(EClientObjectClass.CWeaponHPSA, ItemWeaponMagazined.__name, "WP_HPSA", weapons.wpn_hpsa_s);
  factory.register(EClientObjectClass.CWeaponPM, ItemWeaponMagazined.__name, "WP_PM", weapons.wpn_pm_s);
  factory.register(EClientObjectClass.CWeaponRPG7, ItemWeaponMagazined.__name, "WP_RPG7", weapons.wpn_rpg7_s);
  factory.register(EClientObjectClass.CWeaponSVU, ItemWeaponMagazined.__name, "WP_SVU", weapons.wpn_svu_s);
  factory.register(EClientObjectClass.CWeaponUSP45, ItemWeaponMagazined.__name, "WP_USP45", weapons.wpn_usp45_s);
  factory.register(EClientObjectClass.CWeaponVal, ItemWeaponMagazined.__name, "WP_VAL", weapons.wpn_val_s);
  factory.register(EClientObjectClass.CWeaponVintorez, ItemWeaponMagazined.__name, "WP_VINT", weapons.wpn_vintorez_s);
  factory.register(EClientObjectClass.CWeaponWalther, ItemWeaponMagazined.__name, "WP_WALTH", weapons.wpn_walther_s);
  factory.register(EClientObjectClass.CWeaponAmmo, ItemAmmo.__name, "AMMO_S", weapons.wpn_ammo_s);
  factory.register(EClientObjectClass.CWeaponAmmo, ItemAmmo.__name, "S_VOG25", weapons.wpn_ammo_vog25_s);
  factory.register(EClientObjectClass.CWeaponAmmo, ItemAmmo.__name, "S_OG7B", weapons.wpn_ammo_og7b_s);
  factory.register(EClientObjectClass.CWeaponAmmo, ItemAmmo.__name, "S_M209", weapons.wpn_ammo_m209_s);
  factory.register(EClientObjectClass.CF1, ItemGrenade.__name, "G_F1_S", weapons.wpn_grenade_f1_s);
  factory.register(EClientObjectClass.CRGD5, ItemGrenade.__name, "G_RGD5_S", weapons.wpn_grenade_rgd5_s);
  factory.register(EClientObjectClass.CMedkit, ItemEatable.__name, "S_MEDKI", inventory_objects.obj_medkit_s);
  factory.register(EClientObjectClass.CMedkit, ItemEatable.__name, "S_BANDG", inventory_objects.obj_bandage_s);
  factory.register(EClientObjectClass.CAntirad, ItemEatable.__name, "S_ANTIR", inventory_objects.obj_antirad_s);
  factory.register(EClientObjectClass.CFoodItem, ItemEatable.__name, "S_FOOD", inventory_objects.obj_food_s);
  factory.register(EClientObjectClass.CBottleItem, ItemEatable.__name, "S_BOTTL", inventory_objects.obj_bottle_s);
  factory.register(
    EClientObjectClass.CInventoryBox,
    InventoryBox.__name,
    "S_INVBOX",
    inventory_objects.inventory_box_s
  );
  factory.register(
    EClientObjectClass.CExplosiveItem,
    ItemExplosive.__name,
    "S_EXPLO",
    inventory_objects.obj_explosive_s
  );
  factory.register(EClientObjectClass.CPda, ItemPda.__name, "S_PDA", inventory_objects.obj_pda_s);
  factory.register(
    EClientObjectClass.CWeaponAutomaticShotgun,
    ItemWeaponAutomaticShotgun.__name,
    "WP_ASHTG",
    weapons.wpn_auto_shotgun_s
  );

  // Anomalies:
  factory.register(EClientObjectClass.CHairsZone, ZoneVisual.__name, "ZS_BFUZZ", "zone_bfuzz_s");
  factory.register(EClientObjectClass.CMosquitoBald, AnomalousZone.__name, "ZS_MBALD", "zone_mbald_s");
  factory.register(EClientObjectClass.CMincer, AnomalousZone.__name, "ZS_GALAN", "zone_galant_s");
  factory.register(EClientObjectClass.CMincer, AnomalousZone.__name, "ZS_MINCE", "zone_mincer_s");
  factory.register(EClientObjectClass.CRadioactiveZone, AnomalousZone.__name, "ZS_RADIO", "zone_radio_s");
  factory.register(EClientObjectClass.CTorridZone, ZoneTorrid.__name, "ZS_TORRD", "zone_torrid_s");

  // Monsters:
  factory.register(EClientObjectClass.CAI_Bloodsucker, Monster.__name, "SM_BLOOD", "bloodsucker_s");
  factory.register(EClientObjectClass.CAI_Boar, Monster.__name, "SM_BOARW", "boar_s");
  factory.register(EClientObjectClass.CAI_Dog, Monster.__name, "SM_DOG_S", "dog_s");
  factory.register(EClientObjectClass.CAI_Flesh, Monster.__name, "SM_FLESH", "flesh_s");
  factory.register(EClientObjectClass.CAI_PseudoDog, Monster.__name, "SM_P_DOG", "pseudodog_s");
  factory.register(EClientObjectClass.CBurer, Monster.__name, "SM_BURER", "burer_s");
  factory.register(EClientObjectClass.CCat, Monster.__name, "SM_CAT_S", "cat_s");
  factory.register(EClientObjectClass.CChimera, Monster.__name, "SM_CHIMS", "chimera_s");
  factory.register(EClientObjectClass.CController, Monster.__name, "SM_CONTR", "controller_s");
  factory.register(EClientObjectClass.CFracture, Monster.__name, "SM_IZLOM", "fracture_s");
  factory.register(EClientObjectClass.CPoltergeist, Monster.__name, "SM_POLTR", "poltergeist_s");
  factory.register(EClientObjectClass.CPseudoGigant, Monster.__name, "SM_GIANT", "gigant_s");
  factory.register(EClientObjectClass.CZombie, Monster.__name, "SM_ZOMBI", "zombie_s");
  factory.register(EClientObjectClass.CSnork, Monster.__name, "SM_SNORK", "snork_s");
  factory.register(EClientObjectClass.CTushkano, Monster.__name, "SM_TUSHK", "tushkano_s");
  factory.register(EClientObjectClass.CPsyDog, Monster.__name, "SM_DOG_P", "psy_dog_s");
  factory.register(EClientObjectClass.CPsyDogPhantom, Monster.__name, "SM_DOG_F", "psy_dog_phantom_s");
}
