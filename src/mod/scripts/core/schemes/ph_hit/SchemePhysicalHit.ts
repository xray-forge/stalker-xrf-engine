import { hit, patrol, vector, XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, TSection } from "@/mod/lib/types";
import { getActor, IStoredObject } from "@/mod/scripts/core/db";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/schemes/trySwitchToAnotherSection";
import { cfg_get_switch_conditions, getConfigNumber, getConfigString } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("SchemePhysicalHit");

/**
 * todo;
 */
export class SchemePhysicalHit extends AbstractScheme {
  public static readonly SCHEME_SECTION: EScheme = EScheme.PH_HIT;
  public static readonly SCHEME_TYPE: ESchemeType = ESchemeType.ITEM;

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    storage: IStoredObject
  ): void {
    subscribeActionForEvents(object, storage, new SchemePhysicalHit(object, storage));
  }

  public static set_scheme(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const st = assignStorageAndBind(object, ini, scheme, section);

    st.logic = cfg_get_switch_conditions(ini, section, object);
    st.power = getConfigNumber(ini, section, "power", object, false, 0);
    st.impulse = getConfigNumber(ini, section, "impulse", object, false, 1000);
    st.bone = getConfigString(ini, section, "bone", object, true, "");
    st.dir_path = getConfigString(ini, section, "dir_path", object, true, "");
  }

  public reset_scheme(): void {
    const p1 = new patrol(this.state.dir_path).point(0);
    const p2 = this.object.position();

    const h = new hit();

    h.power = this.state.power;
    h.impulse = this.state.impulse;
    h.bone(this.state.bone);
    h.type = hit.strike;
    h.direction = new vector().set(p1).sub(p2);
    h.draftsman = this.object;
    this.object.hit(h);
  }

  public update(delta: number): void {
    const actor = getActor();

    if (actor) {
      trySwitchToAnotherSection(this.object, this.state, actor);
    }
  }

  /**
   * --[[
   * function action_hit:hit_callback(door, actor)
   *    if this.state.locked then
   *        if this.state.snd_open_start then
   *            this:door_play_snd_from_set(this.state.snd_open_start)
   *        end
   *        return
   *    end
   *
   *    const angle = this.joint:get_axis_angle(90)
   *
   *    if angle - this.low_limits > this.hi_limits - angle then
   *        this:open_door()
   *    else
   *        this:close_door(false)
   *    end
   * end
   * --]]
   */
}
