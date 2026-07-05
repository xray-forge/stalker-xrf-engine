import { IniFile } from "xray16/alias";
import { Nillable, TName, TRate, TSection } from "xray16/lib";
import { $isNil } from "xray16/macros";

import { SYSTEM_INI } from "@/engine/core/database";
import { assert } from "@/engine/core/utils/assertion";
import { parseStringsList, readIniNumber } from "@/engine/core/utils/ini";
import { clamp } from "@/engine/core/utils/number";

/**
 * @param section - Section of weapon to read stats.
 * @param upgradeSections - Serialized list of weapon upgrades.
 * @returns Weapon RPM stat.
 */
export function readWeaponRPM(section: TSection, upgradeSections: Nillable<string> = null): TRate {
  return normalizeWeaponParameter(readWeaponParameter(SYSTEM_INI, section, upgradeSections, "rpm"), 0, 1150);
}

/**
 * @param section - Section of weapon to read stats.
 * @param upgradeSections - Serialized list of weapon upgrades.
 * @returns Weapon handling stat.
 */
export function readWeaponHandling(section: TSection, upgradeSections: Nillable<string> = null): TRate {
  const inertion: TRate = SYSTEM_INI.line_exist(section, "crosshair_inertion")
    ? readWeaponParameter(SYSTEM_INI, section, upgradeSections, "crosshair_inertion")
    : 1;

  return normalizeWeaponParameter(11.9 - inertion, 0, 10.5);
}

/**
 * @param section - Section of weapon to read stats.
 * @param upgradeSections - Serialized list of weapon upgrades.
 * @returns Weapon accuracy stat.
 */
export function readWeaponAccuracy(section: TSection, upgradeSections: Nillable<string> = null): TRate {
  return normalizeWeaponParameter(
    0.85 - readWeaponParameter(SYSTEM_INI, section, upgradeSections, "fire_dispersion_base"),
    0.375,
    0.8
  );
}

/**
 * @param section - Section of weapon to read stats.
 * @param upgradeSections - Serialized list of weapon upgrades.
 * @returns Weapon damage stat for single player game.
 */
export function readWeaponDamage(section: TSection, upgradeSections: Nillable<string> = null): TRate {
  return normalizeWeaponParameter(readWeaponParameter(SYSTEM_INI, section, upgradeSections, "hit_power"), 0, 0.9);
}

/**
 * @param section - Section of weapon to read stats.
 * @param upgradeSections - Serialized list of weapon upgrades.
 * @returns Weapon damage stat for multiplayer game.
 */
export function readWeaponDamageMultiplayer(section: TSection, upgradeSections: Nillable<string> = null): TRate {
  return normalizeWeaponParameterInMultiplayer(
    readWeaponParameter(SYSTEM_INI, section, upgradeSections, "hit_power") * 100
  );
}

/**
 * @param ini - Ini file to read data from.
 * @param section - Section to read in ini.
 * @param upgradeSections - Comma-separated list of applied upgrades.
 * @param field - Field to read in ini.
 * @returns Weapon parameter based on section/field and upgrades.
 */
export function readWeaponParameter(
  ini: IniFile,
  section: TSection,
  upgradeSections: Nillable<string>,
  field: TName
): TRate {
  assert(
    ini.line_exist(section, field),
    "Unexpected ini file read operation, field '%s' in section '%s' does not exist.",
    field,
    section
  );

  let parameter: TRate = ini.r_float(section, field);

  if ($isNil(upgradeSections) || upgradeSections === "") {
    return parameter;
  } else {
    for (const [, upgradeSection] of parseStringsList(upgradeSections)) {
      const value: TRate = readIniNumber(ini, upgradeSection, field, false, 0);

      // For hit power override value, increment otherwise.
      if (field === "hit_power") {
        if (parameter < value) {
          parameter = value;
        }
      } else {
        parameter += value;
      }
    }

    return parameter;
  }
}

/**
 * @param value - Value to normalize.
 * @param min - Minimal value.
 * @param max - Maximal value.
 * @returns Normalize parameter for single player variant.
 */
export function normalizeWeaponParameter(value: TRate, min: TRate, max: TRate): TRate {
  return math.max((100 * (value - min)) / (max - min), 0);
}

/**
 * @param value - Value to normalize.
 * @returns Normalize parameter for multiplayer variant.
 */
export function normalizeWeaponParameterInMultiplayer(value: TRate): TRate {
  return clamp(value, 1, 100);
}
