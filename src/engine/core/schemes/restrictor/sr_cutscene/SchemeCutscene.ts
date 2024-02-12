import { AbstractScheme } from "@/engine/core/ai/scheme";
import { CutsceneManager } from "@/engine/core/schemes/restrictor/sr_cutscene/CutsceneManager";
import { ISchemeCutsceneState } from "@/engine/core/schemes/restrictor/sr_cutscene/sr_cutscene_types";
import {
  getConfigSwitchConditions,
  parseStringsList,
  readIniBoolean,
  readIniNumber,
  readIniString,
} from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { NIL } from "@/engine/lib/constants/words";
import { EScheme, ESchemeType, GameObject, IniFile, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Scheme implementing cutscenes logics.
 * Allows disabling input and controlling camera for some time.
 */
export class SchemeCutscene extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_CUTSCENE;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  public static override activate(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection
  ): ISchemeCutsceneState {
    logger.info("Activate: %s %s %s", object.name(), scheme, section);

    const state: ISchemeCutsceneState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.point = readIniString(ini, section, "point", true, null, "none");
    state.look = readIniString(ini, section, "look", true, null, "none");
    state.isGlobalCameraEffect = readIniBoolean(ini, section, "global_cameffect", false, false);
    state.ppEffector = readIniString(ini, section, "pp_effector", false, null, NIL) + ".ppe";
    state.cameraEffector = parseStringsList(readIniString(ini, section, "cam_effector", true));
    state.fov = readIniNumber(ini, section, "fov", false);
    state.shouldEnableUiOnEnd = readIniBoolean(ini, section, "enable_ui_on_end", false, true);
    state.isOutdoor = readIniBoolean(ini, section, "outdoor", false, false);

    return state;
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeCutsceneState
  ): void {
    AbstractScheme.subscribe(state, new CutsceneManager(object, state));
  }
}
