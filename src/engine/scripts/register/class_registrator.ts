import { Actor, Monster, Stalker } from "@/engine/core/objects/creature";
import { Helicopter } from "@/engine/core/objects/helicopter";
import {
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
} from "@/engine/core/objects/item";
import { LevelChanger } from "@/engine/core/objects/level";
import { ObjectHangingLamp, ObjectPhysic } from "@/engine/core/objects/physic";
import { SmartCover } from "@/engine/core/objects/smart_cover";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { Squad } from "@/engine/core/objects/squad";
import { ZoneAnomalous, ZoneRestrictor, ZoneTorrid, ZoneVisual } from "@/engine/core/objects/zone";
import { MainMenu } from "@/engine/core/ui/menu";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EConfigClassId, EGameObjectClass, EScriptClassId } from "@/engine/lib/constants/class_ids";
import { ObjectFactory, TClassKey } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Register game classes and link corresponding c++, lua and ltx matches.
 * Related to xray: src/xrServerEntities/clsid_game.h
 *
 * @param factory - game engine factory to register game objects links
 */
export function registerGameClasses(factory: ObjectFactory): void {
  logger.info("Registering game classes bindings");

  factory.register(MainMenu.__name, EConfigClassId.MAIN_MNU, EScriptClassId.MAIN_MENU);

  factory.register(Squad.__name, EConfigClassId.ON_OFF_S, EScriptClassId.ONLINE_OFFLINE_GROUP_S);

  // General:
  factory.register(
    EGameObjectClass.ce_smart_zone,
    SmartTerrain.__name,
    EConfigClassId.SMART_TERRAIN,
    EScriptClassId.SMART_TERRAIN
  );
  factory.register(
    EGameObjectClass.ce_smart_zone,
    ZoneRestrictor.__name,
    EConfigClassId.SPC_RS_S,
    EScriptClassId.SCRIPT_RESTRICTOR
  );
  factory.register(
    EGameObjectClass.smart_cover_object,
    SmartCover.__name,
    EConfigClassId.SMRT_C_S,
    EScriptClassId.SMARTCOVER_S
  );
  factory.register(
    EGameObjectClass.CLevelChanger,
    LevelChanger.__name,
    EConfigClassId.LVL_CHNG,
    EScriptClassId.LEVEL_CHANGER_S
  );
  factory.register(EGameObjectClass.CActor, Actor.__name, EConfigClassId.S_ACTOR, EScriptClassId.SCRIPT_ACTOR);
  factory.register(
    EGameObjectClass.CAI_Stalker,
    Stalker.__name,
    EConfigClassId.AI_STL_S,
    EScriptClassId.SCRIPT_STALKER
  );
  factory.register(
    EGameObjectClass.CHelicopter,
    Helicopter.__name,
    EConfigClassId.C_HLCP_S,
    EScriptClassId.SCRIPT_HELI
  );

  factory.register(
    EGameObjectClass.CPhysicObject,
    ObjectPhysic.__name,
    EConfigClassId.O_PHYS_S,
    EScriptClassId.SCRIPT_PHYS
  );
  factory.register(
    EGameObjectClass.CDestroyablePhysicsObject,
    ObjectPhysic.__name,
    EConfigClassId.O_DSTR_S,
    EScriptClassId.DESTRPHYS_S
  );
  factory.register(
    EGameObjectClass.hanging_lamp,
    ObjectHangingLamp.__name,
    EConfigClassId.SO_HLAMP,
    EScriptClassId.HLAMP_S
  );

  // Artefacts:
  factory.register(
    EGameObjectClass.CElectricBall,
    ItemArtefact.__name,
    EConfigClassId.SCRPTART,
    EScriptClassId.ARTEFACT_S
  );

  // Devices:
  factory.register(EGameObjectClass.CTorch, ItemTorch.__name, EConfigClassId.TORCH_S, EScriptClassId.DEVICE_TORCH_S);
  factory.register(
    EGameObjectClass.CScientificDetector,
    ItemDetector.__name,
    EConfigClassId.DET_SCIE,
    EScriptClassId.DETECTOR_SCIENTIFIC_S
  );
  factory.register(
    EGameObjectClass.CEliteDetector,
    ItemDetector.__name,
    EConfigClassId.DET_ELIT,
    EScriptClassId.DETECTOR_ELITE_S as TClassKey
  );
  factory.register(
    EGameObjectClass.CAdvancedDetector,
    ItemDetector.__name,
    EConfigClassId.DET_ADVA,
    EScriptClassId.DETECTOR_ADVANCED_S as TClassKey
  );
  factory.register(
    EGameObjectClass.CSimpleDetector,
    ItemDetector.__name,
    EConfigClassId.DET_SIMP,
    EScriptClassId.DETECTOR_SIMPLE_S as TClassKey
  );
  factory.register(EGameObjectClass.CScope, Item.__name, EConfigClassId.WP_SCOPE, EScriptClassId.WPN_SCOPE_S);
  factory.register(EGameObjectClass.CSilencer, Item.__name, EConfigClassId.WP_SILEN, EScriptClassId.WPN_SILENCER_S);
  factory.register(
    EGameObjectClass.CGrenadeLauncher,
    Item.__name,
    EConfigClassId.WP_GLAUN,
    EScriptClassId.WPN_GRENADE_LAUNCHER_S
  );

  // Outfits:
  factory.register(
    EGameObjectClass.CStalkerOutfit,
    ItemOutfit.__name,
    EConfigClassId.E_STLK,
    EScriptClassId.EQU_STALKER_S
  );
  factory.register(EGameObjectClass.CHelmet, ItemHelmet.__name, EConfigClassId.E_HLMET, EScriptClassId.EQU_HELMET_S);

  // Weapons:
  factory.register(
    EGameObjectClass.CWeaponBinoculars,
    ItemWeaponMagazined.__name,
    EConfigClassId.WP_BINOC,
    EScriptClassId.WPN_BINOCULAR_S
  );
  factory.register(
    EGameObjectClass.CWeaponKnife,
    ItemWeapon.__name,
    EConfigClassId.WP_KNIFE,
    EScriptClassId.WPN_KNIFE_S
  );
  factory.register(
    EGameObjectClass.CWeaponBM16,
    ItemWeaponShotgun.__name,
    EConfigClassId.WP_BM16,
    EScriptClassId.WPN_BM16_S
  );
  factory.register(
    EGameObjectClass.CWeaponRG6,
    ItemWeaponShotgun.__name,
    EConfigClassId.WP_RG6,
    EScriptClassId.WPN_RG6_S
  );
  factory.register(
    EGameObjectClass.CWeaponShotgun,
    ItemWeaponShotgun.__name,
    EConfigClassId.WP_SHOTG,
    EScriptClassId.WPN_SHOTGUN_S
  );
  factory.register(
    EGameObjectClass.CWeaponGroza,
    ItemWeaponMagazinedWGl.__name,
    EConfigClassId.WP_GROZA,
    EScriptClassId.WPN_GROZA_S
  );
  factory.register(
    EGameObjectClass.CWeaponAK74,
    ItemWeaponMagazinedWGl.__name,
    EConfigClassId.WP_AK74,
    EScriptClassId.WPN_AK74_S
  );
  factory.register(
    EGameObjectClass.CWeaponSVD,
    ItemWeaponMagazined.__name,
    EConfigClassId.WP_SVD,
    EScriptClassId.WPN_SVD_S
  );
  factory.register(
    EGameObjectClass.CWeaponLR300,
    ItemWeaponMagazined.__name,
    EConfigClassId.WP_LR300,
    EScriptClassId.WPN_LR300_S
  );
  factory.register(
    EGameObjectClass.CWeaponHPSA,
    ItemWeaponMagazined.__name,
    EConfigClassId.WP_HPSA,
    EScriptClassId.WPN_HPSA_S
  );
  factory.register(
    EGameObjectClass.CWeaponPM,
    ItemWeaponMagazined.__name,
    EConfigClassId.WP_PM,
    EScriptClassId.WPN_PM_S
  );
  factory.register(
    EGameObjectClass.CWeaponRPG7,
    ItemWeaponMagazined.__name,
    EConfigClassId.WP_RPG7,
    EScriptClassId.WPN_RPG7_S
  );
  factory.register(
    EGameObjectClass.CWeaponSVU,
    ItemWeaponMagazined.__name,
    EConfigClassId.WP_SVU,
    EScriptClassId.WPN_SVU_S
  );
  factory.register(
    EGameObjectClass.CWeaponUSP45,
    ItemWeaponMagazined.__name,
    EConfigClassId.WP_USP45,
    EScriptClassId.WPN_USP45_S
  );
  factory.register(
    EGameObjectClass.CWeaponVal,
    ItemWeaponMagazined.__name,
    EConfigClassId.WP_VAL,
    EScriptClassId.WPN_VAL_S
  );
  factory.register(
    EGameObjectClass.CWeaponVintorez,
    ItemWeaponMagazined.__name,
    EConfigClassId.WP_VINT,
    EScriptClassId.WPN_VINTOREZ_S
  );
  factory.register(
    EGameObjectClass.CWeaponWalther,
    ItemWeaponMagazined.__name,
    EConfigClassId.WP_WALTH,
    EScriptClassId.WPN_WALTHER_S
  );
  factory.register(EGameObjectClass.CWeaponAmmo, ItemAmmo.__name, EConfigClassId.AMMO_S, EScriptClassId.WPN_AMMO_S);
  factory.register(
    EGameObjectClass.CWeaponAmmo,
    ItemAmmo.__name,
    EConfigClassId.S_VOG25,
    EScriptClassId.WPN_AMMO_VOG25_S
  );
  factory.register(
    EGameObjectClass.CWeaponAmmo,
    ItemAmmo.__name,
    EConfigClassId.S_OG7B,
    EScriptClassId.WPN_AMMO_OG7B_S
  );
  factory.register(
    EGameObjectClass.CWeaponAmmo,
    ItemAmmo.__name,
    EConfigClassId.S_M209,
    EScriptClassId.WPN_AMMO_M209_S
  );
  factory.register(EGameObjectClass.CF1, ItemGrenade.__name, EConfigClassId.G_F1_S, EScriptClassId.WPN_GRENADE_F1_S);
  factory.register(
    EGameObjectClass.CRGD5,
    ItemGrenade.__name,
    EConfigClassId.G_RGD5_S,
    EScriptClassId.WPN_GRENADE_RGD5_S
  );
  factory.register(EGameObjectClass.CMedkit, ItemEatable.__name, EConfigClassId.S_MEDKI, EScriptClassId.OBJ_MEDKIT_S);
  factory.register(EGameObjectClass.CMedkit, ItemEatable.__name, EConfigClassId.S_BANDG, EScriptClassId.OBJ_BANDAGE_S);
  factory.register(EGameObjectClass.CAntirad, ItemEatable.__name, EConfigClassId.S_ANTIR, EScriptClassId.OBJ_ANTIRAD_S);
  factory.register(EGameObjectClass.CFoodItem, ItemEatable.__name, EConfigClassId.S_FOOD, EScriptClassId.OBJ_FOOD_S);
  factory.register(
    EGameObjectClass.CBottleItem,
    ItemEatable.__name,
    EConfigClassId.S_BOTTL,
    EScriptClassId.OBJ_BOTTLE_S
  );
  factory.register(
    EGameObjectClass.CInventoryBox,
    InventoryBox.__name,
    EConfigClassId.S_INVBOX,
    EScriptClassId.INVENTORY_BOX_S
  );
  factory.register(
    EGameObjectClass.CExplosiveItem,
    ItemExplosive.__name,
    EConfigClassId.S_EXPLO,
    EScriptClassId.OBJ_EXPLOSIVE_S
  );
  factory.register(EGameObjectClass.CPda, ItemPda.__name, EConfigClassId.S_PDA, EScriptClassId.OBJ_PDA_S);
  factory.register(
    EGameObjectClass.CWeaponAutomaticShotgun,
    ItemWeaponAutomaticShotgun.__name,
    EConfigClassId.WP_ASHTG,
    EScriptClassId.WPN_AUTO_SHOTGUN_S
  );

  // Anomalies:
  factory.register(
    EGameObjectClass.CHairsZone,
    ZoneVisual.__name,
    EConfigClassId.ZS_BFUZZ,
    EScriptClassId.ZONE_BFUZZ_S
  );
  factory.register(
    EGameObjectClass.CMosquitoBald,
    ZoneAnomalous.__name,
    EConfigClassId.ZS_MBALD,
    EScriptClassId.ZONE_MBALD_S
  );
  factory.register(
    EGameObjectClass.CMincer,
    ZoneAnomalous.__name,
    EConfigClassId.ZS_GALAN,
    EScriptClassId.ZONE_GALANT_S
  );
  factory.register(
    EGameObjectClass.CMincer,
    ZoneAnomalous.__name,
    EConfigClassId.ZS_MINCE,
    EScriptClassId.ZONE_MINCER_S
  );
  factory.register(
    EGameObjectClass.CRadioactiveZone,
    ZoneAnomalous.__name,
    EConfigClassId.ZS_RADIO,
    EScriptClassId.ZONE_RADIO_S
  );
  factory.register(
    EGameObjectClass.CTorridZone,
    ZoneTorrid.__name,
    EConfigClassId.ZS_TORRD,
    EScriptClassId.ZONE_TORRID_S
  );

  // Monsters:
  factory.register(
    EGameObjectClass.CAI_Bloodsucker,
    Monster.__name,
    EConfigClassId.SM_BLOOD,
    EScriptClassId.BLOODSUCKER_S
  );
  factory.register(EGameObjectClass.CAI_Boar, Monster.__name, EConfigClassId.SM_BOARW, EScriptClassId.BOAR_S);
  factory.register(EGameObjectClass.CAI_Dog, Monster.__name, EConfigClassId.SM_DOG_S, EScriptClassId.DOG_S);
  factory.register(EGameObjectClass.CAI_Flesh, Monster.__name, EConfigClassId.SM_FLESH, EScriptClassId.FLESH_S);
  factory.register(EGameObjectClass.CAI_PseudoDog, Monster.__name, EConfigClassId.SM_P_DOG, EScriptClassId.PSEUDODOG_S);
  factory.register(EGameObjectClass.CBurer, Monster.__name, EConfigClassId.SM_BURER, EScriptClassId.BURER_S);
  factory.register(EGameObjectClass.CCat, Monster.__name, EConfigClassId.SM_CAT_S, EScriptClassId.CAT_S);
  factory.register(EGameObjectClass.CChimera, Monster.__name, EConfigClassId.SM_CHIMS, EScriptClassId.CHIMERA_S);
  factory.register(EGameObjectClass.CController, Monster.__name, EConfigClassId.SM_CONTR, EScriptClassId.CONTROLLER_S);
  factory.register(EGameObjectClass.CFracture, Monster.__name, EConfigClassId.SM_IZLOM, EScriptClassId.FRACTURE_S);
  factory.register(
    EGameObjectClass.CPoltergeist,
    Monster.__name,
    EConfigClassId.SM_POLTR,
    EScriptClassId.POLTERGEIST_S
  );
  factory.register(EGameObjectClass.CPseudoGigant, Monster.__name, EConfigClassId.SM_GIANT, EScriptClassId.GIGANT_S);
  factory.register(EGameObjectClass.CZombie, Monster.__name, EConfigClassId.SM_ZOMBI, EScriptClassId.ZOMBIE_S);
  factory.register(EGameObjectClass.CSnork, Monster.__name, EConfigClassId.SM_SNORK, EScriptClassId.SNORK_S);
  factory.register(EGameObjectClass.CTushkano, Monster.__name, EConfigClassId.SM_TUSHK, EScriptClassId.TUSHKANO_S);
  factory.register(EGameObjectClass.CPsyDog, Monster.__name, EConfigClassId.SM_DOG_P, EScriptClassId.PSY_DOG_S);
  factory.register(
    EGameObjectClass.CPsyDogPhantom,
    Monster.__name,
    EConfigClassId.SM_DOG_F,
    EScriptClassId.PSY_DOG_PHANTOM_S
  );

  /**
   * todo:
   * ADD(CHolderEntityObject, CSE_ALifeDynamicObjectVisual, CLSID_OBJECT_HOLDER_ENT, "obj_holder_ent");
   */
}
