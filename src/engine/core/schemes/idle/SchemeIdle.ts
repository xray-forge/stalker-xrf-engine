import { XR_game_object, XR_ini_file } from "xray16";

import { AbstractScheme } from "@/engine/core/schemes/base/AbstractScheme";
import { IdleManager } from "@/engine/core/schemes/idle/IdleManager";
import { ISchemeIdleState } from "@/engine/core/schemes/idle/ISchemeIdleState";
import { subscribeActionForEvents } from "@/engine/core/schemes/subscribeActionForEvents";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Action scheme to block NPCs from any action until some conditions are met.
 * Example: objects wait for game intro to stop before doing something.
 */
export class SchemeIdle extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_IDLE;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  /**
   * todo;
   */
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeIdleState
  ): void {
    subscribeActionForEvents(object, state, new IdleManager(object, state));
  }

  /**
   * todo;
   */
  public static override setScheme(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const state: ISchemeIdleState = AbstractScheme.assignStateAndBind(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section, object);
  }
}
