import { action_base, LuabindClass, patrol, XR_game_object } from "xray16";

import { AnyCallable, LuaArray, Optional } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { ISchemeSleeperState } from "@/mod/scripts/core/schemes/sleeper";
import { StalkerMoveManager } from "@/mod/scripts/core/state_management/StalkerMoveManager";
import { set_state } from "@/mod/scripts/core/state_management/StateManager";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { IWaypointData, parsePathWaypointsFromArgsList } from "@/mod/scripts/utils/parse";

const logger: LuaLogger = new LuaLogger("ActionSleeperActivity");

const state_walking = 0;
const state_sleeping = 1;

/**
 * todo;
 */
@LuabindClass()
export class ActionSleeperActivity extends action_base {
  public readonly state: ISchemeSleeperState;
  public readonly moveManager: StalkerMoveManager;
  public was_reset: boolean = false;
  public sleeping_state: number = state_walking;

  public timer!: {
    begin: Optional<number>;
    idle: Optional<number>;
    maxidle: number;
    sumidle: number;
    random: number;
  };

  /**
   * todo;
   */
  public constructor(state: ISchemeSleeperState, object: XR_game_object) {
    super(null, ActionSleeperActivity.__name);

    this.state = state;
    this.moveManager = registry.objects.get(object.id()).moveManager!;
    this.was_reset = false;
  }

  /**
   * todo;
   */
  public override initialize(): void {
    super.initialize();

    this.object.set_desired_position();
    this.object.set_desired_direction();

    this.resetScheme();
  }

  /**
   * todo;
   */
  public resetScheme(): void {
    this.timer = {
      begin: null,
      idle: null,
      maxidle: 10,
      sumidle: 20,
      random: 50,
    };

    this.state.signals = new LuaTable();
    this.sleeping_state = state_walking;

    if (this.state.path_walk_info === null) {
      const patrol_main = new patrol(this.state.path_main);

      if (!patrol_main) {
        abort("object '%s': unable to find path_main '%s' on the map", this.object.name(), this.state.path_main);
      }

      const num_wayp = patrol_main.count();

      if (num_wayp === 1) {
        this.state.path_walk = this.state.path_main;
        this.state.path_walk_info = parsePathWaypointsFromArgsList(this.state.path_main, 1, [0, "wp00|ret=1"]);
        this.state.path_look = null;
        this.state.path_look_info = null;
      } else if (num_wayp === 2) {
        this.state.path_walk = this.state.path_main;
        this.state.path_walk_info = parsePathWaypointsFromArgsList(this.state.path_main, 2, [1, "wp00"], [0, "wp01"]);
        this.state.path_look = this.state.path_main;
        this.state.path_look_info = parsePathWaypointsFromArgsList(
          this.state.path_main,
          2,
          [0, "wp00"],
          [1, "wp01|ret=1"]
        );
      } else {
        abort(
          "object '%s': path_main '%s' contains %d waypoints, while 1 or 2 were expected",
          this.object.name(),
          this.state.path_main,
          num_wayp
        );
      }
    }

    this.moveManager.reset(
      this.state.path_walk as string,
      this.state.path_walk_info as LuaArray<IWaypointData>,
      this.state.path_look,
      this.state.path_look_info,
      null,
      null,
      // todo: Unsafe this casting, should be avoided later with updates
      { obj: this, func: this.callback as unknown as AnyCallable },
      true,
      null,
      null
    );
    this.was_reset = true;
  }

  /**
   * todo;
   */
  public activateScheme(): void {
    this.was_reset = false;
  }

  /**
   * todo;
   */
  public callback(mode: number, number: number): boolean {
    this.sleeping_state = state_sleeping;

    const sleepPatrol = new patrol(this.state.path_main);
    const position = sleepPatrol.count() === 2 ? sleepPatrol.point(1) : null;

    if (this.state.wakeable) {
      set_state(this.object, "sit", null, null, { look_position: position }, null);
    } else {
      set_state(this.object, "sleep", null, null, { look_position: position }, null);
    }

    return true;
  }

  /**
   * todo;
   */
  public override execute(): void {
    super.execute();
    if (!this.was_reset) {
      this.resetScheme();
    }

    if (this.sleeping_state === state_walking) {
      this.moveManager.update();

      return;
    }

    /*
     *  if this.state == state_sleeping then
     *    --        GlobalSound:set_sound(this.object, "sleep")
     *  end
     */
  }

  /**
   * todo;
   */
  public override finalize(): void {
    // --  GlobalSound:set_sound(this.object, null)
    this.moveManager.finalize();
    super.finalize();
  }
}
