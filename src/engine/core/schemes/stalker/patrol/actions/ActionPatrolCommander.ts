import { action_base, LuabindClass } from "xray16";

import { EPatrolFormation } from "@/engine/core/ai/patrol";
import { StalkerPatrolManager } from "@/engine/core/ai/patrol/StalkerPatrolManager";
import { EStalkerState, EWaypointArrivalType } from "@/engine/core/animation/types";
import { getManager, getStalkerState, registry } from "@/engine/core/database";
import { SoundManager } from "@/engine/core/managers/sounds/SoundManager";
import { ISchemePatrolState } from "@/engine/core/schemes/stalker/patrol";
import { parseWaypointsData } from "@/engine/core/utils/ini";
import { GameObject, ISchemeEventHandler, Optional } from "@/engine/lib/types";

/**
 * Action to command patrol/group of stalker on way somewhere.
 */
@LuabindClass()
export class ActionPatrolCommander extends action_base implements ISchemeEventHandler {
  public readonly state: ISchemePatrolState;
  public readonly patrolManager: StalkerPatrolManager;

  public currentState: EStalkerState = EStalkerState.PATROL;
  public previousState: Optional<EStalkerState> = null;

  public constructor(state: ISchemePatrolState, object: GameObject) {
    super(null, ActionPatrolCommander.__name);

    this.state = state;
    this.patrolManager = registry.objects.get(object.id()).patrolManager as StalkerPatrolManager;
  }

  public override initialize(): void {
    super.initialize();

    this.object.set_desired_position();
    this.object.set_desired_direction();

    this.activate();
  }

  public activate(): void {
    this.state.signals = new LuaTable();

    if (!this.state.pathWalkInfo) {
      this.state.pathWalkInfo = parseWaypointsData(this.state.pathWalk);
    }

    if (!this.state.pathLookInfo) {
      this.state.pathLookInfo = parseWaypointsData(this.state.pathLook);
    }

    this.patrolManager.reset(
      this.state.pathWalk,
      this.state.pathWalkInfo,
      this.state.pathLook,
      this.state.pathLookInfo,
      this.state.team,
      this.state.suggestedState,
      { context: this, callback: this.onProcessPoint }
    );

    this.state.patrolManager.setCommanderState(this.object, this.currentState, this.state.formation);
  }

  public override execute(): void {
    super.execute();

    this.patrolManager.update();

    const previousState: Optional<EStalkerState> = this.previousState;
    const state: EStalkerState = getStalkerState(this.object) as EStalkerState;

    if (previousState !== state) {
      // Play patrol action start sound.
      if (!this.state.silent) {
        const soundManager: SoundManager = getManager(SoundManager);

        if (state === EStalkerState.SNEAK) {
          soundManager.play(this.object.id(), "patrol_sneak");
        } else if (
          state === EStalkerState.SNEAK_RUN ||
          state === EStalkerState.RUN ||
          state === EStalkerState.ASSAULT ||
          state === EStalkerState.RUSH
        ) {
          soundManager.play(this.object.id(), "patrol_run");
        } else if (
          previousState === EStalkerState.SNEAK ||
          previousState === EStalkerState.SNEAK_RUN ||
          previousState === EStalkerState.RUN ||
          previousState === EStalkerState.ASSAULT ||
          previousState === EStalkerState.RUSH
        ) {
          soundManager.play(this.object.id(), "patrol_walk");
        }
      }

      this.previousState = state;
    }

    this.state.patrolManager.setCommanderState(this.object, state, this.state.formation);
  }

  public override finalize(): void {
    if (this.object.alive()) {
      this.state.patrolManager.setCommanderState(this.object, EStalkerState.GUARD, this.state.formation);
      this.patrolManager.finalize();
    }

    super.finalize();
  }

  public deactivate(object: GameObject): void {
    this.state.patrolManager.unregisterObject(object);
  }

  public onDeath(object: GameObject): void {
    this.state.patrolManager.unregisterObject(object);
  }

  public onSwitchOffline(object: GameObject): void {
    this.deactivate(object);
  }

  /**
   * Handle waypoints in patrol processing callback.
   *
   * @param mode - waypoint arrival mode
   * @param returnValue - patrol waypoint processing result value
   */
  public onProcessPoint(mode: EWaypointArrivalType, returnValue: Optional<number>): void {
    switch (returnValue) {
      case 0:
        this.state.formation = EPatrolFormation.LINE;
        break;

      case 1:
        this.state.formation = EPatrolFormation.AROUND;
        break;

      case 2:
        this.state.formation = EPatrolFormation.BACK;
        break;
    }
  }
}
