import { hit, patrol, vector, XR_game_object, XR_hit, XR_ini_file, XR_vector } from "xray16";

import { EScheme, ESchemeType, TSection } from "@/mod/lib/types";
import { IStoredObject, registry } from "@/mod/scripts/core/database";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/schemes/trySwitchToAnotherSection";
import { getConfigNumber, getConfigString, getConfigSwitchConditions } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("SchemePhysicalHit");

/**
 * todo;
 */
export class SchemePhysicalHit extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.PH_HIT;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.ITEM;

  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    storage: IStoredObject
  ): void {
    subscribeActionForEvents(object, storage, new SchemePhysicalHit(object, storage));
  }

  public static override setScheme(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const st = assignStorageAndBind(object, ini, scheme, section);

    st.logic = getConfigSwitchConditions(ini, section, object);
    st.power = getConfigNumber(ini, section, "power", object, false, 0);
    st.impulse = getConfigNumber(ini, section, "impulse", object, false, 1000);
    st.bone = getConfigString(ini, section, "bone", object, true, "");
    st.dir_path = getConfigString(ini, section, "dir_path", object, true, "");
  }

  public override resetScheme(): void {
    const p1: XR_vector = new patrol(this.state.dir_path).point(0);
    const p2: XR_vector = this.object.position();

    const h: XR_hit = new hit();

    h.power = this.state.power;
    h.impulse = this.state.impulse;
    h.bone(this.state.bone);
    h.type = hit.strike;
    h.direction = new vector().set(p1).sub(p2);
    h.draftsman = this.object;
    this.object.hit(h);
  }

  public override update(delta: number): void {
    trySwitchToAnotherSection(this.object, this.state, registry.actor);
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
