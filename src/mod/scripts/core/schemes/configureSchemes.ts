import { ini_file, XR_game_object, XR_ini_file } from "xray16";

import { Optional } from "@/mod/lib/types";
import { ESchemeType, TSection } from "@/mod/lib/types/configuration";
import { storage } from "@/mod/scripts/core/db";
import { disable_generic_schemes } from "@/mod/scripts/core/schemes/disable_generic_schemes";
import { enable_generic_schemes } from "@/mod/scripts/core/schemes/enable_generic_schemes";
import { issueEvent } from "@/mod/scripts/core/schemes/issueEvent";
import { trade_init } from "@/mod/scripts/core/TradeManager";
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
  npc: XR_game_object,
  ini: XR_ini_file,
  ini_filename: string,
  stype: ESchemeType,
  section_logic: TSection,
  gulag_name: string
): XR_ini_file {
  const npc_id = npc.id();
  const st = storage.get(npc_id);

  if (st.active_section) {
    issueEvent(npc, st[st.active_scheme!], "deactivate", npc);
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
        npc.name(),
        section_logic,
        tostring(ini_filename)
      );
    }
  } else {
    const filename: Optional<string> = getConfigString(ini, section_logic, "cfg", npc, false, "");

    if (filename !== null) {
      actual_ini_filename = filename;
      actual_ini = new ini_file(filename);
      if (!actual_ini.section_exist(section_logic)) {
        abort("object '%s' configuration file [%s] !FOUND || section [logic] isn't assigned ", npc.name(), filename);
      }

      return configureSchemes(npc, actual_ini, actual_ini_filename, stype, section_logic, gulag_name);
    } else {
      if (stype === ESchemeType.STALKER || stype === ESchemeType.MONSTER) {
        const current_smart = get_npc_smart(npc);

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

  disable_generic_schemes(npc, stype);
  enable_generic_schemes(actual_ini, npc, stype, section_logic);

  st.active_section = null;
  st.active_scheme = null;
  st.gulag_name = gulag_name;

  st.stype = stype;
  st.ini = actual_ini;
  st.ini_filename = actual_ini_filename;
  st.section_logic = section_logic;

  if (stype === ESchemeType.STALKER) {
    const trade_ini = getConfigString(
      actual_ini,
      section_logic,
      "trade",
      npc,
      false,
      "",
      "misc\\trade\\trade_generic.ltx"
    );

    trade_init(npc, trade_ini);
    spawnDefaultNpcItems(npc, st);
  }

  return st.ini;
}
