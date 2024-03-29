import { getManager } from "@/engine/core/database";
import { AbstractTimersManager } from "@/engine/core/managers/events/AbstractTimersManager";
import { EGameEvent } from "@/engine/core/managers/events/events_types";
import { assert } from "@/engine/core/utils/assertion";
import { AnyArgs, AnyCallable, AnyContextualCallable, AnyObject, Optional, TCount } from "@/engine/lib/types";

/**
 * Descriptor of event subscriptions list.
 */
type TEventSubscribersDescriptor = Record<EGameEvent, LuaTable<AnyCallable, { context: Optional<AnyObject> }>>;

/**
 * Manager to dispatch and subscribe to custom global events.
 */
export class EventsManager extends AbstractTimersManager {
  /**
   * Emit event directly from class statics for simplicity.
   *
   * @param event - event type to emit
   * @param data - event parameters
   */
  public static emitEvent<T>(event: EGameEvent, data: T): void;
  public static emitEvent(event: EGameEvent, ...data: AnyArgs): void;
  public static emitEvent(event: EGameEvent, ...data: AnyArgs): void {
    return getManager(EventsManager).emitEvent(event, ...data);
  }

  // Initialize list of all enum handlers. Note TSTL map created instead for enum.
  public readonly callbacks: TEventSubscribersDescriptor = Object.values(EGameEvent).reduce((acc, it) => {
    if (type(it) === "number") {
      acc[it as EGameEvent] = new LuaTable();
    }

    return acc;
  }, {} as TEventSubscribersDescriptor);

  /**
   * Register callback and subscribe to event.
   * Context parameter is needed to do a proper call of listeners.
   *
   * @param event - type of event to register callback
   * @param callback - callback to register for event
   * @param context to call callback at
   */
  public registerCallback<T extends AnyObject>(event: EGameEvent, callback: AnyContextualCallable<T>, context: T): void;
  public registerCallback(event: EGameEvent, callback: AnyCallable): void;
  public registerCallback<T extends AnyObject>(
    event: EGameEvent,
    callback: AnyContextualCallable<T>,
    context: Optional<T> = null
  ): void {
    this.assertEventIsDeclared(event);
    this.callbacks[event].set(callback as AnyContextualCallable, { context: context });
  }

  /**
   * Unregister provided callback from event.
   *
   * @param event - type of event to unregister callback
   * @param callback - callback to unregister for event
   */
  public unregisterCallback<T>(event: EGameEvent, callback: AnyContextualCallable): void;
  public unregisterCallback<T>(event: EGameEvent, callback: AnyCallable): void {
    this.assertEventIsDeclared(event);
    this.callbacks[event].delete(callback as AnyCallable);
  }

  /**
   * Emit custom event and trigger all registered callbacks.
   *
   * @param event - type of event to emit
   * @param data - arguments for event emit
   */
  public emitEvent<T>(event: EGameEvent, data: T): void;
  public emitEvent(event: EGameEvent, ...data: AnyArgs): void;
  public emitEvent(event: EGameEvent, ...data: AnyArgs): void {
    for (const [func, config] of this.callbacks[event]) {
      if (config.context) {
        (func as unknown as AnyContextualCallable).call(config.context, ...data);
      } else {
        (func as unknown as AnyCallable)(...data);
      }
    }
  }

  /**
   * Get count of subscribers active in manager.
   *
   * @returns subscribers to manager count
   */
  public getSubscribersCount(): TCount {
    return Object.values(this.callbacks).reduce((acc, it) => {
      return acc + it.length();
    }, 0);
  }

  /**
   * Get count of subscribers active in manager.
   *
   * @param event - event to check
   * @returns count of event subscribers
   */
  public getEventSubscribersCount(event: EGameEvent): TCount {
    return this.callbacks[event].length();
  }

  /**
   * Assert provided event type is already registered and can be used in game.
   *
   * @param event - event to assert declaration in list of callbacks
   */
  public assertEventIsDeclared(event: EGameEvent): void {
    assert(this.callbacks[event], "Callback name '%s' is unknown.", event);
  }
}
