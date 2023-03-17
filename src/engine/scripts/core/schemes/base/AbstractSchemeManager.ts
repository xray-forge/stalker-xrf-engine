import { XR_game_object } from "xray16";

import { TCount } from "@/engine/lib/types";
import { IBaseSchemeState } from "@/engine/scripts/core/schemes/base/IBaseSchemeState";
import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export abstract class AbstractSchemeManager<T extends IBaseSchemeState> {
  public readonly object: XR_game_object;
  public readonly state: T;

  public constructor(object: XR_game_object, state: T) {
    this.object = object;
    this.state = state;
  }

  /**
   * todo;
   */
  public update(delta: TCount): void {}

  /**
   * todo;
   */
  public resetScheme(): void {
    logger.info("Reset scheme:", this.constructor.prototype.SCHEME_SECTION, this.object.name());
  }

  /**
   * todo;
   */
  public deactivate(): void {
    logger.info("Deactivate:", this.constructor.prototype.SCHEME_SECTION, this.object.name());
  }

  /**
   * todo;
   */
  public net_spawn(): void {
    logger.info("Net spawn:", this.constructor.prototype.SCHEME_SECTION, this.object.name());
  }

  /**
   * todo;
   */
  public net_destroy(): void {
    logger.info("Net destroy:", this.constructor.prototype.SCHEME_SECTION, this.object.name());
  }
}
