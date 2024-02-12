import { action_base, LuabindClass, patrol } from "xray16";

import { StalkerPatrolManager } from "@/engine/core/ai/patrol/StalkerPatrolManager";
import { EStalkerState } from "@/engine/core/animation/types";
import { registry, setStalkerState } from "@/engine/core/database";
import { ESleeperState, ISchemeSleeperState } from "@/engine/core/schemes/stalker/sleeper/sleeper_types";
import { abort } from "@/engine/core/utils/assertion";
import { IWaypointData, parseWaypointsDataFromList } from "@/engine/core/utils/ini";
import {
  GameObject,
  ISchemeEventHandler,
  LuaArray,
  Optional,
  Patrol,
  TCount,
  TDuration,
  Vector,
} from "@/engine/lib/types";

/**
 * Action to handle sleeping state of stalkers.
 */
@LuabindClass()
export class ActionSleeperActivity extends action_base implements ISchemeEventHandler {
  public readonly state: ISchemeSleeperState;
  public readonly patrolManager: StalkerPatrolManager;
  public wasReset: boolean = false;
  public sleepingState: ESleeperState = ESleeperState.WALKING; // todo: use boolean?

  public timer!: {
    begin: Optional<number>;
    idle: Optional<number>;
    maxidle: TDuration;
    sumidle: TDuration;
    random: TDuration;
  };

  public constructor(state: ISchemeSleeperState, object: GameObject) {
    super(null, ActionSleeperActivity.__name);

    this.state = state;
    this.patrolManager = registry.objects.get(object.id()).patrolManager!;
    this.wasReset = false;
  }

  public override initialize(): void {
    super.initialize();

    this.object.set_desired_position();
    this.object.set_desired_direction();

    this.reset();
  }

  public override execute(): void {
    super.execute();

    if (!this.wasReset) {
      this.reset();
    }

    if (this.sleepingState === ESleeperState.WALKING) {
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

  public override finalize(): void {
    // --  GlobalSound:set_sound(this.object, null)
    this.patrolManager.finalize();
    super.finalize();
  }

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
    this.sleepingState = ESleeperState.WALKING;

    if (this.state.pathWalkInfo === null) {
      const patrolMain: Patrol = new patrol(this.state.pathMain);

      if (!patrolMain) {
        abort("object '%s': unable to find path_main '%s' on the map", this.object.name(), this.state.pathMain);
      }

      const numWayp: TCount = patrolMain.count();

      if (numWayp === 1) {
        this.state.pathWalk = this.state.pathMain;
        this.state.pathWalkInfo = parseWaypointsDataFromList(this.state.pathMain, 1, [0, "wp00|ret=1"]);
        this.state.pathLook = null;
        this.state.pathLookInfo = null;
      } else if (numWayp === 2) {
        this.state.pathWalk = this.state.pathMain;
        this.state.pathWalkInfo = parseWaypointsDataFromList(this.state.pathMain, 2, [1, "wp00"], [0, "wp01"]);
        this.state.pathLook = this.state.pathMain;
        this.state.pathLookInfo = parseWaypointsDataFromList(this.state.pathMain, 2, [0, "wp00"], [1, "wp01|ret=1"]);
      } else {
        abort(
          "object '%s': path_main '%s' contains %d waypoints, while 1 or 2 were expected",
          this.object.name(),
          this.state.pathMain,
          numWayp
        );
      }
    }

    this.patrolManager.reset(
      this.state.pathWalk as string,
      this.state.pathWalkInfo as LuaArray<IWaypointData>,
      this.state.pathLook,
      this.state.pathLookInfo,
      null,
      null,
      // todo: Unsafe this casting, should be avoided later with updates
      { context: this, callback: this.onPatrolCallback }
    );
    this.wasReset = true;
  }

  /**
   * todo: Description.
   */
  public onPatrolCallback(): boolean {
    this.sleepingState = ESleeperState.SLEEPING;

    const sleepPatrol: Patrol = new patrol(this.state.pathMain);
    const position: Optional<Vector> = sleepPatrol.count() === 2 ? sleepPatrol.point(1) : null;

    setStalkerState(this.object, this.state.wakeable ? EStalkerState.SIT : EStalkerState.SLEEP, null, null, {
      lookPosition: position,
    });

    return true;
  }
}
