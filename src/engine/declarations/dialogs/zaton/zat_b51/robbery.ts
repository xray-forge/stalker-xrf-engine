import { GameObject } from "xray16/alias";
import { extern, LuaArray } from "xray16/lib";
import { $fromObject, $isNotNil } from "xray16/macros";

import { artefacts } from "@/engine/constants/items/artefacts";
import { TWeapon, weapons } from "@/engine/constants/items/weapons";
import { registry } from "@/engine/core/database";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { transferItemsFromActor, transferItemsToActor, transferMoneyFromActor } from "@/engine/core/utils/reward";

/**
 * Rob the actor of a random money share and all listed weapons in favor of the dialog NPC.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b51_robbery", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  const actor: GameObject = registry.actor;
  let amount: number = math.floor((actor.money() * math.random(35, 50)) / 100);

  if (amount > actor.money()) {
    amount = actor.money();
  }

  const needItem: LuaTable<TWeapon, boolean> = $fromObject<TWeapon, boolean>({
    [weapons.wpn_usp]: true,
    [weapons.wpn_desert_eagle]: true,
    [weapons.wpn_protecta]: true,
    [weapons.wpn_sig550]: true,
    [weapons.wpn_fn2000]: true,
    [weapons.wpn_g36]: true,
    [weapons.wpn_val]: true,
    [weapons.wpn_vintorez]: true,
    [weapons.wpn_groza]: true,
    [weapons.wpn_svd]: true,
    [weapons.wpn_svu]: true,
    [weapons.wpn_pkm]: true,
    [weapons.wpn_sig550_luckygun]: true,
    [weapons.wpn_pkm_zulus]: true,
    [weapons.wpn_wincheaster1300_trapper]: true,
    [weapons.wpn_gauss]: true,
    [weapons.wpn_groza_nimble]: true,
    [weapons.wpn_desert_eagle_nimble]: true,
    [weapons.wpn_fn2000_nimble]: true,
    [weapons.wpn_g36_nimble]: true,
    [weapons.wpn_protecta_nimble]: true,
    [weapons.wpn_mp5_nimble]: true,
    [weapons.wpn_sig220_nimble]: true,
    [weapons.wpn_spas12_nimble]: true,
    [weapons.wpn_usp_nimble]: true,
    [weapons.wpn_vintorez_nimble]: true,
    [weapons.wpn_svu_nimble]: true,
    [weapons.wpn_svd_nimble]: true,
  } as Record<TWeapon, boolean>);

  for (const [k] of needItem) {
    if ($isNotNil(actor.object(k))) {
      transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), k, "all");
    }
  }

  transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), amount);
});

/**
 * Take a nimble weapon from the actor, preferring an equipped slot then a random owned one.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b51_rob_nimble_weapon", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  const actor: GameObject = registry.actor;
  const actorHasItem: LuaArray<TWeapon> = new LuaTable();
  const needItem: LuaTable<TWeapon, boolean> = $fromObject<TWeapon, boolean>({
    [weapons.wpn_groza_nimble]: true,
    [weapons.wpn_desert_eagle_nimble]: true,
    [weapons.wpn_fn2000_nimble]: true,
    [weapons.wpn_g36_nimble]: true,
    [weapons.wpn_protecta_nimble]: true,
    [weapons.wpn_mp5_nimble]: true,
    [weapons.wpn_sig220_nimble]: true,
    [weapons.wpn_spas12_nimble]: true,
    [weapons.wpn_usp_nimble]: true,
    [weapons.wpn_vintorez_nimble]: true,
    [weapons.wpn_svu_nimble]: true,
    [weapons.wpn_svd_nimble]: true,
  } as Record<TWeapon, boolean>);

  for (const [k] of needItem) {
    if ($isNotNil(actor.object(k))) {
      table.insert(actorHasItem, k);
    }

    if ($isNotNil(actor.item_in_slot(2)) && actor.item_in_slot(2)!.section() === k) {
      transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), k);

      return;
    } else if ($isNotNil(actor.item_in_slot(3)) && actor.item_in_slot(3)!.section() === k) {
      transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), k);

      return;
    }
  }

  if (actorHasItem.length() > 0) {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), table.random(actorHasItem)[1]);
  }
});

/**
 * Give the compass artefact from the NPC to the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.give_compass_to_actor", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), artefacts.af_compass);
});
