import { AbstractManager } from "@/engine/core/managers/abstract";
import { LuaLogger } from "@/engine/core/utils/logging";
import { TIndex, TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo: Description.
 */
export class LoadScreenManager extends AbstractManager {
  /**
   * todo: Description.
   */
  public getRandomTipIndex(levelName: TName): TIndex {
    logger.info("Get tip for single player game");

    return math.random(1, 100);
  }

  /**
   * todo: Description.
   */
  public getRandomMultiplayerTipIndex(levelName: TName): TIndex {
    logger.info("Get tip for multiplayer game");

    return math.random(1, 55);
  }
}
