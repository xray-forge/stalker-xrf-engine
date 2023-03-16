import { ini_file, XR_game_object, XR_ini_file } from "xray16";

import { ESchemeType, Optional, TName, TNumberId, TSection } from "@/mod/lib/types";
import { IRegistryObjectState, registry } from "@/mod/scripts/core/database";
import { TradeManager } from "@/mod/scripts/core/manager/TradeManager";
import { ESchemeEvent } from "@/mod/scripts/core/scheme/base/index";
import { disableGenericSchemes } from "@/mod/scripts/core/scheme/disableGenericSchemes";
import { enable_generic_schemes } from "@/mod/scripts/core/scheme/enable_generic_schemes";
import { issueSchemeEvent } from "@/mod/scripts/core/scheme/issueSchemeEvent";
import { getConfigString } from "@/mod/scripts/utils/config";
import { abort } from "@/mod/scripts/utils/debug";
import { getObjectBoundSmart } from "@/mod/scripts/utils/gulag";
import { spawnDefaultObjectItems } from "@/mod/scripts/utils/spawn";

/**
 * todo;
 * todo;
 * todo;
 */
export function configureObjectSchemes(
  object: XR_game_object,
  ini: XR_ini_file,
  iniFilename: TName,
  schemeType: ESchemeType,
  sectionLogic: TSection,
  gulagName: Optional<TName>
): XR_ini_file {
  const objectId: TNumberId = object.id();
  const state: IRegistryObjectState = registry.objects.get(objectId);

  if (state.active_section) {
    issueSchemeEvent(object, state[state.active_scheme!]!, ESchemeEvent.DEACTIVATE, object);
  }

  let actualIni: XR_ini_file;
  let actualIniFilename: TName;

  if (!ini.section_exist(sectionLogic)) {
    if (gulagName === "") {
      actualIniFilename = iniFilename;
      actualIni = ini;
    } else {
      abort(
        "ERROR: object '%s': unable to find section '%s' in '%s'",
        object.name(),
        sectionLogic,
        tostring(iniFilename)
      );
    }
  } else {
    const filename: Optional<TName> = getConfigString(ini, sectionLogic, "cfg", object, false, "");

    if (filename !== null) {
      actualIniFilename = filename;
      actualIni = new ini_file(filename);
      if (!actualIni.section_exist(sectionLogic)) {
        abort("object '%s' configuration file [%s] !FOUND || section [logic] isn't assigned ", object.name(), filename);
      }

      return configureObjectSchemes(object, actualIni, actualIniFilename, schemeType, sectionLogic, gulagName);
    } else {
      if (schemeType === ESchemeType.STALKER || schemeType === ESchemeType.MONSTER) {
        const currentSmart = getObjectBoundSmart(object);

        if (currentSmart !== null) {
          const job: any = currentSmart.getJob(objectId);

          if (job) {
            state.job_ini = job.ini_path;
          } else {
            state.job_ini = null;
          }
        }
      }

      actualIniFilename = iniFilename;
      actualIni = ini;
    }
  }

  disableGenericSchemes(object, schemeType);
  enable_generic_schemes(actualIni, object, schemeType, sectionLogic);

  state.active_section = null;
  state.active_scheme = null;
  state.gulag_name = gulagName;

  state.stype = schemeType;
  state.ini = actualIni;
  state.ini_filename = actualIniFilename;
  state.section_logic = sectionLogic;

  if (schemeType === ESchemeType.STALKER) {
    const tradeIni = getConfigString(
      actualIni,
      sectionLogic,
      "trade",
      object,
      false,
      "",
      "misc\\trade\\trade_generic.ltx"
    );

    TradeManager.getInstance().initForObject(object, tradeIni);
    spawnDefaultObjectItems(object, state);
  }

  return state.ini;
}
