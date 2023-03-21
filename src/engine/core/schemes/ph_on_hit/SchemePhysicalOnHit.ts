import { XR_game_object, XR_ini_file } from "xray16";

import { registry } from "@/engine/core/database";
import { AbstractScheme } from "@/engine/core/schemes/base/AbstractScheme";
import { SchemePhysicalHit } from "@/engine/core/schemes/ph_hit";
import { ISchemePhysicalOnHitState } from "@/engine/core/schemes/ph_on_hit/ISchemePhysicalOnHitState";
import { PhysicalOnHitManager } from "@/engine/core/schemes/ph_on_hit/PhysicalOnHitManager";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EScheme, ESchemeType, Optional, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemePhysicalOnHit extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.PH_ON_HIT;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.ITEM;

  /**
   * todo: Description.
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
   * todo: Description.
   */
  public static override setScheme(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const state: ISchemePhysicalOnHitState = AbstractScheme.assignStateAndBind(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section, object);
    SchemePhysicalHit.subscribeToSchemaEvents(object, state, state.action);
  }

  /**
   * todo: Description.
   */
  public static override disableScheme(object: XR_game_object, scheme: EScheme): void {
    const state: Optional<ISchemePhysicalOnHitState> = registry.objects.get(object.id())[
      scheme
    ] as ISchemePhysicalOnHitState;

    if (state !== null) {
      SchemePhysicalHit.unsubscribeFromSchemaEvents(object, state, state.action);
    }
  }
}
