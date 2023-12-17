import { IBoxDropItemDescriptor } from "@/engine/core/managers/box/box_types";
import { boxConfig } from "@/engine/core/managers/box/BoxConfig";
import { parseStringsList } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { IniFile, LuaArray, Optional, TCount, TIndex, TName, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 *
 * @param spawnIni
 * @param section
 * @param field
 */
export function readBoxItemList(
  spawnIni: IniFile,
  section: TSection,
  field: TName
): Optional<LuaTable<TSection, IBoxDropItemDescriptor>> {
  if (!spawnIni.line_exist(section, field)) {
    return null;
  }

  const list: LuaArray<TSection> = parseStringsList(spawnIni.r_string(section, field));
  const count: TCount = list.length();
  const items: LuaTable<TSection, IBoxDropItemDescriptor> = new LuaTable();

  let index: TIndex = 1;

  while (index <= count) {
    const item = {
      section: list.get(index),
      count: null as unknown as number,
    };

    if (boxConfig.ITEMS_BY_BOX_SECTION.get("def_box").get(item.section) === null) {
      logger.info("There is no such item [%s] for box [%s]", tostring(item.section));
    }

    if (list.get(index + 1) !== null) {
      item.count = tonumber(list.get(index + 1)) as TCount;
      index += 2;
    } else {
      item.count = 1;
      index += 1;
    }

    table.insert(items, item);
  }

  return items;
}
