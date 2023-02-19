import { anim, cond, MonsterSpace, sound, XR_cond, XR_game_object, XR_ini_file } from "xray16";

import { AnyCallablesModule, Optional } from "@/mod/lib/types";
import { EScheme, ESchemeType, TSection } from "@/mod/lib/types/scheme";
import { getActor, IStoredObject } from "@/mod/scripts/core/db";
import { send_tip } from "@/mod/scripts/core/NewsManager";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base/AbstractScheme";
import { getMobState, setMobState } from "@/mod/scripts/core/schemes/mob/MobStateManager";
import { mobCapture } from "@/mod/scripts/core/schemes/mobCapture";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { action } from "@/mod/scripts/utils/alife";
import {
  cfg_get_switch_conditions,
  getConfigBoolean,
  getConfigCondList,
  getConfigString,
  parseNames,
  pickSectionFromCondList,
} from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("SchemeMobRemark");

/**
 * todo;
 */
export class SchemeMobRemark extends AbstractScheme {
  public static readonly SCHEME_SECTION: EScheme = EScheme.MOB_REMARK;
  public static readonly SCHEME_TYPE: ESchemeType = ESchemeType.MONSTER;

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    storage: IStoredObject
  ): void {
    subscribeActionForEvents(object, storage, new SchemeMobRemark(object, storage));
  }

  public static set_scheme(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    gulag_name: string
  ): void {
    logger.info("Set scheme:", object.name(), scheme, section);

    const st = assignStorageAndBind(object, ini, scheme, section);

    st.logic = cfg_get_switch_conditions(ini, section, object);
    st.state = getMobState(ini, section, object);
    st.dialog_cond = getConfigCondList(ini, section, "dialog_cond", object);
    st.no_reset = true;
    st.anim = getConfigString(ini, section, "anim", object, false, "");
    st.anim_movement = getConfigBoolean(ini, section, "anim_movement", object, false, false);
    st.anim_head = getConfigString(ini, section, "anim_head", object, false, "");
    st.tip = getConfigString(ini, section, "tip", object, false, "");
    st.snd = getConfigString(ini, section, "snd", object, false, "");
    st.time = getConfigString(ini, section, "time", object, false, "");
  }

  public tip_sent: Optional<boolean> = null;
  public action_end_signalled: Optional<boolean> = null;

  public reset_scheme(): void {
    setMobState(this.object, getActor()!, this.state.state);

    this.object.disable_talk();

    mobCapture(this.object, !this.state.no_reset);

    const anims = parseNames(this.state.anim);

    let snds;

    if (this.state.snd) {
      snds = parseNames(this.state.snd);
    } else {
      snds = new LuaTable();
    }

    let sndset;
    let times;

    if (this.state.time) {
      times = parseNames(this.state.time);
    } else {
      times = new LuaTable();
    }

    let tm: number;
    let cnd: XR_cond;

    for (const [num, an] of anims) {
      sndset = snds.get(num);
      if (times.get(num) !== null) {
        tm = tonumber(times.get(num))!;
      } else {
        tm = 0;
      }

      if (sndset && an) {
        // todo: Never defined anywhere. Probably remove?
        const snd = get_global<AnyCallablesModule>("mob_sound").pick_sound_from_set(this.object, sndset, {});

        if (!snd) {
          abort(
            "mobile '%s': section '%s': sound set '%s' does !exist",
            this.object.name(),
            this.state.section,
            sndset
          );
        }

        if (tm === 0) {
          cnd = new cond(cond.sound_end);
        } else {
          cnd = new cond(cond.time_end, tm);
        }

        if (this.state.anim_head) {
          // --printf("__bp: action set: %d", time_global())
          action(this.object, new anim(an), new sound(snd, "bip01_head", MonsterSpace[this.state.anim_head!]), cnd);
        } else {
          // --printf("__bp: action set: %d", time_global())
          if (this.state.anim_movement === true) {
            action(this.object, new anim(an, true), new sound(snd, "bip01_head"), cnd);
          } else {
            action(this.object, new anim(an), new sound(snd, "bip01_head"), cnd);
          }
        }
      } else if (an !== null) {
        if (tm === 0) {
          cnd = new cond(cond.anim_end);
        } else {
          cnd = new cond(cond.time_end, tm);
        }

        if (this.state.anim_movement === true) {
          action(this.object, new anim(an, true), cnd);
        } else {
          action(this.object, new anim(an), cnd);
        }
      }
    }

    this.tip_sent = false;

    this.state.signals = {};
    this.action_end_signalled = false;
  }

  public update(delta: number): void {
    const actor = getActor()!;

    if (
      this.state.dialog_cond &&
      pickSectionFromCondList(actor, this.object, this.state.dialog_cond.condlist) !== null
    ) {
      // --printf("_bp: enable talk")
      if (!this.object.is_talk_enabled()) {
        this.object.enable_talk();
      }
    } else {
      // --printf("_bp: disable talk")
      if (this.object.is_talk_enabled()) {
        this.object.disable_talk();
      }
    }

    if (!this.tip_sent) {
      this.tip_sent = true;
      if (this.state.tip) {
        send_tip(actor, this.state.tip, null, null, null, null);
      }
    }

    // --printf("_bp: mob_remark:update [%s]", this.object.name())

    if (this.object.get_script() && !this.object.action()) {
      // --this.object.script(false, script_name())
      // --printf("__bp: free from script: %d", time_global())

      if (!this.action_end_signalled) {
        this.action_end_signalled = true;
        this.state.signals["action_end"] = true;
      }
    }
  }
}
