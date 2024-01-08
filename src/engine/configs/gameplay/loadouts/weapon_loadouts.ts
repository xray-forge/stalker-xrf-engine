import { ILoadoutItemDescriptor } from "@/engine/configs/gameplay/utils/create_loadout";
import { ammo } from "@/engine/lib/constants/items/ammo";
import { detectors } from "@/engine/lib/constants/items/detectors";
import { misc } from "@/engine/lib/constants/items/misc";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { TCount } from "@/engine/lib/types";

export function loadoutBinocular(): Array<ILoadoutItemDescriptor> {
  return [{ section: weapons.wpn_binoc }];
}

export function loadoutTorch(): Array<ILoadoutItemDescriptor> {
  return [{ section: misc.device_torch }];
}

export function loadoutDetectorAdvanced(): Array<ILoadoutItemDescriptor> {
  return [{ section: detectors.detector_advanced }];
}

export function loadoutDetectorElite(): Array<ILoadoutItemDescriptor> {
  return [{ section: detectors.detector_elite }];
}

export function loadoutDetectorScientific(): Array<ILoadoutItemDescriptor> {
  return [{ section: detectors.detector_scientific }];
}

export function loadoutWincheaster1300(ap: boolean = false): Array<ILoadoutItemDescriptor> {
  return [{ section: weapons.wpn_wincheaster1300 }, { section: ap ? ammo.ammo_12x70_buck : ammo.ammo_12x76_zhekan }];
}

export function loadoutSpas12(ap: boolean = false): Array<ILoadoutItemDescriptor> {
  return [{ section: weapons.wpn_spas12 }, { section: ap ? ammo.ammo_12x70_buck : ammo.ammo_12x76_zhekan }];
}

export function loadoutProtecta(ap: boolean = false): Array<ILoadoutItemDescriptor> {
  return [{ section: weapons.wpn_protecta }, { section: ap ? ammo.ammo_12x70_buck : ammo.ammo_12x76_zhekan }];
}

export function loadoutBm16(ap: boolean = false): Array<ILoadoutItemDescriptor> {
  return [{ section: weapons.wpn_bm16 }, { section: ap ? ammo.ammo_12x70_buck : ammo.ammo_12x76_zhekan }];
}

export function loadoutToz34(ap: boolean = false): Array<ILoadoutItemDescriptor> {
  return [{ section: weapons.wpn_toz34 }, { section: ap ? ammo.ammo_12x70_buck : ammo.ammo_12x76_zhekan }];
}

export function loadoutAk74(ap: boolean = false): Array<ILoadoutItemDescriptor> {
  return [{ section: weapons.wpn_ak74 }, { section: ap ? ammo["ammo_5.45x39_ap"] : ammo["ammo_5.45x39_fmj"] }];
}

export function loadoutAk74u(ap: boolean = false): Array<ILoadoutItemDescriptor> {
  return [{ section: weapons.wpn_ak74u }, { section: ap ? ammo["ammo_5.45x39_ap"] : ammo["ammo_5.45x39_fmj"] }];
}

export function loadoutVintorez(ap: boolean = false): Array<ILoadoutItemDescriptor> {
  return [{ section: weapons.wpn_vintorez }, { section: ap ? ammo.ammo_9x39_ap : ammo.ammo_9x39_pab9 }];
}

export function loadoutSvu(): Array<ILoadoutItemDescriptor> {
  return [{ section: weapons.wpn_svu }, { section: ammo["ammo_7.62x54_7h1"] }];
}

export function loadoutSvd(): Array<ILoadoutItemDescriptor> {
  return [{ section: weapons.wpn_svd }, { section: ammo["ammo_7.62x54_7h1"] }];
}

export function loadoutL85(ap: boolean = false): Array<ILoadoutItemDescriptor> {
  return [{ section: weapons.wpn_l85 }, { section: ap ? ammo["ammo_5.56x45_ap"] : ammo["ammo_5.56x45_ss190"] }];
}

export function loadoutG36({ ap = false, scope = false, silencer = false } = {}): Array<ILoadoutItemDescriptor> {
  return [
    { section: weapons.wpn_g36, scope, silencer },
    { section: ap ? ammo["ammo_5.56x45_ap"] : ammo["ammo_5.56x45_ss190"] },
  ];
}

export function loadoutMp5({ ap = false, scope = false, silencer = false } = {}): Array<ILoadoutItemDescriptor> {
  return [{ section: weapons.wpn_mp5, scope, silencer }, { section: ap ? ammo.ammo_9x19_pbp : ammo.ammo_9x19_fmj }];
}

export function loadoutSig550({ ap = false, scope = false, silencer = false } = {}): Array<ILoadoutItemDescriptor> {
  return [
    { section: weapons.wpn_sig550, scope, silencer },
    { section: ap ? ammo["ammo_5.56x45_ap"] : ammo["ammo_5.56x45_ss190"] },
  ];
}

export function loadoutLr300({
  ap = false,
  scope = false,
  silencer = false,
  launcher = false,
} = {}): Array<ILoadoutItemDescriptor> {
  return [
    { section: weapons.wpn_lr300, scope, silencer, launcher },
    { section: ap ? ammo["ammo_5.56x45_ap"] : ammo["ammo_5.56x45_ss190"] },
  ];
}

export function loadoutAbakan({
  ap = false,
  scope = false,
  silencer = false,
  launcher = false,
} = {}): Array<ILoadoutItemDescriptor> {
  return [
    { section: weapons.wpn_abakan, scope, silencer, launcher },
    { section: ap ? ammo["ammo_5.45x39_ap"] : ammo["ammo_5.45x39_fmj"] },
  ];
}

export function loadoutGroza({ ap = false, silencer = false } = {}): Array<ILoadoutItemDescriptor> {
  return [{ section: weapons.wpn_groza, silencer }, { section: ap ? ammo.ammo_9x39_ap : ammo.ammo_9x39_pab9 }];
}

export function loadoutVal({ ap = false } = {}): Array<ILoadoutItemDescriptor> {
  return [{ section: weapons.wpn_val }, { section: ap ? ammo.ammo_9x39_ap : ammo.ammo_9x39_pab9 }];
}

export function loadoutHpsa(ap: boolean = false): Array<ILoadoutItemDescriptor> {
  return [{ section: weapons.wpn_hpsa }, { section: ap ? ammo.ammo_9x19_pbp : ammo.ammo_9x19_fmj }];
}

export function loadoutBeretta(ap: boolean = false): Array<ILoadoutItemDescriptor> {
  return [{ section: weapons.wpn_beretta }, { section: ap ? ammo.ammo_9x19_pbp : ammo.ammo_9x19_fmj }];
}

export function loadoutPm(ap: boolean = false): Array<ILoadoutItemDescriptor> {
  return [{ section: weapons.wpn_pm }, { section: ap ? ammo.ammo_9x18_pmm : ammo.ammo_9x18_fmj }];
}

export function loadoutPb(ap: boolean = false): Array<ILoadoutItemDescriptor> {
  return [{ section: weapons.wpn_pb }, { section: ap ? ammo.ammo_9x18_pmm : ammo.ammo_9x18_fmj }];
}

export function loadoutFort(ap: boolean = false): Array<ILoadoutItemDescriptor> {
  return [{ section: weapons.wpn_fort }, { section: ap ? ammo.ammo_9x18_pmm : ammo.ammo_9x18_fmj }];
}

export function loadoutWalther(ap: boolean = false): Array<ILoadoutItemDescriptor> {
  return [{ section: weapons.wpn_walther }, { section: ap ? ammo.ammo_9x19_pbp : ammo.ammo_9x19_fmj }];
}

export function loadoutColt1911(ap: boolean = false): Array<ILoadoutItemDescriptor> {
  return [{ section: weapons.wpn_colt1911 }, { section: ap ? ammo["ammo_11.43x23_hydro"] : ammo["ammo_11.43x23_fmj"] }];
}

export function loadoutSig220({ ap = false, silencer = false } = {}): Array<ILoadoutItemDescriptor> {
  return [
    { section: weapons.wpn_sig220, silencer },
    { section: ap ? ammo["ammo_11.43x23_hydro"] : ammo["ammo_11.43x23_fmj"] },
  ];
}

export function loadoutUsp({ ap = false, silencer = false } = {}): Array<ILoadoutItemDescriptor> {
  return [
    { section: weapons.wpn_usp, silencer },
    { section: ap ? ammo["ammo_11.43x23_hydro"] : ammo["ammo_11.43x23_fmj"] },
  ];
}

export function loadoutDesertEagle(ap: boolean = false): Array<ILoadoutItemDescriptor> {
  return [
    { section: weapons.wpn_desert_eagle },
    { section: ap ? ammo["ammo_11.43x23_hydro"] : ammo["ammo_11.43x23_fmj"] },
  ];
}

export function loadoutRgd5Grenades(count: TCount = 1): Array<ILoadoutItemDescriptor> {
  return [{ section: weapons.grenade_rgd5, count }];
}

export function loadoutF1Grenades(count: TCount = 1): Array<ILoadoutItemDescriptor> {
  return [{ section: weapons.grenade_f1, count }];
}
