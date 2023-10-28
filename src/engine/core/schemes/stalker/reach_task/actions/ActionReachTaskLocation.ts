import { action_base, anim, level, look, LuabindClass, move, object, time_global } from "xray16";

import { registry } from "@/engine/core/database";
import { TSimulationObject } from "@/engine/core/managers/simulation";
import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import { EStalkerState } from "@/engine/core/objects/animation/types";
import { Squad } from "@/engine/core/objects/server/squad/Squad";
import { reachTaskConfig } from "@/engine/core/schemes/stalker/reach_task/ReachTaskConfig";
import { ReachTaskPatrolManager } from "@/engine/core/schemes/stalker/reach_task/ReachTaskPatrolManager";
import { updateObjectReachTaskMovement } from "@/engine/core/schemes/stalker/reach_task/utils";
import { isSquad } from "@/engine/core/utils/class_ids";
import { LuaLogger } from "@/engine/core/utils/logging";
import { sendToNearestAccessibleVertex } from "@/engine/core/utils/position";
import { getObjectSquad } from "@/engine/core/utils/squad/squad_get";
import { areSameVectors, createEmptyVector } from "@/engine/core/utils/vector";
import { Z_VECTOR } from "@/engine/lib/constants/vectors";
import {
  EGameObjectMovementType,
  EGameObjectPath,
  GameObject,
  ISchemeEventHandler,
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
export class ActionReachTaskLocation extends action_base implements ISchemeEventHandler {
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
    this.direction = Z_VECTOR;
    this.nextUpdateAt = time_global() + 1000;

    this.object.set_desired_direction();
    this.object.set_movement_selection_type(EGameObjectMovementType.MASK);
    this.object.set_item(object.idle, this.object.best_weapon());
    this.object.set_body_state(move.standing);
    this.object.set_detail_path_type(move.line);
    this.object.set_mental_state(anim.free);
    this.object.set_movement_type(move.walk);

    const reachTarget: TSimulationObject = registry.simulator.object(this.reachTargetId)!;

    this.object.set_dest_game_vertex_id(reachTarget.m_game_vertex_id);
    this.object.set_path_type(EGameObjectPath.GAME_PATH);
    this.object.inactualize_patrol_path();
    this.object.set_sight(look.path_dir, null, 0);

    // Add to patrol init.
    if (reachTaskConfig.PATROLS.get(this.squadId) === null) {
      reachTaskConfig.PATROLS.set(this.squadId, new ReachTaskPatrolManager(this.squadId));
    }

    this.patrolManager = reachTaskConfig.PATROLS.get(objectSquad.id);
    this.patrolManager.addObjectToPatrol(this.object);
  }

  /**
   * todo: Description.
   */
  public override execute(): void {
    const now: TTimestamp = time_global();

    if (now < this.nextUpdateAt) {
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
      squadTarget = registry.simulator.object(objectSquad.assignedTargetId!);
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
    super.finalize();
    this.object.set_movement_selection_type(EGameObjectMovementType.RANDOM);

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
        this.object.set_path_type(EGameObjectPath.GAME_PATH);
        this.object.set_dest_game_vertex_id(gvi);
        this.object.set_sight(look.path_dir, null, 0);

        updateObjectReachTaskMovement(this.object, squadTarget);

        reachTaskConfig.PATROLS.get(this.squadId).setObjectOrders(this.object, this.currentState, this.formation);

        return;
      }

      this.object.set_path_type(EGameObjectPath.LEVEL_PATH);

      if (!this.object.accessible(position)) {
        [lvi] = this.object.accessible_nearest(position, createEmptyVector());
        position = level.vertex_position(lvi);
      }

      this.object.set_sight(look.path_dir, null, 0);
      this.object.set_dest_level_vertex_id(lvi);
      this.object.set_desired_position(position);
    }

    updateObjectReachTaskMovement(this.object, squadTarget);

    reachTaskConfig.PATROLS.get(this.squadId).setObjectOrders(this.object, this.currentState, this.formation);
  }

  /**
   * todo: Description.
   */
  public executeSquadSoldier(objectSquad: Squad, squadTarget: Optional<TSimulationObject>): void {
    const [lvi, direction, currentState] = reachTaskConfig.PATROLS.get(this.squadId).getObjectOrders(this.object);

    this.direction = direction;
    this.currentState = currentState!;
    this.levelVertexId = sendToNearestAccessibleVertex(this.object, lvi);

    const desiredDirection: Vector = this.direction;

    if (desiredDirection !== null && !areSameVectors(desiredDirection, createEmptyVector())) {
      desiredDirection.normalize();
      this.object.set_desired_direction(desiredDirection);
    }

    this.object.set_path_type(EGameObjectPath.LEVEL_PATH);

    if (squadTarget === null || isSquad(squadTarget) || surgeConfig.IS_STARTED) {
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
  public onDeath(object: GameObject): void {
    this.patrolManager?.removeObjectFromPatrol(object);
  }

  /**
   * todo: Description.
   */
  public onSwitchOffline(object: GameObject): void {
    this.patrolManager?.removeObjectFromPatrol(object);
  }
}
