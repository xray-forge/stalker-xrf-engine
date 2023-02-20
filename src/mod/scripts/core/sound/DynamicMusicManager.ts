import { get_console, IsDynamicMusic, level, time_global, XR_game_object, XR_vector } from "xray16";

import { console_command } from "@/mod/globals/console_command";
import { TSound } from "@/mod/globals/sound/sounds";
import { Optional } from "@/mod/lib/types";
import { registry, silenceZones } from "@/mod/scripts/core/db";
import { EGameEvent } from "@/mod/scripts/core/managers/events/EGameEvent";
import { EventsManager } from "@/mod/scripts/core/managers/events/EventsManager";
import { SurgeManager } from "@/mod/scripts/core/managers/SurgeManager";
import { dynamicMusicThemes } from "@/mod/scripts/core/sound/dynamic_music_themes";
import { StereoSound } from "@/mod/scripts/core/sound/playable_sounds/StereoSound";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { clampNumber } from "@/mod/scripts/utils/number";

const logger: LuaLogger = new LuaLogger("DynamicMusicManager");

// -- global variables (used from other scripts)

// -- const variables (reinit on initialize())
let themes: LuaTable<number, LuaTable<number, TSound>> = new LuaTable();
let ambientVolume: number = get_console().get_float("snd_volume_music");
let m_ambient_vol: number = 0;
let FadeTo_ambient: number = 0;
let m_theme_volume: number = 0;
let FadeTo_theme: number = 0;

let nextTrackStartTime: number = 0;

let areThemesInitialized: boolean = false;
let prev_fade_time: number = 0;

export enum EDynamicMusicState {
  IDLE,
  START,
  FINISH,
}

export class DynamicMusicManager {
  public static readonly MAX_DIST: number = 100;
  public static readonly MIN_DIST: number = 75;

  public static readonly TRACK_SWITCH_DELTA: number = 3000;
  public static readonly THEME_FADE_UPDATE_DELTA: number = 100;
  public static readonly AMBIENT_FADE_UPDATE_DELTA: number = 200;

  public static VOLUME_DELTA: number = 0;
  public static NPC_TABLE: LuaTable<number, number> = new LuaTable();

  public static instance: Optional<DynamicMusicManager> = null;

  public static getInstance(): DynamicMusicManager {
    if (!this.instance) {
      this.instance = new this();
    }

    return this.instance;
  }

  public theme: Optional<StereoSound> = null;
  public updateDelta: number = 0;
  public updateDeltaThreshold: number = 300;

  public currentThemeNumber: number = 0;
  public currentTrackNumber: number = 0;
  public forceFade: boolean = false;
  public wasInSilence: boolean = false;

  public initialize(): void {
    logger.info("Initialize dynamic music manager");

    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.registerCallback(EGameEvent.ACTOR_UPDATE, this.onActorUpdate, this);
    eventsManager.registerCallback(EGameEvent.ACTOR_NET_DESTROY, this.onActorNetDestroy, this);
    eventsManager.registerCallback(EGameEvent.MAIN_MENU_ON, this.onMainMenuOn, this);
    eventsManager.registerCallback(EGameEvent.MAIN_MENU_OFF, this.onMainMenuOff, this);
  }

  public isThemeFading(): boolean {
    return m_theme_volume !== FadeTo_theme;
  }

  public isAmbientFading(): boolean {
    return m_ambient_vol !== FadeTo_ambient;
  }

  public isActorInSilenceZone(): boolean {
    const actorPosition: XR_vector = registry.actor.position();

    for (const [zoneId, zoneName] of silenceZones) {
      if (registry.zones.get(zoneName).inside(actorPosition)) {
        return true;
      }
    }

    return false;
  }

  public selectNextTrack(): void {
    logger.info("Select next track for playback");

    if (this.currentThemeNumber === null || themes.get(this.currentThemeNumber) === null) {
      abort("wrong theme number");
    }

    if (this.currentTrackNumber < themes.get(this.currentThemeNumber).length()) {
      this.currentTrackNumber = this.currentTrackNumber + 1;
    } else {
      this.currentTrackNumber = 1;
    }

    if (this.theme) {
      nextTrackStartTime =
        this.theme.playAtTime(
          nextTrackStartTime + DynamicMusicManager.TRACK_SWITCH_DELTA,
          themes.get(this.currentThemeNumber).get(this.currentTrackNumber),
          m_theme_volume
        ) - DynamicMusicManager.TRACK_SWITCH_DELTA;
    }
  }

  public initializeThemes(): void {
    logger.info("Initialize themes");

    const new_table: LuaTable<number, LuaTable<number, TSound>> = new LuaTable();
    const lname = level.name();

    for (const [k, v] of dynamicMusicThemes) {
      if (!v.maps || v.maps === "" || string.find(v.maps, lname)) {
        table.insert(new_table, v.files);
      }
    }

    themes = new_table;

    m_ambient_vol = ambientVolume;
    m_theme_volume = ambientVolume;
    FadeTo_theme = ambientVolume;
    FadeTo_ambient = ambientVolume;

    this.currentThemeNumber = 0;
    this.currentTrackNumber = 0;

    nextTrackStartTime = 0;
    this.theme = null;

    DynamicMusicManager.VOLUME_DELTA = m_ambient_vol / 50;

    areThemesInitialized = true;
  }

  public getThemeState(): Optional<EDynamicMusicState> {
    const actor: XR_game_object = registry.actor;

    this.forceFade = false;

    if (actor.alive()) {
      if (!this.isActorInSilenceZone()) {
        const actorPosition: XR_vector = actor.position();

        let nearestEnemy: Optional<XR_game_object> = null;
        let nearestEnemyDist: number = 100;

        // todo: No need to check every enemy, just find at least one who meets threshold and flag 'true'
        for (const [k, obj_id] of DynamicMusicManager.NPC_TABLE) {
          const object = registry.objects.get(obj_id) && registry.objects.get(obj_id).object;

          if (object) {
            const enemy: Optional<XR_game_object> = object.best_enemy();

            if (enemy && enemy.id() === actor.id()) {
              const dist: number = actorPosition.distance_to(object.position());

              if (dist < nearestEnemyDist) {
                nearestEnemy = object;
                nearestEnemyDist = dist;
              }
            }
          }
        }

        if (nearestEnemy !== null) {
          if (nearestEnemyDist < DynamicMusicManager.MIN_DIST) {
            this.forceFade = true;

            FadeTo_theme = ambientVolume;
            FadeTo_ambient = 0;

            return this.theme ? EDynamicMusicState.IDLE : EDynamicMusicState.START;
          } else if (nearestEnemyDist > DynamicMusicManager.MAX_DIST) {
            if (this.theme) {
              FadeTo_theme = 0;
              FadeTo_ambient = ambientVolume;

              return EDynamicMusicState.IDLE;
            }
          } else {
            if (this.theme) {
              if (this.wasInSilence) {
                this.wasInSilence = false;
                FadeTo_ambient = ambientVolume;
              }

              return EDynamicMusicState.IDLE;
            }
          }
        }
      } else if (this.theme) {
        this.wasInSilence = true;

        FadeTo_theme = 0;
        FadeTo_ambient = 0;

        return EDynamicMusicState.IDLE;
      }
    }

    if (this.theme) {
      FadeTo_theme = 0;
      FadeTo_ambient = ambientVolume;

      if (this.isThemeFading() || this.isAmbientFading()) {
        return EDynamicMusicState.IDLE;
      } else {
        this.setSoundVolume(ambientVolume);

        return EDynamicMusicState.FINISH;
      }
    }

    return null;
  }

  public fadeTheme(): void {
    const g_time: number = time_global();

    if (g_time - prev_fade_time <= DynamicMusicManager.THEME_FADE_UPDATE_DELTA) {
      return;
    }

    prev_fade_time = g_time;

    FadeTo_theme = clampNumber(FadeTo_theme, 0, ambientVolume);

    if (m_theme_volume > FadeTo_theme) {
      if (this.forceFade) {
        m_theme_volume = FadeTo_theme;
      } else {
        m_theme_volume = m_theme_volume - DynamicMusicManager.VOLUME_DELTA;
      }

      m_theme_volume = clampNumber(m_theme_volume, FadeTo_theme, m_theme_volume);
    } else if (m_theme_volume < FadeTo_theme) {
      if (this.forceFade) {
        m_theme_volume = FadeTo_theme;
      } else {
        m_theme_volume = m_theme_volume + DynamicMusicManager.VOLUME_DELTA;
      }

      m_theme_volume = clampNumber(m_theme_volume, m_theme_volume, FadeTo_theme);
    }
  }

  public fadeAmbient(): void {
    const g_time: number = time_global();

    if (g_time - prev_fade_time <= DynamicMusicManager.AMBIENT_FADE_UPDATE_DELTA) {
      return;
    }

    prev_fade_time = g_time;
    FadeTo_ambient = clampNumber(FadeTo_ambient, 0, ambientVolume);

    if (m_ambient_vol > FadeTo_ambient) {
      if (this.forceFade) {
        m_ambient_vol = FadeTo_ambient;
      } else {
        m_ambient_vol = m_ambient_vol - DynamicMusicManager.VOLUME_DELTA;
      }

      m_ambient_vol = clampNumber(m_ambient_vol, FadeTo_ambient, m_ambient_vol);
    } else if (m_ambient_vol < FadeTo_ambient) {
      if (this.forceFade) {
        m_ambient_vol = FadeTo_ambient;
      } else {
        m_ambient_vol = m_ambient_vol + DynamicMusicManager.VOLUME_DELTA;
      }

      m_ambient_vol = clampNumber(m_ambient_vol, m_ambient_vol, FadeTo_ambient);
    }

    this.setSoundVolume(m_ambient_vol);
  }

  public stopTheme(): void {
    logger.info("Stop theme");

    if (this.theme) {
      this.theme.stop();
    }

    areThemesInitialized = false;
  }

  public startTheme(): void {
    m_ambient_vol = 0;
    this.setSoundVolume(m_ambient_vol);

    m_theme_volume = ambientVolume;

    this.currentThemeNumber = math.random(1, themes.length());
    this.currentTrackNumber = math.random(1, themes.get(this.currentThemeNumber).length());

    logger.info("Start theme:", this.currentThemeNumber, this.currentTrackNumber, m_theme_volume);

    if (this.theme === null) {
      this.theme = new StereoSound();
    }

    this.theme.initialize(themes.get(this.currentThemeNumber).get(this.currentTrackNumber), m_theme_volume);
    nextTrackStartTime = this.theme.play() - DynamicMusicManager.TRACK_SWITCH_DELTA;
    this.theme.update(m_theme_volume);
  }

  /**
   * todo: Description.
   */
  public setSoundVolume(volume: number): void {
    get_console().execute(console_command.snd_volume_music + " " + volume);
  }

  /**
   * todo: Description.
   */
  public onActorNetDestroy(): void {
    if (this.theme && this.theme.isPlaying()) {
      logger.info("Stop theme");
      this.theme.stop();
    }

    logger.info("Toggle ambient volume:", ambientVolume);
    this.setSoundVolume(ambientVolume);
  }

  /**
   * todo: Description.
   */
  public onActorUpdate(delta: number): void {
    this.updateDelta += delta;

    if (this.updateDelta > this.updateDeltaThreshold) {
      this.updateDelta = 0;
    } else {
      return;
    }

    const surgeManager: SurgeManager = SurgeManager.getInstance();

    if (surgeManager.isStarted && surgeManager.blowout_sound) {
      if (surgeManager.isKillingAll()) {
        this.forceFade = true;
        FadeTo_ambient = ambientVolume;
        this.fadeAmbient();
        this.forceFade = false;
      } else {
        FadeTo_ambient = 0;
        this.fadeAmbient();
      }
    }

    if (IsDynamicMusic()) {
      if (!areThemesInitialized) {
        this.initializeThemes();
      }

      if (this.theme) {
        this.theme.update(m_theme_volume);
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

        if (time_global() > nextTrackStartTime) {
          this.selectNextTrack();
        }
      } else if (state === EDynamicMusicState.FINISH) {
        this.stopTheme();
      }
    }
  }

  /**
   * todo: Description.
   */
  public onMainMenuOn(): void {
    this.setSoundVolume(ambientVolume);
  }

  /**
   * todo: Description.
   */
  public onMainMenuOff(): void {
    ambientVolume = get_console().get_float(console_command.snd_volume_music);

    if (this.theme && this.theme.isPlaying()) {
      if (IsDynamicMusic()) {
        this.setSoundVolume(m_ambient_vol);
      } else {
        areThemesInitialized = false;
        this.theme.stop();
      }
    }
  }
}
