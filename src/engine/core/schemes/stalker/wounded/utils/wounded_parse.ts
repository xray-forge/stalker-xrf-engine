import { IWoundedStateDescriptor } from "@/engine/core/schemes/stalker/wounded/wounded_types";
import { parseConditionsList } from "@/engine/core/utils/ini";
import { LuaArray, Optional, TDistance, TIndex, TRate } from "@/engine/lib/types";

/**
 * Parse serialized string as wounded state descriptors list.
 *
 * @param serialized - serialized wounded state description
 * @returns list of parsed wounded state descriptors
 */
export function parseWoundedData(serialized: Optional<string>): LuaArray<IWoundedStateDescriptor> {
  const collection: LuaArray<IWoundedStateDescriptor> = new LuaTable();

  if (serialized) {
    for (const name of string.gfind(serialized, "(%|*%d+%|[^%|]+)%p*")) {
      const [tPosition] = string.find(name, "|", 1, true);
      const [sPosition] = string.find(name, "@", 1, true);

      const hp = string.sub(name, 1, tPosition - 1);

      let state: Optional<string> = null;
      let sound: Optional<string> = null;

      if (sPosition !== null) {
        state = string.sub(name, tPosition + 1, sPosition - 1);
        sound = string.sub(name, sPosition + 1);
      } else {
        state = string.sub(name, tPosition + 1);
      }

      table.insert(collection, {
        hp: tonumber(hp) as TDistance,
        state: state === null ? null : parseConditionsList(state),
        sound: sound === null ? null : parseConditionsList(sound),
      });
    }
  }

  return collection;
}

/**
 * Get wounded state descriptor by current HP breakpoint.
 *
 * todo: Get object ref instead? Get object ref and index as multi-return?
 * todo: Returns previous value.
 *
 * @param descriptors - list of descriptors to search
 * @param hp - hp breakpoint to match in searched descriptors list based on [0-100] current hp value
 * @returns optional index of descriptor matching provided distance requirement
 */
export function getStateIndexByHp(descriptors: LuaArray<IWoundedStateDescriptor>, hp: TRate): Optional<TIndex> {
  let result: Optional<TIndex> = null;

  for (const [index, value] of descriptors) {
    if ((value.hp as TDistance) >= hp) {
      result = index;
    } else {
      return result;
    }
  }

  return result;
}
