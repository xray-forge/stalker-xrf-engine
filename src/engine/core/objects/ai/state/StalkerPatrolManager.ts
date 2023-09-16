import { callback, level, move, patrol, time_global } from "xray16";

import { registry, setStalkerState } from "@/engine/core/database";
import { ECurrentMovementState, EStalkerState } from "@/engine/core/objects/animation/types";
import { abort } from "@/engine/core/utils/assertion";
import { IWaypointData, parseConditionsList, pickSectionFromCondList, TConditionList } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isObjectAtWaypoint } from "@/engine/core/utils/object";
import { chooseLookPoint } from "@/engine/core/utils/patrol";
import { setActiveSchemeSignal } from "@/engine/core/utils/scheme";
import { TRUE } from "@/engine/lib/constants/words";
import {
  AnyCallable,
  AnyObject,
  ClientObject,
  EClientObjectPath,
  Flags32,
  LuaArray,
  Optional,
  Patrol,
  TDistance,
  TDuration,
  TIndex,
  TName,
  TTimestamp,
  Vector,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename, { file: "ai_state" });

const DIST_WALK: TDistance = 10;
const DIST_RUN: TDistance = 2500;
const WALK_MIN_TIME: TDuration = 3000;
const RUN_MIN_TIME: TDuration = 2000;
const KEEP_STATE_MIN_TIME: TDuration = 1500;
const DEFAULT_WAIT_TIME: TDuration = 10_000;

const DEFAULT_STATE_STANDING: EStalkerState = EStalkerState.GUARD;
const DEFAULT_STATE_MOVING1: EStalkerState = EStalkerState.PATROL;
const DEFAULT_STATE_MOVING2: EStalkerState = EStalkerState.PATROL;
const DEFAULT_STATE_MOVING3: EStalkerState = EStalkerState.PATROL;

const ARRIVAL_BEFORE_ROTATION: number = 0;
const ARRIVAL_AFTER_ROTATION: number = 1;

const sync: LuaTable<string, LuaTable<number, boolean>> = new LuaTable();

/**
 * Manager handling movement of stalker objects.
 * Responsible for patrolling schemes logic.
 */
export class StalkerPatrolManager {
  public readonly object: ClientObject;

  public state: Optional<ECurrentMovementState> = null;
  public currentStateMoving!: EStalkerState;
  public currentStateStanding!: EStalkerState;

  public patrolWaitTime: Optional<TDuration> = null;
  public suggestedState!: unknown;
  public synSignal!: Optional<string>;
  public synSignalSetTm!: number;
  public useDefaultSound!: boolean;
  public lastLookIndex!: Optional<TIndex>;

  public patrolWalk: Optional<Patrol> = null;
  public pathWalk: Optional<string> = null;
  public patrolLook: Optional<Patrol> = null;
  public pathLook: Optional<string> = null;
  public pathLookInfo: Optional<LuaTable<number, IWaypointData>> = null;
  public pathWalkInfo!: LuaTable<number, IWaypointData>;

  public noValidation: Optional<boolean> = null;
  public isOnTerminalWaypoint: Optional<boolean> = null;
  public currentPointInitTime: Optional<number> = null;
  public currentPointIndex: Optional<TIndex> = null;
  public canUseGetCurrentPointIndex: Optional<boolean> = null;

  public team: Optional<string> = null;

  public lastIndex: Optional<TIndex> = null;

  public keepStateUntil!: number;
  public walkUntil!: number;
  public runUntil!: number;
  public retvalAfterRotation: Optional<number> = null;

  public defaultStateStanding!: TConditionList;
  public defaultStateMoving1!: TConditionList;
  public defaultStateMoving2!: TConditionList;
  public defaultStateMoving3!: TConditionList;
  public moveCbInfo: Optional<{ obj: AnyObject; func: AnyCallable }> = null;

  public constructor(object: ClientObject) {
    this.object = object;
  }

  /**
   * Initialize move manager, setup state and callbacks.
   *
   * @returns initialized manager reference
   */
  public initialize(): StalkerPatrolManager {
    logger.format("Initialize move manager for: '%s'", this.object.name());

    this.object.set_callback(callback.patrol_path_in_point, this.onWaypoint, this);

    return this;
  }

  /**
   * Reset state for movement manager.
   *
   * todo;
   */
  public reset(
    walkPath: TName,
    walkPathInfo: LuaArray<IWaypointData>,
    lookPath: Optional<string> = null,
    lookPathInfo: Optional<LuaArray<IWaypointData>> = null,
    team: Optional<string> = null,
    suggestedState: Optional<any>, // todo: fix type
    moveCbInfo: Optional<{ obj: AnyObject; func: AnyCallable }> = null,
    noValidation: Optional<boolean> = null
  ): void {
    logger.format(
      "Reset move manager for: '%s', at '%s'/'%s', team - '%s'",
      this.object.name(),
      walkPath,
      lookPath,
      team
    );

    const now: TTimestamp = time_global();

    this.patrolWaitTime = DEFAULT_WAIT_TIME;
    this.suggestedState = suggestedState;

    this.defaultStateStanding = parseConditionsList(
      suggestedState?.standing ? suggestedState.standing : DEFAULT_STATE_STANDING
    );
    this.defaultStateMoving1 = parseConditionsList(
      suggestedState?.moving ? suggestedState.moving : DEFAULT_STATE_MOVING1
    );
    this.defaultStateMoving2 = parseConditionsList(
      suggestedState?.moving ? suggestedState.moving : DEFAULT_STATE_MOVING2
    );
    this.defaultStateMoving3 = parseConditionsList(
      suggestedState?.moving ? suggestedState.moving : DEFAULT_STATE_MOVING3
    );

    this.synSignalSetTm = now + 1000;
    this.synSignal = null;

    this.moveCbInfo = moveCbInfo;

    if (team !== this.team) {
      this.team = team;

      if (this.team) {
        let state: Optional<LuaTable<number, boolean>> = sync.get(this.team);

        if (!state) {
          state = new LuaTable();
          sync.set(this.team, state);
        }

        state.set(this.object.id(), false);
      }
    }

    if (this.pathWalk !== walkPath || this.pathLook !== lookPath) {
      this.noValidation = noValidation;

      this.pathWalk = walkPath;
      this.patrolWalk = new patrol(walkPath);
      if (!this.patrolWalk) {
        abort("object '%s': unable to find path_walk '%s' on the map", this.object.name(), walkPath);
      }

      if (!walkPathInfo) {
        abort(
          "object '%s': path_walk ('%s') field was supplied, but path_walk_info field is null",
          this.object.name(),
          walkPath
        );
      }

      this.pathWalkInfo = walkPathInfo!;

      if (lookPath !== null) {
        if (!lookPathInfo) {
          abort(
            "object '%s': path_look ('%s') field was supplied, but path_look_info field is null",
            this.object.name(),
            lookPath
          );
        }

        this.patrolLook = new patrol(lookPath);
        if (!this.patrolLook) {
          abort("object '%s': unable to find path_look '%s' on the map", this.object.name(), lookPath);
        }
      } else {
        this.patrolLook = null;
      }

      this.pathLook = lookPath;
      this.pathLookInfo = lookPathInfo;

      this.isOnTerminalWaypoint = false;

      this.currentStateStanding = pickSectionFromCondList(registry.actor, this.object, this.defaultStateStanding)!;
      this.currentStateMoving = pickSectionFromCondList(registry.actor, this.object, this.defaultStateMoving1)!;

      this.retvalAfterRotation = null;

      this.canUseGetCurrentPointIndex = false;
      this.currentPointIndex = null;
      this.walkUntil = now + WALK_MIN_TIME;
      this.runUntil = now + WALK_MIN_TIME + RUN_MIN_TIME;
      this.keepStateUntil = now;

      this.lastIndex = null;
      this.lastLookIndex = null;
      this.useDefaultSound = false;

      this.object.patrol_path_make_inactual();
    }

    this.setupMovementByPatrolPath();
  }

  /**
   * Dispose all related data and manager instance.
   */
  public finalize(): void {
    logger.format("Finalize move manager for: '%s' / '%s'", this.object.name(), this.team);

    if (this.team) {
      sync.get(this.team).delete(this.object.id());
    }

    this.object.set_path_type(EClientObjectPath.LEVEL_PATH);
  }

  /**
   * todo: Description.
   */
  public continue(): void {
    this.setupMovementByPatrolPath();
  }

  /**
   * todo: Description.
   */
  public update(): void {
    const now: TTimestamp = time_global();

    if (this.synSignal && now >= this.synSignalSetTm) {
      if (this.isSynchronized()) {
        setActiveSchemeSignal(this.object, this.synSignal);
        this.synSignal = null;
      }
    }

    if (this.canUseGetCurrentPointIndex && !this.isArrivedToFirstWaypoint()) {
      if (now >= this.keepStateUntil) {
        this.keepStateUntil = now + KEEP_STATE_MIN_TIME;

        const currentPointIndex: TIndex = this.currentPointIndex!;
        const dist: TDistance = this.object.position().distance_to(this.patrolWalk!.point(currentPointIndex));

        if (dist <= DIST_WALK || now < this.walkUntil) {
          this.currentStateMoving = pickSectionFromCondList(registry.actor, this.object, this.defaultStateMoving1)!;
        } else if (dist <= DIST_RUN || now < this.runUntil) {
          this.currentStateMoving = pickSectionFromCondList(registry.actor, this.object, this.defaultStateMoving2)!;
        } else {
          this.currentStateMoving = pickSectionFromCondList(registry.actor, this.object, this.defaultStateMoving3)!;
        }

        this.updateMovementState();
      }

      return;
    }
  }

  /**
   * todo: Description.
   */
  public isArrivedToFirstWaypoint(): boolean {
    return this.lastIndex !== null;
  }

  /**
   * todo: Description.
   */
  public updateMovementState(): void {
    setStalkerState(this.object, this.currentStateMoving);
  }

  /**
   * todo: Description.
   */
  public updateStandingState(lookPosition: Vector): void {
    setStalkerState(
      this.object,
      this.currentStateStanding,
      { context: this, callback: this.onAnimationUpdate, turnEndCallback: this.onAnimationTurnEnd },
      this.patrolWaitTime,
      { lookPosition: lookPosition, lookObjectId: null }
    );
  }

  /**
   * todo: Description.
   */
  public setupMovementByPatrolPath(): void {
    this.object.set_path_type(EClientObjectPath.PATROL_PATH);
    this.object.set_detail_path_type(move.line);

    if (this.currentPointIndex) {
      this.object.set_start_point(this.currentPointIndex);
      this.object.set_patrol_path(this.pathWalk as TName, patrol.next, patrol.continue, true);
    } else {
      this.object.set_patrol_path(this.pathWalk as TName, patrol.nearest, patrol.continue, true);
    }

    this.state = ECurrentMovementState.MOVING;

    const [isTerminalPoint, index] = this.isStandingOnTerminalWaypoint();

    if (isTerminalPoint) {
      logger.format("Finish patrol, terminal point: '%s', '%s'", this.object.name(), index);

      this.onWaypoint(this.object, null, index);
    } else {
      this.updateMovementState();
    }
  }

  /**
   * todo: Description.
   * todo: Move to patrol utils.
   */
  public isStandingOnTerminalWaypoint(): LuaMultiReturn<[boolean, Optional<TIndex>]> {
    for (const idx of $range(0, this.patrolWalk!.count() - 1)) {
      if (isObjectAtWaypoint(this.object, this.patrolWalk!, idx) && this.patrolWalk!.terminal(idx)) {
        return $multi(true, idx);
      }
    }

    return $multi(false, null);
  }

  /**
   * todo: Description.
   */
  public isSynchronized(): boolean {
    if (this.team) {
      const state: LuaTable<number, boolean> = sync.get(this.team);

      for (const [id, isFlagged] of state) {
        const object: Optional<ClientObject> = level.object_by_id(id);

        if (object?.alive()) {
          if (isFlagged !== true) {
            return false;
          }
        } else {
          sync.get(this.team).delete(id);
        }
      }
    }

    return true;
  }

  /**
   * todo: Description.
   */
  public onAnimationUpdate(): void {
    logger.format("Animation update for: '%s' at '%s'", this.object.name(), this.lastLookIndex);

    const sigtm: Optional<TName> = this.pathLookInfo!.get(this.lastLookIndex!)["sigtm"] as Optional<TName>;

    if (sigtm) {
      setActiveSchemeSignal(this.object, sigtm);
    }

    if (registry.objects.get(this.object.id()).activeScheme === null) {
      return;
    }

    if (this.lastIndex && this.patrolWalk!.terminal(this.lastIndex)) {
      if (isObjectAtWaypoint(this.object, this.patrolWalk!, this.lastIndex)) {
        this.onWaypoint(this.object, null, this.lastIndex);

        return;
      }

      this.reset(
        this.pathWalk!,
        this.pathWalkInfo,
        this.pathLook,
        this.pathLookInfo,
        this.team,
        this.suggestedState,
        this.moveCbInfo,
        this.noValidation
      );
    } else {
      this.updateMovementState();

      const syn = this.pathLookInfo!.get(this.lastLookIndex!)["syn"];

      if (syn) {
        abort("object '%s': path_walk '%s': syn flag used on non-terminal waypoint", this.object.name(), this.pathWalk);
      }
    }
  }

  /**
   * todo: Description.
   */
  public onAnimationTurnEnd(): void {
    logger.format("Animation turn end for: '%s' at '%s'", this.object.name(), this.lastLookIndex);

    const syn = this.pathLookInfo!.get(this.lastLookIndex!)["syn"];

    if (syn) {
      this.synSignal = this.pathLookInfo!.get(this.lastLookIndex!)["sig"] as string;

      if (!this.synSignal) {
        abort("object '%s': path_look '%s': syn flag uset without sig flag", this.object.name(), this.pathLook);
      }

      if (this.team) {
        sync.get(this.team).set(this.object.id(), true);
      }
    } else {
      const sig = this.pathLookInfo!.get(this.lastLookIndex!)["sig"];

      setActiveSchemeSignal(this.object, sig ? sig : "turn_end");
    }

    if (this.retvalAfterRotation) {
      if (!this.moveCbInfo) {
        abort(
          "object '%s': path_look '%s': ret flag is set, but " +
            "callback function wasn't registered in move_mgr.reset()",
          this.object.name(),
          this.pathLook
        );
      }

      setStalkerState(this.object, this.currentStateStanding);

      if (!this.moveCbInfo) {
        abort(
          "object '%s': path_look '%s': ret flag is set, but " +
            "callback function wasn't registered in move_mgr.reset()",
          this.object.name(),
          this.pathLook
        );
      }

      if (this.moveCbInfo.func(this.moveCbInfo.obj, ARRIVAL_AFTER_ROTATION, this.retvalAfterRotation, this.lastIndex)) {
        return;
      }

      this.updateStandingState(this.patrolLook!.point(this.lastLookIndex!));
    }
  }

  /**
   * todo: Description.
   */
  public onExtrapolate(object: ClientObject): void {
    logger.format("Extrapolate for: '%s' at '%s'", this.object.name(), this.lastLookIndex);

    this.canUseGetCurrentPointIndex = true;
    this.currentPointInitTime = time_global();
    this.currentPointIndex = this.object.get_current_point_index();
  }

  /**
   * todo: Description.
   */
  public onWaypoint(object: ClientObject, actionType: Optional<number>, index: Optional<TIndex>): void {
    logger.format(
      "Waypoint CB for: '%s' at '%s' / '%s' '%s'",
      this.object.name(),
      this.lastLookIndex,
      actionType,
      index
    );

    if (index === -1 || index === null) {
      return;
    }

    this.lastIndex = index;

    if (this.patrolWalk!.terminal(index)) {
      this.isOnTerminalWaypoint = true;
    }

    const suggestedStateMoving = this.pathWalkInfo.get(index)["a"];

    if (suggestedStateMoving) {
      this.currentStateMoving = pickSectionFromCondList(registry.actor, this.object, suggestedStateMoving)!;
      if (tostring(this.currentStateMoving) === TRUE) {
        abort("!!!!!");
      }
    } else {
      this.currentStateMoving = pickSectionFromCondList(registry.actor, this.object, this.defaultStateMoving1)!;
      if (tostring(this.currentStateMoving) === TRUE) {
        abort("!!!!!");
      }
    }

    const retv = this.pathWalkInfo.get(index)["ret"];

    if (retv) {
      const retvNum = tonumber(retv);

      if (!this.moveCbInfo) {
        abort(
          "object '%s': path_walk '%s': ret flag is set, but " +
            "callback function wasn't registered in move_mgr:reset()",
          this.object.name(),
          this.pathWalk
        );
      }

      if (this.moveCbInfo.func(this.moveCbInfo.obj, ARRIVAL_BEFORE_ROTATION, retvNum, index)) {
        return;
      }
    }

    const sig = this.pathWalkInfo.get(index)["sig"];

    if (sig) {
      setActiveSchemeSignal(this.object, sig);
    } else if (index === this.pathWalkInfo.length() - 1) {
      setActiveSchemeSignal(this.object, "path_end");
    }

    const stopProbability = this.pathWalkInfo.get(index)["p"];

    if (!this.patrolLook || (stopProbability && tonumber(stopProbability)! < math.random(1, 100))) {
      this.updateMovementState();

      return;
    }

    const searchFor: Flags32 = this.pathWalkInfo.get(index).flags;

    if (searchFor.get() === 0) {
      this.updateMovementState();

      return;
    }

    const [ptChosenIdx] = chooseLookPoint(this.patrolLook, this.pathLookInfo!, searchFor);

    if (ptChosenIdx) {
      const suggestedAnimationsSet: Optional<TConditionList> = this.pathLookInfo!.get(ptChosenIdx)["a"];

      this.currentStateStanding = pickSectionFromCondList(
        registry.actor,
        this.object,
        suggestedAnimationsSet ? suggestedAnimationsSet : this.defaultStateStanding
      )!;

      const suggestedWaitTime = this.pathLookInfo!.get(ptChosenIdx)["t"];

      if (suggestedWaitTime) {
        if (suggestedWaitTime === "*") {
          this.patrolWaitTime = null;
        } else {
          const tm: number = tonumber(suggestedWaitTime)!;

          if (tm !== 0 && (tm < 1000 || tm > 45000)) {
            abort(
              "object '%s': path_look '%s': flag 't':" +
                " incorrect time specified (* or number in interval [1000, 45000] is expected)",
              this.object.name(),
              this.pathLook
            );
          }

          this.patrolWaitTime = tm;
        }
      } else {
        this.patrolWaitTime = DEFAULT_WAIT_TIME;
      }

      const retv = this.pathLookInfo!.get(ptChosenIdx)["ret"];

      this.retvalAfterRotation = retv ? (tonumber(retv) as number) : null;

      logger.format("Last look index set: '%s' -> '%s'", this.object.name(), ptChosenIdx);

      this.lastLookIndex = ptChosenIdx;
      this.updateStandingState(this.patrolLook.point(ptChosenIdx));

      this.state = ECurrentMovementState.STANDING;

      this.update();
    } else {
      abort(
        "object '%s': path_walk '%s', index.ts %d: cannot find corresponding point(s) on path_look '%s'",
        this.object.name(),
        this.pathWalk,
        index,
        this.pathLook
      );
    }
  }
}
