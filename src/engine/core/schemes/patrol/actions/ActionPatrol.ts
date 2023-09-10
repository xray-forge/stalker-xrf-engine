import { action_base, LuabindClass, time_global } from "xray16";

import { registry, setStalkerState } from "@/engine/core/database";
import { StalkerMoveManager } from "@/engine/core/objects/ai/state/StalkerMoveManager";
import { EStalkerState } from "@/engine/core/objects/animation/types";
import { ISchemePatrolState } from "@/engine/core/schemes/patrol";
import { parseWaypointsData } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { sendToNearestAccessibleVertex } from "@/engine/core/utils/object/object_location";
import { areSameVectors, createEmptyVector, createVector } from "@/engine/core/utils/vector";
import {
  ClientObject,
  EClientObjectPath,
  ISchemeEventHandler,
  TDistance,
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
  public readonly moveManager: StalkerMoveManager;

  public levelVertexId: TNumberId = -1;
  public dist: TDistance = 0;
  public dir: Vector = createVector(0, 0, 1);
  public currentState: EStalkerState = "cur_state" as unknown as EStalkerState; // todo: probably get rid
  public isOnPoint: boolean = false;
  public timeToUpdate: TTimestamp = time_global() + 1000;

  public constructor(state: ISchemePatrolState, object: ClientObject) {
    super(null, ActionPatrol.__name);
    this.state = state;
    this.moveManager = registry.objects.get(object.id()).moveManager!;
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

    if (this.state.path_walk_info === null) {
      this.state.path_walk_info = parseWaypointsData(this.state.path_walk);
    }

    if (this.state.path_look_info === null) {
      this.state.path_look_info = parseWaypointsData(this.state.path_look);
    }

    this.moveManager.reset(
      this.state.path_walk,
      this.state.path_walk_info!,
      this.state.path_look,
      this.state.path_look_info,
      this.state.team,
      this.state.suggested_state,
      { obj: this, func: this.formation_callback },
      null,
      null,
      null
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

    const [lvid, dir, currentState] = registry.patrols.generic.get(this.state.patrol_key).getObjectCommand(this.object);

    this.levelVertexId = lvid;
    this.dir = dir;
    this.currentState = currentState;

    this.levelVertexId = sendToNearestAccessibleVertex(this.object, this.levelVertexId);

    const desiredDirection: Vector = this.dir;

    if (desiredDirection !== null && !areSameVectors(desiredDirection, createEmptyVector())) {
      desiredDirection.normalize();
      this.object.set_desired_direction(desiredDirection);
    }

    this.object.set_path_type(EClientObjectPath.LEVEL_PATH);

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
  public formation_callback(mode: number, number: number, index: number): void {}

  /**
   * todo: Description.
   */
  public onDeath(object: ClientObject): void {
    registry.patrols.generic.get(this.state.patrol_key).removeObject(object);
  }

  /**
   * todo: Description.
   */
  public deactivate(object: ClientObject): void {
    registry.patrols.generic.get(this.state.patrol_key).removeObject(object);
  }

  /**
   * todo: Description.
   */
  public onSwitchOffline(object: ClientObject): void {
    this.deactivate(object);
  }
}
