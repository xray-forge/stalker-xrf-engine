import { SYSTEM_INI } from "@/engine/core/database";
import { parseStringsList } from "@/engine/core/utils/parse";
import { TRate, TSection } from "@/engine/lib/types";

/**
 * todo;
 */
export class WeaponParams {
  /**
   * todo;
   */
  public static getWeaponRPM(section: TSection, upgradeSections: string): TRate {
    return WeaponParams.normalize(WeaponParams.readFloat(section, upgradeSections, "rpm"), 0, 1150);
  }

  /**
   * todo;
   */
  public static getWeaponDamage(section: TSection, upgradeSections: string): TRate {
    return WeaponParams.normalize(WeaponParams.readFloat(section, upgradeSections, "hit_power"), 0, 0.9);
  }

  /**
   * todo;
   */
  public static getWeaponDamageMultiplayer(section: TSection, upgradeSections: string): TRate {
    return WeaponParams.normalizeForMultiplayer(WeaponParams.readFloat(section, upgradeSections, "hit_power") * 100);
  }

  /**
   * todo;
   */
  public static getWeaponHandling(section: TSection, upgradeSections: string): TRate {
    let crosshairInertion: TRate = SYSTEM_INI.line_exist(section, "crosshair_inertion")
      ? WeaponParams.readFloat(section, upgradeSections, "crosshair_inertion")
      : 1;

    crosshairInertion = 11.9 - crosshairInertion;

    return WeaponParams.normalize(crosshairInertion, 0, 10.5);
  }

  /**
   * todo;
   */
  public static getWeaponAccuracy(section: TSection, upgradeSections: string): TRate {
    const fireDispersionBase: TRate = 0.85 - WeaponParams.readFloat(section, upgradeSections, "fire_dispersion_base");

    return WeaponParams.normalize(fireDispersionBase, 0.375, 0.8);
  }

  /**
   * todo;
   */
  private static readFloat(section: string, upgradeSections: string, param: string): number {
    let result: TRate = SYSTEM_INI.r_float(section, param);

    if (upgradeSections === null || upgradeSections === "") {
      return result;
    }

    for (const [index, section] of parseStringsList(upgradeSections)) {
      if (param === "hit_power") {
        if (result < WeaponParams.readSectionIfExists(section, param, 0)) {
          result = WeaponParams.readSectionIfExists(section, param, 0);
        }
      } else {
        result += WeaponParams.readSectionIfExists(section, param, 0);
      }
    }

    return result;
  }

  /**
   * todo;
   */
  private static readSectionIfExists(section: TSection, value: string, defaultValue: number): number {
    if (SYSTEM_INI.section_exist(section) && SYSTEM_INI.line_exist(section, value)) {
      return SYSTEM_INI.r_float(section, value);
    } else {
      return defaultValue;
    }
  }

  /**
   * todo;
   */
  private static normalize(value: number, min: number, max: number): number {
    const d: TRate = (100 * (value - min)) / (max - min);

    return d < 0 ? 0 : d;
  }

  /**
   * todo;
   */
  private static normalizeForMultiplayer(value: number): number {
    if (value > 100) {
      return 100;
    } else if (value < 1) {
      return 1;
    } else {
      return value;
    }
  }
}
