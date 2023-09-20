import { initializeManager } from "@/engine/core/database";
import { AchievementsManager } from "@/engine/core/managers/achievements";
import { ActorInputManager, ActorInventoryMenuManager } from "@/engine/core/managers/actor";
import { TAbstractCoreManagerConstructor } from "@/engine/core/managers/base";
import { ReleaseBodyManager } from "@/engine/core/managers/death";
import { ProfilingManager } from "@/engine/core/managers/debug/profiling";
import { DialogManager } from "@/engine/core/managers/dialogs";
import { EventsManager } from "@/engine/core/managers/events";
import { ItemUpgradesManager, LoadScreenManager } from "@/engine/core/managers/interface";
import { MapDisplayManager } from "@/engine/core/managers/map";
import { NotificationManager } from "@/engine/core/managers/notifications";
import { PdaManager } from "@/engine/core/managers/pda";
import { PhantomManager } from "@/engine/core/managers/psy";
import { SaveManager } from "@/engine/core/managers/save";
import { GameSettingsManager } from "@/engine/core/managers/settings";
import { SimulationBoardManager } from "@/engine/core/managers/simulation";
import { SleepManager } from "@/engine/core/managers/sleep";
import { DynamicMusicManager, GlobalSoundManager } from "@/engine/core/managers/sounds";
import { StatisticsManager } from "@/engine/core/managers/statistics";
import { TaskManager } from "@/engine/core/managers/tasks";
import { TradeManager } from "@/engine/core/managers/trade";
import { TravelManager } from "@/engine/core/managers/travel";
import { TreasureManager } from "@/engine/core/managers/treasures";
import { WeatherManager } from "@/engine/core/managers/weather";
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
