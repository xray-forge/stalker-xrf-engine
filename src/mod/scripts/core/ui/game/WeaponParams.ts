import { system_ini, XR_ini_file } from "xray16";

import { parseNames } from "@/mod/scripts/utils/parse";

export class WeaponParams {
  public static GetRPM(wpn_section: string, upgr_sections: string): number {
    return WeaponParams.normalize(WeaponParams.read_float(wpn_section, upgr_sections, "rpm"), 0, 1150);
  }

  public static GetDamage(wpn_section: string, upgr_sections: string): number {
    return WeaponParams.normalize(WeaponParams.read_float(wpn_section, upgr_sections, "hit_power"), 0, 0.9);
  }

  public static GetDamageMP(wpn_section: string, upgr_sections: string): number {
    return WeaponParams.normalizeMP(WeaponParams.read_float(wpn_section, upgr_sections, "hit_power") * 100);
  }

  public static GetHandling(wpn_section: string, upgr_sections: string): number {
    const ltx: XR_ini_file = system_ini();

    let crosshair_inertion = ltx.line_exist(wpn_section, "crosshair_inertion")
      ? WeaponParams.read_float(wpn_section, upgr_sections, "crosshair_inertion")
      : 1;

    crosshair_inertion = 11.9 - crosshair_inertion;

    return WeaponParams.normalize(crosshair_inertion, 0, 10.5);
  }

  public static GetAccuracy(wpn_section: string, upgr_sections: string): number {
    const fire_dispersion_base: number =
      0.85 - WeaponParams.read_float(wpn_section, upgr_sections, "fire_dispersion_base");

    return WeaponParams.normalize(fire_dispersion_base, 0.375, 0.8);
  }

  private static read_float(wpn_section: string, upgr_sections: string, param: string): number {
    const ltx: XR_ini_file = system_ini();
    let result: number = ltx.r_float(wpn_section, param);

    if (upgr_sections === null || upgr_sections === "") {
      return result;
    }

    for (const [k, sect] of parseNames(upgr_sections)) {
      if (param === "hit_power") {
        if (result < WeaponParams.read_if_exist(sect, param, 0)) {
          result = WeaponParams.read_if_exist(sect, param, 0);
        }
      } else {
        result = result + WeaponParams.read_if_exist(sect, param, 0);
      }
    }

    return result;
  }

  private static read_if_exist(section: string, value: string, defaultValue: number): number {
    const ltx: XR_ini_file = system_ini();

    if (ltx.section_exist(section) && ltx.line_exist(section, value)) {
      return ltx.r_float(section, value);
    } else {
      return defaultValue;
    }
  }

  private static normalize(value: number, min: number, max: number): number {
    const d: number = (100 * (value - min)) / (max - min);

    return d < 0 ? 0 : d;
  }

  private static normalizeMP(value: number): number {
    if (value > 100) {
      return 100;
    } else if (value < 1) {
      return 1;
    } else {
      return value;
    }
  }
}
