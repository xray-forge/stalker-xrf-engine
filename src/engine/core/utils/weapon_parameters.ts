import { SYSTEM_INI } from "@/engine/core/database";
import { assert } from "@/engine/core/utils/assertion";
import { parseStringsList, readIniNumber } from "@/engine/core/utils/ini";
import { clamp } from "@/engine/core/utils/number";
import { IniFile, Optional, TName, TRate, TSection } from "@/engine/lib/types";

/**
 * @param section - section of weapon to read stats
 * @param upgradeSections - serialized list of weapon upgrades
 * @returns weapon RPM stat
 */
export function readWeaponRPM(section: TSection, upgradeSections: Optional<string> = null): TRate {
  return normalizeWeaponParameter(readWeaponParameter(SYSTEM_INI, section, upgradeSections, "rpm"), 0, 1150);
}

/**
 * @param section - section of weapon to read stats
 * @param upgradeSections - serialized list of weapon upgrades
 * @returns weapon handling stat
 */
export function readWeaponHandling(section: TSection, upgradeSections: Optional<string> = null): TRate {
  const inertion: TRate = SYSTEM_INI.line_exist(section, "crosshair_inertion")
    ? readWeaponParameter(SYSTEM_INI, section, upgradeSections, "crosshair_inertion")
    : 1;

  return normalizeWeaponParameter(11.9 - inertion, 0, 10.5);
}

/**
 * @param section - section of weapon to read stats
 * @param upgradeSections - serialized list of weapon upgrades
 * @returns weapon accuracy stat
 */
export function readWeaponAccuracy(section: TSection, upgradeSections: Optional<string> = null): TRate {
  return normalizeWeaponParameter(
    0.85 - readWeaponParameter(SYSTEM_INI, section, upgradeSections, "fire_dispersion_base"),
    0.375,
    0.8
  );
}

/**
 * @param section - section of weapon to read stats
 * @param upgradeSections - serialized list of weapon upgrades
 * @returns weapon damage stat for single player game
 */
export function readWeaponDamage(section: TSection, upgradeSections: Optional<string> = null): TRate {
  return normalizeWeaponParameter(readWeaponParameter(SYSTEM_INI, section, upgradeSections, "hit_power"), 0, 0.9);
}

/**
 * @param section - section of weapon to read stats
 * @param upgradeSections - serialized list of weapon upgrades
 * @returns weapon damage stat for multiplayer game
 */
export function readWeaponDamageMultiplayer(section: TSection, upgradeSections: Optional<string> = null): TRate {
  return normalizeWeaponParameterInMultiplayer(
    readWeaponParameter(SYSTEM_INI, section, upgradeSections, "hit_power") * 100
  );
}

/**
 * @param ini - ini file to read data from
 * @param section - section to read in ini
 * @param upgradeSections - comma-separated list of applied upgrades
 * @param field - field to read in ini
 * @returns weapon parameter based on section/field and upgrades
 */
export function readWeaponParameter(
  ini: IniFile,
  section: TSection,
  upgradeSections: Optional<string>,
  field: TName
): TRate {
  assert(
    ini.line_exist(section, field),
    "Unexpected ini file read operation, field '%s' in section '%s' does not exist.",
    field,
    section
  );

  let parameter: TRate = ini.r_float(section, field);

  if (upgradeSections === null || upgradeSections === "") {
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
 * @param value - value to normalize
 * @param min - minimal value
 * @param max - maximal value
 * @returns normalize parameter for single player variant
 */
export function normalizeWeaponParameter(value: TRate, min: TRate, max: TRate): TRate {
  return math.max((100 * (value - min)) / (max - min), 0);
}

/**
 * @param value - value to normalize
 * @returns normalize parameter for multiplayer variant
 */
export function normalizeWeaponParameterInMultiplayer(value: TRate): TRate {
  return clamp(value, 1, 100);
}
