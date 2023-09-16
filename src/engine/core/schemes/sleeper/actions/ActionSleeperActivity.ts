import { action_base, LuabindClass, patrol } from "xray16";

import { registry, setStalkerState } from "@/engine/core/database";
import { StalkerPatrolManager } from "@/engine/core/objects/ai/state/StalkerPatrolManager";
import { EStalkerState } from "@/engine/core/objects/animation/types";
import { ISchemeSleeperState } from "@/engine/core/schemes/sleeper";
import { abort } from "@/engine/core/utils/assertion";
import { parseWaypointsDataFromList } from "@/engine/core/utils/ini/ini_parse";
import { IWaypointData } from "@/engine/core/utils/ini/ini_types";
import { LuaLogger } from "@/engine/core/utils/logging";
import {
  AnyCallable,
  ClientObject,
  ISchemeEventHandler,
  LuaArray,
  Optional,
  Patrol,
  TCount,
  TDuration,
  Vector,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

const STATE_WALKING = 0;
const STATE_SLEEPING = 1;

/**
 * todo;
 */
@LuabindClass()
export class ActionSleeperActivity extends action_base implements ISchemeEventHandler {
  public readonly state: ISchemeSleeperState;
  public readonly patrolManager: StalkerPatrolManager;
  public wasReset: boolean = false;
  public sleepingState: 1 | 0 = STATE_WALKING; // todo: use boolean

  public timer!: {
    begin: Optional<number>;
    idle: Optional<number>;
    maxidle: TDuration;
    sumidle: TDuration;
    random: TDuration;
  };

  public constructor(state: ISchemeSleeperState, object: ClientObject) {
    super(null, ActionSleeperActivity.__name);

    this.state = state;
    this.patrolManager = registry.objects.get(object.id()).patrolManager!;
    this.wasReset = false;
  }

  /**
   * Reset scheme state and object positioning for new sleeping activity.
   */
  public override initialize(): void {
    super.initialize();

    this.object.set_desired_position();
    this.object.set_desired_direction();

    this.reset();
  }

  /**
   * Handle execution of action.
   * Walk to needed place and start sleeping.
   */
  public override execute(): void {
    super.execute();

    if (!this.wasReset) {
      this.reset();
    }

    if (this.sleepingState === STATE_WALKING) {
      return this.patrolManager.update();
    }

    /*
     * Sounds are disabled originally.
     *
     *  if this.state == state_sleeping then
     *    --        GlobalSound:set_sound(this.object, "sleep")
     *  end
     */
  }

  /**
   * todo: Description.
   */
  public override finalize(): void {
    // --  GlobalSound:set_sound(this.object, null)
    this.patrolManager.finalize();
    super.finalize();
  }

  /**
   * todo: Description.
   */
  public activate(): void {
    this.wasReset = false;
  }

  /**
   * todo: Description.
   */
  public reset(): void {
    this.timer = {
      begin: null,
      idle: null,
      maxidle: 10,
      sumidle: 20,
      random: 50,
    };

    this.state.signals = new LuaTable();
    this.sleepingState = STATE_WALKING;

    if (this.state.path_walk_info === null) {
      const patrolMain: Patrol = new patrol(this.state.path_main);

      if (!patrolMain) {
        abort("object '%s': unable to find path_main '%s' on the map", this.object.name(), this.state.path_main);
      }

      const numWayp: TCount = patrolMain.count();

      if (numWayp === 1) {
        this.state.path_walk = this.state.path_main;
        this.state.path_walk_info = parseWaypointsDataFromList(this.state.path_main, 1, [0, "wp00|ret=1"]);
        this.state.path_look = null;
        this.state.path_look_info = null;
      } else if (numWayp === 2) {
        this.state.path_walk = this.state.path_main;
        this.state.path_walk_info = parseWaypointsDataFromList(this.state.path_main, 2, [1, "wp00"], [0, "wp01"]);
        this.state.path_look = this.state.path_main;
        this.state.path_look_info = parseWaypointsDataFromList(this.state.path_main, 2, [0, "wp00"], [1, "wp01|ret=1"]);
      } else {
        abort(
          "object '%s': path_main '%s' contains %d waypoints, while 1 or 2 were expected",
          this.object.name(),
          this.state.path_main,
          numWayp
        );
      }
    }

    this.patrolManager.reset(
      this.state.path_walk as string,
      this.state.path_walk_info as LuaArray<IWaypointData>,
      this.state.path_look,
      this.state.path_look_info,
      null,
      null,
      // todo: Unsafe this casting, should be avoided later with updates
      { obj: this, func: this.callback as unknown as AnyCallable }
    );
    this.wasReset = true;
  }

  /**
   * todo: Description.
   */
  public callback(): boolean {
    this.sleepingState = STATE_SLEEPING;

    const sleepPatrol: Patrol = new patrol(this.state.path_main);
    const position: Optional<Vector> = sleepPatrol.count() === 2 ? sleepPatrol.point(1) : null;

    if (this.state.wakeable) {
      setStalkerState(this.object, EStalkerState.SIT, null, null, { lookPosition: position, lookObjectId: null });
    } else {
      setStalkerState(this.object, EStalkerState.SLEEP, null, null, { lookPosition: position, lookObjectId: null });
    }

    return true;
  }
}
