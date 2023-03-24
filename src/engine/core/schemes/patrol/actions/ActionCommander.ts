import { action_base, LuabindClass, XR_game_object } from "xray16";

import { getStalkerState, registry } from "@/engine/core/database";
import { GlobalSoundManager } from "@/engine/core/managers/GlobalSoundManager";
import { EStalkerState } from "@/engine/core/objects/state";
import { StalkerMoveManager } from "@/engine/core/objects/state/StalkerMoveManager";
import { ISchemePatrolState } from "@/engine/core/schemes/patrol";
import { parsePathWaypoints } from "@/engine/core/utils/parse";
import { Optional } from "@/engine/lib/types";

/**
 * todo;
 */
@LuabindClass()
export class ActionCommander extends action_base {
  public readonly state: ISchemePatrolState;
  public readonly moveManager: StalkerMoveManager;

  public currentState: EStalkerState = EStalkerState.PATROL;
  public previousState: Optional<EStalkerState> = null;

  /**
   * todo: Description.
   */
  public constructor(state: ISchemePatrolState, object: XR_game_object) {
    super(null, ActionCommander.__name);
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

    this.activateScheme();
  }

  /**
   * todo: Description.
   */
  public activateScheme(): void {
    this.state.signals = new LuaTable();

    if (this.state.path_walk_info === null) {
      this.state.path_walk_info = parsePathWaypoints(this.state.path_walk);
    }

    if (this.state.path_look_info === null) {
      this.state.path_look_info = parsePathWaypoints(this.state.path_look);
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

    registry.patrols.generic
      .get(this.state.patrol_key)
      .set_command(this.object, this.currentState, this.state.formation);
  }

  /**
   * todo: Description.
   */
  public override execute(): void {
    super.execute();

    this.moveManager.update();

    const nextState: EStalkerState = getStalkerState(this.object) as EStalkerState;
    const previousState: Optional<EStalkerState> = this.previousState;

    if (previousState !== nextState) {
      const globalSoundManager: GlobalSoundManager = GlobalSoundManager.getInstance();

      if (this.state.silent !== true) {
        if (nextState === EStalkerState.SNEAK) {
          globalSoundManager.playSound(this.object.id(), "patrol_sneak", null, null);
        } else if (nextState === EStalkerState.SNEAK_RUN) {
          globalSoundManager.playSound(this.object.id(), "patrol_run", null, null);
        } else if (nextState === EStalkerState.RUN) {
          globalSoundManager.playSound(this.object.id(), "patrol_run", null, null);
        } else if (nextState === EStalkerState.ASSAULT) {
          globalSoundManager.playSound(this.object.id(), "patrol_run", null, null);
        } else if (nextState === EStalkerState.RUSH) {
          globalSoundManager.playSound(this.object.id(), "patrol_run", null, null);
        } else if (
          previousState === EStalkerState.SNEAK ||
          previousState === EStalkerState.SNEAK_RUN ||
          previousState === EStalkerState.RUN ||
          previousState === EStalkerState.ASSAULT ||
          previousState === EStalkerState.RUSH
        ) {
          globalSoundManager.playSound(this.object.id(), "patrol_walk", null, null);
        }
      }

      this.previousState = nextState;
    }

    registry.patrols.generic.get(this.state.patrol_key).set_command(this.object, nextState, this.state.formation);
  }

  /**
   * todo: Description.
   */
  public override finalize(): void {
    if (this.object.alive() === true) {
      registry.patrols.generic
        .get(this.state.patrol_key)
        .set_command(this.object, EStalkerState.GUARD, this.state.formation);
      this.moveManager.finalize();
    }

    super.finalize();
  }

  /**
   * todo: Description.
   */
  public deactivate(object: XR_game_object): void {
    registry.patrols.generic.get(this.state.patrol_key).remove_npc(object);
  }

  /**
   * todo: Description.
   */
  public death_callback(object: XR_game_object): void {
    registry.patrols.generic.get(this.state.patrol_key).remove_npc(object);
  }

  /**
   * todo: Description.
   */
  public net_destroy(object: XR_game_object): void {
    this.deactivate(object);
  }

  /**
   * todo: Description.
   */
  public formation_callback(mode: number, number: number, index: number): void {
    if (number === 0) {
      this.state.formation = "line";
    } else if (number === 1) {
      this.state.formation = "around";
    } else if (number === 2) {
      this.state.formation = "back";
    }
  }
}
