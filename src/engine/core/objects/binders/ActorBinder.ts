import {
  alife,
  callback,
  device,
  game,
  level,
  LuabindClass,
  object_binder,
  TXR_game_difficulty,
  TXR_TaskState,
  XR_CGameTask,
  XR_cse_alife_creature_actor,
  XR_game_object,
  XR_net_packet,
  XR_reader,
} from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  IRegistryObjectState,
  openSaveMarker,
  registry,
  resetObject,
} from "@/engine/core/database";
import { registerActor, unregisterActor } from "@/engine/core/database/actor";
import { loadPortableStore, savePortableStore } from "@/engine/core/database/portable_store";
import { openLoadMarker } from "@/engine/core/database/save_markers";
import { updateSimulationObjectAvailability } from "@/engine/core/database/simulation";
import { SaveManager } from "@/engine/core/managers";
import { EGameEvent } from "@/engine/core/managers/events/EGameEvent";
import { EventsManager } from "@/engine/core/managers/events/EventsManager";
import { Actor } from "@/engine/core/objects/alife/Actor";
import { ISchemeDeimosState } from "@/engine/core/schemes/sr_deimos";
import { SchemeDeimos } from "@/engine/core/schemes/sr_deimos/SchemeDeimos";
import { SchemeNoWeapon } from "@/engine/core/schemes/sr_no_weapon";
import { executeConsoleCommand } from "@/engine/core/utils/console";
import { hasAlifeInfo } from "@/engine/core/utils/info_portion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getTableSize } from "@/engine/core/utils/table";
import { readTimeFromPacket, writeTimeToPacket } from "@/engine/core/utils/time";
import { consoleCommands } from "@/engine/lib/constants/console_commands";
import { gameDifficultiesByNumber } from "@/engine/lib/constants/game_difficulties";
import { infoPortions } from "@/engine/lib/constants/info_portions";
import { NIL } from "@/engine/lib/constants/words";
import { Optional, StringOptional, TCount, TDuration, TIndex, TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ActorBinder extends object_binder {
  public isStartCheckNeeded: boolean = false;
  public isLoaded: boolean = false;
  public isLoadedSlotApplied: boolean = false;

  public isWeaponHidden: boolean = false;
  public isWeaponHiddenInDialog: boolean = false;

  public spawnFrame: TIndex = 0;
  public activeItemSlot: TIndex = 3;
  public lastLevelName: Optional<TName> = null;
  public deimos_intensity: Optional<number> = null;

  public state!: IRegistryObjectState;

  public eventsManager: EventsManager = EventsManager.getInstance();

  /**
   * todo: Description.
   */
  public override net_spawn(data: XR_cse_alife_creature_actor): boolean {
    logger.info("Net spawn:", data.name());

    level.show_indicators();

    this.isStartCheckNeeded = true;
    this.isWeaponHidden = false;
    this.isWeaponHiddenInDialog = false;

    if (!super.net_spawn(data)) {
      return false;
    }

    registerActor(this.object);

    (registry.actor as unknown as ActorBinder).deimos_intensity = this.deimos_intensity;

    this.deimos_intensity = null;

    if (this.state.disable_input_time === null) {
      level.enable_input();
    }

    // todo: If needed
    if (this.state.portableStore === null) {
      this.state.portableStore = new LuaTable();
    }

    this.spawnFrame = device().frame;
    this.isLoaded = false;

    this.eventsManager.emitEvent(EGameEvent.ACTOR_NET_SPAWN);

    return true;
  }

  /**
   * todo: Description.
   */
  public override net_destroy(): void {
    logger.info("Net destroy:", this.object.name());

    level.show_weapon(true);

    this.object.set_callback(callback.inventory_info, null);
    this.object.set_callback(callback.article_info, null);
    this.object.set_callback(callback.on_item_take, null);
    this.object.set_callback(callback.on_item_drop, null);
    this.object.set_callback(callback.task_state, null);
    this.object.set_callback(callback.level_border_enter, null);
    this.object.set_callback(callback.level_border_exit, null);
    this.object.set_callback(callback.take_item_from_box, null);
    this.object.set_callback(callback.use_object, null);

    this.eventsManager.emitEvent(EGameEvent.ACTOR_NET_DESTROY);

    /**
     * Unregister actor as last step so dependent managers can properly destroy everything.
     */
    unregisterActor();

    super.net_destroy();
  }

  /**
   * todo: Description.
   */
  public override reinit(): void {
    super.reinit();

    this.state = resetObject(this.object);
    this.state.portableStore = null;

    this.object.set_callback(callback.inventory_info, (object: XR_game_object, info: string) => {
      this.eventsManager.emitEvent(EGameEvent.ACTOR_INFO_UPDATE, object, info);
    });
    this.object.set_callback(callback.take_item_from_box, (box: XR_game_object, item: XR_game_object) => {
      this.eventsManager.emitEvent(EGameEvent.ACTOR_TAKE_BOX_ITEM, box, item);
    });
    this.object.set_callback(callback.on_item_drop, (item: XR_game_object) => {
      this.eventsManager.emitEvent(EGameEvent.ACTOR_ITEM_DROP, item);
    });
    this.object.set_callback(callback.trade_sell_buy_item, (item: XR_game_object, sellBuy: boolean, money: number) => {
      this.eventsManager.emitEvent(EGameEvent.ACTOR_TRADE, item, sellBuy, money);
    });
    this.object.set_callback(callback.task_state, (task: XR_CGameTask, state: TXR_TaskState) => {
      this.eventsManager.emitEvent(EGameEvent.TASK_STATE_UPDATE, task, state);
    });
    this.object.set_callback(callback.on_item_take, (object: XR_game_object) => {
      this.eventsManager.emitEvent(EGameEvent.ACTOR_ITEM_TAKE, object);
    });
    this.object.set_callback(callback.use_object, (object: XR_game_object) => {
      this.eventsManager.emitEvent(EGameEvent.ACTOR_USE_ITEM, object);
    });
  }

  /**
   * todo: Description.
   */
  public override update(delta: TDuration): void {
    super.update(delta);

    // Handle input disabling.
    if (
      this.state.disable_input_time !== null &&
      game.get_game_time().diffSec(this.state.disable_input_time) >= (this.state.disable_input_idle as number)
    ) {
      level.enable_input();
      this.state.disable_input_time = null;
    }

    if (this.object.is_talking()) {
      if (!this.isWeaponHiddenInDialog) {
        logger.info("Hiding weapon in dialog");
        this.object.hide_weapon();
        this.isWeaponHiddenInDialog = true;
      }
    } else {
      if (this.isWeaponHiddenInDialog) {
        logger.info("Restoring weapon in dialog");
        this.object.restore_weapon();
        this.isWeaponHiddenInDialog = false;
      }
    }

    if (SchemeNoWeapon.isInWeaponRestrictionZone()) {
      if (!this.isWeaponHidden) {
        logger.info("Hiding weapon");
        this.object.hide_weapon();
        this.isWeaponHidden = true;
      }
    } else {
      if (this.isWeaponHidden) {
        logger.info("Restoring weapon");
        this.object.restore_weapon();
        this.isWeaponHidden = false;
      }
    }

    if (this.isStartCheckNeeded) {
      if (!hasAlifeInfo(infoPortions.global_dialogs)) {
        this.object.give_info_portion(infoPortions.global_dialogs);
      }

      if (!hasAlifeInfo(infoPortions.level_changer_icons)) {
        this.object.give_info_portion(infoPortions.level_changer_icons);
      }

      this.isStartCheckNeeded = false;
    }

    if (!this.isLoadedSlotApplied) {
      this.object.activate_slot(this.activeItemSlot);
      this.isLoadedSlotApplied = true;
    }

    this.eventsManager.emitEvent(EGameEvent.ACTOR_UPDATE, delta);
    this.isLoaded = true;

    // todo: Probably part of sim manager?
    updateSimulationObjectAvailability(alife().actor<Actor>());
  }

  /**
   * todo: Description.
   */
  public override save(packet: XR_net_packet): void {
    openSaveMarker(packet, ActorBinder.__name);

    super.save(packet);

    packet.w_u8(level.get_game_difficulty());

    if (this.state.disable_input_time === null) {
      packet.w_bool(false);
    } else {
      packet.w_bool(true);
      writeTimeToPacket(packet, this.state.disable_input_time);
    }

    savePortableStore(this.object, packet);
    SaveManager.getInstance().save(packet);

    packet.w_stringZ(tostring(this.lastLevelName));
    packet.w_u8(getTableSize(registry.scriptSpawned));

    for (const [k, v] of registry.scriptSpawned) {
      packet.w_u16(k);
      packet.w_stringZ(v);
    }

    packet.w_u8(this.object.active_slot());

    let isDeimosExisting: boolean = false;

    for (const [k, v] of registry.zones) {
      if (registry.objects.get(v.id()) && registry.objects.get(v.id()).active_section === SchemeDeimos.SCHEME_SECTION) {
        isDeimosExisting = true;
        packet.w_bool(true);
        packet.w_float((registry.objects.get(v.id())[SchemeDeimos.SCHEME_SECTION] as ISchemeDeimosState).intensity);
      }
    }

    if (!isDeimosExisting) {
      packet.w_bool(false);
    }

    closeSaveMarker(packet, ActorBinder.__name);
  }

  /**
   * todo: Description.
   */
  public override load(reader: XR_reader): void {
    openLoadMarker(reader, ActorBinder.__name);

    super.load(reader);

    executeConsoleCommand(
      consoleCommands.g_game_difficulty,
      gameDifficultiesByNumber[reader.r_u8() as TXR_game_difficulty]
    );

    if (reader.r_bool()) {
      this.state.disable_input_time = readTimeFromPacket(reader);
    }

    loadPortableStore(this.object, reader);
    SaveManager.getInstance().load(reader);

    const lastLevelName: StringOptional<TName> = reader.r_stringZ();

    this.lastLevelName = lastLevelName === NIL ? null : lastLevelName;

    const scriptsSpawnedCount: TCount = reader.r_u8();

    for (const it of $range(1, scriptsSpawnedCount)) {
      registry.scriptSpawned.set(reader.r_u16(), reader.r_stringZ());
    }

    this.activeItemSlot = reader.r_u8();
    this.isLoadedSlotApplied = false;

    const hasDeimos: boolean = reader.r_bool();

    if (hasDeimos) {
      this.deimos_intensity = reader.r_float();
    }

    closeLoadMarker(reader, ActorBinder.__name);
  }
}
