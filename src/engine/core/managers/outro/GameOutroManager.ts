import { CUIGameCustom, game, get_hud, sound_object } from "xray16";

import { ActorInputManager } from "@/engine/core/managers/actor";
import { AbstractManager } from "@/engine/core/managers/base/AbstractManager";
import { gameOutroConfig } from "@/engine/core/managers/outro/GameOutroConfig";
import { calculateSoundFade } from "@/engine/core/managers/outro/utils/outro_sound_utils";
import { getExtern } from "@/engine/core/utils/binding";
import { disconnectFromGame } from "@/engine/core/utils/game";
import { LuaLogger } from "@/engine/core/utils/logging";
import { gameTutorials } from "@/engine/lib/constants/game_tutorials";
import { AnyCallablesModule, ESoundObjectType, Optional, SoundObject, TRate } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Manager to handle audio during game outro scenes.
 */
export class GameOutroManager extends AbstractManager {
  public sound: Optional<SoundObject> = null;

  /**
   * todo;
   */
  public startOutro(): void {
    logger.info("Starting game outro");

    game.start_tutorial(gameTutorials.outro_game);
  }

  /**
   * todo;
   */
  public startSound(): void {
    logger.info("Start outro sound");

    this.sound = new sound_object("music_outro");
    this.sound.play(null, 0.0, ESoundObjectType.S2D);
    this.setSoundVolume(1.0);
  }

  /**
   * todo;
   */
  public stopSound(): void {
    logger.info("Stop outro sound");

    if (this.sound) {
      this.sound.stop();
      this.sound = null;
    }
  }

  /**
   * todo;
   */
  public setSoundVolume(volume: number): void {
    if (this.sound) {
      this.sound.volume = volume;
    }
  }

  /**
   * todo;
   */
  public startBkSound(): void {
    this.startSound();

    const hud: CUIGameCustom = get_hud();

    hud.AddCustomStatic("blackscreen", true);
    ActorInputManager.getInstance().disableGameUiOnly();
  }

  /**
   * todo;
   */
  public stopBkSound(): void {
    this.stopSound();

    disconnectFromGame();
    getExtern<AnyCallablesModule>("xr_effects").game_credits();
  }

  /**
   * todo;
   */
  public updateBkSoundFadeStart(factor: number): void {
    this.setSoundVolume(calculateSoundFade(factor, 0.6, 1.0, gameOutroConfig.VOLUME_MAX, gameOutroConfig.VOLUME_MIN));
  }

  /**
   * todo;
   */
  public updateBkSoundFadeStop(factor: number): void {
    this.setSoundVolume(
      factor < 0.5
        ? calculateSoundFade(factor, 0, 0.12, gameOutroConfig.VOLUME_MIN, gameOutroConfig.VOLUME_MAX)
        : calculateSoundFade(factor, 0.7, 0.95, gameOutroConfig.VOLUME_MAX, 0.0)
    );
  }
}
