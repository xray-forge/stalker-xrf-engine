import { action_base, alife, anim, clsid, level, look, LuabindClass, move, object, time_global } from "xray16";

import { registry } from "@/engine/core/database";
import { TSimulationObject } from "@/engine/core/managers/simulation";
import { EStalkerState } from "@/engine/core/objects/animation";
import { Squad } from "@/engine/core/objects/server/squad/Squad";
import { ReachTaskPatrolManager } from "@/engine/core/schemes/reach_task/ReachTaskPatrolManager";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getObjectSquad, sendToNearestAccessibleVertex } from "@/engine/core/utils/object";
import { areSameVectors, createEmptyVector, createVector } from "@/engine/core/utils/vector";
import {
  ClientObject,
  EClientObjectMovementType,
  EClientObjectPath,
  Optional,
  TName,
  TNumberId,
  TTimestamp,
  Vector,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Action to adjust object movement type and movement direction.
 * Executed when objects are not in idle state, but moving to specific destination point.
 * Based on parent squad adjusts destination and formation of the squad participants.
 */
@LuabindClass()
export class ActionReachTaskLocation extends action_base {
  public nextUpdateAt: TTimestamp = 0;

  public reachTargetId!: TNumberId;
  public squadId!: TNumberId;

  public currentState!: EStalkerState;
  public formation!: TName;

  public levelVertexId!: TNumberId;
  public direction!: Vector;
  public distance!: TNumberId;

  public patrolManager: Optional<ReachTaskPatrolManager> = null;

  public constructor() {
    super(null, ActionReachTaskLocation.__name);
  }

  /**
   * Initialize action basing on current squad state / squad priorities.
   */
  public override initialize(): void {
    super.initialize();

    const objectSquad: Squad = getObjectSquad(this.object)!;

    logger.info("Start reach location action:", objectSquad.name(), this.object.name(), objectSquad.assignedTargetId);

    this.reachTargetId = objectSquad.assignedTargetId!;
    this.squadId = objectSquad.id;
    this.currentState = EStalkerState.PATROL;
    this.formation = "back";
    this.levelVertexId = -1;
    this.distance = 0;
    this.direction = createVector(0, 0, 1);
    this.nextUpdateAt = time_global() + 1000;

    this.object.set_desired_direction();
    this.object.set_movement_selection_type(EClientObjectMovementType.MASK);
    this.object.set_item(object.idle, this.object.best_weapon());
    this.object.set_body_state(move.standing);
    this.object.set_detail_path_type(move.line);
    this.object.set_mental_state(anim.free);
    this.object.set_movement_type(move.walk);

    const reachTarget: TSimulationObject = alife().object(this.reachTargetId)!;

    this.object.set_dest_game_vertex_id(reachTarget.m_game_vertex_id);
    this.object.set_path_type(EClientObjectPath.GAME_PATH);
    this.object.inactualize_patrol_path();
    this.object.set_sight(look.path_dir, null, 0);

    // Add to patrol init.
    if (registry.patrols.reachTask.get(this.squadId) === null) {
      registry.patrols.reachTask.set(this.squadId, new ReachTaskPatrolManager(this.squadId));
    }

    this.patrolManager = registry.patrols.reachTask.get(objectSquad.id);
    this.patrolManager.addObjectToPatrol(this.object);
  }

  /**
   * todo: Description.
   */
  public override execute(): void {
    const now: TTimestamp = time_global();

    if (this.nextUpdateAt - now > 0) {
      return;
    } else {
      this.nextUpdateAt = now + 1000;
    }

    const objectSquad: Squad = getObjectSquad(this.object) as Squad;

    if (objectSquad.assignedTargetId !== this.reachTargetId) {
      logger.info("Updating reach task target:", this.reachTargetId, "->", objectSquad.assignedTargetId, "$");

      this.reachTargetId = objectSquad.assignedTargetId!;
    }

    let squadTarget: Optional<TSimulationObject> = registry.simulationObjects.get(objectSquad.assignedTargetId!);

    if (squadTarget === null && objectSquad.getLogicsScriptTarget() !== null) {
      squadTarget = alife().object(objectSquad.assignedTargetId!);
    }

    if (this.object.id() === (getObjectSquad(this.object) as Squad).commander_id()) {
      this.executeSquadCommander(objectSquad, squadTarget);
    } else {
      this.executeSquadSoldier(objectSquad, squadTarget);
    }

    super.execute();
  }

  /**
   * todo: Description.
   */
  public override finalize(): void {
    this.object.set_movement_selection_type(EClientObjectMovementType.RANDOM);
    super.finalize();

    logger.info("Finalize reach task action:", this.object.name());
  }

  /**
   * todo: Description.
   */
  public executeSquadCommander(squad: Squad, squadTarget: Optional<TSimulationObject>): void {
    if (squadTarget !== null && !this.object.is_talking()) {
      const gvi: TNumberId = squadTarget.m_game_vertex_id;
      let lvi: TNumberId = squadTarget.m_level_vertex_id;
      let position: Vector = squadTarget.position;

      if (this.object.game_vertex_id() !== gvi) {
        this.object.set_path_type(EClientObjectPath.GAME_PATH);
        this.object.set_dest_game_vertex_id(gvi);
        this.object.set_sight(look.path_dir, null, 0);

        updateObjectMovement(this.object, squadTarget);

        registry.patrols.reachTask.get(this.squadId).setObjectOrders(this.object, this.currentState, this.formation);

        return;
      }

      this.object.set_path_type(EClientObjectPath.LEVEL_PATH);

      if (!this.object.accessible(position)) {
        lvi = this.object.accessible_nearest(position, createEmptyVector());
        position = level.vertex_position(lvi);
      }

      this.object.set_sight(look.path_dir, null, 0);
      this.object.set_dest_level_vertex_id(lvi);
      this.object.set_desired_position(position);
    }

    updateObjectMovement(this.object, squadTarget);

    registry.patrols.reachTask.get(this.squadId).setObjectOrders(this.object, this.currentState, this.formation);
  }

  /**
   * todo: Description.
   */
  public executeSquadSoldier(objectSquad: Squad, squadTarget: Optional<TSimulationObject>): void {
    const [lvi, direction, currentState] = registry.patrols.reachTask.get(this.squadId).getObjectOrders(this.object);

    this.direction = direction;
    this.currentState = currentState!;
    this.levelVertexId = sendToNearestAccessibleVertex(this.object, lvi);

    const desiredDirection: Vector = this.direction;

    if (desiredDirection !== null && !areSameVectors(desiredDirection, createEmptyVector())) {
      desiredDirection.normalize();
      this.object.set_desired_direction(desiredDirection);
    }

    this.object.set_path_type(EClientObjectPath.LEVEL_PATH);

    if (squadTarget === null || squadTarget.clsid() === clsid.online_offline_group_s || registry.isSurgeStarted) {
      this.object.set_movement_type(level.object_by_id(objectSquad.commander_id())!.movement_type());
      this.object.set_mental_state(level.object_by_id(objectSquad.commander_id())!.mental_state());

      return;
    }

    if (level.object_by_id(getObjectSquad(this.object)!.commander_id())!.movement_type() === move.stand) {
      this.levelVertexId = sendToNearestAccessibleVertex(this.object, this.levelVertexId);
      this.object.set_movement_type(move.stand);

      return;
    }

    if (level.vertex_position(this.levelVertexId).distance_to_sqr(this.object.position()) > 25) {
      this.object.set_movement_type(move.run);
    } else {
      this.object.set_movement_type(move.walk);
    }
  }

  /**
   * todo: Description.
   */
  public onDeath(object: ClientObject): void {
    this.patrolManager?.removeObjectFromPatrol(object);
  }

  /**
   * todo: Description.
   */
  public net_destroy(object: ClientObject): void {
    this.patrolManager?.removeObjectFromPatrol(object);
  }
}

/**
 * todo;
 */
function updateObjectMovement(object: ClientObject, target: Optional<TSimulationObject>): void {
  if (target !== null && !object.is_talking()) {
    if (registry.isSurgeStarted) {
      object.set_movement_type(move.run);
      object.set_mental_state(anim.free);

      return;
    }

    if (target.clsid() === clsid.online_offline_group_s) {
      object.set_movement_type(move.run);
      if (target.position.distance_to_sqr(object.position()) <= 10_000) {
        object.set_mental_state(anim.danger);
      } else {
        object.set_mental_state(anim.free);
      }
    } else {
      object.set_movement_type(move.walk);
      object.set_mental_state(anim.free);
    }
  } else {
    object.set_movement_type(move.stand);
  }
}
