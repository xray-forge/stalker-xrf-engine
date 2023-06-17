import { IBaseSchemeState } from "@/engine/core/schemes/base/types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ClientObject, Optional, TCount, TIndex, TName, Vector } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export abstract class AbstractSchemeManager<T extends IBaseSchemeState> {
  public readonly object: ClientObject;
  public readonly state: T;

  public constructor(object: ClientObject, state: T) {
    this.object = object;
    this.state = state;
  }

  /**
   * todo: Description.
   */
  public update(delta: TCount): void {}

  /**
   * todo: Description.
   */
  public activateScheme(isLoading: boolean, object: ClientObject): void {
    logger.info("Activate scheme:", this.state?.scheme, this.object.name());
  }

  /**
   * todo: Description.
   */
  public resetScheme(): void {
    logger.info("Reset scheme:", this.state?.scheme, this.object.name());
  }

  /**
   * todo: Description.
   */
  public deactivate(): void {
    logger.info("Deactivate:", this.state?.scheme, this.object.name());
  }

  /**
   * todo: Description.
   */
  public net_spawn(): void {
    logger.info("Net spawn:", this.state?.scheme, this.object.name());
  }

  /**
   * todo: Description.
   */
  public net_destroy(): void {
    logger.info("Net destroy:", this.state?.scheme, this.object.name());
  }

  /**
   * todo: Description.
   */
  public onHit(
    object: ClientObject,
    amount: TCount,
    direction: Vector,
    who: Optional<ClientObject>,
    boneIndex: TIndex
  ): void {
    logger.info("Hit:", this.state?.scheme, this.object.name());
  }

  /**
   * todo: Description.
   */
  public onUse(object: ClientObject, who: Optional<ClientObject>): void {
    logger.info("Use:", this.state?.scheme, this.object.name());
  }

  /**
   * todo: Description.
   */
  public onWaypoint(object: ClientObject, actionType: TName, index: TIndex): void {
    logger.info("Waypoint:", this.state?.scheme, this.object.name());
  }

  /**
   * todo: Description.
   */
  public onDeath(victim: ClientObject, who: Optional<ClientObject>): void {
    logger.info("Death:", this.state?.scheme, this.object.name());
  }

  /**
   * todo: Description.
   */
  public onCutscene(): void {
    logger.info("Cutscene:", this.state?.scheme, this.object.name());
  }
}
