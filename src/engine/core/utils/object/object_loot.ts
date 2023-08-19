import { isLootableItemSection } from "@/engine/core/utils/object/object_section";
import { ClientObject, LuaArray } from "@/engine/lib/types";

/**
 * Transfer all lootable items from one object to another.
 *
 * @param from - client object to move loot from
 * @param to - client object to move loot to
 * @returns transfered objects lists
 */
export function transferLoot(from: ClientObject, to: ClientObject): LuaArray<ClientObject> {
  const list: LuaArray<ClientObject> = new LuaTable();

  from.iterate_inventory((owner, item) => {
    if (isLootableItemSection(item.section())) {
      owner.transfer_item(item, to);
      table.insert(list, item);
    }
  }, from);

  return list;
}
