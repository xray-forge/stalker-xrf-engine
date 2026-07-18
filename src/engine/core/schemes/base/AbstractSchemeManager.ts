import { GameObject, Vector } from "xray16/alias";
import { Nillable, TCount, TIndex, TName } from "xray16/lib";
import { $filename } from "xray16/macros";

import type { IBaseSchemeState } from "@/engine/core/schemes/state";
import { ISchemeEventHandler } from "@/engine/core/schemes/types";
import { LuaLogger } from "@/engine/core/utils/logging";

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
    who: Nillable<GameObject>,
    boneIndex: TIndex
  ): void {
    // logger.info("Hit: %s %s", this.state?.scheme, this.object.name());
  }

  public onUse(object: GameObject, who: Nillable<GameObject>): void {
    logger.info("Use: %s %s", this.state?.scheme, this.object.name());
  }

  public onWaypoint(object: GameObject, actionType: TName, index: TIndex): void {
    logger.info("Waypoint: %s %s", this.state?.scheme, this.object.name());
  }

  public onDeath(victim: GameObject, who: Nillable<GameObject>): void {
    logger.info("Death: %s %s", this.state?.scheme, this.object.name());
  }

  public onCutscene(): void {
    logger.info("Cutscene: %s %s", this.state?.scheme, this.object.name());
  }

  public onCombat(): void {
    logger.info("On combat: %s %s", this.state?.scheme, this.object.name());
  }
}
