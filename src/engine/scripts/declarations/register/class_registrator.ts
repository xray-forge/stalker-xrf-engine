import { editor, TXR_class_key, XR_object_factory } from "xray16";

import { inventory_objects } from "@/engine/lib/constants/items/inventory_objects";
import { misc } from "@/engine/lib/constants/items/misc";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { Actor } from "@/engine/scripts/core/objects/alife/Actor";
import { Helicopter } from "@/engine/scripts/core/objects/alife/Helicopter";
import { InventoryBox } from "@/engine/scripts/core/objects/alife/items/InvertoryBox";
import { Item } from "@/engine/scripts/core/objects/alife/items/Item";
import { ItemAmmo } from "@/engine/scripts/core/objects/alife/items/ItemAmmo";
import { ItemArtefact } from "@/engine/scripts/core/objects/alife/items/ItemArtefact";
import { ItemDetector } from "@/engine/scripts/core/objects/alife/items/ItemDetector";
import { ItemEatable } from "@/engine/scripts/core/objects/alife/items/ItemEatable";
import { ItemExplosive } from "@/engine/scripts/core/objects/alife/items/ItemExplosive";
import { ItemGrenade } from "@/engine/scripts/core/objects/alife/items/ItemGrenade";
import { ItemHelmet } from "@/engine/scripts/core/objects/alife/items/ItemHelmet";
import { ItemOutfit } from "@/engine/scripts/core/objects/alife/items/ItemOutfit";
import { ItemPda } from "@/engine/scripts/core/objects/alife/items/ItemPda";
import { ItemTorch } from "@/engine/scripts/core/objects/alife/items/ItemTorch";
import { ItemWeapon } from "@/engine/scripts/core/objects/alife/items/ItemWeapon";
import { ItemWeaponAutomaticShotgun } from "@/engine/scripts/core/objects/alife/items/ItemWeaponAutomaticShotgun";
import { ItemWeaponMagazined } from "@/engine/scripts/core/objects/alife/items/ItemWeaponMagazined";
import { ItemWeaponMagazinedWGl } from "@/engine/scripts/core/objects/alife/items/ItemWeaponMagazinedWGl";
import { ItemWeaponShotgun } from "@/engine/scripts/core/objects/alife/items/ItemWeaponShotgun";
import { LevelChanger } from "@/engine/scripts/core/objects/alife/LevelChanger";
import { Monster } from "@/engine/scripts/core/objects/alife/Monster";
import { ObjectHangingLamp } from "@/engine/scripts/core/objects/alife/ObjectHangingLamp";
import { ObjectPhysic } from "@/engine/scripts/core/objects/alife/ObjectPhysic";
import { SmartCover } from "@/engine/scripts/core/objects/alife/smart/SmartCover";
import { SmartTerrain } from "@/engine/scripts/core/objects/alife/smart/SmartTerrain";
import { Squad } from "@/engine/scripts/core/objects/alife/Squad";
import { Stalker } from "@/engine/scripts/core/objects/alife/Stalker";
import { AnomalousZone } from "@/engine/scripts/core/objects/alife/zones/AnomalousZone";
import { ZoneRestrictor } from "@/engine/scripts/core/objects/alife/zones/ZoneRestrictor";
import { ZoneTorrid } from "@/engine/scripts/core/objects/alife/zones/ZoneTorrid";
import { ZoneVisual } from "@/engine/scripts/core/objects/alife/zones/ZoneVisual";
import { MainMenu } from "@/engine/scripts/core/ui/menu/MainMenu";
import { EClientObjectClass } from "@/engine/scripts/declarations/register/EClientObjectClass";
import { LuaLogger } from "@/engine/scripts/utils/logging";

/**
 * client_object_class - class from C++ code
 * server_object_class - class from lua code
 * clsid - new definition for usage in configs
 * script_clsid - key value from ClsId registry
 */

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
function clientServerRegister(
  factory: XR_object_factory,
  clientObjectClass: EClientObjectClass,
  serverObjectClass: string,
  clsId: string,
  scriptClsId: TXR_class_key
): void {
  logger.info(
    "[clientServerRegister] Registering:",
    string.format(
      "<C: %s>, <lua: %s>, <C clsid: %s>, <LUA clsid: %s>",
      clientObjectClass,
      serverObjectClass,
      clsId,
      scriptClsId
    )
  );
  factory.register(clientObjectClass, serverObjectClass, clsId, scriptClsId);
}

/**
 * todo;
 */
function clientRegister(
  factory: XR_object_factory,
  serverObjectClass: string,
  clsId: string,
  scriptClsId: string
): void {
  if (!editor()) {
    logger.info("[clientRegister] Registering:", serverObjectClass, clsId, scriptClsId);
    factory.register(serverObjectClass, clsId, scriptClsId as TXR_class_key);
  }
}

/**
 * todo;
 */
function serverRegister(
  factory: XR_object_factory,
  serverObjectClass: string,
  clsId: string,
  scriptClsId: TXR_class_key
): void {
  logger.info("[serverRegister] Registering:", serverObjectClass, clsId, scriptClsId);
  factory.register(serverObjectClass, clsId, scriptClsId);
}

/**
 *  @noSelf
 * src/xrServerEntities/clsid_game.h
 */
export function registerGameClasses(factory: XR_object_factory): void {
  logger.info("Registering bindings:");

  // -- GENERAL --------------------------------------------------------------------------------------------------------
  clientRegister(factory, MainMenu.__name, "MAIN_MNU", MainMenu.__name);
  clientServerRegister(factory, EClientObjectClass.ce_smart_zone, SmartTerrain.__name, "SMRTTRRN", "smart_terrain");
  clientServerRegister(factory, EClientObjectClass.ce_smart_zone, ZoneRestrictor.__name, "SPC_RS_S", "script_restr");
  clientServerRegister(factory, EClientObjectClass.CLevelChanger, LevelChanger.__name, "LVL_CHNG", "level_changer_s");
  clientServerRegister(factory, EClientObjectClass.CActor, Actor.__name, "S_ACTOR", "script_actor");
  clientServerRegister(factory, EClientObjectClass.CAI_Stalker, Stalker.__name, "AI_STL_S", "script_stalker");
  clientServerRegister(factory, EClientObjectClass.CHelicopter, Helicopter.__name, "C_HLCP_S", "script_heli");

  clientServerRegister(factory, EClientObjectClass.CPhysicObject, ObjectPhysic.__name, "O_PHYS_S", "script_phys");
  clientServerRegister(factory, EClientObjectClass.smart_cover_object, SmartCover.__name, "SMRT_C_S", "smartcover_s");
  clientServerRegister(
    factory,
    EClientObjectClass.CDestroyablePhysicsObject,
    ObjectPhysic.__name,
    "O_DSTR_S",
    "destrphys_s"
  );
  clientServerRegister(factory, EClientObjectClass.hanging_lamp, ObjectHangingLamp.__name, "SO_HLAMP", "hlamp_s");

  // -- ARTEFACTS ------------------------------------------------------------------------------------------------------
  clientServerRegister(factory, EClientObjectClass.CElectricBall, ItemArtefact.__name, "SCRPTART", "artefact_s");

  // -- DEVICES --------------------------------------------------------------------------------------------------------
  clientServerRegister(factory, EClientObjectClass.CTorch, ItemTorch.__name, "TORCH_S", misc.device_torch_s);
  clientServerRegister(
    factory,
    EClientObjectClass.CScientificDetector,
    ItemDetector.__name,
    "DET_SCIE",
    "detector_scientific_s"
  );
  clientServerRegister(
    factory,
    EClientObjectClass.CEliteDetector,
    ItemDetector.__name,
    "DET_ELIT",
    "detector_elite_s" as any
  );
  clientServerRegister(
    factory,
    EClientObjectClass.CAdvancedDetector,
    ItemDetector.__name,
    "DET_ADVA",
    "detector_advanced_s" as any
  );
  clientServerRegister(
    factory,
    EClientObjectClass.CSimpleDetector,
    ItemDetector.__name,
    "DET_SIMP",
    "detector_simple_s" as any
  );
  clientServerRegister(factory, EClientObjectClass.CScope, Item.__name, "WP_SCOPE", weapons.wpn_scope_s);
  clientServerRegister(factory, EClientObjectClass.CSilencer, Item.__name, "WP_SILEN", weapons.wpn_silencer_s);
  clientServerRegister(factory, EClientObjectClass.CGrenadeLauncher, Item.__name, "WP_GLAUN", "wpn_grenade_launcher_s");

  // -- OUTFITS --------------------------------------------------------------------------------------------------------
  clientServerRegister(factory, EClientObjectClass.CStalkerOutfit, ItemOutfit.__name, "E_STLK", "equ_stalker_s");
  clientServerRegister(factory, EClientObjectClass.CHelmet, ItemHelmet.__name, "E_HLMET", "equ_helmet_s");

  // -- WEAPONS --------------------------------------------------------------------------------------------------------
  clientServerRegister(
    factory,
    EClientObjectClass.CWeaponBinoculars,
    ItemWeaponMagazined.__name,
    "WP_BINOC",
    weapons.wpn_binocular_s
  );
  clientServerRegister(factory, EClientObjectClass.CWeaponKnife, ItemWeapon.__name, "WP_KNIFE", weapons.wpn_knife_s);
  clientServerRegister(
    factory,
    EClientObjectClass.CWeaponBM16,
    ItemWeaponShotgun.__name,
    "WP_BM16",
    weapons.wpn_bm16_s
  );
  clientServerRegister(factory, EClientObjectClass.CWeaponRG6, ItemWeaponShotgun.__name, "WP_RG6", weapons.wpn_rg6_s);
  clientServerRegister(
    factory,
    EClientObjectClass.CWeaponShotgun,
    ItemWeaponShotgun.__name,
    "WP_SHOTG",
    weapons.wpn_shotgun_s
  );
  clientServerRegister(
    factory,
    EClientObjectClass.CWeaponGroza,
    ItemWeaponMagazinedWGl.__name,
    "WP_GROZA",
    weapons.wpn_groza_s
  );
  clientServerRegister(
    factory,
    EClientObjectClass.CWeaponAK74,
    ItemWeaponMagazinedWGl.__name,
    "WP_AK74",
    weapons.wpn_ak74_s
  );
  clientServerRegister(factory, EClientObjectClass.CWeaponSVD, ItemWeaponMagazined.__name, "WP_SVD", weapons.wpn_svd_s);
  clientServerRegister(
    factory,
    EClientObjectClass.CWeaponLR300,
    ItemWeaponMagazined.__name,
    "WP_LR300",
    weapons.wpn_lr300_s
  );
  clientServerRegister(
    factory,
    EClientObjectClass.CWeaponHPSA,
    ItemWeaponMagazined.__name,
    "WP_HPSA",
    weapons.wpn_hpsa_s
  );
  clientServerRegister(factory, EClientObjectClass.CWeaponPM, ItemWeaponMagazined.__name, "WP_PM", weapons.wpn_pm_s);
  clientServerRegister(
    factory,
    EClientObjectClass.CWeaponRPG7,
    ItemWeaponMagazined.__name,
    "WP_RPG7",
    weapons.wpn_rpg7_s
  );
  clientServerRegister(factory, EClientObjectClass.CWeaponSVU, ItemWeaponMagazined.__name, "WP_SVU", weapons.wpn_svu_s);
  clientServerRegister(
    factory,
    EClientObjectClass.CWeaponUSP45,
    ItemWeaponMagazined.__name,
    "WP_USP45",
    weapons.wpn_usp45_s
  );
  clientServerRegister(factory, EClientObjectClass.CWeaponVal, ItemWeaponMagazined.__name, "WP_VAL", weapons.wpn_val_s);
  clientServerRegister(
    factory,
    EClientObjectClass.CWeaponVintorez,
    ItemWeaponMagazined.__name,
    "WP_VINT",
    weapons.wpn_vintorez_s
  );
  clientServerRegister(
    factory,
    EClientObjectClass.CWeaponWalther,
    ItemWeaponMagazined.__name,
    "WP_WALTH",
    weapons.wpn_walther_s
  );
  clientServerRegister(factory, EClientObjectClass.CWeaponAmmo, ItemAmmo.__name, "AMMO_S", weapons.wpn_ammo_s);
  clientServerRegister(factory, EClientObjectClass.CWeaponAmmo, ItemAmmo.__name, "S_VOG25", weapons.wpn_ammo_vog25_s);
  clientServerRegister(factory, EClientObjectClass.CWeaponAmmo, ItemAmmo.__name, "S_OG7B", weapons.wpn_ammo_og7b_s);
  clientServerRegister(factory, EClientObjectClass.CWeaponAmmo, ItemAmmo.__name, "S_M209", weapons.wpn_ammo_m209_s);
  clientServerRegister(factory, EClientObjectClass.CF1, ItemGrenade.__name, "G_F1_S", weapons.wpn_grenade_f1_s);
  clientServerRegister(factory, EClientObjectClass.CRGD5, ItemGrenade.__name, "G_RGD5_S", weapons.wpn_grenade_rgd5_s);
  clientServerRegister(
    factory,
    EClientObjectClass.CMedkit,
    ItemEatable.__name,
    "S_MEDKI",
    inventory_objects.obj_medkit_s
  );
  clientServerRegister(
    factory,
    EClientObjectClass.CMedkit,
    ItemEatable.__name,
    "S_BANDG",
    inventory_objects.obj_bandage_s
  );
  clientServerRegister(
    factory,
    EClientObjectClass.CAntirad,
    ItemEatable.__name,
    "S_ANTIR",
    inventory_objects.obj_antirad_s
  );
  clientServerRegister(
    factory,
    EClientObjectClass.CFoodItem,
    ItemEatable.__name,
    "S_FOOD",
    inventory_objects.obj_food_s
  );
  clientServerRegister(
    factory,
    EClientObjectClass.CBottleItem,
    ItemEatable.__name,
    "S_BOTTL",
    inventory_objects.obj_bottle_s
  );
  clientServerRegister(
    factory,
    EClientObjectClass.CInventoryBox,
    InventoryBox.__name,
    "S_INVBOX",
    inventory_objects.inventory_box_s
  );
  clientServerRegister(
    factory,
    EClientObjectClass.CExplosiveItem,
    ItemExplosive.__name,
    "S_EXPLO",
    inventory_objects.obj_explosive_s
  );
  clientServerRegister(factory, EClientObjectClass.CPda, ItemPda.__name, "S_PDA", inventory_objects.obj_pda_s);
  clientServerRegister(
    factory,
    EClientObjectClass.CWeaponAutomaticShotgun,
    ItemWeaponAutomaticShotgun.__name,
    "WP_ASHTG",
    weapons.wpn_auto_shotgun_s
  );

  serverRegister(factory, Squad.__name, "ON_OFF_S", "online_offline_group_s");

  // -- ANOMALY ZONES --------------------------------------------------------------------------------------------------
  clientServerRegister(factory, EClientObjectClass.CHairsZone, ZoneVisual.__name, "ZS_BFUZZ", "zone_bfuzz_s");
  clientServerRegister(factory, EClientObjectClass.CMosquitoBald, AnomalousZone.__name, "ZS_MBALD", "zone_mbald_s");
  clientServerRegister(factory, EClientObjectClass.CMincer, AnomalousZone.__name, "ZS_GALAN", "zone_galant_s");
  clientServerRegister(factory, EClientObjectClass.CMincer, AnomalousZone.__name, "ZS_MINCE", "zone_mincer_s");
  clientServerRegister(factory, EClientObjectClass.CRadioactiveZone, AnomalousZone.__name, "ZS_RADIO", "zone_radio_s");
  clientServerRegister(factory, EClientObjectClass.CTorridZone, ZoneTorrid.__name, "ZS_TORRD", "zone_torrid_s");

  // -- MONSTERS -------------------------------------------------------------------------------------------------------
  clientServerRegister(factory, EClientObjectClass.CAI_Bloodsucker, Monster.__name, "SM_BLOOD", "bloodsucker_s");
  clientServerRegister(factory, EClientObjectClass.CAI_Boar, Monster.__name, "SM_BOARW", "boar_s");
  clientServerRegister(factory, EClientObjectClass.CAI_Dog, Monster.__name, "SM_DOG_S", "dog_s");
  clientServerRegister(factory, EClientObjectClass.CAI_Flesh, Monster.__name, "SM_FLESH", "flesh_s");
  clientServerRegister(factory, EClientObjectClass.CAI_PseudoDog, Monster.__name, "SM_P_DOG", "pseudodog_s");
  clientServerRegister(factory, EClientObjectClass.CBurer, Monster.__name, "SM_BURER", "burer_s");
  clientServerRegister(factory, EClientObjectClass.CCat, Monster.__name, "SM_CAT_S", "cat_s");
  clientServerRegister(factory, EClientObjectClass.CChimera, Monster.__name, "SM_CHIMS", "chimera_s");
  clientServerRegister(factory, EClientObjectClass.CController, Monster.__name, "SM_CONTR", "controller_s");
  clientServerRegister(factory, EClientObjectClass.CFracture, Monster.__name, "SM_IZLOM", "fracture_s");
  clientServerRegister(factory, EClientObjectClass.CPoltergeist, Monster.__name, "SM_POLTR", "poltergeist_s");
  clientServerRegister(factory, EClientObjectClass.CPseudoGigant, Monster.__name, "SM_GIANT", "gigant_s");
  clientServerRegister(factory, EClientObjectClass.CZombie, Monster.__name, "SM_ZOMBI", "zombie_s");
  clientServerRegister(factory, EClientObjectClass.CSnork, Monster.__name, "SM_SNORK", "snork_s");
  clientServerRegister(factory, EClientObjectClass.CTushkano, Monster.__name, "SM_TUSHK", "tushkano_s");
  clientServerRegister(factory, EClientObjectClass.CPsyDog, Monster.__name, "SM_DOG_P", "psy_dog_s");
  clientServerRegister(factory, EClientObjectClass.CPsyDogPhantom, Monster.__name, "SM_DOG_F", "psy_dog_phantom_s");
}
