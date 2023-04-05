import { TXR_net_processor, XR_net_packet } from "xray16";

import { AbstractCoreManager } from "@/engine/core/managers/AbstractCoreManager";
import { AchievementsManager } from "@/engine/core/managers/achievements";
import { GlobalSoundManager } from "@/engine/core/managers/GlobalSoundManager";
import { PsyAntennaManager } from "@/engine/core/managers/PsyAntennaManager";
import { ReleaseBodyManager } from "@/engine/core/managers/ReleaseBodyManager";
import { StatisticsManager } from "@/engine/core/managers/StatisticsManager";
import { SurgeManager } from "@/engine/core/managers/SurgeManager";
import { TaskManager } from "@/engine/core/managers/tasks";
import { TreasureManager } from "@/engine/core/managers/TreasureManager";
import { WeatherManager } from "@/engine/core/managers/WeatherManager";

/**
 * Manage game saves for other managers / parts.
 */
export class SaveManager extends AbstractCoreManager {
  /**
   * Save core managers data.
   */
  public override save(packet: XR_net_packet) {
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
}
