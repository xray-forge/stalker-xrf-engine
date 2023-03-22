import { XR_game_object, XR_ini_file } from "xray16";

import { AbstractScheme, ESchemeEvent } from "@/engine/core/schemes";
import { emitSchemeEvent } from "@/engine/core/schemes/base/utils/emitSchemeEvent";
import { CutsceneManager } from "@/engine/core/schemes/sr_cutscene/CutsceneManager";
import { ISchemeCutsceneState } from "@/engine/core/schemes/sr_cutscene/ISchemeCutsceneState";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/config";
import { readIniBoolean, readIniNumber, readIniString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { parseStringsList } from "@/engine/core/utils/parse";
import { NIL } from "@/engine/lib/constants/words";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeCutscene extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_CUTSCENE;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  /**
   * todo: Description.
   */
  public static override activate(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const state: ISchemeCutsceneState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.point = readIniString(ini, section, "point", true, "", "none");
    state.look = readIniString(ini, section, "look", true, "", "none");
    state.global_cameffect = readIniBoolean(ini, section, "global_cameffect", false, false);
    state.pp_effector = readIniString(ini, section, "pp_effector", false, "", NIL) + ".ppe";
    state.cam_effector = parseStringsList(readIniString(ini, section, "cam_effector", true, ""));
    state.fov = readIniNumber(ini, section, "fov", true);
    state.enable_ui_on_end = readIniBoolean(ini, section, "enable_ui_on_end", false, true);
    state.outdoor = readIniBoolean(ini, section, "outdoor", false, false);
  }
  /**
   * todo: Description.
   */
  public static override add(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeCutsceneState
  ): void {
    const cutsceneManager: CutsceneManager = new CutsceneManager(object, state);

    state.cutscene_action = cutsceneManager;
    SchemeCutscene.subscribe(object, state, cutsceneManager);
  }

  /**
   * todo: Description.
   */
  public static onCutsceneEnd(): void {
    emitSchemeEvent(CutsceneManager.object_cutscene!, CutsceneManager.storage_scene!, ESchemeEvent.CUTSCENE);
  }
}
