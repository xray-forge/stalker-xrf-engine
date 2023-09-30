import { action_base, LuabindClass } from "xray16";

import { getStalkerState, registry } from "@/engine/core/database";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { StalkerPatrolManager } from "@/engine/core/objects/ai/state/StalkerPatrolManager";
import { EStalkerState, EWaypointArrivalType } from "@/engine/core/objects/animation/types";
import { ISchemePatrolState } from "@/engine/core/schemes/stalker/patrol";
import { parseWaypointsData } from "@/engine/core/utils/ini/ini_parse";
import { ClientObject, ISchemeEventHandler, Optional, TIndex } from "@/engine/lib/types";

/**
 * Action to command patrol/group of stalker on way somewhere.
 */
@LuabindClass()
export class ActionCommander extends action_base implements ISchemeEventHandler {
  public readonly state: ISchemePatrolState;
  public readonly patrolManager: StalkerPatrolManager;

  public currentState: EStalkerState = EStalkerState.PATROL;
  public previousState: Optional<EStalkerState> = null;

  public constructor(state: ISchemePatrolState, object: ClientObject) {
    super(null, ActionCommander.__name);
    this.state = state;
    this.patrolManager = registry.objects.get(object.id()).patrolManager as StalkerPatrolManager;
  }

  /**
   * todo: Description.
   */
  public override initialize(): void {
    super.initialize();

    this.object.set_desired_position();
    this.object.set_desired_direction();

    this.activate();
  }

  /**
   * todo: Description.
   */
  public activate(): void {
    this.state.signals = new LuaTable();

    if (this.state.pathWalkInfo === null) {
      this.state.pathWalkInfo = parseWaypointsData(this.state.pathWalk);
    }

    if (this.state.pathLookInfo === null) {
      this.state.pathLookInfo = parseWaypointsData(this.state.pathLook);
    }

    this.patrolManager.reset(
      this.state.pathWalk,
      this.state.pathWalkInfo!,
      this.state.pathLook,
      this.state.pathLookInfo,
      this.state.team,
      this.state.suggestedState,
      { context: this, callback: this.onProcessPoint }
    );

    registry.patrols.generic
      .get(this.state.patrolKey)
      .setObjectCommand(this.object, this.currentState, this.state.formation);
  }

  /**
   * todo: Description.
   */
  public override execute(): void {
    super.execute();

    this.patrolManager.update();

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

    registry.patrols.generic.get(this.state.patrolKey).setObjectCommand(this.object, nextState, this.state.formation);
  }

  /**
   * todo: Description.
   */
  public override finalize(): void {
    if (this.object.alive() === true) {
      registry.patrols.generic
        .get(this.state.patrolKey)
        .setObjectCommand(this.object, EStalkerState.GUARD, this.state.formation);
      this.patrolManager.finalize();
    }

    super.finalize();
  }

  /**
   * todo: Description.
   */
  public deactivate(object: ClientObject): void {
    registry.patrols.generic.get(this.state.patrolKey).removeObject(object);
  }

  /**
   * todo: Description.
   */
  public onDeath(object: ClientObject): void {
    registry.patrols.generic.get(this.state.patrolKey).removeObject(object);
  }

  /**
   * todo: Description.
   */
  public onSwitchOffline(object: ClientObject): void {
    this.deactivate(object);
  }

  /**
   * todo: Description.
   */
  public onProcessPoint(mode: EWaypointArrivalType, patrolRetVal: Optional<number>, index: TIndex): void {
    if (patrolRetVal === 0) {
      this.state.formation = "line";
    } else if (patrolRetVal === 1) {
      this.state.formation = "around";
    } else if (patrolRetVal === 2) {
      this.state.formation = "back";
    }
  }
}
