import { CUIGameCustom, game, get_hud, sound_object } from "xray16";

import { getManager } from "@/engine/core/database";
import { ActorInputManager } from "@/engine/core/managers/actor";
import { AbstractManager } from "@/engine/core/managers/base/AbstractManager";
import { gameOutroConfig } from "@/engine/core/managers/outro/GameOutroConfig";
import { calculateSoundFade } from "@/engine/core/managers/outro/utils/outro_sound_utils";
import { getExtern } from "@/engine/core/utils/binding";
import { disconnectFromGame } from "@/engine/core/utils/game";
import { LuaLogger } from "@/engine/core/utils/logging";
import { gameTutorials } from "@/engine/lib/constants/game_tutorials";
import { AnyCallablesModule, ESoundObjectType, Optional, SoundObject } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Manager to handle audio during game outro scenes.
 */
export class GameOutroManager extends AbstractManager {
  public sound: Optional<SoundObject> = null;

  /**
   * Start game outro tutorial (scenes shown to summarize game plot).
   */
  public startOutro(): void {
    logger.info("Starting game outro");

    game.start_tutorial(gameTutorials.outro_game);
  }

  /**
   * Start sound playback when game end tutorial is displayed.
   */
  public startSound(): void {
    logger.info("Start outro sound");

    this.sound = new sound_object("music_outro");
    this.sound.play(null, 0.0, ESoundObjectType.S2D);

    this.setSoundVolume(1.0);
  }

  /**
   * Stop game end tutorial music.
   */
  public stopSound(): void {
    logger.info("Stop outro sound");

    if (this.sound) {
      this.sound.stop();
      this.sound = null;
    }
  }

  /**
   * Set volume of current end game sound.
   *
   * @param volume - target music volume
   */
  public setSoundVolume(volume: number): void {
    if (this.sound) {
      this.sound.volume = volume;
    }
  }

  /**
   * Start black screen display and game outro music.
   */
  public startBlackScreenAndSound(): void {
    this.startSound();

    get_hud().AddCustomStatic("blackscreen", true);

    getManager(ActorInputManager).disableGameUiOnly();
  }

  /**
   * todo;
   */
  public stopBlackScreenAndSound(): void {
    this.stopSound();

    disconnectFromGame();
    getExtern<AnyCallablesModule>("xr_effects").game_credits(); // todo: Move from effects
  }

  /**
   * todo;
   */
  public updateBlackScreenAndSoundFadeStart(factor: number): void {
    this.setSoundVolume(calculateSoundFade(factor, 0.6, 1.0, gameOutroConfig.VOLUME_MAX, gameOutroConfig.VOLUME_MIN));
  }

  /**
   * todo;
   */
  public updateBlackScreenAndSoundFadeStop(factor: number): void {
    this.setSoundVolume(
      factor < 0.5
        ? calculateSoundFade(factor, 0, 0.12, gameOutroConfig.VOLUME_MIN, gameOutroConfig.VOLUME_MAX)
        : calculateSoundFade(factor, 0.7, 0.95, gameOutroConfig.VOLUME_MAX, 0.0)
    );
  }
}
