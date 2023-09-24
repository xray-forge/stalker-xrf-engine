import { IWoundedStateDescriptor } from "@/engine/core/schemes/stalker/wounded";
import { parseConditionsList } from "@/engine/core/utils/ini";
import { LuaArray, Optional, TDistance } from "@/engine/lib/types";

/**
 * todo;
 */
export function parseWoundedData(target: Optional<string>): LuaArray<IWoundedStateDescriptor> {
  const collection: LuaArray<any> = new LuaTable();

  if (target) {
    for (const name of string.gfind(target, "(%|*%d+%|[^%|]+)%p*")) {
      const [tPosition] = string.find(name, "|", 1, true);
      const [sPosition] = string.find(name, "@", 1, true);

      const distance = string.sub(name, 1, tPosition - 1);

      let state: Optional<string> = null;
      let sound: Optional<string> = null;

      if (sPosition !== null) {
        state = string.sub(name, tPosition + 1, sPosition - 1);
        sound = string.sub(name, sPosition + 1);
      } else {
        state = string.sub(name, tPosition + 1);
      }

      table.insert(collection, {
        dist: tonumber(distance) as TDistance,
        state: state === null ? null : parseConditionsList(state),
        sound: sound === null ? null : parseConditionsList(sound),
      });
    }
  }

  return collection;
}
