import { XR_game_object, XR_ini_file, XR_vector } from "xray16";

import { AnyCallablesModule, Optional } from "@/mod/lib/types";
import { getActor, IStoredObject } from "@/mod/scripts/core/db";
import { AbstractSchemeAction } from "@/mod/scripts/core/logic/AbstractSchemeAction";
import {
  getConfigBoolean,
  getConfigCondList,
  getConfigString,
  pickSectionFromCondList
} from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("ActionIdle");

export class ActionIdle extends AbstractSchemeAction {
  public static readonly SCHEME_SECTION: string = "ph_idle";

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: string,
    section: string,
    state: IStoredObject
  ): void {
    log.info("Add to binder:", object.name());
    get_global<AnyCallablesModule>("xr_logic").subscribe_action_for_events(
      object,
      state,
      new ActionIdle(object, state)
    );
  }

  public static set_scheme(object: XR_game_object, ini: XR_ini_file, scheme: string, section: string): void {
    log.info("Set scheme:", object.name(), scheme, section);

    const state = get_global<AnyCallablesModule>("xr_logic").assign_storage_and_bind(object, ini, scheme, section);

    state.logic = get_global<AnyCallablesModule>("xr_logic").cfg_get_switch_conditions(ini, section, object);

    state.hit_on_bone = get_global<AnyCallablesModule>("utils").parse_data_1v(
      object,
      getConfigString(ini, section, "hit_on_bone", object, false, "")
    );
    state.nonscript_usable = getConfigBoolean(ini, section, "nonscript_usable", object, false);
    state.on_use = getConfigCondList(ini, section, "on_use", object);

    state.tips = getConfigString(ini, section, "tips", object, false, "", "");

    object.set_tip_text(state.tips);
  }

  public reset_scheme(): void {
    this.object.set_nonscript_usable(this.state.nonscript_usable);
  }

  public update(delta: number): void {
    get_global<AnyCallablesModule>("xr_logic").try_switch_to_another_section(this.object, this.state, getActor());
  }

  public deactivate(): void {
    this.object.set_tip_text("");
  }

  public hit_callback(
    object: XR_game_object,
    amount: number,
    const_direction: XR_vector,
    who: Optional<XR_game_object>,
    bone_index: number
  ): void {
    log.info("Idle hit:", this.object.name());

    if (this.state.hit_on_bone[bone_index] !== null) {
      const section = pickSectionFromCondList(getActor(), this.object, this.state.hit_on_bone[bone_index].state);

      get_global<AnyCallablesModule>("xr_logic").switch_to_section(object, this.state.ini, section);
    }
  }

  public use_callback(): Optional<boolean> {
    log.info("Idle use:", this.object.name());

    if (this.state.on_use) {
      if (
        get_global<AnyCallablesModule>("xr_logic").switch_to_section(
          this.object,
          this.state.ini,
          pickSectionFromCondList(getActor(), this.object, this.state.on_use.condlist)
        )
      ) {
        return true;
      }
    }

    return null;
  }
}
