import { XR_game_object, XR_ini_file } from "xray16";

import { AnyCallablesModule } from "@/mod/lib/types";
import { getActor, IStoredObject } from "@/mod/scripts/core/db";
import { AbstractSchemeAction } from "@/mod/scripts/core/logic/AbstractSchemeAction";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ActionIdle");

export class ActionIdle extends AbstractSchemeAction {
  public static SCHEME_SECTION: string = "sr_idle";

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: string,
    section: string,
    state: IStoredObject
  ): void {
    const new_action: ActionIdle = new ActionIdle(object, state);

    get_global<AnyCallablesModule>("xr_logic").subscribe_action_for_events(object, state, new_action);
  }

  public static set_scheme(object: XR_game_object, ini: XR_ini_file, scheme: string, section: string): void {
    const state: IStoredObject = get_global<AnyCallablesModule>("xr_logic").assign_storage_and_bind(
      object,
      ini,
      scheme,
      section
    );

    state.logic = get_global<AnyCallablesModule>("xr_logic").cfg_get_switch_conditions(ini, section, object);
  }

  public reset_scheme(): void {
    // --printf("_bp: sr_idle: action_idle:reset_scheme: const.object:name()='%s'", const.object:name())
    this.state.signals = {};
  }

  public update(delta: number): void {
    get_global<AnyCallablesModule>("xr_logic").try_switch_to_another_section(this.object, this.state, getActor());
  }
}
