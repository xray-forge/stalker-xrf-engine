import { alife, patrol, time_global } from "xray16";

import { registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/schemes";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/base/utils";
import { ISchemeCrowSpawnerState } from "@/engine/core/schemes/sr_crow_spawner/ISchemeCrowSpawnerState";
import { LuaLogger } from "@/engine/core/utils/logging";
import { copyTable } from "@/engine/core/utils/table";
import { Optional, TCount, TDuration, TIndex } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class CrowSpawnerManager extends AbstractSchemeManager<ISchemeCrowSpawnerState> {
  public spawnTimeConstant: TDuration = 120_000;
  public timeForSpawn: TDuration = time_global();
  public spawnPointsIdle: LuaTable = new LuaTable();
  public spawnedCount: Optional<TCount> = null;

  /**
   * todo: Description.
   */
  public override resetScheme(): void {
    for (const [k, v] of this.state.pathsList!) {
      this.spawnPointsIdle.set(v, time_global());
    }
  }

  /**
   * todo: Description.
   */
  public override update(): void {
    // -- check for spawn crows on level
    if (this.timeForSpawn < time_global()) {
      this.spawnedCount = registry.crows.count;
      if (this.spawnedCount < this.state.maxCrowsOnLevel!) {
        // -- need to spawn
        this.checkForSpawnNewCrow();
      } else {
        // -- now look for spawn later
        this.timeForSpawn = time_global() + this.spawnTimeConstant;
      }
    }

    if (trySwitchToAnotherSection(this.object, this.state, registry.actor)) {
      return;
    }
  }

  /**
   * todo: Description.
   */
  public checkForSpawnNewCrow(): void {
    const pathList: LuaTable<number, string> = new LuaTable();

    copyTable(pathList, this.state.pathsList!);

    for (const it of $range(1, this.state.pathsList!.length())) {
      const idx: TIndex = math.random(pathList.length());
      const selectedPath = pathList.get(idx);

      table.remove(pathList, idx);
      if (this.spawnPointsIdle.get(selectedPath) <= time_global()) {
        // -- if we have not spawned already in this point
        const ptr = new patrol(selectedPath);

        if (ptr.point(0).distance_to(registry.actor.position()) > 100) {
          const obj = alife().create("m_crow", ptr.point(0), ptr.level_vertex_id(0), ptr.game_vertex_id(0));

          logger.info("Spawn new crow:", obj.id, selectedPath);

          this.spawnPointsIdle.set(selectedPath, time_global() + 10000);

          return;
        }
      }
    }
  }
}
