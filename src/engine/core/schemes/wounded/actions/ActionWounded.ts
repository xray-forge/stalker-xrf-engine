import { action_base, alife, alife_simulator, hit, LuabindClass, time_global } from "xray16";

import { registry, setStalkerState } from "@/engine/core/database";
import { getPortableStoreValue, setPortableStoreValue } from "@/engine/core/database/portable_store";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { EStalkerState } from "@/engine/core/objects/state";
import { ISchemeWoundedState } from "@/engine/core/schemes/wounded";
import { WoundManager } from "@/engine/core/schemes/wounded/WoundManager";
import { abort } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { NIL, TRUE } from "@/engine/lib/constants/words";
import { TTimestamp } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ActionWounded extends action_base {
  public readonly state: ISchemeWoundedState;

  public constructor(storage: ISchemeWoundedState) {
    super(null, ActionWounded.__name);
    this.state = storage;
  }

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

    const woundManager: WoundManager = this.state.woundManager;
    const simulator: alife_simulator = alife();

    if (this.state.autoheal === true) {
      if (woundManager.canUseMedkit !== true) {
        const woundedAt: TTimestamp = getPortableStoreValue(this.object, "begin_wounded")!;
        const now: TTimestamp = time_global();

        if (woundedAt === null) {
          setPortableStoreValue(this.object, "begin_wounded", now);
        } else if (now - woundedAt > 60000) {
          const npc = this.object;

          simulator.create("medkit_script", npc.position(), npc.level_vertex_id(), npc.game_vertex_id(), npc.id());
          woundManager.unlockMedkit();
        }
      }
    }

    const woundManagerState: EStalkerState = getPortableStoreValue<EStalkerState>(this.object, "wounded_state")!;
    const woundManagerSound: string = getPortableStoreValue(this.object, "wounded_sound")!;

    if (woundManagerState === TRUE) {
      const hitObject: hit = new hit();

      hitObject.power = 0;
      hitObject.direction = this.object.direction();
      hitObject.bone("bip01_spine");
      hitObject.draftsman = registry.actor;
      hitObject.impulse = 0;
      hitObject.type = hit.wound;
      this.object.hit(hitObject);
    } else {
      if (this.state.use_medkit === true) {
        woundManager.eatMedkit();
      }

      if (tostring(woundManagerState) === NIL) {
        abort("Wrong wounded animation %s", this.object.name());
      }

      // todo: Here should be victim
      setStalkerState(this.object, woundManagerState, null, null, { look_object: null, look_position: null });
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
