import { get_hud, time_global, XR_CUIStatic, XR_game_object, XR_ini_file } from "xray16";

import { Optional } from "@/mod/lib/types";
import { getActor, IStoredObject, storage } from "@/mod/scripts/core/db";
import {
  assign_storage_and_bind,
  subscribe_action_for_events,
  switch_to_section,
  try_switch_to_another_section,
} from "@/mod/scripts/core/logic";
import { AbstractSchemeAction } from "@/mod/scripts/core/logic/AbstractSchemeAction";
import {
  cfg_get_switch_conditions,
  getConfigNumber,
  getConfigString,
  parseCondList,
  pickSectionFromCondList,
} from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { timeToString } from "@/mod/scripts/utils/general";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ActionTimer");

export class ActionTimer extends AbstractSchemeAction {
  public static readonly SCHEME_SECTION: string = "sr_timer";

  /**
   * Add scheme to object binder for initialization.
   */
  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: string,
    section: string,
    state: IStoredObject
  ): void {
    logger.info("Add to binder:", object.name());

    subscribe_action_for_events(object, state, new ActionTimer(object, state));
  }

  public static set_scheme(obj: XR_game_object, ini: XR_ini_file, scheme: string, section: string): void {
    const st = assign_storage_and_bind(obj, ini, scheme, section);

    st.logic = cfg_get_switch_conditions(ini, section, obj);
    st.type = getConfigString(ini, section, "type", obj, false, "", "inc");

    if (st.type !== "inc" && st.type !== "dec") {
      abort("ERROR: wrong sr_timer type. Section [%s], Restrictor [%s]", section, obj.name());
    }

    if (st.type === "dec") {
      st.start_value = getConfigNumber(ini, section, "start_value", obj, true);
    } else {
      st.start_value = getConfigNumber(ini, section, "start_value", obj, false, 0);
    }

    st.on_value = parse_data(obj, getConfigString(ini, section, "on_value", obj, false, ""));
    st.timer_id = getConfigString(ini, section, "timer_id", obj, false, "", "hud_timer");
    st.string = getConfigString(ini, section, "string", obj, false, "");

    st.ui = get_hud();
    st.ui.AddCustomStatic(st.timer_id, true);
    st.timer = st.ui.GetCustomStatic(st.timer_id).wnd();

    if (st.string !== null) {
      st.ui.AddCustomStatic("hud_timer_text", true);

      const timer_text = st.ui.GetCustomStatic("hud_timer_text").wnd();

      timer_text.TextControl().SetTextST(st.string);
    }
  }

  public update(delta: number): void {
    const actor = getActor();

    if (try_switch_to_another_section(this.object, this.state, actor)) {
      return;
    }

    const nn = time_global() - storage.get(this.object.id()).activation_time;

    let value_time = this.state.type === "inc" ? this.state.start_value + nn : this.state.start_value - nn;

    if (value_time <= 0) {
      value_time = 0;
    }

    (this.state.timer as XR_CUIStatic).TextControl().SetTextST(timeToString(value_time));

    for (const [k, v] of this.state.on_value as LuaTable) {
      if ((this.state.type === "dec" && value_time <= v.dist) || (this.state.type === "inc" && value_time >= v.dist)) {
        switch_to_section(this.object, this.state.ini!, pickSectionFromCondList(getActor(), this.object, v.state)!);
      }
    }
  }

  public deactivate(): void {
    this.state.ui!.RemoveCustomStatic(this.state.timer_id);
    if (this.state.string !== null) {
      this.state.ui!.RemoveCustomStatic("hud_timer_text");
    }
  }
}

function parse_data(npc: XR_game_object, str: Optional<string>): LuaTable<number, { dist: number; state: any }> {
  const data: LuaTable<number> = new LuaTable();

  if (str) {
    for (const name of string.gfind(str, "(%|*%d+%|[^%|]+)%p*")) {
      const [t_pos] = string.find(name, "|", 1, true);

      const dist: Optional<string> = string.sub(name, 1, t_pos - 1);
      const state: Optional<string> = string.sub(name, t_pos + 1);

      table.insert(data, {
        dist: tonumber(dist)!,
        state: state === null ? null : parseCondList(npc, dist, state, state),
      });
    }
  }

  return data;
}
