import { disposeManagers, initializeManager, registry } from "@/engine/core/database";
import {
  AchievementsManager,
  ActorInventoryMenuManager,
  DialogManager,
  DynamicMusicManager,
  EventsManager,
  GlobalSoundManager,
  ItemUpgradesManager,
  LoadScreenManager,
  MapDisplayManager,
  NotificationManager,
  PdaManager,
  PhantomManager,
  ReleaseBodyManager,
  SaveManager,
  SimulationBoardManager,
  StatisticsManager,
  TaskManager,
  TradeManager,
  TravelManager,
  TreasureManager,
  WeatherManager,
} from "@/engine/core/managers";
import { TAbstractCoreManagerConstructor } from "@/engine/core/managers/AbstractCoreManager";
import { SleepManager } from "@/engine/core/managers/SleepManager";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Register game managers and dispose existing ones.
 */
export function registerManagers(): void {
  const managers: Array<TAbstractCoreManagerConstructor> = [
    AchievementsManager,
    ActorInventoryMenuManager,
    DialogManager,
    DynamicMusicManager,
    EventsManager,
    GlobalSoundManager,
    ItemUpgradesManager,
    LoadScreenManager,
    MapDisplayManager,
    NotificationManager,
    PdaManager,
    PhantomManager,
    ReleaseBodyManager,
    SaveManager,
    SimulationBoardManager,
    SleepManager,
    StatisticsManager,
    TaskManager,
    TradeManager,
    TravelManager,
    TreasureManager,
    WeatherManager,
  ];

  logger.info("Dispose existing managers:", registry.managers.length());

  disposeManagers();

  logger.info("Register game managers:", managers.length);

  for (const manager of managers) {
    initializeManager(manager);
  }
}
