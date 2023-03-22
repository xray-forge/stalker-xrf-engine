import { device } from "xray16";

import { disposeManagers } from "@/engine/core/database";
import { resetSchemeHard } from "@/engine/core/schemes/base/utils";
import { SoundTheme } from "@/engine/core/sounds/SoundTheme";
import { extern } from "@/engine/core/utils/binding";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EScheme } from "@/engine/lib/types/scheme";
import { fillPhrasesTable } from "@/engine/scripts/declarations/dialogs/dialog_manager";
import { registerSchemeModules } from "@/engine/scripts/register/schemes_registrator";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Register methods related to game start flows.
 */
extern("start", {
  /**
   * Main start game callback.
   * Called when game is started or loaded.
   */
  callback: (): void => {
    logger.info("Start new game");

    math.randomseed(device().time_global());

    disposeManagers();
    registerSchemeModules();

    fillPhrasesTable();
    SoundTheme.loadSound();

    resetSchemeHard(EScheme.SR_LIGHT);
  },
});
