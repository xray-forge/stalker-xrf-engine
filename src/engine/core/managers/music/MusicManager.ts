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
import { getConsoleFloatCommand } from "@/engine/core/utils/console";
import { LuaLogger } from "@/engine/core/utils/logging";
import { clamp } from "@/engine/core/utils/number";
import { isObjectInSilenceZone } from "@/engine/core/utils/position";
import { setMusicVolume } from "@/engine/core/utils/sound";
import { consoleCommands } from "@/engine/lib/constants/console_commands";
import {
  AnyObject,
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
  public currentTrackIndex: TIndex = 0;

  public areThemesInitialized: boolean = false;
  public forceFade: boolean = false;
  public wasInSilence: boolean = false;
  public nextTrackStartAt: TTimestamp = 0;

  public override initialize(): void {
    const eventsManager: EventsManager = getManager(EventsManager);

    eventsManager.registerCallback(EGameEvent.DUMP_LUA_DATA, this.onDebugDump, this);
    eventsManager.registerCallback(EGameEvent.ACTOR_UPDATE, this.onActorUpdate, this);
    eventsManager.registerCallback(EGameEvent.ACTOR_GO_OFFLINE, this.onActorNetworkDestroy, this);
    eventsManager.registerCallback(EGameEvent.MAIN_MENU_ON, this.onMainMenuOn, this);
    eventsManager.registerCallback(EGameEvent.MAIN_MENU_OFF, this.onMainMenuOff, this);
  }

  public override destroy(): void {
    const eventsManager: EventsManager = getManager(EventsManager);

    eventsManager.unregisterCallback(EGameEvent.DUMP_LUA_DATA, this.onDebugDump);
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
   * Initialize list of themes based on current level.
   */
  public initializeThemes(): void {
    this.areThemesInitialized = true;
    this.themes = new LuaTable();
    this.theme = null;
    this.currentThemeIndex = 0;
    this.currentTrackIndex = 0;
    this.nextTrackStartAt = 0;

    this.themeAmbientVolume = this.gameAmbientVolume;
    this.dynamicThemeVolume = this.gameAmbientVolume;
    this.fadeToThemeVolume = this.gameAmbientVolume;
    this.fadeToAmbientVolume = this.gameAmbientVolume;
    this.volumeChangeStep = this.themeAmbientVolume / 50;

    const levelName: TName = level.name();

    logger.info("Initialize level themes: %s", levelName);

    // Filter themes that are not level specific or expected to work with current level.
    for (const [, themeDescriptor] of musicConfig.dynamicMusicThemes) {
      if (!themeDescriptor.maps || themeDescriptor.maps === "" || string.find(themeDescriptor.maps, levelName)[0]) {
        table.insert(this.themes, themeDescriptor.files);
      }
    }
  }

  /**
   * Start one of initialized themes tracks randomly.
   */
  public startTheme(): void {
    this.themeAmbientVolume = 0;
    this.dynamicThemeVolume = this.gameAmbientVolume;
    this.currentThemeIndex = math.random(1, this.themes.length());
    this.currentTrackIndex = math.random(1, this.themes.get(this.currentThemeIndex).length());

    setMusicVolume(this.themeAmbientVolume);

    logger.info("Start theme: %s %s %s", this.currentThemeIndex, this.currentTrackIndex, this.dynamicThemeVolume);

    if (!this.theme) {
      this.theme = new StereoSound();
    }

    this.theme.initialize(this.themes.get(this.currentThemeIndex).get(this.currentTrackIndex), this.dynamicThemeVolume);
    this.nextTrackStartAt = this.theme.play() - musicConfig.TRACK_SWITCH_DELTA;
    this.theme.update(this.dynamicThemeVolume);
  }

  /**
   * Proceed with next track in theme list.
   * Switch to next track smoothly and play from defined track seek position.
   */
  public selectNextTrack(): void {
    logger.info("Select next track for dynamic music");

    if (this.themes.get(this.currentThemeIndex) === null) {
      abort("Wrong theme index, no file with '%s' index listed.", this.currentThemeIndex);
    }

    if (this.currentTrackIndex < this.themes.get(this.currentThemeIndex).length()) {
      this.currentTrackIndex += 1;
    } else {
      this.currentTrackIndex = 1;
    }

    if (this.theme) {
      this.nextTrackStartAt =
        this.theme.playAtTime(
          this.nextTrackStartAt + musicConfig.TRACK_SWITCH_DELTA,
          this.themes.get(this.currentThemeIndex).get(this.currentTrackIndex),
          this.dynamicThemeVolume
        ) - musicConfig.TRACK_SWITCH_DELTA;
    }
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
        setMusicVolume(this.gameAmbientVolume);

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

    setMusicVolume(this.themeAmbientVolume);
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
        this.theme?.stop();
        this.areThemesInitialized = false;
      }
    }
  }

  /**
   * Handle actor going offline.
   */
  public onActorNetworkDestroy(): void {
    this.theme?.stop();
    setMusicVolume(this.gameAmbientVolume);
  }

  /**
   * Handle display main menu event.
   */
  public onMainMenuOn(): void {
    setMusicVolume(this.gameAmbientVolume);
  }

  /**
   * Handle hide main menu event.
   */
  public onMainMenuOff(): void {
    this.gameAmbientVolume = getConsoleFloatCommand(consoleCommands.snd_volume_music);

    if (this.theme?.isPlaying()) {
      if (IsDynamicMusic()) {
        setMusicVolume(this.themeAmbientVolume);
      } else {
        this.areThemesInitialized = false;
        this.theme.stop();
      }
    }
  }

  /**
   * Handle dump data event.
   *
   * @param data - data to dump into file
   */
  public onDebugDump(data: AnyObject): AnyObject {
    data[this.constructor.name] = {
      musicConfig: musicConfig,
      themes: this.themes,
      theme: this.theme,
      updateDelta: this.updateDelta,
      previousFadeStepAppliedAt: this.previousFadeStepAppliedAt,
      themeAmbientVolume: this.themeAmbientVolume,
      dynamicThemeVolume: this.dynamicThemeVolume,
      gameAmbientVolume: this.gameAmbientVolume,
      fadeToAmbientVolume: this.fadeToAmbientVolume,
      fadeToThemeVolume: this.fadeToThemeVolume,
      volumeChangeStep: this.volumeChangeStep,
      currentThemeIndex: this.currentThemeIndex,
      currentTrackIndex: this.currentTrackIndex,
      areThemesInitialized: this.areThemesInitialized,
      forceFade: this.forceFade,
      wasInSilence: this.wasInSilence,
      nextTrackStartAt: this.nextTrackStartAt,
    };

    return data;
  }
}
