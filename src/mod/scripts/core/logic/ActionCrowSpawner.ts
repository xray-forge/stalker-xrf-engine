import { alife, patrol, time_global, XR_game_object, XR_ini_file } from "xray16";

import { Optional } from "@/mod/lib/types";
import { EScheme, ESchemeType, TSection } from "@/mod/lib/types/scheme";
import { CROW_STORAGE, getActor, IStoredObject } from "@/mod/scripts/core/db";
import { AbstractSchemeImplementation } from "@/mod/scripts/core/logic/AbstractSchemeImplementation";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/schemes/trySwitchToAnotherSection";
import { cfg_get_switch_conditions, getConfigNumber, getConfigString, parseNames } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { copyTable } from "@/mod/scripts/utils/table";

const logger: LuaLogger = new LuaLogger("ActionCrowSpawner");

export class ActionCrowSpawner extends AbstractSchemeImplementation {
  public static readonly SCHEME_SECTION: EScheme = EScheme.SR_CROW_SPAWNER;
  public static readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: IStoredObject
  ): void {
    subscribeActionForEvents(object, state, new ActionCrowSpawner(object, state));
  }

  public static set_scheme(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    // -- standart lines: assigning new storage and binding our space restrictor
    const state: IStoredObject = assignStorageAndBind(object, ini, scheme, section);

    state.logic = cfg_get_switch_conditions(ini, section, object);
    state.max_crows_on_level = getConfigNumber(ini, section, "max_crows_on_level", object, false, 16);

    const path = getConfigString(ini, section, "spawn_path", object, false, "", null);

    state.path_table = parseNames(path!);
  }

  public spawn_time_constant: number;
  public time_for_spawn: number;
  public spawn_points_idle: LuaTable;
  public spawned_count: Optional<number>;

  public constructor(object: XR_game_object, state: IStoredObject) {
    super(object, state);

    this.spawn_time_constant = 120000;
    this.time_for_spawn = time_global();
    this.spawn_points_idle = new LuaTable();
    this.spawned_count = null;
  }

  public reset_scheme(): void {
    for (const [k, v] of this.state.path_table!) {
      this.spawn_points_idle.set(v, time_global());
    }
  }

  public update(delta: number): void {
    // -- check for spawn crows on level
    if (this.time_for_spawn < time_global()) {
      this.spawned_count = CROW_STORAGE.COUNT;
      if (this.spawned_count < this.state.max_crows_on_level!) {
        // -- need to spawn
        this.check_for_spawn_new_crow();
      } else {
        // -- now look for spawn later
        this.time_for_spawn = time_global() + this.spawn_time_constant;
      }
    }

    if (trySwitchToAnotherSection(this.object, this.state, getActor())) {
      return;
    }
  }

  public check_for_spawn_new_crow(): void {
    const path_table: LuaTable<number, string> = new LuaTable();

    copyTable(path_table, this.state.path_table!);

    for (const it of $range(1, this.state.path_table!.length())) {
      const idx = math.random(path_table.length());
      const selected_path = path_table.get(idx);

      table.remove(path_table, idx);
      if (this.spawn_points_idle.get(selected_path) <= time_global()) {
        // -- if we have not spawned already in this point
        const ptr = new patrol(selected_path);

        if (ptr.point(0).distance_to(getActor()!.position()) > 100) {
          const obj = alife().create("m_crow", ptr.point(0), ptr.level_vertex_id(0), ptr.game_vertex_id(0));

          logger.info("Spawn new crow:", obj.id, selected_path);

          this.spawn_points_idle.set(selected_path, time_global() + 10000);

          return;
        }
      }
    }
  }
}
