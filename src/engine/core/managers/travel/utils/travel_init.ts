import { ITravelRouteDescriptor } from "@/engine/core/managers/travel";
import { parseConditionsList } from "@/engine/core/utils/ini";
import { TLevel } from "@/engine/lib/constants/levels";
import { IniFile, TCount, TName, TStringId } from "@/engine/lib/types";

/**
 * todo;
 *
 * @param ini
 */
export function readIniTravelDialogs(
  ini: IniFile
): LuaMultiReturn<[LuaTable<TName, ITravelRouteDescriptor>, LuaTable<TName, TStringId>]> {
  const travelDescriptorsByName: LuaTable<TName, ITravelRouteDescriptor> = new LuaTable();
  const travelDescriptorsByPhraseId: LuaTable<TStringId, TName> = new LuaTable();
  const count: TCount = ini.line_count("traveler");

  for (const index of $range(0, count - 1)) {
    const [, name] = ini.r_line("traveler", index, "", "");
    const phraseId: TStringId = tostring(1000 + index);

    travelDescriptorsByPhraseId.set(phraseId, name);

    travelDescriptorsByName.set(name, {
      phraseId: phraseId,
      name: ini.r_string(name, "name"),
      level: ini.r_string(name, "level") as TLevel,
      condlist: parseConditionsList(ini.r_string(name, "condlist")),
    });
  }

  return $multi(travelDescriptorsByName, travelDescriptorsByPhraseId);
}
