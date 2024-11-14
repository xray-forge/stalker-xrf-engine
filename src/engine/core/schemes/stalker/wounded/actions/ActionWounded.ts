import { action_base, hit, LuabindClass, time_global } from "xray16";

import { EStalkerState } from "@/engine/core/animation/types";
import {
  getManager,
  getPortableStoreValue,
  registry,
  setPortableStoreValue,
  setStalkerState,
} from "@/engine/core/database";
import { registerWoundedObject, unRegisterWoundedObject } from "@/engine/core/database/wounded";
import { SoundManager } from "@/engine/core/managers/sounds/SoundManager";
import { schemeWoundedConfig } from "@/engine/core/schemes/stalker/wounded/SchemeWoundedConfig";
import {
  ISchemeWoundedState,
  PS_BEGIN_WOUNDED,
  PS_WOUNDED_SOUND,
  PS_WOUNDED_STATE,
} from "@/engine/core/schemes/stalker/wounded/wounded_types";
import { WoundManager } from "@/engine/core/schemes/stalker/wounded/WoundManager";
import { abort } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { giveWoundedObjectMedkit } from "@/engine/core/utils/object";
import { NIL, TRUE } from "@/engine/lib/constants/words";
import { GameObject, Hit, TName, TNumberId, TTimestamp } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Action to handle stalkers wounded state.
 * If stalkers are wounded, they lay on ground and call for help.
 */
@LuabindClass()
export class ActionWounded extends action_base {
  public readonly state: ISchemeWoundedState;
  public nextSoundPlayAt: TTimestamp = 0;

  public constructor(state: ISchemeWoundedState) {
    super(null, ActionWounded.__name);
    this.state = state;
  }

  public override initialize(): void {
    super.initialize();

    const object: GameObject = this.object;

    logger.info("Become wounded: %s", object.name());

    object.set_desired_position();
    object.set_desired_direction();

    if (this.state.helpStartDialog) {
      object.set_start_dialog(this.state.helpStartDialog);
    }

    object.movement_enabled(false);
    object.disable_trade();
    object.wounded(true);

    // Give some time to fall before calling for help.
    this.nextSoundPlayAt = time_global() + schemeWoundedConfig.CALL_FOR_HELP_DELAY;

    registerWoundedObject(object);
  }

  public override finalize(): void {
    super.finalize();

    const object: GameObject = this.object;

    logger.info("Free from wounded state: %s", object.name());

    object.enable_trade();
    object.disable_talk();
    object.wounded(false);
    object.movement_enabled(true);

    unRegisterWoundedObject(object);
  }

  /**
   * Execute current action as being wounded.
   */
  public override execute(): void {
    super.execute();

    const object: GameObject = this.object;
    const objectId: TNumberId = object.id();
    const woundManager: WoundManager = this.state.woundManager;
    const now: TTimestamp = time_global();

    // Handle healing up by objects after some timeout.
    if (this.state.isAutoHealing && !woundManager.canUseMedkit) {
      const woundedAt: TTimestamp = getPortableStoreValue(objectId, PS_BEGIN_WOUNDED)!;

      if (woundedAt === null) {
        setPortableStoreValue(objectId, PS_BEGIN_WOUNDED, now);
      } else if (now - woundedAt > schemeWoundedConfig.WOUNDED_TIMEOUT) {
        giveWoundedObjectMedkit(object);
        woundManager.unlockMedkit();
      }
    }

    const woundManagerState: EStalkerState = getPortableStoreValue<EStalkerState>(objectId, PS_WOUNDED_STATE)!;
    const woundManagerSound: TName = getPortableStoreValue(objectId, PS_WOUNDED_SOUND)!;

    if (woundManagerState === TRUE) {
      const hitObject: Hit = new hit();

      hitObject.power = 0;
      hitObject.direction = object.direction();
      hitObject.bone("bip01_spine");
      hitObject.draftsman = registry.actor;
      hitObject.impulse = 0;
      hitObject.type = hit.wound;

      object.hit(hitObject);
    } else {
      if (this.state.canUseMedkit === true) {
        woundManager.useMedkit();
      }

      if (tostring(woundManagerState) === NIL) {
        abort("Wrong wounded animation '%s'.", object.name());
      }

      setStalkerState(object, woundManagerState, null, null, null, { isForced: true });
    }

    // Play call for help not more often than once per 5 seconds.
    if (now > this.nextSoundPlayAt) {
      getManager(SoundManager).play(objectId, woundManagerSound === NIL ? null : woundManagerSound);

      this.nextSoundPlayAt = now + schemeWoundedConfig.CALL_FOR_HELP_PERIOD;
    }
  }
}
