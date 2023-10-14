import {
  IMapAnomalyScanDescriptor,
  IMapGenericSpotDescriptor,
  IMapMarkDescriptor,
  IMapSleepSpotDescriptor,
} from "@/engine/core/managers/map";
import { assert } from "@/engine/core/utils/assertion";
import { readIniString } from "@/engine/core/utils/ini";
import { TInfoPortion } from "@/engine/lib/constants/info_portions";
import { IniFile, LuaArray, TCount, TName } from "@/engine/lib/types";

/**
 * Read list of map spots from manager config.
 *
 * @param ini - target ini file to read map spots from
 */
export function readIniMapSpots(ini: IniFile): LuaArray<IMapGenericSpotDescriptor> {
  assert(ini.section_exist("map_spots"), "Expect 'map_spots' section to exist in ini file.");

  const list: LuaArray<IMapGenericSpotDescriptor> = new LuaTable();
  const count: TCount = ini.line_count("map_spots");

  for (const it of $range(0, count - 1)) {
    const [, field, value] = ini.r_line("map_spots", it, "", "");

    table.insert(list, { target: field, hint: value, isVisible: false });
  }

  return list;
}

/**
 * Read list of sleep spots from manager config.
 *
 * @param ini - target ini file to read sleep spots from
 */
export function readIniSleepSpots(ini: IniFile): LuaArray<IMapSleepSpotDescriptor> {
  assert(ini.section_exist("sleep_spots"), "Expect 'sleep_spots' section to exist in ini file.");

  const list: LuaArray<IMapSleepSpotDescriptor> = new LuaTable();
  const count: TCount = ini.line_count("sleep_spots");

  for (const it of $range(0, count - 1)) {
    const [, field, value] = ini.r_line("sleep_spots", it, "", "");

    table.insert(list, { target: field, hint: value });
  }

  return list;
}

/**
 * Read list of generic map marks from manager config.
 *
 * @param ini - target ini file to read sleep spots from
 */
export function readIniMapMarks(ini: IniFile): LuaTable<TName, IMapMarkDescriptor> {
  assert(ini.section_exist("map_marks"), "Expect 'map_marks' section to exist in ini file.");

  const list: LuaTable<TName, IMapMarkDescriptor> = new LuaTable();
  const count: TCount = ini.line_count("map_marks");

  for (const it of $range(0, count - 1)) {
    const [, field] = ini.r_line("map_marks", it, "", "");

    const icon: TName = readIniString(ini, field, "icon", true);
    const hint: TName = readIniString(ini, field, "hint", true);

    list.set(field, { icon, hint });
  }

  return list;
}

/**
 * Read list of generic map marks from manager config.
 *
 * @param ini - target ini file to read sleep spots from
 */
export function readIniMapScannerSpots(ini: IniFile): LuaArray<IMapAnomalyScanDescriptor> {
  assert(ini.section_exist("scanner_spots"), "Expect 'scanner_spots' section to exist in ini file.");

  const list: LuaArray<IMapAnomalyScanDescriptor> = new LuaTable();
  const count: TCount = ini.line_count("scanner_spots");

  for (const it of $range(0, count - 1)) {
    const [, field] = ini.r_line("scanner_spots", it, "", "");

    const target: TName = readIniString(ini, field, "target", true);
    const zone: TName = readIniString(ini, field, "zone", true);
    const hint: TName = readIniString(ini, field, "hint", true);
    const group: TInfoPortion = readIniString(ini, field, "group", true);

    table.insert(list, { target, hint, zone, group, isEnabled: false });
  }

  return list;
}
