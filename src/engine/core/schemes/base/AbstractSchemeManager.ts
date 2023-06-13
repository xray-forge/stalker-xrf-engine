import { IBaseSchemeState } from "@/engine/core/schemes/base/IBaseSchemeState";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ClientObject, Optional, TCount, TIndex, Vector } from "@/engine/lib/types";

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
}
