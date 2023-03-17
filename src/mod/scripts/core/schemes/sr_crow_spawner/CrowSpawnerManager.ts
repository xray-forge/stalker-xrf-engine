import { alife, patrol, time_global } from "xray16";

import { Optional, TCount, TDuration, TIndex } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { AbstractSchemeManager } from "@/mod/scripts/core/schemes/base/AbstractSchemeManager";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/schemes/base/trySwitchToAnotherSection";
import { ISchemeCrowSpawnerState } from "@/mod/scripts/core/schemes/sr_crow_spawner/ISchemeCrowSpawnerState";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { copyTable } from "@/mod/scripts/utils/table";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class CrowSpawnerManager extends AbstractSchemeManager<ISchemeCrowSpawnerState> {
  public spawn_time_constant: number = 120_000;
  public time_for_spawn: TDuration = time_global();
  public spawn_points_idle: LuaTable = new LuaTable();
  public spawned_count: Optional<TCount> = null;

  /**
   * todo;
   */
  public override resetScheme(): void {
    for (const [k, v] of this.state.path_table!) {
      this.spawn_points_idle.set(v, time_global());
    }
  }

  /**
   * todo;
   */
  public override update(): void {
    // -- check for spawn crows on level
    if (this.time_for_spawn < time_global()) {
      this.spawned_count = registry.crows.count;
      if (this.spawned_count < this.state.max_crows_on_level!) {
        // -- need to spawn
        this.check_for_spawn_new_crow();
      } else {
        // -- now look for spawn later
        this.time_for_spawn = time_global() + this.spawn_time_constant;
      }
    }

    if (trySwitchToAnotherSection(this.object, this.state, registry.actor)) {
      return;
    }
  }

  /**
   * todo;
   */
  public check_for_spawn_new_crow(): void {
    const path_table: LuaTable<number, string> = new LuaTable();

    copyTable(path_table, this.state.path_table!);

    for (const it of $range(1, this.state.path_table!.length())) {
      const idx: TIndex = math.random(path_table.length());
      const selected_path = path_table.get(idx);

      table.remove(path_table, idx);
      if (this.spawn_points_idle.get(selected_path) <= time_global()) {
        // -- if we have not spawned already in this point
        const ptr = new patrol(selected_path);

        if (ptr.point(0).distance_to(registry.actor.position()) > 100) {
          const obj = alife().create("m_crow", ptr.point(0), ptr.level_vertex_id(0), ptr.game_vertex_id(0));

          logger.info("Spawn new crow:", obj.id, selected_path);

          this.spawn_points_idle.set(selected_path, time_global() + 10000);

          return;
        }
      }
    }
  }
}
