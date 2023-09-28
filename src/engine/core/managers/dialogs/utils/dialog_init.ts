import { EGenericDialogCategory, IPhrasesDescriptor, TPHRTable } from "@/engine/core/managers/dialogs/dialog_types";
import { assert } from "@/engine/core/utils/assertion";
import { parseInfoPortions, parseStringsList } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { FALSE } from "@/engine/lib/constants/words";
import { IniFile, Optional, TName, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export function readIniGenericDialogs(
  ini: IniFile,
  generatePhraseId: () => TNumberId
): LuaTable<EGenericDialogCategory, TPHRTable> {
  const list: LuaTable<EGenericDialogCategory, TPHRTable> = $fromObject({
    hello: new LuaTable(),
    job: new LuaTable(),
    anomalies: new LuaTable(),
    place: new LuaTable(),
    information: new LuaTable(),
  } as Record<EGenericDialogCategory, TPHRTable>);

  for (const it of $range(0, ini.line_count("list") - 1)) {
    const [, id] = ini.r_line("list", it, "", "");

    assert(ini.line_exist(id, "category"), "Dialog manager error. ! categoried section [%s].", id);

    let category: EGenericDialogCategory = ini.r_string(id, "category") as EGenericDialogCategory;

    switch (category) {
      case EGenericDialogCategory.HELLO:
      case EGenericDialogCategory.ANOMALIES:
      case EGenericDialogCategory.PLACE:
      case EGenericDialogCategory.JOB:
      case EGenericDialogCategory.INFORMATION:
        // nothing
        break;

      default:
        category = EGenericDialogCategory.DEFAULT;
        break;
    }

    if (category !== EGenericDialogCategory.DEFAULT) {
      const phrases: IPhrasesDescriptor = {
        id: tostring(generatePhraseId()),
        name: id,
        npc_community: ini.line_exist(id, "npc_community")
          ? parseStringsList(ini.r_string(id, "npc_community"))
          : "not_set",
        level: ini.line_exist(id, "level") ? parseStringsList(ini.r_string(id, "level")) : "not_set",
        actor_community: ini.line_exist(id, "actor_community")
          ? parseStringsList(ini.r_string(id, "actor_community"))
          : "not_set",
        wounded: ini.line_exist(id, "wounded") ? ini.r_string(id, "wounded") : FALSE,
        once: ini.line_exist(id, "once") ? ini.r_string(id, "once") : "always",
        info: new LuaTable(),
        smart: null as Optional<TName>,
      };

      if (ini.line_exist(id, "info") && ini.r_string(id, "info") !== "") {
        parseInfoPortions(phrases.info, ini.r_string(id, "info"));
      }

      if (category === EGenericDialogCategory.ANOMALIES || category === EGenericDialogCategory.PLACE) {
        phrases.smart = ini.line_exist(id, "smart") ? ini.r_string(id, "smart") : "";
      }

      list.get(category).set(phrases.id, phrases);
    }
  }

  return list;
}
