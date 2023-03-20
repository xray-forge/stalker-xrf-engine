import { XR_game_object, XR_ini_file } from "xray16";

import { AbstractScheme } from "@/engine/core/schemes/base/AbstractScheme";
import { ISchemePhysicalOnDeathState } from "@/engine/core/schemes/ph_on_death/ISchemePhysicalOnDeathState";
import { PhysicalDeathManager } from "@/engine/core/schemes/ph_on_death/PhysicalDeathManager";
import { subscribeActionForEvents } from "@/engine/core/schemes/subscribeActionForEvents";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemePhysicalOnDeath extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.PH_ON_DEATH;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.ITEM;

  /**
   * todo;
   */
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    storage: ISchemePhysicalOnDeathState
  ): void {
    const action: PhysicalDeathManager = new PhysicalDeathManager(object, storage);

    storage.action = action;

    subscribeActionForEvents(object, storage, action);
  }

  /**
   * todo;
   */
  public static override setScheme(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const state: ISchemePhysicalOnDeathState = AbstractScheme.assignStateAndBind(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section, object);
  }

  /**
   * todo;
   */
  public static override disableScheme(object: XR_game_object, scheme: EScheme): void {
    // ---  npc:set_callback(callback.death, nil)
  }
}
