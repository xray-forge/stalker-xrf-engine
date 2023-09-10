import { anim, cond, MonsterSpace, sound } from "xray16";

import { registry, setMonsterState } from "@/engine/core/database";
import { NotificationManager } from "@/engine/core/managers/notifications";
import { AbstractSchemeManager } from "@/engine/core/schemes/base";
import { ISchemeMobRemarkState } from "@/engine/core/schemes/mob_remark/ISchemeMobRemarkState";
import { abort } from "@/engine/core/utils/assertion";
import { getExtern } from "@/engine/core/utils/binding";
import { parseStringsList, pickSectionFromCondList } from "@/engine/core/utils/ini";
import { scriptCaptureMonster, scriptCommandMonster } from "@/engine/core/utils/scheme";
import { AnyCallablesModule, LuaArray, MonsterBodyStateKey, Optional, TName } from "@/engine/lib/types";

/**
 * todo;
 */
export class MobRemarkManager extends AbstractSchemeManager<ISchemeMobRemarkState> {
  public isTipSent: Optional<boolean> = null;
  public isActionEndSignalled: Optional<boolean> = null;

  /**
   * todo: Description.
   */
  public override resetScheme(): void {
    setMonsterState(this.object, this.state.state);

    this.object.disable_talk();

    scriptCaptureMonster(this.object, !this.state.no_reset);

    const animationsList: LuaArray<TName> = parseStringsList(this.state.anim);

    let snds;

    if (this.state.snd) {
      snds = parseStringsList(this.state.snd);
    } else {
      snds = new LuaTable();
    }

    let sndset;
    let times;

    if (this.state.time) {
      times = parseStringsList(this.state.time);
    } else {
      times = new LuaTable();
    }

    let tm: number;
    let cnd: cond;

    for (const [num, an] of animationsList) {
      sndset = snds.get(num);
      if (times.get(num) !== null) {
        tm = tonumber(times.get(num))!;
      } else {
        tm = 0;
      }

      if (sndset && an) {
        // todo: Never defined anywhere. Probably remove?
        const snd = getExtern<AnyCallablesModule>("mob_sound").pick_sound_from_set(this.object, sndset, {});

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
          scriptCommandMonster(
            this.object,
            new anim(an),
            new sound(snd, "bip01_head", MonsterSpace[this.state.anim_head as MonsterBodyStateKey]),
            cnd
          );
        } else {
          if (this.state.anim_movement === true) {
            scriptCommandMonster(this.object, new anim(an, true), new sound(snd, "bip01_head"), cnd);
          } else {
            scriptCommandMonster(this.object, new anim(an), new sound(snd, "bip01_head"), cnd);
          }
        }
      } else if (an !== null) {
        if (tm === 0) {
          cnd = new cond(cond.anim_end);
        } else {
          cnd = new cond(cond.time_end, tm);
        }

        if (this.state.anim_movement === true) {
          scriptCommandMonster(this.object, new anim(an, true), cnd);
        } else {
          scriptCommandMonster(this.object, new anim(an), cnd);
        }
      }
    }

    this.isTipSent = false;

    this.state.signals = new LuaTable();
    this.isActionEndSignalled = false;
  }

  /**
   * todo: Description.
   */
  public update(): void {
    if (
      this.state.dialog_cond &&
      pickSectionFromCondList(registry.actor, this.object, this.state.dialog_cond.condlist) !== null
    ) {
      if (!this.object.is_talk_enabled()) {
        this.object.enable_talk();
      }
    } else {
      if (this.object.is_talk_enabled()) {
        this.object.disable_talk();
      }
    }

    if (!this.isTipSent) {
      this.isTipSent = true;
      if (this.state.tip) {
        NotificationManager.getInstance().sendTipNotification(this.state.tip);
      }
    }

    if (this.object.get_script() && !this.object.action()) {
      if (!this.isActionEndSignalled) {
        this.isActionEndSignalled = true;
        this.state.signals!.set("action_end", true);
      }
    }
  }
}
