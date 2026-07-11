import { LuaArray, Nillable, TDistance, TIndex, TRate } from "xray16/lib";
import { $isNil, $isNotNil } from "xray16/macros";

import { IWoundedStateDescriptor } from "@/engine/core/schemes/stalker/wounded/wounded_types";
import { parseConditionsList } from "@/engine/core/utils/ini";

/**
 * Parse serialized string as wounded state descriptors list.
 *
 * @param serialized - Serialized wounded state description.
 * @returns List of parsed wounded state descriptors.
 */
export function parseWoundedData(serialized: Nillable<string>): LuaArray<IWoundedStateDescriptor> {
  const collection: LuaArray<IWoundedStateDescriptor> = new LuaTable();

  if (serialized) {
    for (const name of string.gfind(serialized, "(%|*%d+%|[^%|]+)%p*")) {
      const [tPosition] = string.find(name, "|", 1, true);
      const [sPosition] = string.find(name, "@", 1, true);

      const hp = string.sub(name, 1, tPosition - 1);

      let state: Nillable<string> = null;
      let sound: Nillable<string> = null;

      if ($isNotNil(sPosition)) {
        state = string.sub(name, tPosition + 1, sPosition - 1);
        sound = string.sub(name, sPosition + 1);
      } else {
        state = string.sub(name, tPosition + 1);
      }

      table.insert(collection, {
        hp: tonumber(hp) as TDistance,
        state: $isNil(state) ? null : parseConditionsList(state),
        sound: $isNil(sound) ? null : parseConditionsList(sound),
      });
    }
  }

  return collection;
}

/**
 * Get wounded state descriptor by current HP breakpoint.
 *
 * Todo: Get object ref instead? Get object ref and index as multi-return?
 * Todo: Returns previous value.
 *
 * @param descriptors - List of descriptors to search.
 * @param hp - Hp breakpoint to match in searched descriptors list based on [0-100] current hp value.
 * @returns Nillable index of descriptor matching provided distance requirement.
 */
export function getStateIndexByHp(descriptors: LuaArray<IWoundedStateDescriptor>, hp: TRate): Nillable<TIndex> {
  let result: Nillable<TIndex> = null;

  for (const [index, value] of descriptors) {
    if ((value.hp as TDistance) >= hp) {
      result = index;
    } else {
      return result;
    }
  }

  return result;
}
