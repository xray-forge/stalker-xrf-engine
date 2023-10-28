import { action_base, anim, level, look, LuabindClass, move, object, time_global } from "xray16";

import { EPatrolFormation } from "@/engine/core/ai/patrol";
import { EStalkerState } from "@/engine/core/animation/types";
import { registry } from "@/engine/core/database";
import { TSimulationObject } from "@/engine/core/managers/simulation";
import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import { Squad } from "@/engine/core/objects/squad/Squad";
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

  public patrolManager!: ReachTaskPatrolManager;

  public currentState: EStalkerState = EStalkerState.PATROL;
  public formation: EPatrolFormation = EPatrolFormation.BACK;

  public reachTargetId!: TNumberId;
  public squadId!: TNumberId;
  public levelVertexId: TNumberId = -1;
  public direction: Vector = Z_VECTOR;
  public distance: TNumberId = 0;

  public constructor() {
    super(null, ActionReachTaskLocation.__name);
  }

  /**
   * Initialize action basing on current squad state / squad priorities.
   */
  public override initialize(): void {
    super.initialize();

    const gameObject: GameObject = this.object;
    const objectSquad: Squad = getObjectSquad(gameObject) as Squad;
    const reachTarget: TSimulationObject = registry.simulator.object(
      objectSquad.assignedTargetId as TNumberId
    ) as TSimulationObject;

    logger.info("Start reach location action:", objectSquad.name(), gameObject.name(), objectSquad.assignedTargetId);

    this.reachTargetId = objectSquad.assignedTargetId!;
    this.squadId = objectSquad.id;
    this.currentState = EStalkerState.PATROL;
    this.formation = EPatrolFormation.BACK;
    this.levelVertexId = -1;
    this.distance = 0;
    this.direction = Z_VECTOR;
    this.nextUpdateAt = time_global() + 1000; // todo: should be 0 for instant update reset?

    gameObject.set_desired_direction();
    gameObject.set_movement_selection_type(EGameObjectMovementType.MASK);
    gameObject.set_item(object.idle, gameObject.best_weapon());
    gameObject.set_body_state(move.standing);
    gameObject.set_detail_path_type(move.line);
    gameObject.set_mental_state(anim.free);
    gameObject.set_movement_type(move.walk);
    gameObject.set_dest_game_vertex_id(reachTarget.m_game_vertex_id);
    gameObject.set_path_type(EGameObjectPath.GAME_PATH);
    gameObject.inactualize_patrol_path();
    gameObject.set_sight(look.path_dir, null, 0);

    // Add to patrol init.
    if (reachTaskConfig.PATROLS.get(this.squadId) === null) {
      reachTaskConfig.PATROLS.set(this.squadId, new ReachTaskPatrolManager(this.squadId));
    }

    this.patrolManager = reachTaskConfig.PATROLS.get(objectSquad.id);
    this.patrolManager.addObjectToPatrol(gameObject);
  }

  /**
   * todo: Description.
   */
  public override execute(): void {
    const now: TTimestamp = time_global();

    if (now < this.nextUpdateAt) {
      return;
    } else {
      this.nextUpdateAt = now + reachTaskConfig.PATROL_UPDATE_PERIOD;
    }

    const squad: Squad = getObjectSquad(this.object) as Squad;

    if (squad.assignedTargetId !== this.reachTargetId) {
      this.reachTargetId = squad.assignedTargetId!;
    }

    let target: Optional<TSimulationObject> = registry.simulationObjects.get(squad.assignedTargetId!);

    if (target === null && squad.getLogicsScriptTarget() !== null) {
      target = registry.simulator.object(squad.assignedTargetId!);
    }

    if (this.object.id() === squad.commander_id()) {
      this.executeSquadCommander(squad, target);
    } else {
      this.executeSquadSoldier(squad, target);
    }

    super.execute();
  }

  /**
   * Stop reaching target and clean up object state.
   */
  public override finalize(): void {
    super.finalize();
    this.object.set_movement_selection_type(EGameObjectMovementType.RANDOM);

    logger.info("Finalize reach task action:", this.object.name());
  }

  /**
   * todo: Description.
   */
  public executeSquadCommander(squad: Squad, target: Optional<TSimulationObject>): void {
    if (target !== null && !this.object.is_talking()) {
      const gvi: TNumberId = target.m_game_vertex_id;
      let lvi: TNumberId = target.m_level_vertex_id;
      let position: Vector = target.position;

      if (this.object.game_vertex_id() !== gvi) {
        this.object.set_path_type(EGameObjectPath.GAME_PATH);
        this.object.set_dest_game_vertex_id(gvi);
        this.object.set_sight(look.path_dir, null, 0);

        updateObjectReachTaskMovement(this.object, target);

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

    updateObjectReachTaskMovement(this.object, target);

    reachTaskConfig.PATROLS.get(this.squadId).setObjectOrders(this.object, this.currentState, this.formation);
  }

  /**
   * todo: Description.
   */
  public executeSquadSoldier(squad: Squad, target: Optional<TSimulationObject>): void {
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

    if (target === null || isSquad(target) || surgeConfig.IS_STARTED) {
      this.object.set_movement_type(level.object_by_id(squad.commander_id())!.movement_type());
      this.object.set_mental_state(level.object_by_id(squad.commander_id())!.mental_state());

      return;
    }

    if (level.object_by_id(getObjectSquad(this.object)!.commander_id())!.movement_type() === move.stand) {
      this.levelVertexId = sendToNearestAccessibleVertex(this.object, this.levelVertexId);
      this.object.set_movement_type(move.stand);

      return;
    }

    this.object.set_movement_type(
      level.vertex_position(this.levelVertexId).distance_to_sqr(this.object.position()) > 25 ? move.run : move.walk
    );
  }

  /**
   * Handle object death.
   * Unregister it from active patrol.
   *
   * @param object - target game object to switch
   */
  public onDeath(object: GameObject): void {
    if (!this.patrolManager) {
      return;
    }

    this.patrolManager.removeObjectFromPatrol(object);
  }

  /**
   * Handle object switching offline.
   * Unregister it from active patrol.
   *
   * @param object - target game object to switch
   */
  public onSwitchOffline(object: GameObject): void {
    if (!this.patrolManager) {
      return;
    }

    this.patrolManager.removeObjectFromPatrol(object);
  }
}
