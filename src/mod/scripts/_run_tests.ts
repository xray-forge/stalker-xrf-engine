import { game } from "xray16";

import { game_tutorials } from "@/mod/globals/game_tutorials";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("_tests");

logger.info("Testing");

game.start_tutorial(game_tutorials.outro_game);
