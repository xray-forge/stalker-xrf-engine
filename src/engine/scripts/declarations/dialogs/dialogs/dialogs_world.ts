import { level } from "xray16";

import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import { extern } from "@/engine/core/utils/binding";
import { LuaLogger } from "@/engine/core/utils/logging";
import { levels } from "@/engine/lib/constants/levels";

const logger: LuaLogger = new LuaLogger($filename);

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
