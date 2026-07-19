import { level } from "xray16";
import { extern } from "xray16/lib";
import { $filename } from "xray16/macros";

import { levels } from "@/engine/constants/levels";
import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

logger.info("Resolve and bind dialogs world");

/**
 * Check whether current level is zaton.
 */
extern("dialogs.level_zaton", (): boolean => {
  return level.name() === levels.zaton;
});

/**
 * Check whether current level is not zaton.
 */
extern("dialogs.not_level_zaton", (): boolean => {
  return level.name() !== levels.zaton;
});

/**
 * Check whether current level is jupiter.
 */
extern("dialogs.level_jupiter", (): boolean => {
  return level.name() === levels.jupiter;
});

/**
 * Check whether current level is not jupiter.
 */
extern("dialogs.not_level_jupiter", (): boolean => {
  return level.name() !== levels.jupiter;
});

/**
 * Check whether current level is pripyat.
 */
extern("dialogs.level_pripyat", (): boolean => {
  return level.name() === levels.pripyat;
});

/**
 * Check whether current level is not pripyat.
 */
extern("dialogs.not_level_pripyat", (): boolean => {
  return level.name() !== levels.pripyat;
});

/**
 * Check if surge is in running state.
 */
extern("dialogs.is_surge_running", (): boolean => {
  return surgeConfig.IS_STARTED;
});

/**
 * Check if surge is in finished state (not running).
 */
extern("dialogs.is_surge_not_running", (): boolean => {
  return surgeConfig.IS_FINISHED;
});
