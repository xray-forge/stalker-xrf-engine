import { XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";
import { registry } from "@/engine/scripts/core/database";
import { AbstractScheme } from "@/engine/scripts/core/schemes/base/AbstractScheme";
import { ISchemeSilenceState } from "@/engine/scripts/core/schemes/sr_silence/ISchemeSilenceState";
import { SilenceManager } from "@/engine/scripts/core/schemes/sr_silence/SilenceManager";
import { subscribeActionForEvents } from "@/engine/scripts/core/schemes/subscribeActionForEvents";
import { getConfigSwitchConditions } from "@/engine/scripts/utils/ini_config/config";
import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Scheme to implement zones where playing dynamic music is restricted.
 */
export class SchemeSilence extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_SILENCE;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  /**
   * todo;
   */
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeSilenceState
  ): void {
    subscribeActionForEvents(object, state, new SilenceManager(object, state));
  }

  /**
   * todo;
   */
  public static override setScheme(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const state: ISchemeSilenceState = AbstractScheme.assignStateAndBind(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section, object);

    registry.silenceZones.set(object.id(), object.name());
  }
}
