import { IMapSmartTerrainMarkDescriptor } from "@/engine/core/managers/map";
import { assert } from "@/engine/core/utils/assertion";
import { IniFile, LuaArray, TCount } from "@/engine/lib/types";

/**
 * Read list of map spots from manager config.
 *
 * @param ini - target ini file to read map spots from
 */
export function readIniMapSpots(ini: IniFile): LuaArray<IMapSmartTerrainMarkDescriptor> {
  assert(ini.section_exist("map_spots"), "Expect 'map_spots' section to exist in ini file.");

  const list: LuaArray<IMapSmartTerrainMarkDescriptor> = new LuaTable();
  const count: TCount = ini.line_count("map_spots");

  for (const it of $range(0, count - 1)) {
    const [, field, value] = ini.r_line("map_spots", it, "", "");

    table.insert(list, { target: field, hint: value, isVisible: false });
  }

  return list;
}
