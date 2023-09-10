import { beforeEach, describe, expect, it } from "@jest/globals";
import { AchievementsManager } from "core/managers/achievements";
import { DialogManager } from "core/managers/dialog";
import { SleepManager } from "core/managers/sleep";
import { TaskManager } from "core/managers/tasks";
import { TradeManager } from "core/managers/trade";
import { TravelManager } from "core/managers/travel";
import { TreasureManager } from "core/managers/treasures";

import { registry } from "@/engine/core/database";
import { ProfilingManager } from "@/engine/core/managers/debug/ProfilingManager";
import { EventsManager } from "@/engine/core/managers/events";
import { ActorInputManager, MapDisplayManager, NotificationManager } from "@/engine/core/managers/interface";
import { ActorInventoryMenuManager } from "@/engine/core/managers/interface/ActorInventoryMenuManager";
import { GameSettingsManager } from "@/engine/core/managers/interface/GameSettingsManager";
import { ItemUpgradesManager } from "@/engine/core/managers/interface/ItemUpgradesManager";
import { LoadScreenManager } from "@/engine/core/managers/interface/LoadScreenManager";
import { PdaManager } from "@/engine/core/managers/interface/PdaManager";
import { StatisticsManager } from "@/engine/core/managers/interface/statistics";
import { SaveManager } from "@/engine/core/managers/save/SaveManager";
import { SimulationBoardManager } from "@/engine/core/managers/simulation/SimulationBoardManager";
import { DynamicMusicManager } from "@/engine/core/managers/sounds/DynamicMusicManager";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { PhantomManager } from "@/engine/core/managers/world/PhantomManager";
import { ReleaseBodyManager } from "@/engine/core/managers/world/ReleaseBodyManager";
import { WeatherManager } from "@/engine/core/managers/world/WeatherManager";
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
