import { XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, Optional, TSection } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base/AbstractScheme";
import { ISchemePhysicalOnHitState } from "@/mod/scripts/core/schemes/ph_on_hit/ISchemePhysicalOnHitState";
import { PhysicalOnHitManager } from "@/mod/scripts/core/schemes/ph_on_hit/PhysicalOnHitManager";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { unsubscribeActionFromEvents } from "@/mod/scripts/core/schemes/unsubscribeActionFromEvents";
import { getConfigSwitchConditions } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(FILENAME);

/**
 * todo;
 */
export class SchemePhysicalOnHit extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.PH_ON_HIT;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.ITEM;

  /**
   * todo;
   */
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemePhysicalOnHitState
  ): void {
    state.action = new PhysicalOnHitManager(object, state);
  }

  /**
   * todo;
   */
  public static override setScheme(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const state: ISchemePhysicalOnHitState = AbstractScheme.assignStateAndBind(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section, object);
    subscribeActionForEvents(object, state, state.action);
  }

  /**
   * todo;
   */
  public static override disableScheme(object: XR_game_object, scheme: EScheme): void {
    const state: Optional<ISchemePhysicalOnHitState> = registry.objects.get(object.id())[
      scheme
    ] as ISchemePhysicalOnHitState;

    if (state !== null) {
      unsubscribeActionFromEvents(object, state, state.action);
    }
  }
}
