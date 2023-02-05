import { time_global, XR_game_object, XR_ini_file, XR_object, XR_vector } from "xray16";

import { AnyCallablesModule, Optional } from "@/mod/lib/types";
import { getActor, IStoredObject, storage } from "@/mod/scripts/core/db";
import { AbstractSchemeAction } from "@/mod/scripts/core/logic/AbstractSchemeAction";
import {
  getConfigBoolean,
  getConfigCondList,
  getConfigString,
  pickSectionFromCondList
} from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ActionButton");

export class ActionButton extends AbstractSchemeAction {
  public static readonly SCHEME_SECTION: string = "ph_button";

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: string,
    section: string,
    state: IStoredObject
  ): void {
    get_global<AnyCallablesModule>("xr_logic").subscribe_action_for_events(
      object,
      state,
      new ActionButton(object, state)
    );
  }

  public static set_scheme(object: XR_game_object, ini: XR_ini_file, scheme: string, section: string): void {
    const st = get_global<AnyCallablesModule>("xr_logic").assign_storage_and_bind(object, ini, scheme, section);

    st.logic = get_global<AnyCallablesModule>("xr_logic").cfg_get_switch_conditions(ini, section, object);

    st.on_press = getConfigCondList(ini, section, "on_press", object);

    st.tooltip = getConfigString(ini, section, "tooltip", object, false, "");
    if (st.tooltip) {
      object.set_tip_text(st.tooltip);
    } else {
      object.set_tip_text("");
    }

    st.anim = getConfigString(ini, section, "anim", object, true, "");
    st.blending = getConfigBoolean(ini, section, "anim_blend", object, false, true);
    if (st.blending === null) {
      st.blending = true;
    }
  }

  public last_hit_tm: Optional<number> = null;

  public reset_scheme(): void {
    this.object.play_cycle(this.state.anim, this.state.blending);

    this.last_hit_tm = time_global();
  }

  public update(delta: number): void {
    get_global<AnyCallablesModule>("xr_logic").try_switch_to_another_section(this.object, this.state, getActor());
  }

  public try_switch(): boolean {
    const st = storage.get(this.object.id());

    if (st.active_scheme && st.active_scheme === ActionButton.SCHEME_SECTION && this.state.on_press) {
      // --if xr_logic.try_switch_to_another_section(obj, this.st, db.actor) {
      if (
        get_global<AnyCallablesModule>("xr_logic").switch_to_section(
          this.object,
          this.state.ini,
          pickSectionFromCondList(getActor(), this.object, this.state.on_press.condlist)
        )
      ) {
        return true;
      }
    }

    return false;
  }

  public hit_callback(
    object: XR_object,
    amount: number,
    local_direction: XR_vector,
    who: Optional<XR_game_object>,
    bone_index: number
  ): void {
    return;
    /* --[[    const who_name
      if who then
        who_name = who:name()
      else
        who_name = "nil"
      end

      printf("_bp: ph_button:hit_callback: obj='%s', amount=%d, who='%s'", obj:name(), amount, who_name)

      if time_global() - this.last_hit_tm > 500 then
        this.last_hit_tm = time_global()
        if this:try_switch() then
          return
        end
      end
    ]]
    */
  }

  public use_callback(object: XR_game_object, who: Optional<XR_game_object>): void {
    logger.info("Button used:", object.name(), who?.name());

    this.try_switch();
  }
}
