import { IDynamicSaveData, initializeManager, registry } from "@/engine/core/database";
import { AchievementsManager } from "@/engine/core/managers/achievements";
import { ActorInputManager } from "@/engine/core/managers/actor";
import { AbstractManager } from "@/engine/core/managers/base";
import { ReleaseBodyManager } from "@/engine/core/managers/death";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { PsyAntennaManager } from "@/engine/core/managers/psy";
import { GameSettingsManager } from "@/engine/core/managers/settings";
import { SimulationBoardManager } from "@/engine/core/managers/simulation";
import { GlobalSoundManager } from "@/engine/core/managers/sounds";
import { StatisticsManager } from "@/engine/core/managers/statistics";
import { SurgeManager } from "@/engine/core/managers/surge";
import { TaskManager } from "@/engine/core/managers/tasks";
import { TreasureManager } from "@/engine/core/managers/treasures";
import { WeatherManager } from "@/engine/core/managers/weather";
import { loadDynamicGameSave, saveDynamicGameSave } from "@/engine/core/utils/game_save";
import { LuaLogger } from "@/engine/core/utils/logging";
import { NetPacket, NetProcessor, Optional, TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Manage game saves for other managers / parts.
 */
export class SaveManager extends AbstractManager {
  public override initialize(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.registerCallback(EGameEvent.ACTOR_REINIT, this.onActorReinit, this);
  }

  public override destroy(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.unregisterCallback(EGameEvent.ACTOR_REINIT, this.onActorReinit);
  }

  /**
   * Save core managers data.
   */
  public clientSave(packet: NetPacket): void {
    logger.info("Saving client data");

    WeatherManager.getInstance().save(packet);
    ReleaseBodyManager.getInstance().save(packet);
    SurgeManager.getInstance().save(packet);
    PsyAntennaManager.save(packet);
    GlobalSoundManager.getInstance().save(packet);
    StatisticsManager.getInstance().save(packet);
    TreasureManager.getInstance().save(packet);
    TaskManager.getInstance().save(packet);
    AchievementsManager.getInstance().save(packet);
    ActorInputManager.getInstance().save(packet);
    GameSettingsManager.getInstance().save(packet);
  }

  /**
   * Load core managers data.
   */
  public clientLoad(reader: NetProcessor): void {
    logger.info("Loading client data");

    WeatherManager.getInstance().load(reader);
    ReleaseBodyManager.getInstance().load(reader);
    SurgeManager.getInstance().load(reader);
    PsyAntennaManager.load(reader);
    GlobalSoundManager.getInstance().load(reader);
    StatisticsManager.getInstance().load(reader);
    TreasureManager.getInstance().load(reader);
    TaskManager.getInstance().load(reader);
    AchievementsManager.getInstance().load(reader);
    ActorInputManager.getInstance().load(reader);
    GameSettingsManager.getInstance().load(reader);
  }

  /**
   * Write state for core managers.
   */
  public serverSave(packet: NetPacket): void {
    logger.info("Saving server data");

    SimulationBoardManager.getInstance().save(packet);
  }

  /**
   * Read state for core managers.
   */
  public serverLoad(reader: NetProcessor): void {
    logger.info("Loading server data");

    SimulationBoardManager.getInstance().load(reader);
  }

  /**
   * When game save creation starting.
   *
   * @param saveName - name of save file, just base name with extension like `example.scop`
   */
  public onBeforeGameSave(saveName: TName): void {
    logger.info("Before game save:", saveName);

    EventsManager.emitEvent(EGameEvent.GAME_SAVE, registry.dynamicData.eventPacket);

    saveDynamicGameSave(saveName, registry.dynamicData);
  }

  /**
   * When game saved successfully.
   *
   * @param saveName - name of save file, just base name with extension like `example.scop`
   */
  public onGameSave(saveName: TName): void {
    logger.info("On game save:", saveName);
  }

  /**
   * When game save loading starts.
   *
   * @param saveName - name of save file, full path with disk/system folders structure
   */
  public onBeforeGameLoad(saveName: TName): void {
    logger.info("Before game load:", saveName);

    const data: Optional<IDynamicSaveData> = loadDynamicGameSave(saveName);

    registry.dynamicData = data ? data : registry.dynamicData;

    EventsManager.emitEvent(EGameEvent.GAME_LOAD, registry.dynamicData.eventPacket);
  }

  /**
   * When game save loaded successfully.
   *
   * @param saveName - name of save file, full path with disk/system folders structure
   */
  public onGameLoad(saveName: TName): void {
    logger.info("On game load:", saveName);
  }

  /**
   * When actor created and re-initialized.
   */
  public onActorReinit(): void {
    initializeManager(SurgeManager);
  }
}
