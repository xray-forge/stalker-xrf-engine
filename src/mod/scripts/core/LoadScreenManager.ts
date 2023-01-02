import { AbstractSingletonManager } from "@/mod/scripts/core/utils/AbstractSingletonManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("LoadScreenManager");

export class LoadScreenManager extends AbstractSingletonManager {
  public get_tip_number(levelName: string): number {
    log.info("Get tip for single player game");

    return math.random(1, 100);
  }

  public get_mp_tip_number(levelName: string): number {
    log.info("Get tip for multiplayer game");

    return math.random(1, 55);
  }
}

export const loadScreenManager: LoadScreenManager = LoadScreenManager.getInstance() as LoadScreenManager;
