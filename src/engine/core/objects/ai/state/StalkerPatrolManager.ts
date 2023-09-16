import { callback, level, move, patrol, time_global } from "xray16";

import { registry, setStalkerState } from "@/engine/core/database";
import {
  ECurrentMovementState,
  EStalkerState,
  EWaypointArrivalType,
  IPatrolCallbackDescriptor,
  IPatrolSuggestedState,
} from "@/engine/core/objects/animation/types";
import { abort, assert } from "@/engine/core/utils/assertion";
import { IWaypointData, parseConditionsList, pickSectionFromCondList, TConditionList } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isObjectAtWaypoint } from "@/engine/core/utils/object";
import { chooseLookPoint, isObjectStandingOnTerminalWaypoint } from "@/engine/core/utils/patrol";
import { setObjectActiveSchemeSignal } from "@/engine/core/utils/scheme";
import {
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
  TNumberId,
  TTimestamp,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename, { file: "ai_state" });

/**
 * Manager handling patrol movement of stalker objects.
 * Responsible for patrolling schemes logic and mainly called from related schemes (walker, sleep, patrol).
 */
export class StalkerPatrolManager {
  public static DEFAULT_PATROL_WAIT_TIME: TDuration = 10_000;
  public static DEFAULT_PATROL_STATE_STANDING: EStalkerState = EStalkerState.GUARD;
  public static DEFAULT_PATROL_STATE_MOVING: EStalkerState = EStalkerState.PATROL;

  // When cannot keep with patrol state, persist state for a while and then switch walk/run/sprint based on distance.
  public static KEEP_STATE_DURATION: TDuration = 1500;
  // Minimal time to walk before checking whether state can switch.
  public static WALK_STATE_DURATION: TDuration = 3000;
  // Minimal time to run before checking whether state can switch.
  public static RUN_STATE_DURATION: TDuration = 2000;

  // Distances to coordinate current movement (walk, run, sprint)
  public static DISTANCE_TO_WALK_SQR: TDistance = 10 * 10;
  public static DISTANCE_TO_RUN_SQR: TDistance = 50 * 50;

  public readonly object: ClientObject;

  public team: Optional<string> = null;
  public state: Optional<ECurrentMovementState> = null;
  public currentStateMoving!: EStalkerState;
  public currentStateStanding!: EStalkerState;
  public suggestedState: Optional<IPatrolSuggestedState> = null;

  // Next timestamp to check synchronization of run-walk-sprint state.
  public keepStateUntil!: TTimestamp;
  public patrolWaitTime: Optional<TDuration> = null;

  public lastWalkIndex: Optional<TIndex> = null;
  public lastLookIndex: Optional<TIndex> = null;
  public synSignal: Optional<string> = null;
  public synSignalSetTm!: TDuration;
  public patrolCallbackDescriptor: Optional<IPatrolCallbackDescriptor> = null;

  public patrolWalk: Optional<Patrol> = null;
  public patrolWalkName: Optional<TName> = null;
  public patrolWalkWaypoints!: LuaArray<IWaypointData>;
  public patrolLook: Optional<Patrol> = null;
  public patrolLookName: Optional<TName> = null;
  public patrolLookWaypoints: Optional<LuaArray<IWaypointData>> = null;

  public isOnTerminalWaypoint: Optional<boolean> = null;
  public useDefaultSound!: boolean;

  public currentPointInitTime: Optional<number> = null;
  public currentPointIndex: Optional<TIndex> = null;
  public canUseGetCurrentPointIndex: Optional<boolean> = null;

  public walkUntil!: number;
  public runUntil!: number;
  public retvalAfterRotation: Optional<number> = null;

  public defaultStateStanding!: TConditionList;
  public defaultStateMoving1!: TConditionList;
  public defaultStateMoving2!: TConditionList;
  public defaultStateMoving3!: TConditionList;

  public constructor(object: ClientObject) {
    this.object = object;
  }

  /**
   * Initialize patrol manager, setup state and callbacks.
   *
   * @returns initialized manager reference
   */
  public initialize(): StalkerPatrolManager {
    logger.format("Initialize patrol manager for: '%s'", this.object.name());

    this.object.set_callback(callback.patrol_path_in_point, this.onWalkWaypoint, this);

    return this;
  }

  /**
   * Reset state for movement manager.
   *
   * todo;
   */
  public reset(
    walkPathName: TName,
    walkPathWaypoints: LuaArray<IWaypointData>,
    lookPathName: Optional<TName> = null,
    lookPathWaypoints: Optional<LuaArray<IWaypointData>> = null,
    patrolTeam: Optional<TName> = null,
    patrolSuggestedStates: Optional<IPatrolSuggestedState>,
    patrolCallbackDescriptor: Optional<IPatrolCallbackDescriptor> = null
  ): void {
    logger.format(
      "Reset patrol manager for: '%s', walk - '%s' look - '%s', team - '%s'",
      this.object.name(),
      walkPathName,
      lookPathName,
      patrolTeam
    );

    const now: TTimestamp = time_global();

    this.patrolWaitTime = StalkerPatrolManager.DEFAULT_PATROL_WAIT_TIME;
    this.suggestedState = patrolSuggestedStates;

    this.defaultStateStanding = parseConditionsList(
      patrolSuggestedStates?.standing ?? StalkerPatrolManager.DEFAULT_PATROL_STATE_STANDING
    );
    this.defaultStateMoving1 = parseConditionsList(
      patrolSuggestedStates?.moving ?? StalkerPatrolManager.DEFAULT_PATROL_STATE_MOVING
    );
    this.defaultStateMoving2 = parseConditionsList(
      patrolSuggestedStates?.moving ?? StalkerPatrolManager.DEFAULT_PATROL_STATE_MOVING
    );
    this.defaultStateMoving3 = parseConditionsList(
      patrolSuggestedStates?.moving ?? StalkerPatrolManager.DEFAULT_PATROL_STATE_MOVING
    );

    this.synSignalSetTm = now + 1000;
    this.synSignal = null;

    this.patrolCallbackDescriptor = patrolCallbackDescriptor;

    // Initialize sync state if it is changed:
    if (patrolTeam !== this.team) {
      this.team = patrolTeam;

      if (this.team) {
        let state: Optional<LuaTable<TNumberId, boolean>> = registry.patrolSynchronization.get(this.team);

        if (!state) {
          state = new LuaTable();
          registry.patrolSynchronization.set(this.team, state);
        }

        state.set(this.object.id(), false);
      }
    }

    // Reset patrol - use new patrol that should be fully re-initialized:
    if (this.patrolWalkName !== walkPathName || this.patrolLookName !== lookPathName) {
      this.patrolWalkName = walkPathName;
      this.patrolWalk = new patrol(walkPathName);
      if (!this.patrolWalk) {
        abort("object '%s': unable to find path_walk '%s' on the map", this.object.name(), walkPathName);
      }

      if (!walkPathWaypoints) {
        abort(
          "object '%s': path_walk ('%s') field was supplied, but path_walk_info field is null",
          this.object.name(),
          walkPathName
        );
      }

      this.patrolWalkWaypoints = walkPathWaypoints!;

      if (lookPathName !== null) {
        if (!lookPathWaypoints) {
          abort(
            "object '%s': path_look ('%s') field was supplied, but path_look_info field is null",
            this.object.name(),
            lookPathName
          );
        }

        this.patrolLook = new patrol(lookPathName);
        if (!this.patrolLook) {
          abort("object '%s': unable to find path_look '%s' on the map", this.object.name(), lookPathName);
        }
      } else {
        this.patrolLook = null;
      }

      this.patrolLookName = lookPathName;
      this.patrolLookWaypoints = lookPathWaypoints;

      this.currentStateStanding = pickSectionFromCondList(registry.actor, this.object, this.defaultStateStanding)!;
      this.currentStateMoving = pickSectionFromCondList(registry.actor, this.object, this.defaultStateMoving1)!;

      this.canUseGetCurrentPointIndex = false;
      this.walkUntil = now + StalkerPatrolManager.WALK_STATE_DURATION;
      this.runUntil = now + StalkerPatrolManager.WALK_STATE_DURATION + StalkerPatrolManager.RUN_STATE_DURATION;
      this.keepStateUntil = now;

      this.retvalAfterRotation = null;
      this.isOnTerminalWaypoint = false;
      this.currentPointIndex = null;
      this.lastWalkIndex = null;
      this.lastLookIndex = null;
      this.useDefaultSound = false;

      // Reset previous patrols.
      this.object.patrol_path_make_inactual();
    }

    // Perform movement update based on current paths.
    this.setupMovementByPatrolPath();
  }

  /**
   * Dispose all related data and manager instance.
   */
  public finalize(): void {
    logger.format(
      "Finalize patrol manager for: '%s', walk '%s' look '%s' , team '%s'",
      this.object.name(),
      this.patrolWalkName,
      this.patrolLookName,
      this.team
    );

    if (this.team) {
      registry.patrolSynchronization.get(this.team).delete(this.object.id());
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
   * Handle game object update tick.
   */
  public update(): void {
    const now: TTimestamp = time_global();

    // If sync is needed and time passed, check state and write signal when should.
    if (this.synSignal && now >= this.synSignalSetTm && this.isSynchronized()) {
      setObjectActiveSchemeSignal(this.object, this.synSignal);
      this.synSignal = null; // Reset.
    }

    // todo: explain.
    if (this.canUseGetCurrentPointIndex && this.lastWalkIndex === null && now >= this.keepStateUntil) {
      this.keepStateUntil = now + StalkerPatrolManager.KEEP_STATE_DURATION;

      const distance: TDistance = this.object
        .position()
        .distance_to_sqr(this.patrolWalk!.point(this.currentPointIndex as TIndex));

      if (distance <= StalkerPatrolManager.DISTANCE_TO_WALK_SQR || now < this.walkUntil) {
        this.currentStateMoving = pickSectionFromCondList(registry.actor, this.object, this.defaultStateMoving1)!;
      } else if (distance <= StalkerPatrolManager.DISTANCE_TO_RUN_SQR || now < this.runUntil) {
        this.currentStateMoving = pickSectionFromCondList(registry.actor, this.object, this.defaultStateMoving2)!;
      } else {
        this.currentStateMoving = pickSectionFromCondList(registry.actor, this.object, this.defaultStateMoving3)!;
      }

      setStalkerState(this.object, this.currentStateMoving);
    }
  }

  /**
   * todo: Description.
   */
  public setupMovementByPatrolPath(): void {
    this.object.set_path_type(EClientObjectPath.PATROL_PATH);
    this.object.set_detail_path_type(move.line);

    if (this.currentPointIndex) {
      this.object.set_start_point(this.currentPointIndex);
      this.object.set_patrol_path(this.patrolWalkName as TName, patrol.next, patrol.continue, true);
    } else {
      this.object.set_patrol_path(this.patrolWalkName as TName, patrol.nearest, patrol.continue, true);
    }

    this.state = ECurrentMovementState.MOVING;

    const [isTerminalPoint, index] = isObjectStandingOnTerminalWaypoint(this.object, this.patrolWalk as Patrol);

    if (isTerminalPoint) {
      this.onWalkWaypoint(this.object, null, index);
    } else {
      setStalkerState(this.object, this.currentStateMoving);
    }
  }

  /**
   * todo: Description.
   */
  public isSynchronized(): boolean {
    if (this.team) {
      const state: LuaTable<TNumberId, boolean> = registry.patrolSynchronization.get(this.team);

      for (const [id, isFlagged] of state) {
        const object: Optional<ClientObject> = level.object_by_id(id);

        // Check sync stat of the object if it is online and alive.
        if (object && object.alive()) {
          if (!isFlagged) {
            return false;
          }
        } else {
          // Delete objects that cannot be synchronized.
          registry.patrolSynchronization.get(this.team).delete(id);
        }
      }
    }

    return true;
  }

  /**
   * todo: Description.
   */
  public onExtrapolate(object: ClientObject): void {
    this.canUseGetCurrentPointIndex = true;
    this.currentPointInitTime = time_global();
    this.currentPointIndex = this.object.get_current_point_index();

    logger.format("Extrapolate patrol point for: '%s' at '%s'", this.object.name(), this.currentPointIndex);
  }

  /**
   * Handle animation update on some path_look point.
   * Fired on timeout or when animation is finished.
   */
  public onAnimationEnd(): void {
    logger.format("Animation end for: '%s' at '%s'", this.object.name(), this.lastLookIndex);

    // No active scheme for logics update, just skip update.
    if (registry.objects.get(this.object.id()).activeScheme === null) {
      return;
    }

    const sigTm: Optional<TName> = this.patrolLookWaypoints!.get(this.lastLookIndex!).sigtm as Optional<TName>;

    // Animation is finished, have signal to set -> set it for activeScheme.
    if (sigTm) {
      setObjectActiveSchemeSignal(this.object, sigTm);
    }

    // Animation is finished, currently on terminal waypoint -> notify logics about finally reaching the point.
    if (this.lastWalkIndex && (this.patrolWalk as Patrol).terminal(this.lastWalkIndex)) {
      if (isObjectAtWaypoint(this.object, this.patrolWalk!, this.lastWalkIndex)) {
        return this.onWalkWaypoint(this.object, null, this.lastWalkIndex);
      }

      this.reset(
        this.patrolWalkName as TName,
        this.patrolWalkWaypoints,
        this.patrolLookName,
        this.patrolLookWaypoints,
        this.team,
        this.suggestedState,
        this.patrolCallbackDescriptor
      );
    } else {
      // Update movement state and continue patrolling.
      setStalkerState(this.object, this.currentStateMoving);

      // Still have to reach final point, no way to synchronize before it.
      assert(
        !this.patrolLookWaypoints!.get(this.lastLookIndex!).syn,
        "Object '%s': path_walk '%s': syn flag used on non-terminal waypoint.",
        this.object.name(),
        this.patrolWalkName
      );
    }
  }

  /**
   * todo: Description.
   */
  public onAnimationTurnEnd(): void {
    logger.format("Animation turn end for: '%s' at '%s'", this.object.name(), this.lastLookIndex);

    const waypoint: IWaypointData = this.patrolLookWaypoints!.get(this.lastLookIndex as TIndex);

    if (waypoint.syn) {
      this.synSignal = waypoint.sig as Optional<TName>;

      // Assert that `syn` signal is set.
      assert(
        this.synSignal,
        "Object '%s': path_look '%s': syn flag used without sig flag.",
        this.object.name(),
        this.patrolLookName
      );

      // Mark current object as synchronized.
      if (this.team) {
        registry.patrolSynchronization.get(this.team).set(this.object.id(), true);
      }
    } else {
      setObjectActiveSchemeSignal(this.object, waypoint.sig ? waypoint.sig : "turn_end");
    }

    if (this.retvalAfterRotation) {
      assert(
        this.patrolCallbackDescriptor,
        "Object '%s': path_look '%s': ret flag is set, but callback function wasn't registered in move_mgr.reset()",
        this.object.name(),
        this.patrolLookName
      );

      setStalkerState(this.object, this.currentStateStanding);

      assert(
        this.patrolCallbackDescriptor,
        "object '%s': path_look '%s': ret flag is set, but callback function wasn't registered in move_mgr.reset()",
        this.object.name(),
        this.patrolLookName
      );

      // todo: Probably simplify, never return true?
      if (
        this.patrolCallbackDescriptor.callback(
          this.patrolCallbackDescriptor.context,
          EWaypointArrivalType.AFTER_ANIMATION_TURN,
          this.retvalAfterRotation,
          this.lastWalkIndex
        )
      ) {
        // Nothing to do here.
        return;
      } else {
        setStalkerState(
          this.object,
          this.currentStateStanding,
          { context: this, callback: this.onAnimationEnd, turnEndCallback: this.onAnimationTurnEnd },
          this.patrolWaitTime,
          { lookPosition: (this.patrolLook as Patrol).point(this.lastLookIndex as TIndex), lookObjectId: null }
        );
      }
    }
  }

  /**
   * Handle reaching `walk` waypoint of patrol.
   * todo: Description.
   */
  public onWalkWaypoint(object: ClientObject, actionType: Optional<number>, index: Optional<TIndex>): void {
    logger.format(
      "Waypoint `walk`: '%s' action '%s', '%s' -> '%s'",
      this.object.name(),
      actionType,
      this.lastWalkIndex,
      index
    );

    // Patrol point is out of bounds.
    if (index === -1 || index === null) {
      return;
    }

    this.lastWalkIndex = index;
    this.isOnTerminalWaypoint = (this.patrolWalk as Patrol).terminal(index);

    logger.format("Walk index set: '%s' -> '%s'", this.object.name(), index);

    this.currentStateMoving = pickSectionFromCondList(
      registry.actor,
      this.object,
      this.patrolWalkWaypoints.get(index).a ?? this.defaultStateMoving1
    )!;

    const retv = this.patrolWalkWaypoints.get(index).ret;

    if (retv) {
      const retvNum = tonumber(retv);

      if (!this.patrolCallbackDescriptor) {
        abort(
          "object '%s': path_walk '%s': ret flag is set, but callback function wasn't registered in move_mgr:reset()",
          this.object.name(),
          this.patrolWalkName
        );
      }

      if (
        this.patrolCallbackDescriptor.callback(
          this.patrolCallbackDescriptor.context,
          EWaypointArrivalType.BEFORE_ANIMATION_TURN,
          retvNum,
          index
        )
      ) {
        return;
      }
    }

    const sig: Optional<TName> = this.patrolWalkWaypoints.get(index).sig;

    // todo: Always set signal path end on terminal points?
    if (sig) {
      // Set reach signal if override provided.
      setObjectActiveSchemeSignal(this.object, sig);
    } else if (index === this.patrolWalkWaypoints.length() - 1) {
      // Set path end if terminal point and no override provided.
      setObjectActiveSchemeSignal(this.object, "path_end");
    }

    const stopProbability = this.patrolWalkWaypoints.get(index).p;

    // Not looking right now OR have probability to stop, check against random chance:
    if (!this.patrolLook || (stopProbability && tonumber(stopProbability)! < math.random(1, 100))) {
      return setStalkerState(this.object, this.currentStateMoving);
    }

    const flags: Flags32 = this.patrolWalkWaypoints.get(index).flags;

    // Search for check??? todo: probably means that should not search for any look point here.
    if (flags.get() === 0) {
      return setStalkerState(this.object, this.currentStateMoving);
    } else {
      this.onLookWaypoint(object, actionType, index, flags);
    }
  }

  /**
   * Handle reaching `look` waypoint of patrol.
   * todo: Description.
   */
  public onLookWaypoint(
    object: ClientObject,
    actionType: Optional<number>,
    index: Optional<TIndex>,
    flags: Flags32
  ): void {
    const [lookPointIndex] = chooseLookPoint(this.patrolLook as Patrol, this.patrolLookWaypoints!, flags);

    logger.format(
      "Waypoint `look`: '%s' action '%s', '%s' -> '%s', selected '%s'",
      this.object.name(),
      actionType,
      this.lastWalkIndex,
      index,
      lookPointIndex
    );

    if (!lookPointIndex) {
      abort(
        "Object '%s': path_walk '%s', index.ts %d: cannot find corresponding point(s) on path_look '%s'.",
        this.object.name(),
        this.patrolWalkName,
        index,
        this.patrolLookName
      );
    }

    this.currentStateStanding = pickSectionFromCondList(
      registry.actor,
      this.object,
      this.patrolLookWaypoints!.get(lookPointIndex).a ?? this.defaultStateStanding
    )!;

    const suggestedWaitTime = this.patrolLookWaypoints!.get(lookPointIndex).t;

    if (suggestedWaitTime) {
      if (suggestedWaitTime === "*") {
        this.patrolWaitTime = null;
      } else {
        const tm: TDuration = tonumber(suggestedWaitTime)!;

        if (tm !== 0 && (tm < 1000 || tm > 45000)) {
          abort(
            "Object '%s': path_look '%s': flag 't': incorrect time specified " +
              "(* or number in interval [1000, 45000] is expected)",
            this.object.name(),
            this.patrolLookName
          );
        }

        this.patrolWaitTime = tm;
      }
    } else {
      this.patrolWaitTime = StalkerPatrolManager.DEFAULT_PATROL_WAIT_TIME;
    }

    const retVal: Optional<string> = this.patrolLookWaypoints!.get(lookPointIndex).ret;

    this.retvalAfterRotation = retVal ? (tonumber(retVal) as number) : null;

    logger.format("Look index set: '%s' -> '%s'", this.object.name(), lookPointIndex);

    this.lastLookIndex = lookPointIndex;

    setStalkerState(
      this.object,
      this.currentStateStanding,
      { context: this, callback: this.onAnimationEnd, turnEndCallback: this.onAnimationTurnEnd },
      this.patrolWaitTime,
      { lookPosition: (this.patrolLook as Patrol).point(this.lastLookIndex as TIndex), lookObjectId: null }
    );

    this.state = ECurrentMovementState.STANDING;

    this.update();
  }
}
