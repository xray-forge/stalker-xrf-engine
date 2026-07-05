import { TIndex } from "xray16/lib";
import { $filename } from "xray16/macros";

import { AbstractManager } from "@/engine/core/managers/abstract";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Manager generating load screen labels / tips.
 */
export class LoadScreenManager extends AbstractManager {
  /**
   * @returns Random tip index for single player game.
   */
  public getRandomTipIndex(): TIndex {
    logger.info("Get tip for single player game");

    return math.random(1, 100);
  }
}
