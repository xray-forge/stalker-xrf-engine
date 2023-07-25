import { action_base, level, LuabindClass } from "xray16";

import { registry, setStalkerState } from "@/engine/core/database";
import { SimulationBoardManager } from "@/engine/core/managers/interaction/SimulationBoardManager";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { EStalkerState } from "@/engine/core/objects/animation";
import { ISchemeCoverState } from "@/engine/core/schemes/cover";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/ini_config";
import { areSameVectors, createEmptyVector, createVector, subVectors } from "@/engine/core/utils/vector";
import { CoverPoint, EClientObjectPath, Optional, TDistance, TNumberId, Vector } from "@/engine/lib/types";

/**
 * Find cover and hide action.
 */
@LuabindClass()
export class ActionCover extends action_base {
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
   */
  public override execute(): void {
    if (this.coverPosition.distance_to_sqr(this.object.position()) <= 0.4) {
      const targetState: Optional<EStalkerState> = pickSectionFromCondList(
        registry.actor,
        this.object,
        this.state.animationConditionList
      );

      setStalkerState(
        this.object,
        targetState!,
        null,
        null,
        { lookPosition: this.enemyRandomPosition, lookObject: null },
        null
      );
    } else {
      this.object.set_dest_level_vertex_id(this.coverVertexId);
      setStalkerState(this.object, EStalkerState.ASSAULT);
    }

    if (this.state.soundIdle !== null) {
      GlobalSoundManager.getInstance().playSound(this.object.id(), this.state.soundIdle);
    }

    super.execute();
  }

  /**
   * todo: Description.
   */
  public isPositionReached(): boolean {
    return this.coverPosition.distance_to_sqr(this.object.position()) <= 0.4;
  }

  /**
   * todo: Description.
   */
  public activateScheme(): void {
    this.state.signals = new LuaTable();

    const smartTerrainVertexId: TNumberId = SimulationBoardManager.getInstance().getSmartTerrainByName(
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
      this.coverVertexId = this.object.accessible_nearest(this.coverPosition, createEmptyVector());
      this.coverPosition = level.vertex_position(this.coverVertexId);
    }

    const desiredDirection: Vector = subVectors(this.coverPosition, this.enemyRandomPosition);

    if (desiredDirection !== null && !areSameVectors(desiredDirection, createEmptyVector())) {
      desiredDirection.normalize();
      this.object.set_desired_direction(desiredDirection);
    }

    this.object.set_path_type(EClientObjectPath.LEVEL_PATH);
    this.object.set_dest_level_vertex_id(this.coverVertexId);

    setStalkerState(this.object, EStalkerState.ASSAULT);
  }
}
