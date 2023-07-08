import { SYSTEM_INI } from "@/engine/core/database";
import { LuaArray, TSection } from "@/engine/lib/types";

/**
 * Get all weapons sections.
 *
 * @returns list of weapons / grenades sections
 */
export function getWeaponSections(): LuaArray<TSection> {
  const list: LuaArray<TSection> = new LuaTable();

  SYSTEM_INI.section_for_each((it) => {
    if ((it.startsWith("wpn_") || it.startsWith("grenade_")) && !it.endsWith("_hud")) {
      table.insert(list, it);
    }
  });

  return list;
}

/**
 * Get all helmets sections.
 *
 * @returns list of helmets sections
 */
export function getHelmetsSections(): LuaArray<TSection> {
  const list: LuaArray<TSection> = new LuaTable();

  SYSTEM_INI.section_for_each((it) => {
    if (it.startsWith("helm_")) {
      table.insert(list, it);
    }
  });

  return list;
}

/**
 * Get all ammo sections.
 *
 * @returns list of ammo sections
 */
export function getAmmoSections(): LuaArray<TSection> {
  const list: LuaArray<TSection> = new LuaTable();

  SYSTEM_INI.section_for_each((it) => {
    if (it.startsWith("ammo_") && it !== "ammo_base") {
      table.insert(list, it);
    }
  });

  return list;
}

/**
 * Get all artefacts sections.
 *
 * @returns list of artefacts sections
 */
export function getArtefactsSections(): LuaArray<TSection> {
  const list: LuaArray<TSection> = new LuaTable();

  SYSTEM_INI.section_for_each((it) => {
    if (it !== "af_base" && it.startsWith("af_") && !it.startsWith("af_activation") && !it.endsWith("_absorbation")) {
      table.insert(list, it);
    }
  });

  return list;
}

/**
 * Get all outfit sections.
 *
 * @returns list of outfits sections
 */
export function getOutfitSections(): LuaArray<TSection> {
  const list: LuaArray<TSection> = new LuaTable();

  SYSTEM_INI.section_for_each((it) => {
    if (
      it !== "without_outfit" &&
      it !== "outfit_base" &&
      it.includes("outfit") &&
      !it.startsWith("up_") &&
      !it.startsWith("sect_") &&
      !it.startsWith("prop_") &&
      !it.endsWith("_immunities") &&
      !it.endsWith("_bones")
    ) {
      table.insert(list, it);
    }
  });

  return list;
}

/**
 * Get all stalker sections.
 *
 * @returns list of simulation groups sections
 */
export function getSimulationGroupSections(): LuaArray<TSection> {
  const list: LuaArray<TSection> = new LuaTable();

  SYSTEM_INI.section_for_each((it) => {
    if (it.startsWith("simulation_") || string.match(it, "._sim_squad_.")[0]) {
      table.insert(list, it);
    }
  });

  return list;
}

/**
 * Get all stalker group sections.
 *
 * @returns list of stalker sections
 */
export function getStalkerSections(): LuaArray<TSection> {
  const list: LuaArray<TSection> = new LuaTable();

  SYSTEM_INI.section_for_each((it) => {
    if (it.startsWith("sim_default_")) {
      table.insert(list, it);
    }
  });

  return list;
}
