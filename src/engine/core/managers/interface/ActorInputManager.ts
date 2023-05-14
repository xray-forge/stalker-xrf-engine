import {
  game,
  get_hud,
  level,
  TXR_net_processor,
  XR_CTime,
  XR_CUIGameCustom,
  XR_game_object,
  XR_net_packet,
} from "xray16";

import { closeLoadMarker, closeSaveMarker, openLoadMarker, openSaveMarker, registry } from "@/engine/core/database";
import { AbstractCoreManager, EGameEvent, EventsManager } from "@/engine/core/managers";
import { SchemeNoWeapon } from "@/engine/core/schemes/sr_no_weapon";
import { LuaLogger } from "@/engine/core/utils/logging";
import { readTimeFromPacket, writeTimeToPacket } from "@/engine/core/utils/time";
import { misc } from "@/engine/lib/constants/items/misc";
import { Optional, TDuration, TIndex } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Manager to handle actor input.
 */
export class ActorInputManager extends AbstractCoreManager {
  /**
   * Item slot `none`.
   */
  public static readonly NONE_ITEM_SLOT: TIndex = 0;
  /**
   * Item slot applied by default when game is started.
   */
  public static readonly DEFAULT_ACTIVE_ITEM_SLOT: TIndex = 3;

  public isWeaponHidden: boolean = false;
  public isWeaponHiddenInDialog: boolean = false;
  public isActorNightVisionEnabled: boolean = false;
  public isActorTorchEnabled: boolean = false;

  public activeItemSlot: TIndex = ActorInputManager.DEFAULT_ACTIVE_ITEM_SLOT;
  public memoizedItemSlot: TIndex = ActorInputManager.NONE_ITEM_SLOT;

  public disableInputAt: Optional<XR_CTime> = null;
  public disableInputDuration: Optional<TDuration> = null;

  public override initialize(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.registerCallback(EGameEvent.ACTOR_UPDATE, this.onUpdate, this);
    eventsManager.registerCallback(EGameEvent.ACTOR_FIRST_UPDATE, this.onFirstUpdate, this);
    eventsManager.registerCallback(EGameEvent.ACTOR_NET_SPAWN, this.onNetworkSpawn, this);
  }

  public override destroy(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.unregisterCallback(EGameEvent.ACTOR_UPDATE, this.onUpdate);
    eventsManager.unregisterCallback(EGameEvent.ACTOR_FIRST_UPDATE, this.onFirstUpdate);
    eventsManager.unregisterCallback(EGameEvent.ACTOR_NET_SPAWN, this.onNetworkSpawn);
  }

  public override save(packet: XR_net_packet): void {
    openSaveMarker(packet, ActorInputManager.name);

    if (this.disableInputAt === null) {
      packet.w_bool(false);
    } else {
      packet.w_bool(true);
      writeTimeToPacket(packet, this.disableInputAt);
    }

    packet.w_u8(registry.actor.active_slot());
    closeSaveMarker(packet, ActorInputManager.name);
  }

  public override load(reader: TXR_net_processor): void {
    openLoadMarker(reader, ActorInputManager.name);

    if (reader.r_bool()) {
      this.disableInputAt = readTimeFromPacket(reader);
    }

    this.activeItemSlot = reader.r_u8();
    closeLoadMarker(reader, ActorInputManager.name);
  }

  /**
   * Disable game input for delta duration.
   */
  public setInactiveInputTime(delta: TDuration): void {
    this.disableInputAt = game.get_game_time();
    this.disableInputDuration = delta;

    level.disable_input();
  }

  /**
   * todo;
   */
  public disableActorNightVision(actor: XR_game_object = registry.actor): void {
    const nightVision: Optional<XR_game_object> = actor.object(misc.device_torch);

    if (nightVision !== null && nightVision.night_vision_enabled()) {
      nightVision.enable_night_vision(false);
      this.isActorNightVisionEnabled = false;
    }
  }

  /**
   * todo;
   */
  public enableActorNightVision(actor: XR_game_object = registry.actor): void {
    const nightVision: Optional<XR_game_object> = actor.object(misc.device_torch);

    if (nightVision !== null && !nightVision.night_vision_enabled() && !this.isActorNightVisionEnabled) {
      nightVision.enable_night_vision(true);
      this.isActorNightVisionEnabled = true;
    }
  }

  /**
   * todo;
   */
  public disableActorTorch(actor: XR_game_object = registry.actor): void {
    const torch: Optional<XR_game_object> = actor.object(misc.device_torch);

    if (torch !== null && torch.torch_enabled()) {
      torch.enable_torch(false);
      this.isActorTorchEnabled = false;
    }
  }

  /**
   * todo;
   */
  public enableActorTorch(actor: XR_game_object = registry.actor): void {
    const torch: Optional<XR_game_object> = actor.object(misc.device_torch);

    if (torch !== null && !torch.torch_enabled() && !this.isActorTorchEnabled) {
      torch.enable_torch(true);
      this.isActorTorchEnabled = true;
    }
  }

  /**
   * todo;
   */
  public disableGameUi(actor: XR_game_object, resetSlot: boolean = false): void {
    logger.info("Disable game UI");

    if (actor.is_talking()) {
      actor.stop_talk();
    }

    level.show_weapon(false);

    if (resetSlot) {
      const slot: TIndex = actor.active_slot();

      if (slot !== ActorInputManager.NONE_ITEM_SLOT) {
        this.memoizedItemSlot = slot;
        actor.activate_slot(ActorInputManager.NONE_ITEM_SLOT);
      }
    }

    level.disable_input();
    level.hide_indicators_safe();

    const hud: XR_CUIGameCustom = get_hud();

    hud.HideActorMenu();
    hud.HidePdaMenu();

    this.disableActorNightVision(actor);
    this.disableActorTorch(actor);
  }

  /**
   * todo;
   */
  public enableGameUi(restore: boolean = false): void {
    logger.info("Enable game UI");

    if (restore) {
      if (
        this.memoizedItemSlot !== ActorInputManager.NONE_ITEM_SLOT &&
        registry.actor.item_in_slot(this.memoizedItemSlot) !== null
      ) {
        registry.actor.activate_slot(this.memoizedItemSlot);
      }
    }

    this.memoizedItemSlot = ActorInputManager.NONE_ITEM_SLOT;

    level.show_weapon(true);
    level.enable_input();
    level.show_indicators();

    this.enableActorNightVision(registry.actor);
    this.enableActorTorch(registry.actor);
  }

  /**
   * todo;
   */
  public disableGameUiOnly(actor: XR_game_object): void {
    logger.info("Disable game UI only");

    if (actor.is_talking()) {
      actor.stop_talk();
    }

    level.show_weapon(false);

    const slot: TIndex = actor.active_slot();

    if (slot !== ActorInputManager.NONE_ITEM_SLOT) {
      this.memoizedItemSlot = slot;
      actor.activate_slot(ActorInputManager.NONE_ITEM_SLOT);
    }

    level.disable_input();
    level.hide_indicators_safe();

    const hud: XR_CUIGameCustom = get_hud();

    hud.HideActorMenu();
    hud.HidePdaMenu();
  }

  /**
   * Handle generic update from actor input perspective.
   */
  public onUpdate(delta: TDuration): void {
    const actor: XR_game_object = registry.actor;

    if (
      this.disableInputAt !== null &&
      game.get_game_time().diffSec(this.disableInputAt) >= (this.disableInputDuration as number)
    ) {
      level.enable_input();
      this.disableInputAt = null;
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

  /**
   * Handle actor network spawn.
   */
  public onNetworkSpawn(): void {
    if (this.disableInputAt === null) {
      level.enable_input();
    }
  }
}