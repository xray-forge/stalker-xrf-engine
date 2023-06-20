import { disposeManagers, initializeManager, registry } from "@/engine/core/database";
import { EventsManager } from "@/engine/core/managers";
import { TAbstractCoreManagerConstructor } from "@/engine/core/managers/base/AbstractCoreManager";
import { SaveManager } from "@/engine/core/managers/base/SaveManager";
import { AchievementsManager } from "@/engine/core/managers/interaction/achievements";
import { DialogManager } from "@/engine/core/managers/interaction/dialog/DialogManager";
import { SimulationBoardManager } from "@/engine/core/managers/interaction/SimulationBoardManager";
import { SleepManager } from "@/engine/core/managers/interaction/SleepManager";
import { TaskManager } from "@/engine/core/managers/interaction/tasks";
import { TradeManager } from "@/engine/core/managers/interaction/TradeManager";
import { TravelManager } from "@/engine/core/managers/interaction/TravelManager";
import { ActorInputManager, MapDisplayManager, NotificationManager } from "@/engine/core/managers/interface";
import { ActorInventoryMenuManager } from "@/engine/core/managers/interface/ActorInventoryMenuManager";
import { GameSettingsManager } from "@/engine/core/managers/interface/GameSettingsManager";
import { ItemUpgradesManager } from "@/engine/core/managers/interface/ItemUpgradesManager";
import { LoadScreenManager } from "@/engine/core/managers/interface/LoadScreenManager";
import { PdaManager } from "@/engine/core/managers/interface/PdaManager";
import { StatisticsManager } from "@/engine/core/managers/interface/StatisticsManager";
import { DynamicMusicManager } from "@/engine/core/managers/sounds/DynamicMusicManager";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { PhantomManager } from "@/engine/core/managers/world/PhantomManager";
import { ReleaseBodyManager } from "@/engine/core/managers/world/ReleaseBodyManager";
import { TreasureManager } from "@/engine/core/managers/world/TreasureManager";
import { WeatherManager } from "@/engine/core/managers/world/WeatherManager";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Register game managers and dispose existing ones.
 */
export function registerManagers(): void {
  const managers: Array<TAbstractCoreManagerConstructor> = [
    AchievementsManager,
    ActorInputManager,
    ActorInventoryMenuManager,
    DialogManager,
    DynamicMusicManager,
    EventsManager,
    GameSettingsManager,
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
