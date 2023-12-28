import {
  EGenericPhraseCategory,
  IPhrasesDescriptor,
  TAvailablePhrasesMap,
} from "@/engine/core/managers/dialogs/dialog_types";
import { assert } from "@/engine/core/utils/assertion";
import { parseInfoPortions, parseStringsList } from "@/engine/core/utils/ini";
import { FALSE } from "@/engine/lib/constants/words";
import { IniFile, Optional, TName, TNumberId, TStringifiedBoolean } from "@/engine/lib/types";

/**
 * @param ini - target file to read descriptors from
 * @param getPhraseId - getter of generic unique phrase ID
 * @returns map of default generic dialogs descriptors for basic categories
 */
export function readIniGenericDialogs(
  ini: IniFile,
  getPhraseId: () => TNumberId
): LuaTable<EGenericPhraseCategory, TAvailablePhrasesMap> {
  const list: LuaTable<EGenericPhraseCategory, TAvailablePhrasesMap> = $fromObject({
    [EGenericPhraseCategory.HELLO]: new LuaTable(),
    [EGenericPhraseCategory.JOB]: new LuaTable(),
    [EGenericPhraseCategory.ANOMALIES]: new LuaTable(),
    [EGenericPhraseCategory.PLACE]: new LuaTable(),
    [EGenericPhraseCategory.INFORMATION]: new LuaTable(),
  } as Record<EGenericPhraseCategory, TAvailablePhrasesMap>);

  for (const index of $range(0, ini.line_count("list") - 1)) {
    const [, id] = ini.r_line("list", index, "", "");

    assert(ini.line_exist(id, "category"), "Dialog manager error. Unknown category in '%s' provided.", id);

    const category: EGenericPhraseCategory = ini.r_string(id, "category") as EGenericPhraseCategory;

    switch (category) {
      case EGenericPhraseCategory.HELLO:
      case EGenericPhraseCategory.ANOMALIES:
      case EGenericPhraseCategory.PLACE:
      case EGenericPhraseCategory.JOB:
      case EGenericPhraseCategory.INFORMATION: {
        const phrase: IPhrasesDescriptor = {
          id: tostring(getPhraseId()),
          name: id,
          npcCommunity: ini.line_exist(id, "npc_community")
            ? parseStringsList(ini.r_string(id, "npc_community"))
            : "not_set",
          level: ini.line_exist(id, "level") ? parseStringsList(ini.r_string(id, "level")) : "not_set",
          actorCommunity: ini.line_exist(id, "actor_community")
            ? parseStringsList(ini.r_string(id, "actor_community"))
            : "not_set",
          wounded: ini.line_exist(id, "wounded") ? (ini.r_string(id, "wounded") as TStringifiedBoolean) : FALSE,
          once: ini.line_exist(id, "once") ? ini.r_string(id, "once") : "always",
          info: new LuaTable(),
          smart: null as Optional<TName>,
        };

        if (ini.line_exist(id, "info") && ini.r_string(id, "info") !== "") {
          parseInfoPortions(phrase.info, ini.r_string(id, "info"));
        }

        if (category === EGenericPhraseCategory.ANOMALIES || category === EGenericPhraseCategory.PLACE) {
          phrase.smart = ini.line_exist(id, "smart") ? ini.r_string(id, "smart") : "";
        }

        list.get(category).set(phrase.id, phrase);

        break;
      }
    }
  }

  return list;
}
