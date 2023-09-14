import { anim, cond, look, move, patrol, sound } from "xray16";

import { registry, setMonsterState } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/objects/ai/scheme";
import { ISchemeMobWalkerState } from "@/engine/core/schemes/mob_walker/ISchemeMobWalkerState";
import { abort } from "@/engine/core/utils/assertion";
import { IWaypointData, parseWaypointsData, pickSectionFromCondList } from "@/engine/core/utils/ini";
import { isObjectAtWaypoint } from "@/engine/core/utils/object";
import { chooseLookPoint } from "@/engine/core/utils/patrol";
import { isMonsterScriptCaptured, scriptCaptureMonster, scriptCommandMonster } from "@/engine/core/utils/scheme";
import { copyVector } from "@/engine/core/utils/vector";
import { EMonsterState } from "@/engine/lib/constants/monsters";
import { NIL, TRUE } from "@/engine/lib/constants/words";
import {
  ClientObject,
  EScheme,
  Flags32,
  LuaArray,
  Optional,
  Patrol,
  TAnimationKey,
  TAnimationType,
  TDuration,
  TIndex,
  TName,
  TSoundKey,
  Vector,
} from "@/engine/lib/types";

const DEFAULT_WAIT_TIME: TDuration = 5000;
const DEFAULT_ANIM_STANDING: TAnimationType = anim.stand_idle;

const STATE_MOVING: number = 0;
const STATE_STANDING: number = 1;

/**
 * todo;
 */
export class MobWalkerManager extends AbstractSchemeManager<ISchemeMobWalkerState> {
  public lastIndex: Optional<TIndex> = null;
  public patrolLook: Optional<Patrol> = null;
  public patrolWalk: Optional<Patrol> = null;
  public lastLookIndex: Optional<TIndex> = null;
  public curAnimSet: Optional<TAnimationType> = null;
  public scheduledSound: Optional<TSoundKey> = null;
  public ptWaitTime: Optional<number> = null;

  public pathWalkInfo!: Optional<LuaArray<IWaypointData>>;

  public crouch: Optional<boolean> = null;
  public running: Optional<boolean> = null;
  public mobState: Optional<number> = null;

  public pathLookInfo: Optional<LuaTable<number, IWaypointData>> = null;

  /**
   * todo: Description.
   */
  public override activate(): void {
    setMonsterState(this.object, this.state.state);

    this.state.signals = new LuaTable();
    scriptCaptureMonster(this.object, true);

    this.patrolWalk = new patrol(this.state.path_walk);

    if (!this.patrolWalk) {
      abort("object '%s': unable to find path_walk '%s' on the map", this.object.name(), this.state.path_walk);
    }

    if (this.state.path_look) {
      this.patrolLook = new patrol(this.state.path_look);
      if (!this.patrolLook) {
        abort("object '%s': unable to find path_look '%s' on the map", this.object.name(), this.state.path_look);
      }
    } else {
      this.patrolLook = null;
    }

    if (this.state.path_walk_info === null) {
      this.state.path_walk_info = parseWaypointsData(this.state.path_walk);
      this.pathWalkInfo = this.state.path_walk_info;
    }

    if (this.state.path_look_info === null && this.state.path_look !== null) {
      this.state.path_look_info = parseWaypointsData(this.state.path_look);
      this.pathLookInfo = this.state.path_look_info;
    }

    this.mobState = STATE_MOVING;
    this.crouch = false;
    this.running = false;
    this.curAnimSet = DEFAULT_ANIM_STANDING;
    this.ptWaitTime = DEFAULT_WAIT_TIME;
    this.scheduledSound = null;
    this.lastIndex = null;
    this.lastLookIndex = null;

    scriptCommandMonster(
      this.object,
      new move(move.walk_fwd, new patrol(this.state.path_walk, patrol.next, patrol.continue)),
      new cond(cond.move_end)
    );
  }

  /**
   * todo: Description.
   */
  public update(): void {
    if (!isMonsterScriptCaptured(this.object)) {
      this.activate();

      return;
    }

    if (this.mobState === STATE_STANDING) {
      if (!this.object.action()) {
        const patrolWalkCount = this.patrolWalk!.count();

        if (patrolWalkCount === 1 && isObjectAtWaypoint(this.object, this.patrolWalk!, 0)) {
          this.mobState = STATE_MOVING;
          this.onWaypoint(this.object, null, this.lastIndex);
        } else {
          this.lastLookIndex = null;
          this.mobState = STATE_MOVING;
          this.updateMovementState();
        }
      }
    }
  }

  /**
   * todo: Description.
   */
  public arrivedToFirstWaypoint(): boolean {
    return this.lastIndex !== null;
  }

  /**
   * todo: Description.
   */
  public override onWaypoint(object: ClientObject, actionType: Optional<TName>, index: Optional<TIndex>): void {
    if (index === -1 || index === null) {
      return;
    }

    this.lastIndex = index;

    const suggestedSound = this.pathWalkInfo!.get(index)["s"] as Optional<TSoundKey>;

    if (suggestedSound) {
      this.scheduledSound = suggestedSound;
    }

    const suggestedCrouch = this.pathWalkInfo!.get(index)["c"];

    this.crouch = suggestedCrouch === TRUE;

    const suggestedRunning = this.pathWalkInfo!.get(index)["r"];

    this.running = suggestedRunning === TRUE;

    const signal: Optional<TName> = this.pathWalkInfo!.get(index)["sig"] as TName;

    if (signal !== null) {
      // -- HACK, fixme:
      const objectId = this.object.id();
      const scheme: EScheme = registry.objects.get(objectId)["activeScheme"]!;
      const signals: LuaTable<TName, boolean> = registry.objects.get(objectId)[scheme!]!.signals!;

      signals.set(signal, true);
    }

    const beh: Optional<EMonsterState> = this.pathWalkInfo!.get(index)["b"] as Optional<EMonsterState>;

    setMonsterState(this.object, beh ? beh : this.state.state);

    const searchForFlags = this.pathWalkInfo!.get(index)["flags"] as Flags32;

    if (searchForFlags.get() === 0) {
      this.updateMovementState();

      return;
    }

    const [ptChosenIdx] = chooseLookPoint(this.patrolLook!, this.pathLookInfo!, searchForFlags);

    if (ptChosenIdx) {
      const suggestedWaitTime = this.pathLookInfo!.get(ptChosenIdx)["t"];

      if (suggestedWaitTime) {
        this.ptWaitTime = tonumber(suggestedWaitTime)!;
      } else {
        const patrolWalkCount = this.patrolWalk!.count();

        if (patrolWalkCount === 1 && isObjectAtWaypoint(this.object, this.patrolWalk!, 0)) {
          this.ptWaitTime = 100_000_000;
        } else {
          this.ptWaitTime = DEFAULT_WAIT_TIME;
        }
      }

      let suggestedAnimSet = this.pathLookInfo!.get(ptChosenIdx)["a"];

      if (suggestedAnimSet) {
        if (suggestedAnimSet === NIL) {
          suggestedAnimSet = null;
        }

        this.curAnimSet = anim[pickSectionFromCondList(registry.actor, this.object, suggestedAnimSet) as TAnimationKey];
      } else {
        this.curAnimSet = DEFAULT_ANIM_STANDING;
      }

      const beh = this.pathWalkInfo!.get(index)["b"];

      setMonsterState(this.object, (beh ? beh : this.state.state) as EMonsterState);

      if (ptChosenIdx !== this.lastLookIndex) {
        this.lookAtWaypoint(ptChosenIdx);
      }

      this.mobState = STATE_STANDING;
      this.updateStandingState();

      this.update();
    } else {
      abort("object '%s': cannot find corresponding point(s) on path_look '%s'", this.object.name(), index);
    }
  }

  /**
   * todo: Description.
   */
  public updateMovementState(): void {
    scriptCaptureMonster(this.object, true);

    let m;

    if (this.running) {
      m = move.run_fwd;
    } else if (this.crouch) {
      m = move.steal;
    } else {
      m = move.walk_fwd;
    }

    if (this.scheduledSound) {
      scriptCommandMonster(
        this.object,
        new move(m, new patrol(this.state.path_walk, patrol.next, patrol.continue)),
        new sound(sound[this.scheduledSound]),
        new cond(cond.move_end)
      );
      this.scheduledSound = null;
    } else {
      scriptCommandMonster(
        this.object,
        new move(m, new patrol(this.state.path_walk, patrol.next, patrol.continue)),
        new cond(cond.move_end)
      );
    }
  }

  /**
   * todo: Description.
   */
  public updateStandingState(): void {
    scriptCaptureMonster(this.object, true);

    if (this.scheduledSound) {
      scriptCommandMonster(
        this.object,
        new anim(this.curAnimSet!, 0),
        new sound(sound[this.scheduledSound]),
        new cond(cond.time_end, this.ptWaitTime!)
      );
      this.scheduledSound = null;
    } else {
      scriptCommandMonster(this.object, new anim(this.curAnimSet!, 0), new cond(cond.time_end, this.ptWaitTime!));
    }
  }

  /**
   * todo: Description.
   */
  public override deactivate(): void {
    scriptCaptureMonster(this.object, true);
    scriptCommandMonster(this.object, new move(move.steal, this.patrolWalk!.point(0)), new cond(cond.move_end));
  }

  /**
   * todo: Description.
   */
  public lookAtWaypoint(pt: number): void {
    if (!this.patrolLook) {
      return;
    }

    const lookPoint: Vector = copyVector(this.patrolLook.point(pt)).sub(this.object.position());

    lookPoint.normalize();
    // --this.object:set_sight(look.direction, look_pt, 0)

    scriptCaptureMonster(this.object, true);
    scriptCommandMonster(this.object, new look(look.direction, lookPoint), new cond(cond.look_end));

    this.lastLookIndex = pt;
  }
}
