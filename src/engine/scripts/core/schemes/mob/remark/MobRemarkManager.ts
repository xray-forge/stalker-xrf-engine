import { anim, cond, MonsterSpace, sound, TXR_MonsterBodyStateKey, XR_cond } from "xray16";

import { AnyCallablesModule, Optional } from "@/engine/lib/types";
import { registry } from "@/engine/scripts/core/database";
import { NotificationManager } from "@/engine/scripts/core/managers/notifications";
import { AbstractSchemeManager } from "@/engine/scripts/core/schemes/base/AbstractSchemeManager";
import { setMobState } from "@/engine/scripts/core/schemes/mob/MobStateManager";
import { ISchemeMobRemarkState } from "@/engine/scripts/core/schemes/mob/remark/ISchemeMobRemarkState";
import { mobCapture } from "@/engine/scripts/core/schemes/mobCapture";
import { abort } from "@/engine/scripts/utils/debug";
import { pickSectionFromCondList } from "@/engine/scripts/utils/ini_config/config";
import { action } from "@/engine/scripts/utils/object";
import { parseNames } from "@/engine/scripts/utils/parse";

/**
 * todo;
 */
export class MobRemarkManager extends AbstractSchemeManager<ISchemeMobRemarkState> {
  public tip_sent: Optional<boolean> = null;
  public action_end_signalled: Optional<boolean> = null;

  /**
   * todo;
   */
  public override resetScheme(): void {
    setMobState(this.object, registry.actor, this.state.state);

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
          action(
            this.object,
            new anim(an),
            new sound(snd, "bip01_head", MonsterSpace[this.state.anim_head as TXR_MonsterBodyStateKey]),
            cnd
          );
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

    this.state.signals = new LuaTable();
    this.action_end_signalled = false;
  }

  /**
   * todo;
   */
  public override update(): void {
    const actor = registry.actor;

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
        NotificationManager.getInstance().sendTipNotification(actor, this.state.tip, null, null, null, null);
      }
    }

    // --printf("_bp: mob_remark:update [%s]", this.object.name())

    if (this.object.get_script() && !this.object.action()) {
      // --this.object.script(false, script_name())
      // --printf("__bp: free from script: %d", time_global())

      if (!this.action_end_signalled) {
        this.action_end_signalled = true;
        this.state.signals!.set("action_end", true);
      }
    }
  }
}
