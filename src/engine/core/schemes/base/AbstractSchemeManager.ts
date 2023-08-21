import { IBaseSchemeState, ISchemeEventHandler } from "@/engine/core/schemes/base/types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ClientObject, Optional, TCount, TIndex, TName, Vector } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export abstract class AbstractSchemeManager<T extends IBaseSchemeState> implements ISchemeEventHandler {
  public readonly object: ClientObject;
  public readonly state: T;

  public constructor(object: ClientObject, state: T) {
    this.object = object;
    this.state = state;
  }

  public activateScheme(isLoading: boolean, object: ClientObject): void {
    logger.info("Activate scheme:", this.state?.scheme, this.object.name());
  }

  public resetScheme(): void {
    // logger.info("Reset scheme:", this.state?.scheme, this.object.name());
  }

  public deactivate(): void {
    // logger.info("Deactivate:", this.state?.scheme, this.object.name());
  }

  public net_spawn(): void {
    logger.info("Net spawn:", this.state?.scheme, this.object.name());
  }

  public net_destroy(): void {
    logger.info("Net destroy:", this.state?.scheme, this.object.name());
  }

  /**
   * Handle scheme hit callback.
   * Emits when objects are hit by something.
   *
   * @param object - target client object being hit
   * @param amount - amount of hit applied
   * @param direction - direction of hit
   * @param who - client object which is source of hit
   * @param boneIndex - index of bone being hit
   */
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

  /**
   * Handle scheme death callback.
   * Emits when objects are dying.
   *
   * @param object - target client object dying
   * @param who - client object who killed the object
   */
  public onDeath(object: ClientObject, who: Optional<ClientObject>): void {
    logger.info("Death:", this.state?.scheme, this.object.name());
  }

  public onCutscene(): void {
    logger.info("Cutscene:", this.state?.scheme, this.object.name());
  }
}
