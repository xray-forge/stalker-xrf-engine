import { action_base, LuabindClass, time_global } from "xray16";

import { registry, setStalkerState } from "@/engine/core/database";
import { StalkerPatrolManager } from "@/engine/core/objects/ai/state/StalkerPatrolManager";
import { EStalkerState, EWaypointArrivalType } from "@/engine/core/objects/animation/types";
import { ISchemePatrolState } from "@/engine/core/schemes/stalker/patrol";
import { patrolConfig } from "@/engine/core/schemes/stalker/patrol/PatrolConfig";
import { parseWaypointsData } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { sendToNearestAccessibleVertex } from "@/engine/core/utils/position";
import { areSameVectors, createEmptyVector, createVector } from "@/engine/core/utils/vector";
import {
  EGameObjectPath,
  GameObject,
  ISchemeEventHandler,
  Optional,
  TDistance,
  TIndex,
  TNumberId,
  TTimestamp,
  Vector,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Action patrol when objects should go to some specific place.
 */
@LuabindClass()
export class ActionPatrol extends action_base implements ISchemeEventHandler {
  public readonly state: ISchemePatrolState;
  public readonly moveManager: StalkerPatrolManager;

  public levelVertexId: TNumberId = -1;
  public dist: TDistance = 0;
  public dir: Vector = createVector(0, 0, 1);
  public currentState: EStalkerState = "cur_state" as unknown as EStalkerState; // todo: probably get rid
  public isOnPoint: boolean = false;
  public timeToUpdate: TTimestamp = time_global() + 1000;

  public constructor(state: ISchemePatrolState, object: GameObject) {
    super(null, ActionPatrol.__name);
    this.state = state;
    this.moveManager = registry.objects.get(object.id()).patrolManager!;
  }

  /**
   * todo: Description.
   */
  public override initialize(): void {
    super.initialize();

    this.object.set_desired_position();
    this.object.set_desired_direction();

    this.isOnPoint = false;
  }

  /**
   * todo: Description.
   */
  public activate(): void {
    this.state.signals = new LuaTable();

    if (this.state.pathWalkInfo === null) {
      this.state.pathWalkInfo = parseWaypointsData(this.state.pathWalk);
    }

    if (this.state.pathLookInfo === null) {
      this.state.pathLookInfo = parseWaypointsData(this.state.pathLook);
    }

    this.moveManager.reset(
      this.state.pathWalk,
      this.state.pathWalkInfo!,
      this.state.pathLook,
      this.state.pathLookInfo,
      this.state.team,
      this.state.suggestedState,
      { context: this, callback: this.onProcessWaypoint }
    );
  }

  /**
   * todo: Description.
   */
  public override execute(): void {
    super.execute();

    if (this.timeToUpdate - time_global() > 0) {
      return;
    }

    this.timeToUpdate = time_global() + 1000;

    const [lvid, dir, currentState] = patrolConfig.PATROLS.get(this.state.patrolKey).getObjectCommand(this.object);

    this.levelVertexId = lvid;
    this.dir = dir;
    this.currentState = currentState;

    this.levelVertexId = sendToNearestAccessibleVertex(this.object, this.levelVertexId);

    const desiredDirection: Vector = this.dir;

    if (desiredDirection !== null && !areSameVectors(desiredDirection, createEmptyVector())) {
      desiredDirection.normalize();
      this.object.set_desired_direction(desiredDirection);
    }

    this.object.set_path_type(EGameObjectPath.LEVEL_PATH);

    setStalkerState(this.object, this.currentState, null, null, null, null);
  }

  /**
   * todo: Description.
   */
  public override finalize(): void {
    if (this.object.alive()) {
      this.moveManager.finalize();
    }

    super.finalize();
  }

  /**
   * todo: Description.
   */
  public deactivate(object: GameObject): void {
    patrolConfig.PATROLS.get(this.state.patrolKey).removeObject(object);
  }

  /**
   * todo: Description.
   */
  public onProcessWaypoint(mode: EWaypointArrivalType, patrolRetVal: Optional<number>, index: TIndex): void {}

  /**
   * todo: Description.
   */
  public onDeath(object: GameObject): void {
    patrolConfig.PATROLS.get(this.state.patrolKey).removeObject(object);
  }

  /**
   * todo: Description.
   */
  public onSwitchOffline(object: GameObject): void {
    this.deactivate(object);
  }
}
