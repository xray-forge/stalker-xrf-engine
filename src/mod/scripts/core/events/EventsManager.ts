import { AnyArgs, AnyCallable, AnyObject, Optional } from "@/mod/lib/types";
import { EGameEvent } from "@/mod/scripts/core/events/EGameEvent";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("CoreEventsManager");

export class EventsManager {
  public static instance: Optional<EventsManager> = null;

  public static getInstance(): EventsManager {
    if (!this.instance) {
      this.instance = new this();
    }

    return this.instance;
  }

  public callbacks: Record<EGameEvent, LuaTable<AnyCallable, AnyObject>> = {
    [EGameEvent.ACTOR_NET_SPAWN]: new LuaTable(),
    [EGameEvent.ACTOR_NET_DESTROY]: new LuaTable(),
    [EGameEvent.ACTOR_UPDATE]: new LuaTable(),
    [EGameEvent.HIT]: new LuaTable(),
    [EGameEvent.MONSTER_HIT]: new LuaTable(),
    [EGameEvent.NPC_HIT]: new LuaTable(),
    [EGameEvent.ENEMY_SEE_ACTOR]: new LuaTable(),
    [EGameEvent.ACTOR_SEE_ENEMY]: new LuaTable(),
    [EGameEvent.NPC_SHOT_ACTOR]: new LuaTable(),
    [EGameEvent.MAIN_MENU_ON]: new LuaTable(),
    [EGameEvent.MAIN_MENU_OFF]: new LuaTable()
  };

  public registerCallback(event: EGameEvent, func: AnyCallable, context: AnyObject): void {
    log.info("Register callback:", event);

    this.assertEventIsDeclared(event);
    this.callbacks[event].set(func, { context: context });
  }

  public unregisterCallback(event: EGameEvent, func: AnyCallable): void {
    log.info("Unregister callback:", event);

    this.assertEventIsDeclared(event);
    this.callbacks[event].delete(func);
  }

  public emitEvent(event: EGameEvent, ...data: AnyArgs): void {
    for (const [func, config] of this.callbacks[event]) {
      func(config.context, ...data);
    }
  }

  /**
   * Assert provided event type is already registered and can be used in game.
   */
  public assertEventIsDeclared(event: EGameEvent): void {
    if (!this.callbacks[event]) {
      abort("Callback name '%s' is unknown.", event);
    }
  }
}
