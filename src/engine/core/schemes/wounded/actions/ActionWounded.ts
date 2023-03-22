import { action_base, alife, hit, LuabindClass, time_global, XR_alife_simulator } from "xray16";

import { registry } from "@/engine/core/database";
import { portableStoreGet, portableStoreSet } from "@/engine/core/database/portable_store";
import { GlobalSoundManager } from "@/engine/core/managers/GlobalSoundManager";
import { set_state } from "@/engine/core/objects/state/StateManager";
import { ISchemeWoundedState } from "@/engine/core/schemes/wounded";
import { abort } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { NIL, TRUE } from "@/engine/lib/constants/words";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ActionWounded extends action_base {
  public readonly state: ISchemeWoundedState;

  /**
   * todo: Description.
   */
  public constructor(storage: ISchemeWoundedState) {
    super(null, ActionWounded.__name);
    this.state = storage;
  }

  /**
   * todo: Description.
   */
  public override initialize(): void {
    super.initialize();

    this.object.set_desired_position();
    this.object.set_desired_direction();

    if (this.state.help_start_dialog) {
      this.object.set_start_dialog(this.state.help_start_dialog);
    }

    this.object.movement_enabled(false);
    this.object.disable_trade();
    this.object.wounded(true);
  }

  /**
   * todo: Description.
   */
  public override execute(): void {
    super.execute();

    const woundManager = this.state.wound_manager;

    const sim: XR_alife_simulator = alife();

    if (this.state.autoheal === true) {
      if (woundManager.can_use_medkit !== true) {
        const begin_wounded: number = portableStoreGet(this.object, "begin_wounded")!;
        const current_time: number = time_global();

        if (begin_wounded === null) {
          portableStoreSet(this.object, "begin_wounded", current_time);
        } else if (current_time - begin_wounded > 60000) {
          const npc = this.object;

          sim.create("medkit_script", npc.position(), npc.level_vertex_id(), npc.game_vertex_id(), npc.id());
          woundManager.unlockMedkit();
        }
      }
    }

    const woundManagerState: string = portableStoreGet(this.object, "wounded_state")!;
    const woundManagerSound: string = portableStoreGet(this.object, "wounded_sound")!;

    if (woundManagerState === TRUE) {
      const h = new hit();

      h.power = 0;
      h.direction = this.object.direction();
      h.bone("bip01_spine");
      h.draftsman = registry.actor;
      h.impulse = 0;
      h.type = hit.wound;
      this.object.hit(h);
    } else {
      if (this.state.use_medkit === true) {
        woundManager.eatMedkit();
      }

      if (tostring(woundManagerState) === NIL) {
        abort("Wrong wounded animation %s", this.object.name());
      }

      // todo: Here should be victim
      set_state(this.object, woundManagerState, null, null, { look_object: null, look_position: null }, null);
    }

    if (woundManagerSound === NIL) {
      GlobalSoundManager.getInstance().playSound(this.object.id(), null, null, null);
    } else {
      GlobalSoundManager.getInstance().playSound(this.object.id(), woundManagerSound, null, null);
    }
  }

  /**
   * todo: Description.
   */
  public override finalize(): void {
    super.finalize();

    this.object.enable_trade();
    this.object.disable_talk();
    this.object.wounded(false);
    this.object.movement_enabled(true);
  }
}
