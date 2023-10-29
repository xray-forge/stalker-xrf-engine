import { ammo } from "@/engine/lib/constants/items/ammo";
import { questItems } from "@/engine/lib/constants/items/quest_items";
import { weaponAddons } from "@/engine/lib/constants/items/weapon_addons";
import { weapons } from "@/engine/lib/constants/items/weapons";

export const mockWeaponLtx = {
  [questItems.pri_a17_gauss_rifle]: {
    cost: 25_000,
    no_repair: true,
  },
  [weapons.wpn_ak74]: {
    inv_name: "AK-74",
    strap_bone0: "some_bone",
  },
  [weapons.wpn_ak74u]: {
    cost: 4000,
    inv_name: "AK-74u",
    strap_bone0: "some_bone_u",
    upgrades:
      "up_gr_firstab_ak74u, up_gr_seconab_ak74u, up_gr_thirdab_ak74u, up_gr_fourtab_ak74u, " +
      "up_gr_fifthab_ak74u, up_gr_fifthcd_ak74u",
  },
  [weapons.wpn_svu]: {
    cost: 7000,
    strap_bone0: "some_bone",
  },
  [weapons.wpn_abakan]: {
    cost: 5000,
    strap_bone0: "some_bone",
  },
  [weaponAddons.wpn_addon_scope]: {
    cost: 2100,
  },
  [weapons.grenade_f1]: {},
  [ammo.ammo_9x18_pmm]: {
    box_size: 30,
  },
  [ammo["ammo_5.45x39_ap"]]: {
    box_size: 30,
  },
  ammo_9x39_ap: {
    box_size: 30,
  },
  "ammo_5.56x45_ap": {
    box_size: 30,
  },
  ammo_12x76_zhekan: {
    box_size: 20,
  },
};
