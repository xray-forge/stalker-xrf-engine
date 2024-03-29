import { AbstractManager } from "@/engine/core/managers/abstract";
import { LuaLogger } from "@/engine/core/utils/logging";
import { TIndex } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Manager generating load screen labels / tips.
 */
export class LoadScreenManager extends AbstractManager {
  /**
   * @returns random tip index for single player game
   */
  public getRandomTipIndex(): TIndex {
    logger.info("Get tip for single player game");

    return math.random(1, 100);
  }

  /**
   * @returns random tip index for multiplayer game
   */
  public getRandomMultiplayerTipIndex(): TIndex {
    logger.info("Get tip for multiplayer game");

    return math.random(1, 55);
  }
}
