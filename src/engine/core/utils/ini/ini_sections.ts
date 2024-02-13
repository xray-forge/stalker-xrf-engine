import { SYSTEM_INI } from "@/engine/core/database/ini_registry";
import { readIniString } from "@/engine/core/utils/ini/ini_read";
import {
  AMMO_CONFIG_CLASSES,
  ARTEFACT_CONFIG_CLASSES,
  DETECTOR_CONFIG_CLASSES,
  EConfigClassId,
  WEAPON_ADDONS_CONFIG_CLASSES,
  WEAPON_CONFIG_CLASSES,
} from "@/engine/lib/constants/class_ids";
import { LuaArray, TSection } from "@/engine/lib/types";

/**
 * @param sections - list of sections to check and filter
 * @returns filtered list of sections that does not contain sections with defined story id
 */
export function getSectionsWithoutStoryIDs(sections: LuaArray<TSection>): LuaArray<TSection> {
  const filtered: LuaArray<TSection> = new LuaTable();

  for (const [, it] of sections) {
    if (!readIniString(SYSTEM_INI, it, "story_id")) {
      table.insert(filtered, it);
    }
  }

  return filtered;
}

/**
 * @returns list of weapons / grenades sections
 */
export function getWeaponSections(): LuaArray<TSection> {
  const list: LuaArray<TSection> = new LuaTable();

  SYSTEM_INI.section_for_each((it) => {
    if (WEAPON_CONFIG_CLASSES.has(readIniString(SYSTEM_INI, it, "class"))) {
      table.insert(list, it);
    }
  });

  return list;
}

/**
 * @returns list of weapons addons sections like scopes and grenade launchers
 */
export function getWeaponAddonsSections(): LuaArray<TSection> {
  const list: LuaArray<TSection> = new LuaTable();

  SYSTEM_INI.section_for_each((it) => {
    if (WEAPON_ADDONS_CONFIG_CLASSES.has(readIniString(SYSTEM_INI, it, "class"))) {
      table.insert(list, it);
    }
  });

  return list;
}

/**
 * @returns list of helmets sections
 */
export function getHelmetsSections(): LuaArray<TSection> {
  const list: LuaArray<TSection> = new LuaTable();

  SYSTEM_INI.section_for_each((it) => {
    if (it !== "helmet" && readIniString(SYSTEM_INI, it, "class") === EConfigClassId.E_HLMET) {
      table.insert(list, it);
    }
  });

  return list;
}

/**
 * @returns list of ammo sections
 */
export function getAmmoSections(): LuaArray<TSection> {
  const list: LuaArray<TSection> = new LuaTable();

  SYSTEM_INI.section_for_each((it) => {
    if (AMMO_CONFIG_CLASSES.has(readIniString(SYSTEM_INI, it, "class"))) {
      table.insert(list, it);
    }
  });

  return list;
}

/**
 * @returns list of artefacts sections
 */
export function getArtefactsSections(): LuaArray<TSection> {
  const list: LuaArray<TSection> = new LuaTable();

  SYSTEM_INI.section_for_each((it) => {
    if (ARTEFACT_CONFIG_CLASSES.has(readIniString(SYSTEM_INI, it, "class"))) {
      table.insert(list, it);
    }
  });

  return list;
}

/**
 * @returns list of detectors sections
 */
export function getDetectorsSections(): LuaArray<TSection> {
  const list: LuaArray<TSection> = new LuaTable();

  SYSTEM_INI.section_for_each((it) => {
    if (DETECTOR_CONFIG_CLASSES.has(readIniString(SYSTEM_INI, it, "class"))) {
      table.insert(list, it);
    }
  });

  return list;
}

/**
 * @returns list of outfits sections
 */
export function getOutfitSections(): LuaArray<TSection> {
  const list: LuaArray<TSection> = new LuaTable();

  SYSTEM_INI.section_for_each((it) => {
    if (readIniString(SYSTEM_INI, it, "class") === EConfigClassId.E_STLK) {
      table.insert(list, it);
    }
  });

  return list;
}

/**
 * @returns list of simulation groups sections
 */
export function getSimulationGroupSections(): LuaArray<TSection> {
  const list: LuaArray<TSection> = new LuaTable();

  SYSTEM_INI.section_for_each((it) => {
    if (it !== "online_offline_group" && readIniString(SYSTEM_INI, it, "class") === EConfigClassId.ON_OFF_S) {
      table.insert(list, it);
    }
  });

  return list;
}

/**
 * @returns list of stalker sections
 */
export function getStalkerSections(): LuaArray<TSection> {
  const list: LuaArray<TSection> = new LuaTable();

  SYSTEM_INI.section_for_each((it) => {
    if (readIniString(SYSTEM_INI, it, "class") === EConfigClassId.AI_STL_S) {
      table.insert(list, it);
    }
  });

  return list;
}

/**
 * @returns list of boosters sections
 */
export function getBoosterSections(): LuaArray<TSection> {
  const list: LuaArray<TSection> = new LuaTable();

  SYSTEM_INI.section_for_each((it) => {
    if (it !== "default" && readIniString(SYSTEM_INI, it, "class") === EConfigClassId.S_FOOD) {
      table.insert(list, it);
    }
  });

  return list;
}
