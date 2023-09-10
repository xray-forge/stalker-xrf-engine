import { initializeManager } from "@/engine/core/database";
import { AchievementsManager } from "@/engine/core/managers/achievements";
import { ActorInputManager, ActorInventoryMenuManager } from "@/engine/core/managers/actor";
import { TAbstractCoreManagerConstructor } from "@/engine/core/managers/base/AbstractManager";
import { ReleaseBodyManager } from "@/engine/core/managers/death/ReleaseBodyManager";
import { ProfilingManager } from "@/engine/core/managers/debug/ProfilingManager";
import { DialogManager } from "@/engine/core/managers/dialogs";
import { EventsManager } from "@/engine/core/managers/events";
import { ItemUpgradesManager } from "@/engine/core/managers/interface/ItemUpgradesManager";
import { LoadScreenManager } from "@/engine/core/managers/interface/LoadScreenManager";
import { MapDisplayManager } from "@/engine/core/managers/map";
import { NotificationManager } from "@/engine/core/managers/notifications";
import { PdaManager } from "@/engine/core/managers/pda/PdaManager";
import { PhantomManager } from "@/engine/core/managers/psy/PhantomManager";
import { SaveManager } from "@/engine/core/managers/save/SaveManager";
import { GameSettingsManager } from "@/engine/core/managers/settings/GameSettingsManager";
import { SimulationBoardManager } from "@/engine/core/managers/simulation/SimulationBoardManager";
import { SleepManager } from "@/engine/core/managers/sleep";
import { DynamicMusicManager } from "@/engine/core/managers/sounds/DynamicMusicManager";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { StatisticsManager } from "@/engine/core/managers/statistics";
import { TaskManager } from "@/engine/core/managers/tasks";
import { TradeManager } from "@/engine/core/managers/trade";
import { TravelManager } from "@/engine/core/managers/travel";
import { TreasureManager } from "@/engine/core/managers/treasures";
import { WeatherManager } from "@/engine/core/managers/weather/WeatherManager";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Register game managers and dispose existing ones.
 *
 * todo: Check why game time cannot be accessed when managers initialize (surge manager)
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
    ProfilingManager,
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

  logger.info("Register game managers:", managers.length);

  for (const manager of managers) {
    initializeManager(manager);
  }
}
