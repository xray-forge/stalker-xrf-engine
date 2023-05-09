import { game, level, TXR_net_processor, XR_game_object, XR_net_packet } from "xray16";

import { closeLoadMarker, closeSaveMarker, openLoadMarker, openSaveMarker, registry } from "@/engine/core/database";
import { AbstractCoreManager, EGameEvent, EventsManager } from "@/engine/core/managers";
import { ActorBinder } from "@/engine/core/objects";
import { SchemeNoWeapon } from "@/engine/core/schemes/sr_no_weapon";
import { LuaLogger } from "@/engine/core/utils/logging";
import { TDuration, TIndex } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Manager to handle actor input.
 */
export class ActorInputManager extends AbstractCoreManager {
  /**
   * Item slot applied by default when game is started.
   */
  public static readonly DEFAULT_ACTIVE_ITEM_SLOT: TIndex = 3;

  public isWeaponHidden: boolean = false;
  public isWeaponHiddenInDialog: boolean = false;

  public activeItemSlot: TIndex = ActorInputManager.DEFAULT_ACTIVE_ITEM_SLOT;

  public override initialize(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.registerCallback(EGameEvent.ACTOR_UPDATE, this.onUpdate, this);
    eventsManager.registerCallback(EGameEvent.ACTOR_FIRST_UPDATE, this.onFirstUpdate, this);
  }

  public override destroy(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.unregisterCallback(EGameEvent.ACTOR_UPDATE, this.onUpdate);
    eventsManager.unregisterCallback(EGameEvent.ACTOR_FIRST_UPDATE, this.onFirstUpdate);
  }

  public override save(packet: XR_net_packet): void {
    openSaveMarker(packet, ActorInputManager.name);
    packet.w_u8(registry.actor.active_slot());
    closeSaveMarker(packet, ActorInputManager.name);
  }

  public override load(reader: TXR_net_processor): void {
    openLoadMarker(reader, ActorInputManager.name);
    this.activeItemSlot = reader.r_u8();
    closeLoadMarker(reader, ActorInputManager.name);
  }

  /**
   * Handle generic update from actor input perspective.
   */
  public onUpdate(delta: TDuration, binder: ActorBinder): void {
    const actor: XR_game_object = binder.object;

    if (
      binder.state.disable_input_time !== null &&
      game.get_game_time().diffSec(binder.state.disable_input_time) >= (binder.state.disable_input_idle as number)
    ) {
      level.enable_input();
      binder.state.disable_input_time = null;
    }

    if (actor.is_talking()) {
      if (!this.isWeaponHiddenInDialog) {
        logger.info("Hiding weapon in dialog");
        actor.hide_weapon();
        this.isWeaponHiddenInDialog = true;
      }
    } else {
      if (this.isWeaponHiddenInDialog) {
        logger.info("Restoring weapon in dialog");
        actor.restore_weapon();
        this.isWeaponHiddenInDialog = false;
      }
    }

    if (SchemeNoWeapon.isInWeaponRestrictionZone()) {
      if (!this.isWeaponHidden) {
        logger.info("Hiding weapon");
        actor.hide_weapon();
        this.isWeaponHidden = true;
      }
    } else {
      if (this.isWeaponHidden) {
        logger.info("Restoring weapon");
        actor.restore_weapon();
        this.isWeaponHidden = false;
      }
    }
  }

  /**
   * Handle first update from actor input perspective.
   */
  public onFirstUpdate(delta: TDuration): void {
    logger.info("Apply active item slot:", this.activeItemSlot);
    registry.actor.activate_slot(this.activeItemSlot);
  }
}
