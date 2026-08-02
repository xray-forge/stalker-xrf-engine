import { GameObject } from "xray16/alias";
import { AnyCallablesModule, extern, getExtern, TCount, TName } from "xray16/lib";
import { $fromObject, $isNil } from "xray16/macros";

import { questItems } from "@/engine/constants/items/quest_items";
import { registry } from "@/engine/core/database";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { transferItemsFromActor } from "@/engine/core/utils/reward";

/**
 * Transfer all b200 tech materials from the actor to the NPC and update the brought counter.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jupiter_b200_tech_materials_relocate",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    const needItems: LuaTable<TName, boolean> = $fromObject<TName, boolean>({
      [questItems.jup_b200_tech_materials_wire]: true,
      [questItems.jup_b200_tech_materials_acetone]: true,
      [questItems.jup_b200_tech_materials_textolite]: true,
      [questItems.jup_b200_tech_materials_transistor]: true,
      [questItems.jup_b200_tech_materials_capacitor]: true,
    });

    const actor: GameObject = registry.actor;
    const itemsToRelocate: LuaTable<string, number> = new LuaTable();
    let count: TCount = 0;

    function relocateAndIncCount(object: GameObject, item: GameObject): void {
      if (needItems.get(item.section())) {
        const section: string = item.section();

        count = count + 1;

        if ($isNil(itemsToRelocate.get(section))) {
          itemsToRelocate.set(section, 1);
        } else {
          itemsToRelocate.set(section, itemsToRelocate.get(section) + 1);
        }
      }
    }

    actor.iterate_inventory(relocateAndIncCount, actor);

    getExtern<AnyCallablesModule>("xr_effects").inc_counter(actor, null, [
      "jup_b200_tech_materials_brought_counter",
      tostring(count),
    ]);

    for (const [k, v] of itemsToRelocate) {
      transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), k, v);
    }
  }
);
