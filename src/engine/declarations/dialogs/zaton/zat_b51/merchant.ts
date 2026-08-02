import { GameObject } from "xray16/alias";
import { AnyCallable, extern, getExtern, LuaArray, TCount, TSection } from "xray16/lib";
import { $fromArray } from "xray16/macros";

import { infoPortions, TInfoPortion } from "@/engine/constants/info_portions";
import { helmets } from "@/engine/constants/items/helmets";
import { outfits } from "@/engine/constants/items/outfits";
import { weapons } from "@/engine/constants/items/weapons";
import { registry } from "@/engine/core/database";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { disableInfoPortion, giveInfoPortion, hasInfoPortion } from "@/engine/core/utils/info_portion";
import { transferItemsToActor, transferMoneyFromActor } from "@/engine/core/utils/reward";

const itemCountByCategory: LuaArray<TCount> = $fromArray([3, 3, 3, 3, 1, 1, 1]);
const zatB51CostsTable: LuaArray<{ prepayAgreed: number; prepayRefused: number; cost: number }> = $fromArray([
  { prepayAgreed: 700, prepayRefused: 1400, cost: 2800 },
  { prepayAgreed: 2000, prepayRefused: 4000, cost: 8000 },
  { prepayAgreed: 4000, prepayRefused: 8000, cost: 16000 },
  { prepayAgreed: 4000, prepayRefused: 8000, cost: 16000 },
  { prepayAgreed: 8000, prepayRefused: 16000, cost: 32000 },
  { prepayAgreed: 6000, prepayRefused: 12000, cost: 24000 },
  { prepayAgreed: 12000, prepayRefused: 24000, cost: 48000 },
]);
const zatB51BuyItemTable: LuaArray<LuaArray<{ item: LuaArray<TSection> }>> = $fromArray<
  LuaArray<{ item: LuaArray<TSection> }>
>([
  $fromArray<{ item: LuaArray<TSection> }>([
    { item: $fromArray<TSection>([weapons.wpn_desert_eagle_nimble]) },
    { item: $fromArray<TSection>([weapons.wpn_sig220_nimble]) },
    { item: $fromArray<TSection>([weapons.wpn_usp_nimble]) },
  ]),
  $fromArray<{ item: LuaArray<TSection> }>([
    { item: $fromArray<TSection>([weapons.wpn_mp5_nimble]) },
    { item: $fromArray<TSection>([weapons.wpn_spas12_nimble]) },
    { item: $fromArray<TSection>([weapons.wpn_protecta_nimble]) },
  ]),
  $fromArray<{ item: LuaArray<TSection> }>([
    { item: $fromArray<TSection>([weapons.wpn_groza_nimble]) },
    { item: $fromArray<TSection>([weapons.wpn_g36_nimble]) },
    { item: $fromArray<TSection>([weapons.wpn_fn2000_nimble]) },
  ]),
  $fromArray<{ item: LuaArray<TSection> }>([
    { item: $fromArray<TSection>([weapons.wpn_vintorez_nimble]) },
    { item: $fromArray<TSection>([weapons.wpn_svu_nimble]) },
    { item: $fromArray<TSection>([weapons.wpn_svd_nimble]) },
  ]),
  $fromArray<{ item: LuaArray<TSection> }>([
    { item: $fromArray<TSection>([helmets.helm_tactic, outfits.cs_heavy_outfit]) },
  ]),
  $fromArray<{ item: LuaArray<TSection> }>([{ item: $fromArray<TSection>([outfits.scientific_outfit]) }]),
  $fromArray<{ item: LuaArray<TSection> }>([{ item: $fromArray<TSection>([outfits.exo_outfit]) }]),
]);

interface IZatB51InfoPortions {
  processing: TInfoPortion;
  finishing: TInfoPortion;
  ordered: LuaArray<TInfoPortion>;
  done: LuaArray<TInfoPortion>;
}
const zatB51InfoPortionsTable: LuaArray<IZatB51InfoPortions> = $fromArray<IZatB51InfoPortions>([
  {
    processing: infoPortions.zat_b51_processing_category_1,
    finishing: infoPortions.zat_b51_finishing_category_1,
    ordered: $fromArray<TInfoPortion>([
      infoPortions.zat_b51_ordered_item_1_1,
      infoPortions.zat_b51_ordered_item_1_2,
      infoPortions.zat_b51_ordered_item_1_3,
    ]),
    done: $fromArray<TInfoPortion>([
      infoPortions.zat_b51_done_item_1_1,
      infoPortions.zat_b51_done_item_1_2,
      infoPortions.zat_b51_done_item_1_3,
    ]),
  },
  {
    processing: infoPortions.zat_b51_processing_category_2,
    finishing: infoPortions.zat_b51_finishing_category_2,
    ordered: $fromArray<TInfoPortion>([
      infoPortions.zat_b51_ordered_item_2_1,
      infoPortions.zat_b51_ordered_item_2_2,
      infoPortions.zat_b51_ordered_item_2_3,
    ]),
    done: $fromArray<TInfoPortion>([
      infoPortions.zat_b51_done_item_2_1,
      infoPortions.zat_b51_done_item_2_2,
      infoPortions.zat_b51_done_item_2_3,
    ]),
  },
  {
    processing: infoPortions.zat_b51_processing_category_3,
    finishing: infoPortions.zat_b51_finishing_category_3,
    ordered: $fromArray<TInfoPortion>([
      infoPortions.zat_b51_ordered_item_3_1,
      infoPortions.zat_b51_ordered_item_3_2,
      infoPortions.zat_b51_ordered_item_3_3,
    ]),
    done: $fromArray<TInfoPortion>([
      infoPortions.zat_b51_done_item_3_1,
      infoPortions.zat_b51_done_item_3_2,
      infoPortions.zat_b51_done_item_3_3,
    ]),
  },
  {
    processing: infoPortions.zat_b51_processing_category_4,
    finishing: infoPortions.zat_b51_finishing_category_4,
    ordered: $fromArray<TInfoPortion>([
      infoPortions.zat_b51_ordered_item_4_1,
      infoPortions.zat_b51_ordered_item_4_2,
      infoPortions.zat_b51_ordered_item_4_3,
    ]),
    done: $fromArray<TInfoPortion>([
      infoPortions.zat_b51_done_item_4_1,
      infoPortions.zat_b51_done_item_4_2,
      infoPortions.zat_b51_done_item_4_3,
    ]),
  },
  {
    processing: infoPortions.zat_b51_processing_category_5,
    finishing: infoPortions.zat_b51_finishing_category_5,
    ordered: $fromArray<TInfoPortion>([infoPortions.zat_b51_ordered_item_5_1]),
    done: $fromArray<TInfoPortion>([infoPortions.zat_b51_done_item_5_1]),
  },
  {
    processing: infoPortions.zat_b51_processing_category_6,
    finishing: infoPortions.zat_b51_finishing_category_6,
    ordered: $fromArray<TInfoPortion>([infoPortions.zat_b51_ordered_item_6_1]),
    done: $fromArray<TInfoPortion>([infoPortions.zat_b51_done_item_6_1]),
  },
  {
    processing: infoPortions.zat_b51_processing_category_7,
    finishing: infoPortions.zat_b51_finishing_category_7,
    ordered: $fromArray<TInfoPortion>([infoPortions.zat_b51_ordered_item_7_1]),
    done: $fromArray<TInfoPortion>([infoPortions.zat_b51_done_item_7_1]),
  },
]);

/**
 * For each processing category, randomly select one not yet ordered item and mark it as ordered.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b51_randomize_item", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  for (const it of $range(1, 7)) {
    const categoryInfoPortions: IZatB51InfoPortions = zatB51InfoPortionsTable.get(it);

    if (hasInfoPortion(categoryInfoPortions.processing)) {
      const zatB51AvailableItemsTable: LuaArray<TCount> = new LuaTable();

      for (const j of $range(1, itemCountByCategory.get(it))) {
        if (!hasInfoPortion(categoryInfoPortions.done.get(j))) {
          table.insert(zatB51AvailableItemsTable, j);
        }
      }

      giveInfoPortion(
        categoryInfoPortions.ordered.get(
          zatB51AvailableItemsTable.get(math.random(1, zatB51AvailableItemsTable.length()))
        )
      );
    }
  }
});

/**
 * Transfer the prepay amount for the active order category from the actor to the NPC.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b51_give_prepay", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  for (const it of $range(1, 7)) {
    if (hasInfoPortion(zatB51InfoPortionsTable.get(it).processing)) {
      if (!hasInfoPortion(infoPortions.zat_b51_order_refused)) {
        return transferMoneyFromActor(
          getNpcSpeaker(firstSpeaker, secondSpeaker),
          zatB51CostsTable.get(it).prepayAgreed
        );
      }

      return transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), zatB51CostsTable.get(it).prepayRefused);
    }
  }
});

/**
 * Check whether the actor can afford the prepay for the active order category.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor money is enough for the agreed or refused prepay of the active category.
 */
extern("dialogs_zaton.zat_b51_has_prepay", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  const actor: GameObject = registry.actor;

  for (const it of $range(1, 7)) {
    if (hasInfoPortion(zatB51InfoPortionsTable.get(it).processing)) {
      if (!hasInfoPortion(infoPortions.zat_b51_order_refused)) {
        return actor.money() >= zatB51CostsTable.get(it).prepayAgreed;
      }

      return actor.money() >= zatB51CostsTable.get(it).prepayRefused;
    }
  }

  return false;
});

/**
 * Check whether the actor cannot afford the prepay for the active order category.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor money is below the required prepay for the active category.
 */
extern("dialogs_zaton.zat_b51_hasnt_prepay", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !getExtern<AnyCallable>("zat_b51_has_prepay", getExtern("dialogs_zaton"))(firstSpeaker, secondSpeaker);
});

/**
 * Complete the active order: give the ordered item, take its cost and update order info portions.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b51_buy_item", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  for (const it of $range(1, 7)) {
    const categoryInfoPortions: IZatB51InfoPortions = zatB51InfoPortionsTable.get(it);

    if (hasInfoPortion(categoryInfoPortions.processing)) {
      for (const j of $range(1, zatB51BuyItemTable.get(it).length())) {
        if (hasInfoPortion(categoryInfoPortions.ordered.get(j))) {
          for (const [_k, v] of zatB51BuyItemTable.get(it).get(j).item) {
            transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), v);
          }

          transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), zatB51CostsTable.get(it).cost);
          disableInfoPortion(categoryInfoPortions.processing);
          disableInfoPortion(categoryInfoPortions.ordered.get(j));
          giveInfoPortion(categoryInfoPortions.done.get(j));
          break;
        }
      }

      let categoryFinishing: boolean = true;

      for (const j of $range(1, zatB51BuyItemTable.get(it).length())) {
        if (!hasInfoPortion(categoryInfoPortions.done.get(j))) {
          categoryFinishing = false;
          break;
        }
      }

      if (categoryFinishing) {
        giveInfoPortion(categoryInfoPortions.finishing);
      }

      return;
    }
  }
});

/**
 * Refuse the active ordered item and update the related order info portions.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b51_refuse_item", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  for (const i of $range(1, 7)) {
    const categoryInfoPortions: IZatB51InfoPortions = zatB51InfoPortionsTable.get(i);

    if (hasInfoPortion(categoryInfoPortions.processing)) {
      for (const j of $range(1, zatB51BuyItemTable.get(i).length())) {
        if (hasInfoPortion(categoryInfoPortions.ordered.get(j))) {
          disableInfoPortion(categoryInfoPortions.processing);
          disableInfoPortion(categoryInfoPortions.ordered.get(j));
          giveInfoPortion(categoryInfoPortions.done.get(j));
          break;
        }
      }

      let categoryFinishing: boolean = true;

      for (const j of $range(1, zatB51BuyItemTable.get(i).length())) {
        if (!hasInfoPortion(categoryInfoPortions.done.get(j))) {
          categoryFinishing = false;
          break;
        }
      }

      if (categoryFinishing === true) {
        giveInfoPortion(categoryInfoPortions.finishing);
      }

      return;
    }
  }
});

/**
 * Check whether the actor can afford the full cost of the active order category.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor money is enough to pay the cost of the active category.
 */
extern("dialogs_zaton.zat_b51_has_item_cost", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  const actor: GameObject = registry.actor;

  for (const i of $range(1, 7)) {
    if (hasInfoPortion(zatB51InfoPortionsTable.get(i).processing)) {
      return actor.money() >= zatB51CostsTable.get(i).cost;
    }
  }

  return false;
});

/**
 * Check whether the actor cannot afford the full cost of the active order category.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor money is below the cost of the active category.
 */
extern("dialogs_zaton.zat_b51_hasnt_item_cost", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !getExtern<AnyCallable>("zat_b51_has_item_cost", getExtern("dialogs_zaton"))(firstSpeaker, secondSpeaker);
});
