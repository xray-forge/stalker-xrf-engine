import { IBaseSchemeState, ISchemeEventHandler } from "@/engine/core/objects/ai/scheme/scheme_types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ClientObject, Optional, TCount, TIndex, TName, Vector } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Abstract scheme manager class representing unit that works when scheme is active.
 * Includes generic handlers and interface for implementation of scheme events.
 */
export abstract class AbstractSchemeManager<T extends IBaseSchemeState> implements ISchemeEventHandler {
  public readonly object: ClientObject;
  public readonly state: T;

  public constructor(object: ClientObject, state: T) {
    this.object = object;
    this.state = state;
  }

  public activate(isLoading: boolean, object: ClientObject): void {
    // logger.info("Reset scheme:", this.state?.scheme, this.object.name());
  }

  public deactivate(object: ClientObject): void {
    // logger.info("Deactivate:", this.state?.scheme, this.object.name());
  }

  public onSwitchOnline(object: ClientObject): void {
    logger.info("Net spawn:", this.state?.scheme, object.name());
  }

  public onSwitchOffline(object: ClientObject): void {
    logger.info("Net destroy:", this.state?.scheme, object.name());
  }

  public onHit(
    object: ClientObject,
    amount: TCount,
    direction: Vector,
    who: Optional<ClientObject>,
    boneIndex: TIndex
  ): void {
    // logger.info("Hit:", this.state?.scheme, this.object.name());
  }

  public onUse(object: ClientObject, who: Optional<ClientObject>): void {
    logger.info("Use:", this.state?.scheme, this.object.name());
  }

  public onWaypoint(object: ClientObject, actionType: TName, index: TIndex): void {
    logger.info("Waypoint:", this.state?.scheme, this.object.name());
  }

  public onDeath(victim: ClientObject, who: Optional<ClientObject>): void {
    logger.info("Death:", this.state?.scheme, this.object.name());
  }

  public onCutscene(): void {
    logger.info("Cutscene:", this.state?.scheme, this.object.name());
  }
}
