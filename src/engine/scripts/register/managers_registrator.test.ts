import { beforeEach, describe, expect, it } from "@jest/globals";

import { registry } from "@/engine/core/database";
import { AnyObject } from "@/engine/lib/types";
import { registerManagers } from "@/engine/scripts/register/managers_registrator";
import { AchievementsManager } from "@/engine/core/managers/interaction/achievements";
import { ActorInputManager, MapDisplayManager, NotificationManager } from "@/engine/core/managers/interface";
import { ActorInventoryMenuManager } from "@/engine/core/managers/interface/ActorInventoryMenuManager";
import { DialogManager } from "@/engine/core/managers/interaction/dialog";
import { DynamicMusicManager } from "@/engine/core/managers/sounds/DynamicMusicManager";
import { EventsManager } from "@/engine/core/managers";
import { GameSettingsManager } from "@/engine/core/managers/interface/GameSettingsManager";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { ItemUpgradesManager } from "@/engine/core/managers/interface/ItemUpgradesManager";
import { LoadScreenManager } from "@/engine/core/managers/interface/LoadScreenManager";
import { PdaManager } from "@/engine/core/managers/interface/PdaManager";
import { PhantomManager } from "@/engine/core/managers/world/PhantomManager";
import { ReleaseBodyManager } from "@/engine/core/managers/world/ReleaseBodyManager";
import { SaveManager } from "@/engine/core/managers/base/SaveManager";
import { SimulationBoardManager } from "@/engine/core/managers/interaction/SimulationBoardManager";
import { SleepManager } from "@/engine/core/managers/interaction/SleepManager";
import { StatisticsManager } from "@/engine/core/managers/interface/statistics";
import { TaskManager } from "@/engine/core/managers/interaction/tasks";
import { TradeManager } from "@/engine/core/managers/interaction/TradeManager";
import { TravelManager } from "@/engine/core/managers/interaction/TravelManager";
import { TreasureManager } from "@/engine/core/managers/world/TreasureManager";
import { WeatherManager } from "@/engine/core/managers/world/WeatherManager";

describe("'managers_registrator' entry point", () => {
  beforeEach(() => {
    registry.managers = new LuaTable();
  });

  it("'registerSchemeModules' should correctly re-register required managers", () => {
    registerManagers();

    expect((registry.managers as AnyObject).size).toBe(24);

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
