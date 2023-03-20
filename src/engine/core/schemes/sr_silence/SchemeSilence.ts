import { XR_game_object, XR_ini_file } from "xray16";

import { registry } from "@/engine/core/database";
import { AbstractScheme } from "@/engine/core/schemes/base/AbstractScheme";
import { ISchemeSilenceState } from "@/engine/core/schemes/sr_silence/ISchemeSilenceState";
import { SilenceManager } from "@/engine/core/schemes/sr_silence/SilenceManager";
import { subscribeActionForEvents } from "@/engine/core/schemes/subscribeActionForEvents";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

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
