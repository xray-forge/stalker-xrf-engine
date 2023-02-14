import { XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, TSection } from "@/mod/lib/types/configuration";
import { getActor, IStoredObject } from "@/mod/scripts/core/db";
import { AbstractSchemeImplementation } from "@/mod/scripts/core/logic/AbstractSchemeImplementation";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/schemes/trySwitchToAnotherSection";
import { cfg_get_switch_conditions } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ActionIdle");

export class ActionIdle extends AbstractSchemeImplementation {
  public static SCHEME_SECTION: EScheme = EScheme.SR_IDLE;
  public static readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: IStoredObject
  ): void {
    subscribeActionForEvents(object, state, new ActionIdle(object, state));
  }

  public static set_scheme(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const state: IStoredObject = assignStorageAndBind(object, ini, scheme, section);

    state.logic = cfg_get_switch_conditions(ini, section, object);
  }

  public reset_scheme(): void {
    this.state.signals = {};
  }

  public update(delta: number): void {
    trySwitchToAnotherSection(this.object, this.state, getActor()!);
  }
}
