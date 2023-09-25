import { action_base, hit, LuabindClass, time_global } from "xray16";

import {
  getPortableStoreValue,
  registerWoundedObject,
  registry,
  setPortableStoreValue,
  setStalkerState,
  unRegisterWoundedObject,
} from "@/engine/core/database";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { EStalkerState } from "@/engine/core/objects/animation/types";
import { ISchemeWoundedState } from "@/engine/core/schemes/stalker/wounded";
import { schemeWoundedConfig } from "@/engine/core/schemes/stalker/wounded/SchemeWoundedConfig";
import { WoundManager } from "@/engine/core/schemes/stalker/wounded/WoundManager";
import { abort } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { giveWoundedObjectMedkit } from "@/engine/core/utils/object";
import { NIL, TRUE } from "@/engine/lib/constants/words";
import { Hit, TTimestamp } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Action to handle stalkers wounded state.
 * If stalkers are wounded, they lay on ground and call for help.
 */
@LuabindClass()
export class ActionWounded extends action_base {
  public readonly state: ISchemeWoundedState;
  public nextSoundPlayAt: TTimestamp = 0;

  public constructor(storage: ISchemeWoundedState) {
    super(null, ActionWounded.__name);
    this.state = storage;
  }

  public override initialize(): void {
    super.initialize();

    logger.info("Become wounded:", this.object.name());

    this.object.set_desired_position();
    this.object.set_desired_direction();

    if (this.state.helpStartDialog) {
      this.object.set_start_dialog(this.state.helpStartDialog);
    }

    this.object.movement_enabled(false);
    this.object.disable_trade();
    this.object.wounded(true);

    // Give some time to fall before calling for help.
    this.nextSoundPlayAt = time_global() + schemeWoundedConfig.CALL_FOR_HELP_DELAY;

    registerWoundedObject(this.object);
  }

  public override finalize(): void {
    logger.info("Free from wounded state:", this.object.name());

    super.finalize();

    this.object.enable_trade();
    this.object.disable_talk();
    this.object.wounded(false);
    this.object.movement_enabled(true);

    unRegisterWoundedObject(this.object);
  }

  /**
   * Execute current action as being wounded.
   */
  public override execute(): void {
    super.execute();

    const woundManager: WoundManager = this.state.woundManager;
    const now: TTimestamp = time_global();

    // Handle healing up by objects after some timeout.
    if (this.state.autoheal && !woundManager.canUseMedkit) {
      const woundedAt: TTimestamp = getPortableStoreValue(this.object.id(), "begin_wounded")!;

      if (woundedAt === null) {
        setPortableStoreValue(this.object.id(), "begin_wounded", now);
      } else if (now - woundedAt > schemeWoundedConfig.WOUNDED_TIMEOUT) {
        giveWoundedObjectMedkit(this.object);
        woundManager.unlockMedkit();
      }
    }

    const woundManagerState: EStalkerState = getPortableStoreValue<EStalkerState>(this.object.id(), "wounded_state")!;
    const woundManagerSound: string = getPortableStoreValue(this.object.id(), "wounded_sound")!;

    if (woundManagerState === TRUE) {
      const hitObject: Hit = new hit();

      hitObject.power = 0;
      hitObject.direction = this.object.direction();
      hitObject.bone("bip01_spine");
      hitObject.draftsman = registry.actor;
      hitObject.impulse = 0;
      hitObject.type = hit.wound;

      this.object.hit(hitObject);
    } else {
      if (this.state.useMedkit === true) {
        woundManager.eatMedkit();
      }

      if (tostring(woundManagerState) === NIL) {
        abort("Wrong wounded animation '%s'.", this.object.name());
      }

      setStalkerState(this.object, woundManagerState, null, null, null, { isForced: true });
    }

    // Play call for help not more often than once per 5 seconds.
    if (now > this.nextSoundPlayAt) {
      GlobalSoundManager.getInstance().playSound(
        this.object.id(),
        woundManagerSound === NIL ? null : woundManagerSound
      );

      this.nextSoundPlayAt = now + schemeWoundedConfig.CALL_FOR_HELP_PERIOD;
    }
  }
}
