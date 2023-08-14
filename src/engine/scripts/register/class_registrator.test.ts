import { describe, expect, it, jest } from "@jest/globals";

import { EClientObjectClass } from "@/engine/lib/constants/class_ids";
import { registerGameClasses } from "@/engine/scripts/register/class_registrator";
import { mockObjectFactory } from "@/fixtures/xray/mocks/objects/ObjectFactory.mock";
import { getFunctionMock } from "@/fixtures/utils";

describe("'class_registrator' entry point", () => {
  it("'registerGameClasses' should correctly link script and engine classes for all object classes", () => {
    const [factory, factoryStore] = mockObjectFactory();

    registerGameClasses(factory);

    Object.values(EClientObjectClass).forEach((it) => {
      expect(factoryStore.registeredClientClasses.has(it)).toBeTruthy();
    });
  });

  it("'registerGameClasses' should correctly register links", () => {
    const [factory] = mockObjectFactory();

    jest.spyOn(factory, "register").mockImplementation(() => {});

    registerGameClasses(factory);

    expect(getFunctionMock(factory.register).mock.calls).toEqual([
      ["MainMenu", "MAIN_MNU", "main_menu"],
      ["Squad", "ON_OFF_S", "online_offline_group_s"],
      ["ce_smart_zone", "SmartTerrain", "SMRTTRRN", "smart_terrain"],
      ["ce_smart_zone", "ZoneRestrictor", "SPC_RS_S", "script_restr"],
      ["smart_cover_object", "SmartCover", "SMRT_C_S", "smartcover_s"],
      ["CLevelChanger", "LevelChanger", "LVL_CHNG", "level_changer_s"],
      ["CActor", "Actor", "S_ACTOR", "script_actor"],
      ["CAI_Stalker", "Stalker", "AI_STL_S", "script_stalker"],
      ["CHelicopter", "Helicopter", "C_HLCP_S", "script_heli"],
      ["CPhysicObject", "ObjectPhysic", "O_PHYS_S", "script_phys"],
      ["CDestroyablePhysicsObject", "ObjectPhysic", "O_DSTR_S", "destrphys_s"],
      ["hanging_lamp", "ObjectHangingLamp", "SO_HLAMP", "hlamp_s"],
      ["CElectricBall", "ItemArtefact", "SCRPTART", "artefact_s"],
      ["CTorch", "ItemTorch", "TORCH_S", "device_torch_s"],
      ["CScientificDetector", "ItemDetector", "DET_SCIE", "detector_scientific_s"],
      ["CEliteDetector", "ItemDetector", "DET_ELIT", "detector_elite_s"],
      ["CAdvancedDetector", "ItemDetector", "DET_ADVA", "detector_advanced_s"],
      ["CSimpleDetector", "ItemDetector", "DET_SIMP", "detector_simple_s"],
      ["CScope", "Item", "WP_SCOPE", "wpn_scope_s"],
      ["CSilencer", "Item", "WP_SILEN", "wpn_silencer_s"],
      ["CGrenadeLauncher", "Item", "WP_GLAUN", "wpn_grenade_launcher_s"],
      ["CStalkerOutfit", "ItemOutfit", "E_STLK", "equ_stalker_s"],
      ["CHelmet", "ItemHelmet", "E_HLMET", "equ_helmet_s"],
      ["CWeaponBinoculars", "ItemWeaponMagazined", "WP_BINOC", "wpn_binocular_s"],
      ["CWeaponKnife", "ItemWeapon", "WP_KNIFE", "wpn_knife_s"],
      ["CWeaponBM16", "ItemWeaponShotgun", "WP_BM16", "wpn_bm16_s"],
      ["CWeaponRG6", "ItemWeaponShotgun", "WP_RG6", "wpn_rg6_s"],
      ["CWeaponShotgun", "ItemWeaponShotgun", "WP_SHOTG", "wpn_shotgun_s"],
      ["CWeaponGroza", "ItemWeaponMagazinedWGl", "WP_GROZA", "wpn_groza_s"],
      ["CWeaponAK74", "ItemWeaponMagazinedWGl", "WP_AK74", "wpn_ak74_s"],
      ["CWeaponSVD", "ItemWeaponMagazined", "WP_SVD", "wpn_svd_s"],
      ["CWeaponLR300", "ItemWeaponMagazined", "WP_LR300", "wpn_lr300_s"],
      ["CWeaponHPSA", "ItemWeaponMagazined", "WP_HPSA", "wpn_hpsa_s"],
      ["CWeaponPM", "ItemWeaponMagazined", "WP_PM", "wpn_pm_s"],
      ["CWeaponRPG7", "ItemWeaponMagazined", "WP_RPG7", "wpn_rpg7_s"],
      ["CWeaponSVU", "ItemWeaponMagazined", "WP_SVU", "wpn_svu_s"],
      ["CWeaponUSP45", "ItemWeaponMagazined", "WP_USP45", "wpn_usp45_s"],
      ["CWeaponVal", "ItemWeaponMagazined", "WP_VAL", "wpn_val_s"],
      ["CWeaponVintorez", "ItemWeaponMagazined", "WP_VINT", "wpn_vintorez_s"],
      ["CWeaponWalther", "ItemWeaponMagazined", "WP_WALTH", "wpn_walther_s"],
      ["CWeaponAmmo", "ItemAmmo", "AMMO_S", "wpn_ammo_s"],
      ["CWeaponAmmo", "ItemAmmo", "S_VOG25", "wpn_ammo_vog25_s"],
      ["CWeaponAmmo", "ItemAmmo", "S_OG7B", "wpn_ammo_og7b_s"],
      ["CWeaponAmmo", "ItemAmmo", "S_M209", "wpn_ammo_m209_s"],
      ["CF1", "ItemGrenade", "G_F1_S", "wpn_grenade_f1_s"],
      ["CRGD5", "ItemGrenade", "G_RGD5_S", "wpn_grenade_rgd5_s"],
      ["CMedkit", "ItemEatable", "S_MEDKI", "obj_medkit_s"],
      ["CMedkit", "ItemEatable", "S_BANDG", "obj_bandage_s"],
      ["CAntirad", "ItemEatable", "S_ANTIR", "obj_antirad_s"],
      ["CFoodItem", "ItemEatable", "S_FOOD", "obj_food_s"],
      ["CBottleItem", "ItemEatable", "S_BOTTL", "obj_bottle_s"],
      ["CInventoryBox", "InventoryBox", "S_INVBOX", "inventory_box_s"],
      ["CExplosiveItem", "ItemExplosive", "S_EXPLO", "obj_explosive_s"],
      ["CPda", "ItemPda", "S_PDA", "obj_pda_s"],
      ["CWeaponAutomaticShotgun", "ItemWeaponAutomaticShotgun", "WP_ASHTG", "wpn_auto_shotgun_s"],
      ["CHairsZone", "ZoneVisual", "ZS_BFUZZ", "zone_bfuzz_s"],
      ["CMosquitoBald", "ZoneAnomalous", "ZS_MBALD", "zone_mbald_s"],
      ["CMincer", "ZoneAnomalous", "ZS_GALAN", "zone_galant_s"],
      ["CMincer", "ZoneAnomalous", "ZS_MINCE", "zone_mincer_s"],
      ["CRadioactiveZone", "ZoneAnomalous", "ZS_RADIO", "zone_radio_s"],
      ["CTorridZone", "ZoneTorrid", "ZS_TORRD", "zone_torrid_s"],
      ["CAI_Bloodsucker", "Monster", "SM_BLOOD", "bloodsucker_s"],
      ["CAI_Boar", "Monster", "SM_BOARW", "boar_s"],
      ["CAI_Dog", "Monster", "SM_DOG_S", "dog_s"],
      ["CAI_Flesh", "Monster", "SM_FLESH", "flesh_s"],
      ["CAI_PseudoDog", "Monster", "SM_P_DOG", "pseudodog_s"],
      ["CBurer", "Monster", "SM_BURER", "burer_s"],
      ["CCat", "Monster", "SM_CAT_S", "cat_s"],
      ["CChimera", "Monster", "SM_CHIMS", "chimera_s"],
      ["CController", "Monster", "SM_CONTR", "controller_s"],
      ["CFracture", "Monster", "SM_IZLOM", "fracture_s"],
      ["CPoltergeist", "Monster", "SM_POLTR", "poltergeist_s"],
      ["CPseudoGigant", "Monster", "SM_GIANT", "gigant_s"],
      ["CZombie", "Monster", "SM_ZOMBI", "zombie_s"],
      ["CSnork", "Monster", "SM_SNORK", "snork_s"],
      ["CTushkano", "Monster", "SM_TUSHK", "tushkano_s"],
      ["CPsyDog", "Monster", "SM_DOG_P", "psy_dog_s"],
      ["CPsyDogPhantom", "Monster", "SM_DOG_F", "psy_dog_phantom_s"],
    ]);
  });
});
