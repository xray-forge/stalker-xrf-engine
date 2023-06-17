import { alife, patrol, time_global } from "xray16";

import { registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/schemes";
import { ISchemeCrowSpawnerState } from "@/engine/core/schemes/sr_crow_spawner/ISchemeCrowSpawnerState";
import { LuaLogger } from "@/engine/core/utils/logging";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme/switch";
import { copyTable } from "@/engine/core/utils/table";
import { Optional, Patrol, ServerObject, TCount, TDuration, TIndex, TName } from "@/engine/lib/types";

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

    if (trySwitchToAnotherSection(this.object, this.state)) {
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
      const selectedPath: TName = pathList.get(idx);

      table.remove(pathList, idx);
      if (this.spawnPointsIdle.get(selectedPath) <= time_global()) {
        // -- if we have not spawned already in this point
        const crowPatrol: Patrol = new patrol(selectedPath);

        if (crowPatrol.point(0).distance_to(registry.actor.position()) > 100) {
          const object: ServerObject = alife().create(
            "m_crow",
            crowPatrol.point(0),
            crowPatrol.level_vertex_id(0),
            crowPatrol.game_vertex_id(0)
          );

          logger.info("Spawn new crow:", object.id, selectedPath);

          this.spawnPointsIdle.set(selectedPath, time_global() + 10000);

          return;
        }
      }
    }
  }
}
