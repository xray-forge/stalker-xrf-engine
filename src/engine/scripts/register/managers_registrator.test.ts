import { beforeEach, describe, expect, it } from "@jest/globals";

import { registry } from "@/engine/core/database";
import { AchievementsManager } from "@/engine/core/managers/achievements";
import { ActorInputManager } from "@/engine/core/managers/actor";
import { ActorInventoryMenuManager } from "@/engine/core/managers/actor/ActorInventoryMenuManager";
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
import { AnyObject } from "@/engine/lib/types";
import { registerManagers } from "@/engine/scripts/register/managers_registrator";

describe("'managers_registrator' entry point", () => {
  beforeEach(() => {
    registry.managers = new LuaTable();
  });

  it("'registerSchemeModules' should correctly re-register required managers", () => {
    registerManagers();

    expect((registry.managers as AnyObject).size).toBe(25);

    [
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
    ].forEach((it) => expect(registry.managers.has(it)).toBe(true));
  });
});
