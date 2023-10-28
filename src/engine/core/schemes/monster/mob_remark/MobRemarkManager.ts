import { anim, cond } from "xray16";

import { AbstractSchemeManager } from "@/engine/core/ai/scheme";
import { registry, setMonsterState } from "@/engine/core/database";
import { NotificationManager } from "@/engine/core/managers/notifications";
import { ISchemeMobRemarkState } from "@/engine/core/schemes/monster/mob_remark/mob_remark_types";
import { parseStringsList, pickSectionFromCondList } from "@/engine/core/utils/ini";
import { scriptCaptureMonster, scriptCommandMonster } from "@/engine/core/utils/scheme";
import { Cond, LuaArray, TDuration, TName } from "@/engine/lib/types";

/**
 * todo;
 */
export class MobRemarkManager extends AbstractSchemeManager<ISchemeMobRemarkState> {
  public isTipSent: boolean = false;
  public isActionEndSignalled: boolean = false;

  public override activate(): void {
    this.state.signals = new LuaTable();
    this.isTipSent = false;
    this.isActionEndSignalled = false;

    this.object.disable_talk();

    setMonsterState(this.object, this.state.state);
    scriptCaptureMonster(this.object, !this.state.noReset);

    const animationsList: LuaArray<TName> = parseStringsList(this.state.anim);
    const timesList: LuaArray<TName> = this.state.time ? parseStringsList(this.state.time) : new LuaTable();

    for (const [index, animation] of animationsList) {
      const timeout: TDuration = timesList.get(index) !== null ? tonumber(timesList.get(index))! : 0;
      const condition: Cond = timeout === 0 ? new cond(cond.anim_end) : new cond(cond.time_end, timeout);

      if (this.state.animationMovement) {
        scriptCommandMonster(this.object, new anim(animation, true), condition);
      } else {
        scriptCommandMonster(this.object, new anim(animation), condition);
      }
    }
  }

  public update(): void {
    // Sync dialog / speaking state.
    if (
      this.state.dialogCondition &&
      pickSectionFromCondList(registry.actor, this.object, this.state.dialogCondition.condlist) !== null
    ) {
      if (!this.object.is_talk_enabled()) {
        this.object.enable_talk();
      }
    } else {
      if (this.object.is_talk_enabled()) {
        this.object.disable_talk();
      }
    }

    // Send tip notification it needed.
    if (!this.isTipSent) {
      this.isTipSent = true;

      if (this.state.tip) {
        NotificationManager.getInstance().sendTipNotification(this.state.tip);
      }
    }

    if (!this.isActionEndSignalled && this.object.get_script() && !this.object.action()) {
      this.isActionEndSignalled = true;
      this.state.signals!.set("action_end", true);
    }
  }
}
