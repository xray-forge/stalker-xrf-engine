import { callback, level, LuabindClass, object_binder } from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  getManager,
  initializePortableStore,
  IRegistryObjectState,
  loadPortableStore,
  openLoadMarker,
  openSaveMarker,
  registerActor,
  registry,
  resetPortableStore,
  savePortableStore,
  unregisterActor,
} from "@/engine/core/database";
import { updateSimulationObjectAvailability } from "@/engine/core/database/simulation";
import { EGameEvent } from "@/engine/core/managers/events/events_types";
import { EventsManager } from "@/engine/core/managers/events/EventsManager";
import { SaveManager } from "@/engine/core/managers/save/SaveManager";
import { ISchemeDeimosState } from "@/engine/core/schemes/restrictor/sr_deimos";
import { SchemeDeimos } from "@/engine/core/schemes/restrictor/sr_deimos/SchemeDeimos";
import { setStableAlifeObjectsUpdate, setUnlimitedAlifeObjectsUpdate } from "@/engine/core/utils/alife";
import { LuaLogger } from "@/engine/core/utils/logging";
import { alifeConfig } from "@/engine/lib/configs/AlifeConfig";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import {
  GameObject,
  GameTask,
  NetPacket,
  Optional,
  Reader,
  ServerActorObject,
  TCount,
  TDuration,
  TTaskState,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Binder of actor game object.
 * Intercepts and handles lifecycle of actor game object.
 */
@LuabindClass()
export class ActorBinder extends object_binder {
  public readonly eventsManager: EventsManager = getManager(EventsManager);

  // todo: Move out deimos related logic / data.
  public deimosIntensity: Optional<number> = null;
  public isFirstUpdatePerformed: boolean = false;

  public override net_spawn(serverObject: ServerActorObject): boolean {
    logger.info("Actor go online");

    level.show_indicators();

    if (!super.net_spawn(serverObject)) {
      return false;
    }

    registerActor(this.object);
    initializePortableStore(this.object.id());

    // todo: Move out deimos related logic / data.
    (registry.actor as unknown as ActorBinder).deimosIntensity = this.deimosIntensity;

    this.deimosIntensity = null;

    this.eventsManager.emitEvent(EGameEvent.ACTOR_GO_ONLINE, this);

    return true;
  }

  public override net_destroy(): void {
    logger.info("Actor go offline");

    level.show_weapon(true);

    this.resetCallbacks();

    this.eventsManager.emitEvent(EGameEvent.ACTOR_GO_OFFLINE, this);

    unregisterActor();

    super.net_destroy();
  }

  public override reinit(): void {
    super.reinit();

    logger.info("Re-init actor");

    registerActor(this.object);
    resetPortableStore(ACTOR_ID);

    this.setupCallbacks();

    // At re-init allow alife to do batched updates.
    setUnlimitedAlifeObjectsUpdate();

    this.eventsManager.registerGameTimeout(setStableAlifeObjectsUpdate, alifeConfig.OBJECT_INITIAL_SPAWN_BUFFER_TIME);
    this.eventsManager.emitEvent(EGameEvent.ACTOR_REINIT, this);
  }

  public override update(delta: TDuration): void {
    super.update(delta);

    if (!this.isFirstUpdatePerformed) {
      this.isFirstUpdatePerformed = true;
      this.eventsManager.emitEvent(EGameEvent.ACTOR_FIRST_UPDATE, delta, this);
    }

    this.eventsManager.emitEvent(EGameEvent.ACTOR_UPDATE, delta, this);
    this.eventsManager.tick();

    // todo: Probably part of simulation manager?
    updateSimulationObjectAvailability(registry.actorServer);
  }

  public override save(packet: NetPacket): void {
    openSaveMarker(packet, ActorBinder.__name);

    super.save(packet);

    savePortableStore(this.object.id(), packet);
    getManager(SaveManager).clientSave(packet);

    // todo: Move out deimos logic. Probably store in pstore?
    let isDeimosExisting: boolean = false;

    for (const [, zone] of registry.zones) {
      const state: IRegistryObjectState = registry.objects.get(zone.id());

      // todo: Probably should check scheme instead of section.
      // todo: Only one deimos zone can exist, it is hardcoded.
      // todo: Consider creating separate deimos manager or store in dynamic save file?
      if (state.activeSection === SchemeDeimos.SCHEME_SECTION) {
        isDeimosExisting = true;
        packet.w_bool(true);
        packet.w_float((state[SchemeDeimos.SCHEME_SECTION] as ISchemeDeimosState).intensity);
      }
    }

    if (!isDeimosExisting) {
      packet.w_bool(false);
    }

    closeSaveMarker(packet, ActorBinder.__name);
  }

  public override load(reader: Reader): void {
    this.isFirstUpdatePerformed = false;

    openLoadMarker(reader, ActorBinder.__name);

    super.load(reader);

    loadPortableStore(this.object.id(), reader);
    getManager(SaveManager).clientLoad(reader);

    // todo: Move out deimos logic.
    const hasDeimos: boolean = reader.r_bool();

    if (hasDeimos) {
      this.deimosIntensity = reader.r_float();
    }

    closeLoadMarker(reader, ActorBinder.__name);
  }

  /**
   * Setup binder callback on going online.
   */
  public setupCallbacks(): void {
    const object: GameObject = this.object;
    const eventsManager: EventsManager = this.eventsManager;

    object.set_callback(callback.inventory_info, (object: GameObject, info: string) => {
      eventsManager.emitEvent(EGameEvent.ACTOR_INFO_UPDATE, object, info);
    });
    object.set_callback(callback.take_item_from_box, (box: GameObject, item: GameObject) => {
      eventsManager.emitEvent(EGameEvent.ACTOR_TAKE_BOX_ITEM, box, item);
    });
    object.set_callback(callback.on_item_take, (object: GameObject) => {
      eventsManager.emitEvent(EGameEvent.ACTOR_ITEM_TAKE, object);
    });
    object.set_callback(callback.on_item_drop, (item: GameObject) => {
      eventsManager.emitEvent(EGameEvent.ACTOR_ITEM_DROP, item);
    });
    object.set_callback(callback.trade_sell_buy_item, (item: GameObject, sellBuy: boolean, money: TCount) => {
      eventsManager.emitEvent(EGameEvent.ACTOR_TRADE, item, sellBuy, money);
    });
    object.set_callback(callback.task_state, (task: GameTask, state: TTaskState) => {
      eventsManager.emitEvent(EGameEvent.TASK_STATE_UPDATE, task, state);
    });
    object.set_callback(callback.use_object, (object: GameObject) => {
      eventsManager.emitEvent(EGameEvent.ACTOR_USE_ITEM, object);
    });

    // todo: article_info info callback.
    // todo: level_border_enter info callback.
    // todo: level_border_exit info callback.
  }

  /**
   * Reset callbacks and unsubscribe from events on going offline.
   */
  public resetCallbacks(): void {
    const object: GameObject = this.object;

    object.set_callback(callback.inventory_info, null);
    object.set_callback(callback.article_info, null);
    object.set_callback(callback.on_item_take, null);
    object.set_callback(callback.on_item_drop, null);
    object.set_callback(callback.trade_sell_buy_item, null);
    object.set_callback(callback.task_state, null);
    object.set_callback(callback.level_border_enter, null);
    object.set_callback(callback.level_border_exit, null);
    object.set_callback(callback.take_item_from_box, null);
    object.set_callback(callback.use_object, null);
  }
}
