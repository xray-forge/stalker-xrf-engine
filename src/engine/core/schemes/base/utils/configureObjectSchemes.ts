import { ini_file, XR_game_object, XR_ini_file } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { TradeManager } from "@/engine/core/managers/interaction/TradeManager";
import { ESchemeEvent } from "@/engine/core/schemes";
import { disableObjectGenericSchemes } from "@/engine/core/schemes/base/utils/disableObjectGenericSchemes";
import { emitSchemeEvent } from "@/engine/core/schemes/base/utils/emitSchemeEvent";
import { enableObjectGenericSchemes } from "@/engine/core/schemes/base/utils/enableObjectGenericSchemes";
import { abort } from "@/engine/core/utils/assertion";
import { readIniString } from "@/engine/core/utils/ini/getters";
import { getObjectSmartTerrain } from "@/engine/core/utils/object";
import { spawnDefaultObjectItems } from "@/engine/core/utils/spawn";
import { ESchemeType, Optional, TName, TNumberId, TSection } from "@/engine/lib/types";

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
    emitSchemeEvent(object, state[state.active_scheme!]!, ESchemeEvent.DEACTIVATE, object);
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
    const filename: Optional<TName> = readIniString(ini, sectionLogic, "cfg", false, "");

    if (filename !== null) {
      actualIniFilename = filename;
      actualIni = new ini_file(filename);
      if (!actualIni.section_exist(sectionLogic)) {
        abort("object '%s' configuration file [%s] !FOUND || section [logic] isn't assigned ", object.name(), filename);
      }

      return configureObjectSchemes(object, actualIni, actualIniFilename, schemeType, sectionLogic, gulagName);
    } else {
      if (schemeType === ESchemeType.STALKER || schemeType === ESchemeType.MONSTER) {
        const currentSmart = getObjectSmartTerrain(object);

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

  disableObjectGenericSchemes(object, schemeType);
  enableObjectGenericSchemes(actualIni, object, schemeType, sectionLogic);

  state.active_section = null;
  state.active_scheme = null;
  state.gulag_name = gulagName;

  state.stype = schemeType;
  state.ini = actualIni;
  state.ini_filename = actualIniFilename;
  state.section_logic = sectionLogic;

  if (schemeType === ESchemeType.STALKER) {
    const tradeIni = readIniString(actualIni, sectionLogic, "trade", false, "", "misc\\trade\\trade_generic.ltx");

    TradeManager.getInstance().initForObject(object, tradeIni);
    spawnDefaultObjectItems(object, state);
  }

  return state.ini;
}
