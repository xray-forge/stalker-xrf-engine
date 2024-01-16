import { level } from "xray16";

import { EPatrolFormation } from "@/engine/core/ai/patrol";
import { EStalkerState } from "@/engine/core/animation/types";
import { IFormationObjectDescriptor, IPatrolObjectDescriptor } from "@/engine/core/schemes/stalker/patrol/patrol_types";
import { patrolConfig } from "@/engine/core/schemes/stalker/patrol/PatrolConfig";
import { abort } from "@/engine/core/utils/assertion";
import { copyVector, vectorCross, vectorRotateY, yawDegree } from "@/engine/core/utils/vector";
import { X_VECTOR, Z_VECTOR, ZERO_VECTOR } from "@/engine/lib/constants/vectors";
import {
  GameObject,
  LuaArray,
  Optional,
  TCount,
  TDistance,
  TIndex,
  TName,
  TNumberId,
  TRate,
  Vector,
} from "@/engine/lib/types";

/**
 * Manager for generic patrol scheme objects.
 */
export class PatrolManager {
  public name: TName;
  public state: EStalkerState = EStalkerState.PATROL;
  public formation: EPatrolFormation = EPatrolFormation.BACK;
  public commanderId: Optional<TNumberId> = null;
  public objects: LuaTable<TNumberId, IPatrolObjectDescriptor> = new LuaTable();

  public constructor(name: TName) {
    this.name = name;
  }

  /**
   * @param object - object to register in patrol
   * @param isCommander - whether object should become patrol commander
   */
  public registerObject(object: GameObject, isCommander: Optional<boolean> = null): void {
    if (!object.alive() || this.objects.has(object.id())) {
      return;
    }

    const objectsCount: TCount = table.size(this.objects) + 1;

    if (objectsCount >= 7) {
      abort("Attempt to add more than 7 objects in patrol manager, '%s' in '%s'.", object.name(), this.name);
    }

    if (isCommander || objectsCount === 1) {
      this.commanderId = object.id();
    }

    this.objects.set(object.id(), { object, direction: X_VECTOR, distance: 0 });

    this.resetFormationPositions();
  }

  /**
   * @param object - object to unregister from patrol
   */
  public unregisterObject(object: GameObject): void {
    if (this.objects.has(object.id())) {
      this.objects.delete(object.id());

      if (object.id() === this.commanderId) {
        this.commanderId = null;
        this.resetFormationPositions();
      }
    }
  }

  /**
   * @param formation - formation type to set in current patrol
   */
  public setFormation(formation: EPatrolFormation): void {
    this.formation = formation;
    this.resetFormationPositions();
  }

  /**
   * Reset positions of currently registered objects to use correct formation.
   */
  public resetFormationPositions(): void {
    const formationPositions: LuaArray<IFormationObjectDescriptor> = patrolConfig.FORMATIONS.get(this.formation);

    let index: TIndex = 1;

    for (const [id, descriptor] of this.objects) {
      // First position is reserved for commander.
      if (index === 1 && !this.commanderId) {
        this.commanderId = id;
      }

      if (id === this.commanderId) {
        descriptor.direction = X_VECTOR;
        descriptor.distance = 0;
      } else {
        const formationDescriptor: IFormationObjectDescriptor = formationPositions.get(index);

        descriptor.direction = formationDescriptor.direction;
        descriptor.distance = formationDescriptor.distance;

        index += 1;
      }
    }
  }

  /**
   * Set state of current patrol commander object.
   */
  public setCommanderState(object: GameObject, state: EStalkerState, formation: EPatrolFormation): void {
    if (!object.alive()) {
      return this.unregisterObject(object);
    }

    if (this.commanderId === object.id()) {
      this.state = state;

      if (this.formation !== formation) {
        this.setFormation(formation);
      }
    }
  }

  /**
   * @param object - game object to get target state for
   * @returns tuple with level vertex id, direction and animation state
   */
  public getFollowerTarget(object: GameObject): LuaMultiReturn<[TNumberId, Vector, EStalkerState]> {
    const objectId: TNumberId = object.id();

    if (this.commanderId === objectId) {
      abort("Patrol method 'getFollowerTarget' failed in '%s', tried to get commander target.", this.name);
    } else if (this.commanderId === null) {
      abort("Patrol method 'getFollowerTarget' failed without commander, '%s'.", this.name);
    }

    const commander: GameObject = this.objects.get(this.commanderId).object;
    const descriptor: IPatrolObjectDescriptor = this.objects.get(objectId);
    const position: Vector = descriptor.object.position();
    const direction: Vector = copyVector(commander.direction());
    const distance: TDistance = commander.position().distance_to(position);

    let angle: TRate = yawDegree(descriptor.direction, Z_VECTOR);

    if (vectorCross(descriptor.direction, Z_VECTOR).y < 0) {
      angle = -angle;
    }

    direction.y = 0;
    direction.normalize();

    let commanderVertexId: TNumberId = commander.location_on_path(5, ZERO_VECTOR);

    // Follow commander if target vertex is too far.
    if (level.vertex_position(commanderVertexId).distance_to(position) > 5) {
      commanderVertexId = commander.level_vertex_id();
    }

    const targetVertexId: TNumberId = level.vertex_in_direction(
      level.vertex_in_direction(commanderVertexId, vectorRotateY(direction, angle), descriptor.distance),
      direction,
      2
    );

    // Try to accelerate in patrol, too far from leader.
    if (distance > descriptor.distance + 2) {
      const acceleratedState: Optional<EStalkerState> = patrolConfig.ACCELERATION_BY_STATE.get(this.state);

      if (acceleratedState) {
        return $multi(targetVertexId, direction, acceleratedState);
      }
    }

    return $multi(targetVertexId, direction, this.state);
  }
}
