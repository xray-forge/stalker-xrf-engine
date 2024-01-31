import { IsDynamicMusic, level, time_global } from "xray16";

import { getManager, getManagerByName, registry } from "@/engine/core/database";
import { AbstractManager } from "@/engine/core/managers/abstract";
import { EGameEvent } from "@/engine/core/managers/events/events_types";
import { EventsManager } from "@/engine/core/managers/events/EventsManager";
import { musicConfig } from "@/engine/core/managers/music/MusicConfig";
import { StereoSound } from "@/engine/core/managers/sounds/objects";
import { EDynamicMusicState } from "@/engine/core/managers/sounds/sounds_types";
import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import type { SurgeManager } from "@/engine/core/managers/surge/SurgeManager";
import { abort } from "@/engine/core/utils/assertion";
import { executeConsoleCommand, getConsoleFloatCommand } from "@/engine/core/utils/console";
import { LuaLogger } from "@/engine/core/utils/logging";
import { clamp } from "@/engine/core/utils/number";
import { isObjectInSilenceZone } from "@/engine/core/utils/position";
import { setSoundVolume } from "@/engine/core/utils/sound";
import { consoleCommands } from "@/engine/lib/constants/console_commands";
import {
  GameObject,
  LuaArray,
  Optional,
  TDistance,
  TDuration,
  TIndex,
  TName,
  TNumberId,
  TRate,
  TTimestamp,
  Vector,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Manager handling dynamic game music.
 * Main purpose is to turn off combat music when fighting.
 */
export class MusicManager extends AbstractManager {
  public themes: LuaArray<LuaArray<TName>> = new LuaTable();
  public theme: Optional<StereoSound> = null;
  public updateDelta: TDuration = 0;

  public previousFadeStepAppliedAt: TTimestamp = 0;

  public themeAmbientVolume: TRate = 0;
  public dynamicThemeVolume: TRate = 0;
  public gameAmbientVolume: TRate = getConsoleFloatCommand(consoleCommands.snd_volume_music);
  public fadeToAmbientVolume: TRate = 0;
  public fadeToThemeVolume: TRate = 0;
  public volumeChangeStep: TRate = 0;

  public currentThemeIndex: TIndex = 0;
  public currentThemeTrackIndex: TIndex = 0;

  public areThemesInitialized: boolean = false;
  public forceFade: boolean = false;
  public wasInSilence: boolean = false;
  public nextTrackStartAt: TTimestamp = 0;

  public override initialize(): void {
    const eventsManager: EventsManager = getManager(EventsManager);

    eventsManager.registerCallback(EGameEvent.ACTOR_UPDATE, this.onActorUpdate, this);
    eventsManager.registerCallback(EGameEvent.ACTOR_GO_OFFLINE, this.onActorNetworkDestroy, this);
    eventsManager.registerCallback(EGameEvent.MAIN_MENU_ON, this.onMainMenuOn, this);
    eventsManager.registerCallback(EGameEvent.MAIN_MENU_OFF, this.onMainMenuOff, this);
  }

  public override destroy(): void {
    const eventsManager: EventsManager = getManager(EventsManager);

    eventsManager.unregisterCallback(EGameEvent.ACTOR_UPDATE, this.onActorUpdate);
    eventsManager.unregisterCallback(EGameEvent.ACTOR_GO_OFFLINE, this.onActorNetworkDestroy);
    eventsManager.unregisterCallback(EGameEvent.MAIN_MENU_ON, this.onMainMenuOn);
    eventsManager.unregisterCallback(EGameEvent.MAIN_MENU_OFF, this.onMainMenuOff);
  }

  /**
   * @returns whether theme volume is fading right now
   */
  public isThemeFading(): boolean {
    return this.dynamicThemeVolume !== this.fadeToThemeVolume;
  }

  /**
   * @returns whether ambient volume is fading right now
   */
  public isAmbientFading(): boolean {
    return this.themeAmbientVolume !== this.fadeToAmbientVolume;
  }

  /**
   * todo: Description.
   */
  public selectNextTrack(): void {
    logger.info("Select next track for playback");

    if (this.currentThemeIndex === null || this.themes.get(this.currentThemeIndex) === null) {
      abort("Wrong theme index, no file with such index listed.");
    }

    if (this.currentThemeTrackIndex < this.themes.get(this.currentThemeIndex).length()) {
      this.currentThemeTrackIndex += 1;
    } else {
      this.currentThemeTrackIndex = 1;
    }

    if (this.theme) {
      this.nextTrackStartAt =
        this.theme.playAtTime(
          this.nextTrackStartAt + musicConfig.TRACK_SWITCH_DELTA,
          this.themes.get(this.currentThemeIndex).get(this.currentThemeTrackIndex),
          this.dynamicThemeVolume
        ) - musicConfig.TRACK_SWITCH_DELTA;
    }
  }

  /**
   * todo: Description.
   */
  public initializeThemes(): void {
    const newThemesList: LuaArray<LuaArray<TName>> = new LuaTable();
    const levelName: TName = level.name();

    logger.info("Initialize level themes: %s", levelName);

    for (const [, themeDescriptor] of musicConfig.dynamicMusicThemes) {
      if (!themeDescriptor.maps || themeDescriptor.maps === "" || string.find(themeDescriptor.maps, levelName)) {
        table.insert(newThemesList, themeDescriptor.files);
      }
    }

    this.areThemesInitialized = true;
    this.themes = newThemesList;
    this.theme = null;
    this.currentThemeIndex = 0;
    this.currentThemeTrackIndex = 0;
    this.nextTrackStartAt = 0;

    this.themeAmbientVolume = this.gameAmbientVolume;
    this.dynamicThemeVolume = this.gameAmbientVolume;
    this.fadeToThemeVolume = this.gameAmbientVolume;
    this.fadeToAmbientVolume = this.gameAmbientVolume;
    this.volumeChangeStep = this.themeAmbientVolume / 50;
  }

  /**
   * todo: Description.
   */
  public getThemeState(): Optional<EDynamicMusicState> {
    const actor: GameObject = registry.actor;

    this.forceFade = false;

    if (actor.alive()) {
      if (!isObjectInSilenceZone(registry.actor)) {
        const actorPosition: Vector = actor.position();
        const actorId: TNumberId = actor.id();

        let nearestEnemy: Optional<GameObject> = null;
        let nearestEnemyDistanceSqr: TDistance = 10_000;

        // todo: No need to check every enemy, just find at least one who meets threshold and flag 'true'
        // todo: No need to check every enemy, just check same location.
        for (const [objectId] of registry.stalkers) {
          const object: Optional<GameObject> = registry.objects.get(objectId).object;
          const enemy: Optional<GameObject> = object.best_enemy();

          if (enemy && enemy.id() === actorId) {
            const dist: TDistance = actorPosition.distance_to_sqr(object.position());

            if (dist < nearestEnemyDistanceSqr) {
              nearestEnemy = object;
              nearestEnemyDistanceSqr = dist;
            }
          }
        }

        if (nearestEnemy !== null) {
          if (nearestEnemyDistanceSqr < musicConfig.MIN_DIST * musicConfig.MIN_DIST) {
            this.forceFade = true;
            this.fadeToThemeVolume = this.gameAmbientVolume;
            this.fadeToAmbientVolume = 0;

            return this.theme ? EDynamicMusicState.IDLE : EDynamicMusicState.START;
          } else if (nearestEnemyDistanceSqr > musicConfig.MAX_DIST * musicConfig.MAX_DIST) {
            if (this.theme) {
              this.fadeToThemeVolume = 0;
              this.fadeToAmbientVolume = this.gameAmbientVolume;

              return EDynamicMusicState.IDLE;
            }
          } else {
            if (this.theme) {
              if (this.wasInSilence) {
                this.wasInSilence = false;
                this.fadeToAmbientVolume = this.gameAmbientVolume;
              }

              return EDynamicMusicState.IDLE;
            }
          }
        }
      } else if (this.theme) {
        this.wasInSilence = true;
        this.fadeToThemeVolume = 0;
        this.fadeToAmbientVolume = 0;

        return EDynamicMusicState.IDLE;
      }
    }

    if (this.theme) {
      this.fadeToThemeVolume = 0;
      this.fadeToAmbientVolume = this.gameAmbientVolume;

      if (this.isThemeFading() || this.isAmbientFading()) {
        return EDynamicMusicState.IDLE;
      } else {
        setSoundVolume(this.gameAmbientVolume);

        return EDynamicMusicState.FINISH;
      }
    }

    return null;
  }

  /**
   * todo: Description.
   */
  public fadeTheme(): void {
    const now: TTimestamp = time_global();

    if (now - this.previousFadeStepAppliedAt <= musicConfig.THEME_FADE_UPDATE_STEP) {
      return;
    }

    this.previousFadeStepAppliedAt = now;

    this.fadeToThemeVolume = clamp(this.fadeToThemeVolume, 0, this.gameAmbientVolume);

    if (this.dynamicThemeVolume > this.fadeToThemeVolume) {
      if (this.forceFade) {
        this.dynamicThemeVolume = this.fadeToThemeVolume;
      } else {
        this.dynamicThemeVolume = this.dynamicThemeVolume - this.volumeChangeStep;
      }

      this.dynamicThemeVolume = clamp(this.dynamicThemeVolume, this.fadeToThemeVolume, this.dynamicThemeVolume);
    } else if (this.dynamicThemeVolume < this.fadeToThemeVolume) {
      if (this.forceFade) {
        this.dynamicThemeVolume = this.fadeToThemeVolume;
      } else {
        this.dynamicThemeVolume = this.dynamicThemeVolume + this.volumeChangeStep;
      }

      this.dynamicThemeVolume = clamp(this.dynamicThemeVolume, this.dynamicThemeVolume, this.fadeToThemeVolume);
    }
  }

  /**
   * todo: Description.
   */
  public fadeAmbient(): void {
    const now: TTimestamp = time_global();

    if (now - this.previousFadeStepAppliedAt <= musicConfig.AMBIENT_FADE_UPDATE_DELTA) {
      return;
    }

    this.previousFadeStepAppliedAt = now;
    this.fadeToAmbientVolume = clamp(this.fadeToAmbientVolume, 0, this.gameAmbientVolume);

    if (this.themeAmbientVolume > this.fadeToAmbientVolume) {
      if (this.forceFade) {
        this.themeAmbientVolume = this.fadeToAmbientVolume;
      } else {
        this.themeAmbientVolume = this.themeAmbientVolume - this.volumeChangeStep;
      }

      this.themeAmbientVolume = clamp(this.themeAmbientVolume, this.fadeToAmbientVolume, this.themeAmbientVolume);
    } else if (this.themeAmbientVolume < this.fadeToAmbientVolume) {
      if (this.forceFade) {
        this.themeAmbientVolume = this.fadeToAmbientVolume;
      } else {
        this.themeAmbientVolume = this.themeAmbientVolume + this.volumeChangeStep;
      }

      this.themeAmbientVolume = clamp(this.themeAmbientVolume, this.themeAmbientVolume, this.fadeToAmbientVolume);
    }

    setSoundVolume(this.themeAmbientVolume);
  }

  /**
   * todo: Description.
   */
  public stopTheme(): void {
    logger.info("Stop theme");

    if (this.theme) {
      this.theme.stop();
    }

    this.areThemesInitialized = false;
  }

  /**
   * todo: Description.
   */
  public startTheme(): void {
    this.themeAmbientVolume = 0;
    this.dynamicThemeVolume = this.gameAmbientVolume;
    this.currentThemeIndex = math.random(1, this.themes.length());
    this.currentThemeTrackIndex = math.random(1, this.themes.get(this.currentThemeIndex).length());

    setSoundVolume(this.themeAmbientVolume);

    logger.info("Start theme: %s %s %s", this.currentThemeIndex, this.currentThemeTrackIndex, this.dynamicThemeVolume);

    if (this.theme === null) {
      this.theme = new StereoSound();
    }

    this.theme.initialize(
      this.themes.get(this.currentThemeIndex).get(this.currentThemeTrackIndex),
      this.dynamicThemeVolume
    );
    this.nextTrackStartAt = this.theme.play() - musicConfig.TRACK_SWITCH_DELTA;
    this.theme.update(this.dynamicThemeVolume);
  }

  /**
   * todo: Description.
   */
  public onActorNetworkDestroy(): void {
    this.stopTheme();

    if (registry.effectsVolume !== 0) {
      executeConsoleCommand(consoleCommands.snd_volume_eff, tostring(registry.effectsVolume));
      registry.effectsVolume = 0;
    }

    if (registry.musicVolume !== 0) {
      executeConsoleCommand(consoleCommands.snd_volume_music, tostring(registry.musicVolume));
      registry.musicVolume = 0;
    }

    logger.info("Toggle ambient volume: %s", this.gameAmbientVolume);
    setSoundVolume(this.gameAmbientVolume);
  }

  /**
   * todo: Description.
   */
  public onActorUpdate(delta: TDuration): void {
    this.updateDelta += delta;

    if (this.updateDelta > musicConfig.LOGIC_UPDATE_STEP) {
      this.updateDelta = 0;
    } else {
      return;
    }

    const surgeManager: Optional<SurgeManager> = getManagerByName<SurgeManager>("SurgeManager");

    if (surgeConfig.IS_STARTED && surgeManager?.isBlowoutSoundStarted) {
      if (surgeManager.isKillingAll()) {
        this.forceFade = true;
        this.fadeToAmbientVolume = this.gameAmbientVolume;
        this.fadeAmbient();
        this.forceFade = false;
      } else {
        this.fadeToAmbientVolume = 0;
        this.fadeAmbient();
      }
    }

    if (IsDynamicMusic()) {
      if (!this.areThemesInitialized) {
        this.initializeThemes();
      }

      if (this.theme) {
        this.theme.update(this.dynamicThemeVolume);
      }

      const state: Optional<EDynamicMusicState> = this.getThemeState();

      if (state === EDynamicMusicState.START) {
        this.startTheme();
      } else if (state === EDynamicMusicState.IDLE) {
        if (this.isThemeFading()) {
          this.fadeTheme();
        } else if (this.isAmbientFading()) {
          this.fadeAmbient();
        }

        if (time_global() > this.nextTrackStartAt) {
          this.selectNextTrack();
        }
      } else if (state === EDynamicMusicState.FINISH) {
        this.stopTheme();
      }
    }
  }

  /**
   * Handle display main menu event.
   */
  public onMainMenuOn(): void {
    setSoundVolume(this.gameAmbientVolume);
  }

  /**
   * todo: Description.
   */
  public onMainMenuOff(): void {
    this.gameAmbientVolume = getConsoleFloatCommand(consoleCommands.snd_volume_music);

    if (this.theme?.isPlaying()) {
      if (IsDynamicMusic()) {
        setSoundVolume(this.themeAmbientVolume);
      } else {
        this.areThemesInitialized = false;
        this.theme.stop();
      }
    }
  }
}
