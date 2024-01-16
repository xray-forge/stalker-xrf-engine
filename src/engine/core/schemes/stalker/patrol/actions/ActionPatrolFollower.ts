import { action_base, LuabindClass, time_global } from "xray16";

import { StalkerPatrolManager } from "@/engine/core/ai/patrol/StalkerPatrolManager";
import { registry, setStalkerState } from "@/engine/core/database";
import { ISchemePatrolState } from "@/engine/core/schemes/stalker/patrol";
import { parseWaypointsData } from "@/engine/core/utils/ini";
import { sendToNearestAccessibleVertex } from "@/engine/core/utils/position";
import { areSameVectors, copyVector } from "@/engine/core/utils/vector";
import { ZERO_VECTOR } from "@/engine/lib/constants/vectors";
import { EGameObjectPath, GameObject, ISchemeEventHandler, TTimestamp } from "@/engine/lib/types";

/**
 * Action patrol when objects should go to some specific place.
 */
@LuabindClass()
export class ActionPatrolFollower extends action_base implements ISchemeEventHandler {
  public readonly state: ISchemePatrolState;
  public readonly patrolManager: StalkerPatrolManager;

  public nextUpdateAt: TTimestamp = time_global() + 1000;

  public constructor(state: ISchemePatrolState, object: GameObject) {
    super(null, ActionPatrolFollower.__name);

    this.state = state;
    this.patrolManager = registry.objects.get(object.id()).patrolManager!;
  }

  public override initialize(): void {
    super.initialize();

    this.object.set_desired_position();
    this.object.set_desired_direction();
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
      { context: this, callback: this.onProcessWaypoint }
    );
  }

  public override execute(): void {
    super.execute();

    const now: TTimestamp = time_global();

    if (now < this.nextUpdateAt) {
      return;
    }

    this.nextUpdateAt = now + 1000;

    const object: GameObject = this.object;
    const [lvid, direction, state] = this.state.patrolManager.getFollowerTarget(object);

    if (!areSameVectors(direction, ZERO_VECTOR)) {
      object.set_desired_direction(copyVector(direction).normalize());
    }

    object.set_path_type(EGameObjectPath.LEVEL_PATH);

    sendToNearestAccessibleVertex(object, lvid);
    setStalkerState(object, state);
  }

  public override finalize(): void {
    if (this.object.alive()) {
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
    this.state.patrolManager.unregisterObject(object);
  }

  /**
   * Handle waypoints in patrol processing callback.
   */
  public onProcessWaypoint(): void {}
}
