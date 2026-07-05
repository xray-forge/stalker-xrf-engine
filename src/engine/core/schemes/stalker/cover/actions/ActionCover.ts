import { action_base, level, LuabindClass } from "xray16";
import { CoverPoint, EGameObjectPath, Vector } from "xray16/alias";
import { $isNil, $isNotNil } from "xray16/macros";

import { EStalkerState } from "@/engine/core/animation/types";
import { getManager, registry, setStalkerState } from "@/engine/core/database";
import { getSimulationTerrainByName } from "@/engine/core/managers/simulation/utils";
import { SoundManager } from "@/engine/core/managers/sounds/SoundManager";
import { ISchemeCoverState } from "@/engine/core/schemes/stalker/cover";
import { pickSectionFromCondList } from "@/engine/core/utils/ini";
import { areSameVectors, createVector, subVectors } from "@/engine/core/utils/vector";
import { ZERO_VECTOR } from "@/engine/lib/constants/vectors";
import { ISchemeEventHandler, Nillable, TDistance, TNumberId } from "@/engine/lib/types";

/**
 * Find cover and hide action.
 */
@LuabindClass()
export class ActionCover extends action_base implements ISchemeEventHandler {
  public readonly state: ISchemeCoverState;

  public enemyRandomPosition: Nillable<Vector> = null;
  public coverVertexId!: TNumberId;
  public coverPosition!: Vector;

  public constructor(state: ISchemeCoverState) {
    super(null, ActionCover.__name);
    this.state = state;
  }

  /**
   * Execute the action logic on planner update.
   *
   * Go to cover location if it is not reached.
   * In other cases sit in it and play desired animation.
   */
  public override execute(): void {
    if (this.coverPosition.distance_to_sqr(this.object.position()) <= 0.4) {
      const targetState: Nillable<EStalkerState> = pickSectionFromCondList(
        registry.actor,
        this.object,
        this.state.animationConditionList
      );

      setStalkerState(this.object, targetState!, null, null, {
        lookPosition: this.enemyRandomPosition,
      });
    } else {
      this.object.set_dest_level_vertex_id(this.coverVertexId);
      setStalkerState(this.object, EStalkerState.ASSAULT);
    }

    // Play idle state sounds from stalkers like complaining etc.
    // While in cover or while approaching.
    if ($isNotNil(this.state.soundIdle)) {
      getManager(SoundManager).play(this.object.id(), this.state.soundIdle);
    }

    super.execute();
  }

  /**
   * Handle scheme activation event.
   *
   * Pick a random nearby cover point around the smart terrain and send the object toward it.
   */
  public activate(): void {
    this.state.signals = new LuaTable();

    const smartTerrainVertexId: TNumberId = getSimulationTerrainByName(this.state.smartTerrainName)!.m_level_vertex_id;

    const directionVector: Vector = createVector(math.random(-100, 100), 0, math.random(-100, 100));
    const baseVertexId: TNumberId = level.vertex_in_direction(
      smartTerrainVertexId,
      directionVector,
      math.random(this.state.radiusMin, this.state.radiusMax)
    );
    const thisRandomPosition: Vector = level.vertex_position(baseVertexId);

    this.enemyRandomPosition = thisRandomPosition;

    let cover: Nillable<CoverPoint> = null;
    let coverDistance: TDistance = 2;

    while ($isNil(cover) && coverDistance <= 4) {
      cover = this.object.best_cover(thisRandomPosition, this.enemyRandomPosition, coverDistance, 1, 150);
      coverDistance += 1;
    }

    if (cover) {
      this.coverVertexId = cover.level_vertex_id();
      this.coverPosition = cover.position();
    } else {
      this.coverVertexId = baseVertexId;
      this.coverPosition = thisRandomPosition;
    }

    if (!this.object.accessible(this.coverPosition)) {
      [this.coverVertexId, this.coverPosition] = this.object.accessible_nearest(this.coverPosition, ZERO_VECTOR);
    }

    const desiredDirection: Vector = subVectors(this.coverPosition, this.enemyRandomPosition);

    if (desiredDirection && !areSameVectors(desiredDirection, ZERO_VECTOR)) {
      desiredDirection.normalize();
      this.object.set_desired_direction(desiredDirection);
    }

    this.object.set_path_type(EGameObjectPath.LEVEL_PATH);
    this.object.set_dest_level_vertex_id(this.coverVertexId);

    setStalkerState(this.object, EStalkerState.ASSAULT);
  }
}
