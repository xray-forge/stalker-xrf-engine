import { LuaLogger } from "@/engine/core/utils/logging";

export const logger: LuaLogger = new LuaLogger("game");

export const gameState: { isGameoverCreditsStarted: boolean } = {
  isGameoverCreditsStarted: false,
};
