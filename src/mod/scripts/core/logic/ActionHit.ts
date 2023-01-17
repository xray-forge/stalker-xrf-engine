import { hit, patrol, vector, XR_game_object, XR_ini_file } from "xray16";

import { AnyCallablesModule } from "@/mod/lib/types";
import { getActor, IStoredObject } from "@/mod/scripts/core/db";
import { getConfigNumber, getConfigString } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("ActionHit");

export class ActionHit {
  public static readonly SCHEME_SECTION: string = "ph_hit";

  public static add_to_binder(
    npc: XR_game_object,
    ini: XR_ini_file,
    scheme: string,
    section: string,
    storage: IStoredObject
  ): void {
    get_global<AnyCallablesModule>("xr_logic").subscribe_action_for_events(npc, storage, new ActionHit(npc, storage));
  }

  public set_scheme(npc: XR_game_object, ini: XR_ini_file, scheme: string, section: string): void {
    const st = get_global<AnyCallablesModule>("xr_logic").assign_storage_and_bind(npc, ini, scheme, section);

    st.logic = get_global<AnyCallablesModule>("xr_logic").cfg_get_switch_conditions(ini, section, npc);

    st.power = getConfigNumber(ini, section, "power", npc, false, 0);
    st.impulse = getConfigNumber(ini, section, "impulse", npc, false, 1000);
    st.bone = getConfigString(ini, section, "bone", npc, true, "");
    st.dir_path = getConfigString(ini, section, "dir_path", npc, true, "");
  }

  public object: XR_game_object;
  public st: IStoredObject;

  public constructor(object: XR_game_object, storage: IStoredObject) {
    this.object = object;
    this.st = storage;
  }

  public reset_scheme(): void {
    const p1 = new patrol(this.st.dir_path).point(0);
    const p2 = this.object.position();

    const h = new hit();

    h.power = this.st.power;
    h.impulse = this.st.impulse;
    h.bone(this.st.bone);
    h.type = hit.strike;
    h.direction = new vector().set(p1).sub(p2);
    h.draftsman = this.object;
    this.object.hit(h);
  }

  public update(delta: number): void {
    const actor = getActor();

    if (actor) {
      get_global<AnyCallablesModule>("xr_logic").try_switch_to_another_section(this.object, this.st, actor);
    }
  }

  /**
   * --[[
   * function action_hit:hit_callback(door, actor)
   *    if this.st.locked then
   *        if this.st.snd_open_start then
   *            this:door_play_snd_from_set(this.st.snd_open_start)
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
