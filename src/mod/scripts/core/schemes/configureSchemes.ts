import { ini_file, XR_game_object, XR_ini_file } from "xray16";

import { ESchemeType, Optional, TSection } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { TradeManager } from "@/mod/scripts/core/managers/TradeManager";
import { disableGenericSchemes } from "@/mod/scripts/core/schemes/disableGenericSchemes";
import { enable_generic_schemes } from "@/mod/scripts/core/schemes/enable_generic_schemes";
import { issueEvent } from "@/mod/scripts/core/schemes/issueEvent";
import { spawnDefaultNpcItems } from "@/mod/scripts/utils/alife";
import { getConfigString } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { get_npc_smart } from "@/mod/scripts/utils/gulag";

/**
 * todo;
 * todo;
 * todo;
 * todo;
 */
export function configureSchemes(
  object: XR_game_object,
  ini: XR_ini_file,
  ini_filename: string,
  schemeType: ESchemeType,
  section_logic: TSection,
  gulag_name: string
): XR_ini_file {
  const npc_id = object.id();
  const st = registry.objects.get(npc_id);

  if (st.active_section) {
    issueEvent(object, st[st.active_scheme!], "deactivate", object);
  }

  let actual_ini: XR_ini_file;
  let actual_ini_filename: string;

  if (!ini.section_exist(section_logic)) {
    if (gulag_name === "") {
      actual_ini_filename = ini_filename;
      actual_ini = ini;
    } else {
      abort(
        "ERROR: object '%s': unable to find section '%s' in '%s'",
        object.name(),
        section_logic,
        tostring(ini_filename)
      );
    }
  } else {
    const filename: Optional<string> = getConfigString(ini, section_logic, "cfg", object, false, "");

    if (filename !== null) {
      actual_ini_filename = filename;
      actual_ini = new ini_file(filename);
      if (!actual_ini.section_exist(section_logic)) {
        abort("object '%s' configuration file [%s] !FOUND || section [logic] isn't assigned ", object.name(), filename);
      }

      return configureSchemes(object, actual_ini, actual_ini_filename, schemeType, section_logic, gulag_name);
    } else {
      if (schemeType === ESchemeType.STALKER || schemeType === ESchemeType.MONSTER) {
        const current_smart = get_npc_smart(object);

        if (current_smart !== null) {
          const t: any = current_smart.getJob(npc_id);

          if (t) {
            st.job_ini = t.ini_path;
          } else {
            st.job_ini = null;
          }
        }
      }

      actual_ini_filename = ini_filename;
      actual_ini = ini;
    }
  }

  disableGenericSchemes(object, schemeType);
  enable_generic_schemes(actual_ini, object, schemeType, section_logic);

  st.active_section = null;
  st.active_scheme = null;
  st.gulag_name = gulag_name;

  st.stype = schemeType;
  st.ini = actual_ini;
  st.ini_filename = actual_ini_filename;
  st.section_logic = section_logic;

  if (schemeType === ESchemeType.STALKER) {
    const trade_ini = getConfigString(
      actual_ini,
      section_logic,
      "trade",
      object,
      false,
      "",
      "misc\\trade\\trade_generic.ltx"
    );

    TradeManager.getInstance().initForObject(object, trade_ini);
    spawnDefaultNpcItems(object, st);
  }

  return st.ini;
}
