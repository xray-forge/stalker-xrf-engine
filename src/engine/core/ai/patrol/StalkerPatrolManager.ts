import { callback, move, patrol, time_global } from "xray16";

import { isPatrolTeamSynchronized } from "@/engine/core/ai/patrol/patrol_utils";
import { patrolConfig } from "@/engine/core/ai/patrol/PatrolConfig";
import {
  EStalkerState,
  EWaypointArrivalType,
  IPatrolCallbackDescriptor,
  IPatrolSuggestedState,
} from "@/engine/core/animation/types";
import { registry, setStalkerState } from "@/engine/core/database";
import { abort, assert } from "@/engine/core/utils/assertion";
import { IWaypointData, parseConditionsList, pickSectionFromCondList, TConditionList } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import {
  choosePatrolWaypointByFlags,
  isObjectAtTerminalWaypoint,
  isObjectAtWaypoint,
} from "@/engine/core/utils/patrol";
import { setObjectActiveSchemeSignal } from "@/engine/core/utils/scheme";
import {
  EGameObjectPath,
  Flags32,
  GameObject,
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
 *
 * {@link https://xray-forge.github.io/stalker-xrf-book/script_engine/patrols.html patrols system}
 */
export class StalkerPatrolManager {
  public readonly object: GameObject;
  public team: Optional<TName> = null;

  public suggestedStates: Optional<IPatrolSuggestedState> = null;
  public currentStateMoving!: EStalkerState;
  public currentStateStanding!: EStalkerState;

  // Descriptor of callback to call on waypoint update emit.
  public patrolCallbackDescriptor: Optional<IPatrolCallbackDescriptor> = null;
  public retvalAfterRotation: Optional<number> = null;

  // Next timestamp to check synchronization of run-walk-sprint state.
  public keepStateUntil: TTimestamp = 0;
  public patrolWaitTime: Optional<TDuration> = null;

  public lastWalkPointIndex: Optional<TIndex> = null; // last active point of walk patrol
  public lastLookPointIndex: Optional<TIndex> = null; // last active point of look patrol
  public synchronizationSignal: Optional<TName> = null; // signal to set when team is synchronized
  public synchronizationSignalTimeout: TTimestamp = 0; // timestamp to block sync check for some time

  public canUseGetCurrentPointIndex: boolean = false;
  public currentPointInitAt: TTimestamp = 0;
  public currentPointIndex: Optional<TIndex> = null;

  public walkUntil: TTimestamp = 0; // Delay to switch patrols smoothly.
  public runUntil: TTimestamp = 0; // Delay to switch patrols smoothly.

  public patrolWalk: Optional<Patrol> = null;
  public patrolWalkName: Optional<TName> = null;
  public patrolWalkWaypoints!: LuaArray<IWaypointData>;
  public patrolLook: Optional<Patrol> = null;
  public patrolLookName: Optional<TName> = null;
  public patrolLookWaypoints: Optional<LuaArray<IWaypointData>> = null;

  public defaultStateStanding!: TConditionList;
  public defaultStateMoving1!: TConditionList;
  public defaultStateMoving2!: TConditionList;
  public defaultStateMoving3!: TConditionList;

  public constructor(object: GameObject) {
    this.object = object;
  }

  /**
   * Initialize patrol manager, setup state and callbacks.
   *
   * @returns initialized manager reference
   */
  public initialize(): StalkerPatrolManager {
    logger.info("Initialize patrol manager for: '%s'", this.object.name());

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
    logger.info(
      "Reset patrol manager for: '%s', walk - '%s' look - '%s', team - '%s'",
      this.object.name(),
      walkPathName,
      lookPathName,
      patrolTeam
    );

    const now: TTimestamp = time_global();

    this.patrolWaitTime = patrolConfig.DEFAULT_PATROL_WAIT_TIME;
    this.suggestedStates = patrolSuggestedStates;

    this.defaultStateStanding = parseConditionsList(
      patrolSuggestedStates?.standing ?? patrolConfig.DEFAULT_PATROL_STATE_STANDING
    );
    this.defaultStateMoving1 = parseConditionsList(
      patrolSuggestedStates?.moving ?? patrolConfig.DEFAULT_PATROL_STATE_MOVING
    );
    this.defaultStateMoving2 = parseConditionsList(
      patrolSuggestedStates?.moving ?? patrolConfig.DEFAULT_PATROL_STATE_MOVING
    );
    this.defaultStateMoving3 = parseConditionsList(
      patrolSuggestedStates?.moving ?? patrolConfig.DEFAULT_PATROL_STATE_MOVING
    );

    this.synchronizationSignalTimeout = now + 1000;
    this.synchronizationSignal = null;

    this.patrolCallbackDescriptor = patrolCallbackDescriptor;

    // Initialize sync state if it is changed:
    if (patrolTeam !== this.team) {
      this.team = patrolTeam;

      if (this.team) {
        let state: Optional<LuaTable<TNumberId, boolean>> = patrolConfig.PATROL_TEAMS.get(this.team);

        if (!state) {
          state = new LuaTable();
          patrolConfig.PATROL_TEAMS.set(this.team, state);
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

      if (lookPathName) {
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
      this.walkUntil = now + patrolConfig.WALK_STATE_DURATION;
      this.runUntil = now + patrolConfig.WALK_STATE_DURATION + patrolConfig.RUN_STATE_DURATION;
      this.keepStateUntil = now;

      this.retvalAfterRotation = null;
      this.currentPointIndex = null;
      this.lastWalkPointIndex = null;
      this.lastLookPointIndex = null;

      // Reset previous patrols.
      this.object.patrol_path_make_inactual();
    }

    // Perform movement update based on current paths.
    this.setup();
  }

  /**
   * Dispose all related data and manager instance.
   */
  public finalize(): void {
    logger.info(
      "Finalize patrol manager for: '%s', walk '%s' look '%s' , team '%s'",
      this.object.name(),
      this.patrolWalkName,
      this.patrolLookName,
      this.team
    );

    if (this.team) {
      patrolConfig.PATROL_TEAMS.get(this.team).delete(this.object.id());
    }

    this.object.set_path_type(EGameObjectPath.LEVEL_PATH);

    // todo: Should remove callback from init?
  }

  /**
   * todo: Description.
   */
  public setup(): void {
    this.object.set_path_type(EGameObjectPath.PATROL_PATH);
    this.object.set_detail_path_type(move.line);

    if (this.currentPointIndex) {
      this.object.set_start_point(this.currentPointIndex);
      this.object.set_patrol_path(this.patrolWalkName as TName, patrol.next, patrol.continue, true);
    } else {
      this.object.set_patrol_path(this.patrolWalkName as TName, patrol.nearest, patrol.continue, true);
    }

    const [isTerminalPoint, terminalPointIndex] = isObjectAtTerminalWaypoint(this.object, this.patrolWalk as Patrol);

    if (isTerminalPoint) {
      this.onWalkWaypoint(this.object, null, terminalPointIndex);
    } else {
      setStalkerState(this.object, this.currentStateMoving);
    }
  }

  /**
   * Handle game object update tick.
   */
  public update(): void {
    const now: TTimestamp = time_global();

    // If sync is needed and time passed, check state and write signal when should.
    if (this.synchronizationSignal && now >= this.synchronizationSignalTimeout && isPatrolTeamSynchronized(this.team)) {
      setObjectActiveSchemeSignal(this.object, this.synchronizationSignal);
      this.synchronizationSignal = null; // Reset.
    }

    // todo: explain.
    if (this.canUseGetCurrentPointIndex && this.lastWalkPointIndex === null && now >= this.keepStateUntil) {
      this.keepStateUntil = now + patrolConfig.KEEP_STATE_DURATION;

      const distance: TDistance = this.object
        .position()
        .distance_to_sqr(this.patrolWalk!.point(this.currentPointIndex as TIndex));

      if (distance <= patrolConfig.DISTANCE_TO_WALK_SQR || now < this.walkUntil) {
        this.currentStateMoving = pickSectionFromCondList(registry.actor, this.object, this.defaultStateMoving1)!;
      } else if (distance <= patrolConfig.DISTANCE_TO_RUN_SQR || now < this.runUntil) {
        this.currentStateMoving = pickSectionFromCondList(registry.actor, this.object, this.defaultStateMoving2)!;
      } else {
        this.currentStateMoving = pickSectionFromCondList(registry.actor, this.object, this.defaultStateMoving3)!;
      }

      setStalkerState(this.object, this.currentStateMoving);
    }
  }

  /**
   * Handle animation update on some path_look point.
   * Fired on timeout or when animation is finished.
   */
  public onAnimationEnd(): void {
    logger.info("Animation end for: '%s' at '%s'", this.object.name(), this.lastLookPointIndex);

    // No active scheme for logics update, just skip update.
    if (registry.objects.get(this.object.id()).activeScheme === null) {
      return;
    }

    const signalOnTime: Optional<TName> = this.patrolLookWaypoints!.get(this.lastLookPointIndex!)
      .sigtm as Optional<TName>;

    // Animation is finished, have signal to set -> set it for activeScheme.
    if (signalOnTime) {
      setObjectActiveSchemeSignal(this.object, signalOnTime);
    }

    // Animation is finished, currently on terminal waypoint -> notify logics about finally reaching the point.
    if (this.lastWalkPointIndex && (this.patrolWalk as Patrol).terminal(this.lastWalkPointIndex)) {
      if (isObjectAtWaypoint(this.object, this.patrolWalk!, this.lastWalkPointIndex)) {
        return this.onWalkWaypoint(this.object, null, this.lastWalkPointIndex);
      }

      this.reset(
        this.patrolWalkName as TName,
        this.patrolWalkWaypoints,
        this.patrolLookName,
        this.patrolLookWaypoints,
        this.team,
        this.suggestedStates,
        this.patrolCallbackDescriptor
      );
    } else {
      // Update movement state and continue patrolling.
      setStalkerState(this.object, this.currentStateMoving);

      // Still have to reach final point, no way to synchronize before it.
      assert(
        !this.patrolLookWaypoints!.get(this.lastLookPointIndex!).syn,
        "Object '%s': path_walk '%s': syn flag used on non-terminal waypoint.",
        this.object.name(),
        this.patrolWalkName
      );
    }
  }

  /**
   * Handle animation turn end and starting to correctly animate.
   * Usually means that look point reached and prepared, animation just starting and required signals emit.
   * Sync requirement may block signals emitting for a while.
   */
  public onAnimationTurnEnd(): void {
    logger.info("Animation turn end for: '%s' at '%s'", this.object.name(), this.lastLookPointIndex);

    const waypoint: IWaypointData = this.patrolLookWaypoints!.get(this.lastLookPointIndex as TIndex);

    // Sync is required, wait for others.
    if (waypoint.syn) {
      this.synchronizationSignal = waypoint.sig as Optional<TName>;

      // Assert that `syn` signal is set.
      assert(
        this.synchronizationSignal,
        "Object '%s': path_look '%s': syn flag used without sig flag.",
        this.object.name(),
        this.patrolLookName
      );

      // Mark current object as synchronized.
      if (this.team) {
        patrolConfig.PATROL_TEAMS.get(this.team).set(this.object.id(), true);
      }
    } else {
      // Emit turn signal since not blocked by sync.
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

      if (
        this.patrolCallbackDescriptor.callback.call(
          this.patrolCallbackDescriptor.context,
          EWaypointArrivalType.AFTER_ANIMATION_TURN,
          this.retvalAfterRotation,
          this.lastWalkPointIndex as TIndex
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
          { lookPosition: (this.patrolLook as Patrol).point(this.lastLookPointIndex as TIndex), lookObjectId: null }
        );
      }
    }
  }

  /**
   * Handle reaching `walk` waypoint of patrol.
   * todo: Description.
   */
  public onWalkWaypoint(object: GameObject, actionType: Optional<number>, index: Optional<TIndex>): void {
    logger.info(
      "Waypoint `walk`: '%s' action '%s', '%s' -> '%s'",
      this.object.name(),
      actionType,
      this.lastWalkPointIndex,
      index
    );

    // Patrol point is out of bounds.
    if (index === -1 || index === null) {
      return;
    }

    this.lastWalkPointIndex = index;

    logger.info("Walk index set: '%s' -> '%s'", this.object.name(), index);

    this.currentStateMoving = pickSectionFromCondList(
      registry.actor,
      this.object,
      this.patrolWalkWaypoints.get(index).a ?? this.defaultStateMoving1
    )!;

    const retv = this.patrolWalkWaypoints.get(index).ret;

    if (retv) {
      const retvNum: Optional<number> = tonumber(retv) as Optional<number>;

      if (!this.patrolCallbackDescriptor) {
        abort(
          "object '%s': path_walk '%s': ret flag is set, but callback function wasn't registered in move_mgr:reset()",
          this.object.name(),
          this.patrolWalkName
        );
      }

      if (
        this.patrolCallbackDescriptor.callback.call(
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
    object: GameObject,
    actionType: Optional<number>,
    index: Optional<TIndex>,
    flags: Flags32
  ): void {
    const [lookPointIndex] = choosePatrolWaypointByFlags(this.patrolLook as Patrol, this.patrolLookWaypoints!, flags);

    logger.info(
      "Waypoint `look`: '%s' action '%s', '%s' -> '%s', selected '%s'",
      this.object.name(),
      actionType,
      this.lastWalkPointIndex,
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
        const waitTime: TDuration = tonumber(suggestedWaitTime)!;

        if (waitTime !== 0 && (waitTime < 1000 || waitTime > 45000)) {
          abort(
            "Object '%s': path_look '%s': flag 't': incorrect time specified " +
              "(* or number in interval [1000, 45000] is expected)",
            this.object.name(),
            this.patrolLookName
          );
        }

        this.patrolWaitTime = waitTime;
      }
    } else {
      this.patrolWaitTime = patrolConfig.DEFAULT_PATROL_WAIT_TIME;
    }

    const retVal: Optional<string> = this.patrolLookWaypoints!.get(lookPointIndex).ret;

    this.retvalAfterRotation = retVal ? (tonumber(retVal) as number) : null;

    logger.info("Look index set: '%s' -> '%s'", this.object.name(), lookPointIndex);

    this.lastLookPointIndex = lookPointIndex;

    setStalkerState(
      this.object,
      this.currentStateStanding,
      { context: this, callback: this.onAnimationEnd, turnEndCallback: this.onAnimationTurnEnd },
      this.patrolWaitTime,
      { lookPosition: (this.patrolLook as Patrol).point(this.lastLookPointIndex as TIndex), lookObjectId: null }
    );

    this.update();
  }

  /**
   * Handle object extrapolate callback.
   *
   * @param object - target object callback is called for
   * @param pointIndex - index of extrapolate point
   */
  public onExtrapolate(object: GameObject, pointIndex: TIndex): void {
    this.canUseGetCurrentPointIndex = true;
    this.currentPointInitAt = time_global();
    this.currentPointIndex = this.object.get_current_point_index();

    logger.info(
      "Extrapolate patrol point for: '%s' at '%s' | '%s'",
      this.object.name(),
      this.currentPointIndex,
      pointIndex
    );
  }
}
