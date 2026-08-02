import { extern, TSection } from "xray16/lib";

import {
  readWeaponAccuracy,
  readWeaponDamage,
  readWeaponDamageMultiplayer,
  readWeaponHandling,
  readWeaponRPM,
} from "@/engine/core/utils/weapon_parameters";

/** Inventory weapon parameter callbacks. */
extern("ui_wpn_params", {
  GetRPM: (section: TSection, upgradeSections: string): number => readWeaponRPM(section, upgradeSections),
  GetDamage: (section: TSection, upgradeSections: string): number => readWeaponDamage(section, upgradeSections),
  GetDamageMP: (section: TSection, upgradeSections: string): number =>
    readWeaponDamageMultiplayer(section, upgradeSections),
  GetHandling: (section: TSection, upgradeSections: string): number => readWeaponHandling(section, upgradeSections),
  GetAccuracy: (section: TSection, upgradeSections: string): number => readWeaponAccuracy(section, upgradeSections),
});
