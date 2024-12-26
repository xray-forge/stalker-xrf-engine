import { beforeEach, describe, expect, it } from "@jest/globals";

import { registry } from "@/engine/core/database";
import { ActorInputManager, ActorInventoryMenuManager } from "@/engine/core/managers/actor";
import { DatabaseManager } from "@/engine/core/managers/database";
import { ReleaseBodyManager } from "@/engine/core/managers/death";
import { DebugManager } from "@/engine/core/managers/debug";
import { ProfilingManager } from "@/engine/core/managers/debug/profiling";
import { DialogManager } from "@/engine/core/managers/dialogs";
import { EventsManager } from "@/engine/core/managers/events";
import { LoadScreenManager } from "@/engine/core/managers/interface";
import { MapDisplayManager } from "@/engine/core/managers/map";
import { MusicManager } from "@/engine/core/managers/music";
import { NotificationManager } from "@/engine/core/managers/notifications";
import { PdaManager } from "@/engine/core/managers/pda";
import { PhantomManager } from "@/engine/core/managers/psy";
import { SaveManager } from "@/engine/core/managers/save";
import { GameSettingsManager } from "@/engine/core/managers/settings";
import { SimulationManager } from "@/engine/core/managers/simulation";
import { SleepManager } from "@/engine/core/managers/sleep";
import { SoundManager } from "@/engine/core/managers/sounds";
import { StatisticsManager } from "@/engine/core/managers/statistics";
import { TaskManager } from "@/engine/core/managers/tasks";
import { TradeManager } from "@/engine/core/managers/trade";
import { TravelManager } from "@/engine/core/managers/travel";
import { TreasureManager } from "@/engine/core/managers/treasures";
import { UpgradesManager } from "@/engine/core/managers/upgrades";
import { WeatherManager } from "@/engine/core/managers/weather";
import { AnyObject } from "@/engine/lib/types";
import { registerManagers } from "@/engine/scripts/register/managers_registrator";
import { resetRegistry } from "@/fixtures/engine";

describe("managers_registrator entry point", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("registerSchemeModules should correctly re-register required managers", () => {
    registerManagers();

    expect((registry.managers as AnyObject).size).toBe(26);

    [
      ActorInputManager,
      ActorInventoryMenuManager,
      DatabaseManager,
      DebugManager,
      DialogManager,
      MusicManager,
      EventsManager,
      GameSettingsManager,
      SoundManager,
      UpgradesManager,
      LoadScreenManager,
      MapDisplayManager,
      NotificationManager,
      PdaManager,
      PhantomManager,
      ProfilingManager,
      ReleaseBodyManager,
      SaveManager,
      SimulationManager,
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
