import { time_global, XR_game_object, XR_ini_file, XR_object, XR_vector } from "xray16";

import { EScheme, ESchemeType, Optional, TSection } from "@/mod/lib/types";
import { IStoredObject, registry } from "@/mod/scripts/core/database";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base/AbstractScheme";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { switchToSection } from "@/mod/scripts/core/schemes/switchToSection";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/schemes/trySwitchToAnotherSection";
import {
  cfg_get_switch_conditions,
  getConfigBoolean,
  getConfigCondList,
  getConfigString,
  pickSectionFromCondList,
} from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("SchemePhysicalButton");

/**
 * todo;
 */
export class SchemePhysicalButton extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.PH_BUTTON;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.ITEM;

  public static override add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: IStoredObject
  ): void {
    subscribeActionForEvents(object, state, new SchemePhysicalButton(object, state));
  }

  public static override set_scheme(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection
  ): void {
    const st = assignStorageAndBind(object, ini, scheme, section);

    st.logic = cfg_get_switch_conditions(ini, section, object);
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

  public override reset_scheme(): void {
    this.object.play_cycle(this.state.anim, this.state.blending);

    this.last_hit_tm = time_global();
  }

  public override update(delta: number): void {
    trySwitchToAnotherSection(this.object, this.state, registry.actor);
  }

  public try_switch(): boolean {
    const state = registry.objects.get(this.object.id());

    if (state.active_scheme && state.active_scheme === SchemePhysicalButton.SCHEME_SECTION && this.state.on_press) {
      if (
        switchToSection(
          this.object,
          this.state.ini!,
          pickSectionFromCondList(registry.actor, this.object, this.state.on_press.condlist)!
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
