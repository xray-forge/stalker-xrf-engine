import { action_base, level, LuabindClass } from "xray16";

import { EStalkerState } from "@/engine/core/animation/types";
import { getManager, registry, setStalkerState } from "@/engine/core/database";
import { SimulationManager } from "@/engine/core/managers/simulation/SimulationManager";
import { SoundManager } from "@/engine/core/managers/sounds/SoundManager";
import { ISchemeCoverState } from "@/engine/core/schemes/stalker/cover";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/ini_config";
import { areSameVectors, createVector, subVectors } from "@/engine/core/utils/vector";
import { ZERO_VECTOR } from "@/engine/lib/constants/vectors";
import {
  CoverPoint,
  EGameObjectPath,
  ISchemeEventHandler,
  Optional,
  TDistance,
  TNumberId,
  Vector,
} from "@/engine/lib/types";

/**
 * Find cover and hide action.
 */
@LuabindClass()
export class ActionCover extends action_base implements ISchemeEventHandler {
  public readonly state: ISchemeCoverState;

  public enemyRandomPosition: Optional<Vector> = null;
  public coverVertexId!: TNumberId;
  public coverPosition!: Vector;

  public constructor(state: ISchemeCoverState) {
    super(null, ActionCover.__name);
    this.state = state;
  }

  /**
   * todo: Description.
   *
   * Go to cover location if it is not reached.
   * In other cases sit in it and play desired animation.
   */
  public override execute(): void {
    if (this.coverPosition.distance_to_sqr(this.object.position()) <= 0.4) {
      const targetState: Optional<EStalkerState> = pickSectionFromCondList(
        registry.actor,
        this.object,
        this.state.animationConditionList
      );

      setStalkerState(this.object, targetState!, null, null, {
        lookPosition: this.enemyRandomPosition,
      });

      // Play idle state sounds from stalkers like complaining etc.
      if (this.state.soundIdle !== null) {
        getManager(SoundManager).playSound(this.object.id(), this.state.soundIdle);
      }
    } else {
      this.object.set_dest_level_vertex_id(this.coverVertexId);
      setStalkerState(this.object, EStalkerState.ASSAULT);
    }

    super.execute();
  }

  /**
   * Handle scheme activation event.
   * todo: Description.
   */
  public activate(): void {
    this.state.signals = new LuaTable();

    const smartTerrainVertexId: TNumberId = getManager(SimulationManager).getSmartTerrainByName(
      this.state.smartTerrainName
    )!.m_level_vertex_id;

    const directionVector: Vector = createVector(math.random(-100, 100), 0, math.random(-100, 100));
    const baseVertexId: TNumberId = level.vertex_in_direction(
      smartTerrainVertexId,
      directionVector,
      math.random(this.state.radiusMin, this.state.radiusMax)
    );
    const thisRandomPosition: Vector = level.vertex_position(baseVertexId);

    this.enemyRandomPosition = thisRandomPosition;

    let cover: Optional<CoverPoint> = null;
    let coverDistance: TDistance = 2;

    while (cover === null && coverDistance <= 4) {
      cover = this.object.best_cover(thisRandomPosition, this.enemyRandomPosition, coverDistance, 1, 150);
      coverDistance += 1;
    }

    if (cover === null) {
      this.coverVertexId = baseVertexId;
      this.coverPosition = thisRandomPosition;
    } else {
      this.coverVertexId = cover.level_vertex_id();
      this.coverPosition = cover.position();
    }

    if (!this.object.accessible(this.coverPosition)) {
      [this.coverVertexId, this.coverPosition] = this.object.accessible_nearest(this.coverPosition, ZERO_VECTOR);
    }

    const desiredDirection: Vector = subVectors(this.coverPosition, this.enemyRandomPosition);

    if (desiredDirection !== null && !areSameVectors(desiredDirection, ZERO_VECTOR)) {
      desiredDirection.normalize();
      this.object.set_desired_direction(desiredDirection);
    }

    this.object.set_path_type(EGameObjectPath.LEVEL_PATH);
    this.object.set_dest_level_vertex_id(this.coverVertexId);

    setStalkerState(this.object, EStalkerState.ASSAULT);
  }
}
