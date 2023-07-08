import { callback, level, move, patrol, time_global } from "xray16";

import { IRegistryObjectState, registry, setStalkerState } from "@/engine/core/database";
import { EStalkerState } from "@/engine/core/objects/state/types";
import { abort } from "@/engine/core/utils/assertion";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/ini_config";
import { parseConditionsList } from "@/engine/core/utils/ini/ini_parse";
import { IWaypointData, TConditionList } from "@/engine/core/utils/ini/ini_types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isObjectAtWaypoint } from "@/engine/core/utils/object";
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

const logger: LuaLogger = new LuaLogger($filename);

const DIST_WALK: TDistance = 10;
const DIST_RUN: TDistance = 2500;
const WALK_MIN_TIME: TDuration = 3000;
const RUN_MIN_TIME: TDuration = 2000;
const KEEP_STATE_MIN_TIME: TDuration = 1500;
const DEFAULT_WAIT_TIME: TDuration = 10000;

const DEFAULT_STATE_STANDING: EStalkerState = EStalkerState.GUARD;
const DEFAULT_STATE_MOVING1: EStalkerState = EStalkerState.PATROL;
const DEFAULT_STATE_MOVING2: EStalkerState = EStalkerState.PATROL;
const DEFAULT_STATE_MOVING3: EStalkerState = EStalkerState.PATROL;

const ARRIVAL_BEFORE_ROTATION: number = 0;
const ARRIVAL_AFTER_ROTATION: number = 1;

enum ECurrentState {
  NONE = 0,
  MOVING = 1,
  STANDING = 2,
}

const sync: LuaTable<string, LuaTable<number, boolean>> = new LuaTable();

/**
 * todo;
 */
export class StalkerMoveManager {
  /**
   * todo: Description.
   */
  public static chooseLookPoint(
    patrolLook: Patrol,
    pathLookInfo: LuaArray<IWaypointData>,
    searchFor: Flags32
  ): LuaMultiReturn<[Optional<number>, number]> {
    let patrolChosenIdx: Optional<TIndex> = null;

    let ptsFoundTotalWeight = 0;
    let numEqualPts = 0;

    for (const lookIndex of $range(0, patrolLook.count() - 1)) {
      const thisVal = pathLookInfo.get(lookIndex).flags;

      if (thisVal.equal(searchFor)) {
        numEqualPts = numEqualPts + 1;

        const probabilityRaw = pathLookInfo.get(lookIndex)["p"];
        const pointLookWeight: number = probabilityRaw === null ? 100 : (tonumber(probabilityRaw) as number);

        ptsFoundTotalWeight = ptsFoundTotalWeight + pointLookWeight;

        const r = math.random(1, ptsFoundTotalWeight);

        if (r <= pointLookWeight) {
          patrolChosenIdx = lookIndex;
        }
      }
    }

    return $multi(patrolChosenIdx, numEqualPts);
  }

  public readonly object: ClientObject;

  public state: Optional<ECurrentState> = null;
  public currentStateMoving!: EStalkerState;
  public currentStateStanding!: EStalkerState;

  public ptWaitTime: Optional<TDuration> = null;
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

  /**
   * todo: Description.
   */
  public constructor(object: ClientObject) {
    this.object = object;
  }

  /**
   * todo: Description.
   */
  public initialize(): StalkerMoveManager {
    this.object.set_callback(callback.patrol_path_in_point, this.onWaypoint, this as any);

    return this;
  }

  /**
   * todo: Description.
   */
  public reset(
    walkPath: TName,
    walkPathInfo: LuaArray<IWaypointData>,
    lookPath: Optional<string>,
    lookPathInfo: Optional<LuaArray<IWaypointData>>,
    team: Optional<string>,
    suggestedState: Optional<any>,
    moveCbInfo: Optional<{ obj: AnyObject; func: AnyCallable }>,
    noValidation: Optional<boolean>,
    fplaceholder: Optional<any>,
    useDefaultSound: Optional<boolean>
  ): void {
    this.ptWaitTime = DEFAULT_WAIT_TIME;
    this.suggestedState = suggestedState;

    const defStateStanding = suggestedState?.standing ? suggestedState.standing : DEFAULT_STATE_STANDING;
    const defStateMoving1 = suggestedState?.moving ? suggestedState.moving : DEFAULT_STATE_MOVING1;
    const defStateMoving2 = suggestedState?.moving ? suggestedState.moving : DEFAULT_STATE_MOVING2;
    const defStateMoving3 = suggestedState?.moving ? suggestedState.moving : DEFAULT_STATE_MOVING3;

    this.defaultStateStanding = parseConditionsList(defStateStanding);
    this.defaultStateMoving1 = parseConditionsList(defStateMoving1);
    this.defaultStateMoving2 = parseConditionsList(defStateMoving2);
    this.defaultStateMoving3 = parseConditionsList(defStateMoving3);

    this.synSignalSetTm = time_global() + 1000;
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

      this.currentStateStanding = pickSectionFromCondList(
        registry.actor,
        this.object,
        this.defaultStateStanding as any
      )!;
      this.currentStateMoving = pickSectionFromCondList(registry.actor, this.object, this.defaultStateMoving1 as any)!;

      this.retvalAfterRotation = null;

      this.canUseGetCurrentPointIndex = false;
      this.currentPointIndex = null;
      this.walkUntil = time_global() + WALK_MIN_TIME;
      this.runUntil = time_global() + WALK_MIN_TIME + RUN_MIN_TIME;
      this.keepStateUntil = time_global();

      this.lastIndex = null;
      this.lastLookIndex = null;

      this.useDefaultSound = useDefaultSound!;

      this.object.patrol_path_make_inactual();
    }

    this.setupMovementByPatrolPath();
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
    if (this.synSignal && time_global() >= this.synSignalSetTm) {
      if (this.isSynchronized()) {
        this.setActiveSchemeSignal(this.synSignal);
        this.synSignal = null;
      }
    }

    if (this.canUseGetCurrentPointIndex && !this.isArrivedToFirstWaypoint()) {
      const now: TTimestamp = time_global();

      if (now >= this.keepStateUntil) {
        this.keepStateUntil = now + KEEP_STATE_MIN_TIME;

        const currentPointIndex: TIndex = this.currentPointIndex!;
        const dist: TDistance = this.object.position().distance_to(this.patrolWalk!.point(currentPointIndex));

        if (dist <= DIST_WALK || now < this.walkUntil) {
          this.currentStateMoving = pickSectionFromCondList(
            registry.actor,
            this.object,
            this.defaultStateMoving1 as any
          )!;
        } else if (dist <= DIST_RUN || now < this.runUntil) {
          this.currentStateMoving = pickSectionFromCondList(
            registry.actor,
            this.object,
            this.defaultStateMoving2 as any
          )!;
        } else {
          this.currentStateMoving = pickSectionFromCondList(
            registry.actor,
            this.object,
            this.defaultStateMoving3 as any
          )!;
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
      this.ptWaitTime,
      { lookPosition: lookPosition, lookObject: null },
      null
    );
  }

  /**
   * todo: Description.
   */
  public finalize(): void {
    if (this.team) {
      sync.get(this.team).delete(this.object.id());
    }

    this.object.set_path_type(EClientObjectPath.LEVEL_PATH);
  }

  /**
   * todo: Description.
   */
  public setupMovementByPatrolPath(): void {
    this.object.set_path_type(EClientObjectPath.PATROL_PATH);
    this.object.set_detail_path_type(move.line);

    if (this.currentPointIndex) {
      this.object.set_start_point(this.currentPointIndex);
      this.object.set_patrol_path(this.pathWalk!, patrol.next, patrol.continue, true);
    } else {
      this.object.set_patrol_path(this.pathWalk!, patrol.nearest, patrol.continue, true);
    }

    this.state = ECurrentState.MOVING;

    const [isTerminalPoint, index] = this.isStandingOnTerminalWaypoint();

    if (isTerminalPoint) {
      this.onWaypoint(this.object, null, index);
    } else {
      this.updateMovementState();
    }
  }

  /**
   * todo: Description.
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
  public setActiveSchemeSignal(signal: TName): void {
    const state: IRegistryObjectState = registry.objects.get(this.object.id());

    if (state !== null && state[state.activeScheme!] !== null) {
      const signals: Optional<LuaTable<TName, boolean>> = state[state.activeScheme!]!.signals;

      if (signals !== null) {
        signals.set(signal, true);
      }
    }
  }

  /**
   * todo: Description.
   */
  public onAnimationUpdate(): void {
    const sigtm: Optional<TName> = this.pathLookInfo!.get(this.lastLookIndex!)["sigtm"] as Optional<TName>;

    if (sigtm) {
      this.setActiveSchemeSignal(sigtm);
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
        this.pathLook!,
        this.pathLookInfo,
        this.team,
        this.suggestedState,
        this.moveCbInfo,
        this.noValidation!,
        null,
        null
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

      if (sig) {
        this.setActiveSchemeSignal(sig);
      } else {
        this.setActiveSchemeSignal("turn_end");
      }
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

      setStalkerState(this.object, this.currentStateStanding, null, null, null, null);

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
    this.canUseGetCurrentPointIndex = true;
    this.currentPointInitTime = time_global();
    this.currentPointIndex = this.object.get_current_point_index();
  }

  /**
   * todo: Description.
   */
  public onWaypoint(object: ClientObject, actionType: Optional<number>, index: Optional<TIndex>): void {
    if (index === -1 || index === null) {
      return;
    }

    this.lastIndex = index;

    if (this.patrolWalk!.terminal(index)) {
      this.isOnTerminalWaypoint = true;
    }

    const suggestedStateMoving = this.pathWalkInfo.get(index)["a"];

    if (suggestedStateMoving) {
      this.currentStateMoving = pickSectionFromCondList(registry.actor, this.object, suggestedStateMoving as any)!;
      if (tostring(this.currentStateMoving) === TRUE) {
        abort("!!!!!");
      }
    } else {
      this.currentStateMoving = pickSectionFromCondList(registry.actor, this.object, this.defaultStateMoving1 as any)!;
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
      this.setActiveSchemeSignal(sig);
    } else if (index === this.pathWalkInfo.length() - 1) {
      this.setActiveSchemeSignal("path_end");
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

    const [ptChosenIdx, numEqualPts] = StalkerMoveManager.chooseLookPoint(
      this.patrolLook,
      this.pathLookInfo!,
      searchFor
    );

    if (ptChosenIdx) {
      const suggestedAnimationsSet: Optional<string> = this.pathLookInfo!.get(ptChosenIdx)["a"];

      this.currentStateStanding = pickSectionFromCondList(
        registry.actor,
        this.object,
        suggestedAnimationsSet ? suggestedAnimationsSet : (this.defaultStateStanding as any)
      )!;

      const suggestedWaitTime = this.pathLookInfo!.get(ptChosenIdx)["t"];

      if (suggestedWaitTime) {
        if (suggestedWaitTime === "*") {
          this.ptWaitTime = null;
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

          this.ptWaitTime = tm;
        }
      } else {
        this.ptWaitTime = DEFAULT_WAIT_TIME;
      }

      const retv = this.pathLookInfo!.get(ptChosenIdx)["ret"];

      this.retvalAfterRotation = retv ? tonumber(retv)! : null;

      this.lastLookIndex = ptChosenIdx;
      this.updateStandingState(this.patrolLook.point(ptChosenIdx));

      this.state = ECurrentState.STANDING;

      this.update();
    } else {
      abort(
        "object '%s': path_walk '%s', index.ts %d: cannot find corresponding point(s) on path_look '%s'",
        this.object.name(),
        tostring(this.pathWalk),
        tostring(index),
        tostring(this.pathLook)
      );
    }
  }
}
