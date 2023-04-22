import { TXR_net_processor, XR_net_packet } from "xray16";

import { AbstractCoreManager } from "@/engine/core/managers/base/AbstractCoreManager";
import { AchievementsManager } from "@/engine/core/managers/interaction/achievements";
import { SimulationBoardManager } from "@/engine/core/managers/interaction/SimulationBoardManager";
import { TaskManager } from "@/engine/core/managers/interaction/tasks";
import { StatisticsManager } from "@/engine/core/managers/interface/StatisticsManager";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { PsyAntennaManager } from "@/engine/core/managers/world/PsyAntennaManager";
import { ReleaseBodyManager } from "@/engine/core/managers/world/ReleaseBodyManager";
import { SurgeManager } from "@/engine/core/managers/world/SurgeManager";
import { TreasureManager } from "@/engine/core/managers/world/TreasureManager";
import { WeatherManager } from "@/engine/core/managers/world/WeatherManager";

/**
 * Manage game saves for other managers / parts.
 */
export class SaveManager extends AbstractCoreManager {
  /**
   * Save core managers data.
   */
  public override save(packet: XR_net_packet): void {
    WeatherManager.getInstance().save(packet);
    ReleaseBodyManager.getInstance().save(packet);
    SurgeManager.getInstance().save(packet);
    PsyAntennaManager.save(packet);
    GlobalSoundManager.getInstance().save(packet);
    StatisticsManager.getInstance().save(packet);
    TreasureManager.getInstance().save(packet);
    TaskManager.getInstance().save(packet);
    AchievementsManager.getInstance().save(packet);
  }

  /**
   * Load core managers data.
   */
  public override load(reader: TXR_net_processor): void {
    WeatherManager.getInstance().load(reader);
    ReleaseBodyManager.getInstance().load(reader);
    SurgeManager.getInstance().load(reader);
    PsyAntennaManager.load(reader);
    GlobalSoundManager.getInstance().load(reader);
    StatisticsManager.getInstance().load(reader);
    TreasureManager.getInstance().load(reader);
    TaskManager.getInstance().load(reader);
    AchievementsManager.getInstance().load(reader);
  }

  /**
   * Write state for core managers.
   */
  public writeState(packet: XR_net_packet): void {
    SimulationBoardManager.getInstance().save(packet);
  }

  /**
   * Read state for core managers.
   */
  public readState(reader: TXR_net_processor): void {
    SimulationBoardManager.getInstance().load(reader);
  }
}
