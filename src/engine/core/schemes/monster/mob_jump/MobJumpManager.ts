import { cond, look, patrol } from "xray16";

import { AbstractSchemeManager } from "@/engine/core/objects/ai/scheme";
import { EMobJumpState, ISchemeMobJumpState } from "@/engine/core/schemes/monster/mob_jump/mob_jump_types";
import { abort } from "@/engine/core/utils/assertion";
import { scriptCaptureMonster, scriptCommandMonster, scriptReleaseMonster } from "@/engine/core/utils/scheme";
import { addVectors } from "@/engine/core/utils/vector";
import { Optional, Patrol, Vector } from "@/engine/lib/types";

/**
 * todo;
 */
export class MobJumpManager extends AbstractSchemeManager<ISchemeMobJumpState> {
  public jumpPath: Optional<Patrol> = null;
  public point: Optional<Vector> = null;
  public stateCurrent: Optional<number> = null;

  public override activate(): void {
    scriptCaptureMonster(this.object, true, MobJumpManager.name);

    // -- reset signals
    this.state.signals = new LuaTable();

    // -- initialize jump point
    this.jumpPath = null;

    if (this.state.jumpPathName) {
      this.jumpPath = new patrol(this.state.jumpPathName);
    } else {
      this.state.jumpPathName = "[not defined]";
    }

    if (!this.jumpPath) {
      abort("object '%s': unable to find jump_path '%s' on the map", this.object.name(), this.state.jumpPathName);
    }

    this.point = addVectors(this.jumpPath.point(0), this.state.offset);
    this.stateCurrent = EMobJumpState.START_LOOK;
  }

  public update(): void {
    if (this.stateCurrent === EMobJumpState.START_LOOK) {
      if (!this.object.action()) {
        scriptCommandMonster(this.object, new look(look.point, this.point!), new cond(cond.look_end));

        this.stateCurrent = EMobJumpState.WAIT_LOOK_END;
      }
    } else if (this.stateCurrent === EMobJumpState.WAIT_LOOK_END) {
      if (!this.object.action()) {
        this.stateCurrent = EMobJumpState.JUMP;
      }
    }

    if (this.stateCurrent === EMobJumpState.JUMP) {
      this.object.jump(this.point!, this.state.phJumpFactor);
      this.state.signals!.set("jumped", true);
      scriptReleaseMonster(this.object);
    }
  }
}
