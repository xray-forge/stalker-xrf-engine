import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import { LuaLogger } from "@/engine/core/utils/logging";
import type { GameObject, ISchemeEventHandler, Optional, TCount, TIndex, TName, Vector } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Abstract scheme manager class representing unit that works when scheme is active.
 * Includes generic handlers and interface for implementation of scheme events.
 */
export abstract class AbstractSchemeManager<T extends IBaseSchemeState> implements ISchemeEventHandler {
  public readonly object: GameObject;
  public readonly state: T;

  public constructor(object: GameObject, state: T) {
    this.object = object;
    this.state = state;
  }

  public activate(object: GameObject, isLoading: boolean): void {
    // logger.info("Reset scheme: %s %s", this.state?.scheme, this.object.name());
  }

  public deactivate(object: GameObject): void {
    // logger.info("Deactivate: %s %s", this.state?.scheme, this.object.name());
  }

  public onSwitchOnline(object: GameObject): void {
    // logger.info("Net spawn: %s %s", this.state?.scheme, object.name());
  }

  public onSwitchOffline(object: GameObject): void {
    // logger.info("Net destroy: %s %s", this.state?.scheme, object.name());
  }

  public onHit(
    object: GameObject,
    amount: TCount,
    direction: Vector,
    who: Optional<GameObject>,
    boneIndex: TIndex
  ): void {
    // logger.info("Hit: %s %s", this.state?.scheme, this.object.name());
  }

  public onUse(object: GameObject, who: Optional<GameObject>): void {
    logger.info("Use: %s %s", this.state?.scheme, this.object.name());
  }

  public onWaypoint(object: GameObject, actionType: TName, index: TIndex): void {
    logger.info("Waypoint: %s %s", this.state?.scheme, this.object.name());
  }

  public onDeath(victim: GameObject, who: Optional<GameObject>): void {
    logger.info("Death: %s %s", this.state?.scheme, this.object.name());
  }

  public onCutscene(): void {
    logger.info("Cutscene: %s %s", this.state?.scheme, this.object.name());
  }

  public onCombat(): void {
    logger.info("On combat: %s %s", this.state?.scheme, this.object.name());
  }
}
