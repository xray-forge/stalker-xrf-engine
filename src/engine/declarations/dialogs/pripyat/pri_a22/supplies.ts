import { GameObject } from "xray16/alias";
import { extern, TCount } from "xray16/lib";
import { $fromObject } from "xray16/macros";

import { TInfoPortion } from "@/engine/constants/info_portions/info_portions";
import { TAmmoItem } from "@/engine/constants/items/ammo";
import { helmets } from "@/engine/constants/items/helmets";
import { outfits } from "@/engine/constants/items/outfits";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { disableInfoPortion, hasInfoPortion } from "@/engine/core/utils/info_portion";
import { transferItemsToActor } from "@/engine/core/utils/reward";

const suppliesList = $fromObject({
  ["supply_ammo_1"]: $fromObject({ ["ammo_9x18_fmj"]: 2, ["ammo_9x18_pmm"]: 1 }),
  ["supply_ammo_2"]: $fromObject({ ["ammo_9x19_fmj"]: 2, ["ammo_9x19_pbp"]: 1 }),
  ["supply_ammo_3"]: $fromObject({ ["ammo_11.43x23_fmj"]: 2, ["ammo_11.43x23_hydro"]: 1 }),
  ["supply_ammo_4"]: $fromObject({ ["ammo_12x70_buck"]: 10, ["ammo_12x76_zhekan"]: 5 }),
  ["supply_ammo_5"]: $fromObject({ ["ammo_5.45x39_fmj"]: 2, ["ammo_5.45x39_ap"]: 1 }),
  ["supply_ammo_6"]: $fromObject({ ["ammo_5.56x45_ss190"]: 2, ["ammo_5.56x45_ap"]: 1 }),
  ["supply_ammo_7"]: $fromObject({ ["ammo_9x39_pab9"]: 1, ["ammo_9x39_ap"]: 1 }),
  ["supply_ammo_8"]: $fromObject({ ["ammo_7.62x54_7h1"]: 1 }),
  ["supply_ammo_9"]: $fromObject({ ["ammo_pkm_100"]: 1 }),
  ["supply_grenade_1"]: $fromObject({ ["grenade_rgd5"]: 3, ["grenade_f1"]: 2 }),
  ["supply_grenade_2"]: $fromObject({ ["ammo_vog-25"]: 3 }),
  ["supply_grenade_3"]: $fromObject({ ["ammo_m209"]: 3 }),
}) as unknown as LuaTable<TInfoPortion, LuaTable<TAmmoItem, TCount>>;

extern("dialogs_pripyat.pri_a22_army_signaller_supply", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  for (const [name, itemsList] of suppliesList) {
    if (hasInfoPortion(name)) {
      for (const [section, amount] of itemsList) {
        transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), section, amount);
      }

      disableInfoPortion(name);
    }
  }
});

/**
 * Transfer the military outfit and battle helmet from the NPC to the actor.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 */
extern("dialogs_pripyat.pri_a22_give_actor_outfit", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), outfits.military_outfit);
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), helmets.helm_battle);
});
