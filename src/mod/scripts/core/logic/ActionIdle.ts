import { XR_game_object, XR_ini_file } from "xray16";

import { getActor, IStoredObject } from "@/mod/scripts/core/db";
import {
  assign_storage_and_bind,
  subscribe_action_for_events,
  try_switch_to_another_section,
} from "@/mod/scripts/core/logic";
import { AbstractSchemeAction } from "@/mod/scripts/core/logic/AbstractSchemeAction";
import { cfg_get_switch_conditions } from "@/mod/scripts/utils/configs";
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
    subscribe_action_for_events(object, state, new ActionIdle(object, state));
  }

  public static set_scheme(object: XR_game_object, ini: XR_ini_file, scheme: string, section: string): void {
    const state: IStoredObject = assign_storage_and_bind(object, ini, scheme, section);

    state.logic = cfg_get_switch_conditions(ini, section, object);
  }

  public reset_scheme(): void {
    this.state.signals = {};
  }

  public update(delta: number): void {
    try_switch_to_another_section(this.object, this.state, getActor()!);
  }
}
