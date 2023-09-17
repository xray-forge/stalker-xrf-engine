import { alife, patrol, time_global } from "xray16";

import { registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/objects/ai/scheme";
import { ISchemeCrowSpawnerState } from "@/engine/core/schemes/restrictor/sr_crow_spawner/ISchemeCrowSpawnerState";
import { LuaLogger } from "@/engine/core/utils/logging";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme/scheme_switch";
import { copyTable } from "@/engine/core/utils/table";
import { AlifeSimulator, LuaArray, Patrol, TDuration, TIndex, TName, TTimestamp, Vector } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Manager of crow spawning.
 * If scheme is active, spawning crows at random paths defined in scheme config.
 */
export class CrowSpawnerManager extends AbstractSchemeManager<ISchemeCrowSpawnerState> {
  public static CROW_UPDATE_THROTTLE: TDuration = 120_000;

  public nextUpdateAt: TTimestamp = 0;
  public spawnPointsUpdateAt: LuaTable<TName, TTimestamp> = new LuaTable();

  public override activate(): void {
    for (const [, pathName] of this.state.pathsList) {
      this.spawnPointsUpdateAt.set(pathName, 0);
    }
  }

  public update(): void {
    const now: TTimestamp = time_global();

    if (this.nextUpdateAt < now) {
      if (registry.crows.count < this.state.maxCrowsOnLevel) {
        this.spawnCrows();
      } else {
        this.nextUpdateAt = now + CrowSpawnerManager.CROW_UPDATE_THROTTLE;
      }
    }

    trySwitchToAnotherSection(this.object, this.state);
  }

  /**
   * Spawn random crows for current level.
   * Check where crows were not spawned recently and add crow objects.
   */
  public spawnCrows(): void {
    const now: TTimestamp = time_global();
    const simulator: AlifeSimulator = alife();
    const pathList: LuaArray<TName> = copyTable(new LuaTable(), this.state.pathsList);
    const actorPosition: Vector = registry.actor.position();

    for (const it of $range(1, this.state.pathsList.length())) {
      const index: TIndex = math.random(pathList.length());
      const selectedPath: TName = pathList.get(index);

      table.remove(pathList, index);

      if (this.spawnPointsUpdateAt.get(selectedPath) <= now) {
        const crowPatrol: Patrol = new patrol(selectedPath);
        const spawnPosition: Vector = crowPatrol.point(0);

        // Check distance 100*100.
        if (spawnPosition.distance_to_sqr(actorPosition) > 10_000) {
          simulator.create("m_crow", spawnPosition, crowPatrol.level_vertex_id(0), crowPatrol.game_vertex_id(0));

          this.spawnPointsUpdateAt.set(selectedPath, now + 10_000);

          return;
        }
      }
    }
  }
}
