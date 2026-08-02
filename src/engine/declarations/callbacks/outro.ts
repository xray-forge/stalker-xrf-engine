import { extern } from "xray16/lib";

import { getManager } from "@/engine/core/database";
import { GameOutroManager } from "@/engine/core/managers/outro";
import { gameOutroConfig } from "@/engine/core/managers/outro/GameOutroConfig";

/** Callbacks related to the game outro. */
extern("outro", {
  conditions: gameOutroConfig.OUTRO_CONDITIONS,
  start_bk_sound: () => getManager(GameOutroManager).startBlackScreenAndSound(),
  stop_bk_sound: () => getManager(GameOutroManager).stopBlackScreenAndSound(),
  update_bk_sound_fade_start: (factor: number) =>
    getManager(GameOutroManager).updateBlackScreenAndSoundFadeStart(factor),
  update_bk_sound_fade_stop: (factor: number) => getManager(GameOutroManager).updateBlackScreenAndSoundFadeStop(factor),
});
