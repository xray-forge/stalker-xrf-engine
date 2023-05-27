import { action_base, level, LuabindClass } from "xray16";

import { registry, setStalkerState } from "@/engine/core/database";
import { SimulationBoardManager } from "@/engine/core/managers/interaction/SimulationBoardManager";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { EStalkerState } from "@/engine/core/objects/state";
import { ISchemeCoverState } from "@/engine/core/schemes/cover";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { areSameVectors, createEmptyVector, createVector, subVectors } from "@/engine/core/utils/vector";
import { CoverPoint, EClientObjectPath, Optional, TDistance, TNumberId, Vector } from "@/engine/lib/types";

/**
 * todo;
 */
@LuabindClass()
export class ActionBaseCover extends action_base {
  public readonly state: ISchemeCoverState;
  public board!: SimulationBoardManager;

  public enemy_random_position: Optional<Vector> = null;
  public cover_vertex_id!: TNumberId;
  public cover_position!: Vector;

  public constructor(state: ISchemeCoverState) {
    super(null, ActionBaseCover.__name);
    this.state = state;
  }

  /**
   * todo: Description.
   */
  public override initialize(): void {
    super.initialize();
    this.board = SimulationBoardManager.getInstance();
  }

  /**
   * todo: Description.
   */
  public activateScheme(): void {
    this.state.signals = new LuaTable();
    this.board = SimulationBoardManager.getInstance();

    const base_point = this.board.getSmartTerrainByName(this.state.smart)!.m_level_vertex_id;

    const direction_vector: Vector = createVector(math.random(-100, 100), 0, math.random(-100, 100));
    const base_vertex_id: TNumberId = level.vertex_in_direction(
      base_point,
      direction_vector,
      math.random(this.state.radius_min, this.state.radius_max)
    );
    const this_random_position = level.vertex_position(base_vertex_id);

    this.enemy_random_position = this_random_position;

    let cover: Optional<CoverPoint> = null;
    let cover_dist: TDistance = 2;

    while (cover === null && cover_dist <= 4) {
      cover = this.object.best_cover(this_random_position, this.enemy_random_position, cover_dist, 1, 150);
      cover_dist = cover_dist + 1;
    }

    if (cover === null) {
      this.cover_vertex_id = base_vertex_id;
      this.cover_position = this_random_position;
    } else {
      this.cover_vertex_id = cover.level_vertex_id();
      this.cover_position = cover.position();
    }

    if (!this.object.accessible(this.cover_position)) {
      const ttp: Vector = createEmptyVector();

      this.cover_vertex_id = this.object.accessible_nearest(this.cover_position, ttp);
      this.cover_position = level.vertex_position(this.cover_vertex_id);
    }

    const desired_direction: Vector = subVectors(this.cover_position, this.enemy_random_position);

    if (desired_direction !== null && !areSameVectors(desired_direction, createEmptyVector())) {
      desired_direction.normalize();
      this.object.set_desired_direction(desired_direction);
    }

    this.object.set_path_type(EClientObjectPath.LEVEL_PATH);
    this.object.set_dest_level_vertex_id(this.cover_vertex_id);

    setStalkerState(this.object, EStalkerState.ASSAULT);
  }

  /**
   * todo: Description.
   */
  public override execute(): void {
    if (this.cover_position.distance_to_sqr(this.object.position()) <= 0.4) {
      const anim: Optional<EStalkerState> = pickSectionFromCondList(registry.actor, this.object, this.state.anim);

      setStalkerState(
        this.object,
        anim!,
        null,
        null,
        { look_position: this.enemy_random_position, look_object: null },
        null
      );
    } else {
      this.object.set_dest_level_vertex_id(this.cover_vertex_id);
      setStalkerState(this.object, EStalkerState.ASSAULT);
    }

    if (this.state.sound_idle !== null) {
      GlobalSoundManager.getInstance().playSound(this.object.id(), this.state.sound_idle, null, null);
    }

    super.execute();
  }

  /**
   * todo: Description.
   */
  public position_reached(): boolean {
    return this.cover_position.distance_to_sqr(this.object.position()) <= 0.4;
  }
}
