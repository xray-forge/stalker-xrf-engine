import { cond, look, patrol, vector } from "xray16";

import { AbstractSchemeManager } from "@/engine/core/schemes";
import { ISchemeMobJumpState } from "@/engine/core/schemes/mob/jump/ISchemeMobJumpState";
import { abort } from "@/engine/core/utils/assertion";
import { action, scriptCaptureObject, scriptReleaseObject } from "@/engine/core/utils/object";
import { Optional } from "@/engine/lib/types";

const STATE_START_LOOK = 1;
const STATE_WAIT_LOOK_END = 2;
const STATE_JUMP = 3;

/**
 * todo;
 */
export class MobJumpManager extends AbstractSchemeManager<ISchemeMobJumpState> {
  public jump_path: Optional<patrol> = null;
  public point: Optional<vector> = null;
  public state_current: Optional<number> = null;

  /**
   * todo: Description.
   */
  public override resetScheme(): void {
    scriptCaptureObject(this.object, true, MobJumpManager.name);

    // -- reset signals
    this.state.signals = new LuaTable();

    // -- initialize jump point
    this.jump_path = null;

    if (this.state.jump_path_name) {
      this.jump_path = new patrol(this.state.jump_path_name);
    } else {
      this.state.jump_path_name = "[not defined]";
    }

    if (!this.jump_path) {
      abort("object '%s': unable to find jump_path '%s' on the map", this.object.name(), this.state.jump_path_name);
    }

    this.point = new vector().add(this.jump_path.point(0), this.state.offset);

    this.state_current = STATE_START_LOOK;
  }

  /**
   * todo: Description.
   */
  public override update(delta: number): void {
    if (this.state_current === STATE_START_LOOK) {
      if (!this.object.action()) {
        action(this.object, new look(look.point, this.point!), new cond(cond.look_end));

        this.state_current = STATE_WAIT_LOOK_END;
      }
    } else if (this.state_current === STATE_WAIT_LOOK_END) {
      if (!this.object.action()) {
        this.state_current = STATE_JUMP;
      }
    }

    if (this.state_current === STATE_JUMP) {
      this.object.jump(this.point!, this.state.ph_jump_factor);
      this.state.signals!.set("jumped", true);
      scriptReleaseObject(this.object, MobJumpManager.name);
    }
  }
}
