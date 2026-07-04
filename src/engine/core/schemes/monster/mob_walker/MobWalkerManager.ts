import { anim, cond, look, move, patrol, sound } from "xray16";
import { $isNil, $isNotNil } from "xray16/macros";

import { AbstractSchemeManager } from "@/engine/core/ai/scheme";
import { registry, setMonsterState } from "@/engine/core/database";
import { EMobWalkerState, ISchemeMobWalkerState } from "@/engine/core/schemes/monster/mob_walker/mob_walker_types";
import { mobWalkerConfig } from "@/engine/core/schemes/monster/mob_walker/MobWalkerConfig";
import { abort } from "@/engine/core/utils/assertion";
import { IWaypointData, parseWaypointsData, pickSectionFromCondList } from "@/engine/core/utils/ini";
import { choosePatrolWaypointByFlags, isObjectAtWaypoint } from "@/engine/core/utils/patrol";
import { isMonsterScriptCaptured, scriptCaptureMonster, scriptCommandMonster } from "@/engine/core/utils/scheme";
import { copyVector } from "@/engine/core/utils/vector";
import { EMonsterState } from "@/engine/lib/constants/monsters";
import { TRUE } from "@/engine/lib/constants/words";
import {
  EScheme,
  Flags32,
  GameObject,
  LuaArray,
  Nillable,
  Patrol,
  TAnimationKey,
  TAnimationType,
  TCount,
  TDuration,
  TIndex,
  TMoveType,
  TName,
  TNumberId,
  TSoundKey,
  Vector,
} from "@/engine/lib/types";

/**
 * Manager handling monster walker scheme behaviour for an object.
 */
export class MobWalkerManager extends AbstractSchemeManager<ISchemeMobWalkerState> {
  public lastIndex: Nillable<TIndex> = null;
  public patrolLook: Nillable<Patrol> = null;
  public patrolWalk: Nillable<Patrol> = null;
  public lastLookIndex: Nillable<TIndex> = null;
  public curAnimSet: Nillable<TAnimationType> = null;
  public scheduledSound: Nillable<TSoundKey> = null;
  public ptWaitTime: Nillable<number> = null;

  public crouch: Nillable<boolean> = null;
  public running: Nillable<boolean> = null;
  public mobState: Nillable<number> = null;

  public pathWalkInfo!: Nillable<LuaArray<IWaypointData>>;
  public pathLookInfo: Nillable<LuaArray<IWaypointData>> = null;

  public override activate(): void {
    setMonsterState(this.object, this.state.state);
    scriptCaptureMonster(this.object, true);

    this.state.signals = new LuaTable();
    this.patrolWalk = new patrol(this.state.pathWalk);

    if (!this.patrolWalk) {
      abort("%s - unable to find pathWalk '%s' on the map.", MobWalkerManager.name, this.state.pathWalk);
    }

    if (this.state.pathLook) {
      this.patrolLook = new patrol(this.state.pathLook);

      if (!this.patrolLook) {
        abort("object '%s': unable to find pathLook '%s' on the map", this.object.name(), this.state.pathLook);
      }
    } else {
      this.patrolLook = null;
    }

    if (!this.state.pathWalkInfo) {
      this.state.pathWalkInfo = parseWaypointsData(this.state.pathWalk);
      this.pathWalkInfo = this.state.pathWalkInfo;
    }

    if (!this.state.pathLookInfo && this.state.pathLook) {
      this.state.pathLookInfo = parseWaypointsData(this.state.pathLook);
      this.pathLookInfo = this.state.pathLookInfo;
    }

    this.mobState = EMobWalkerState.MOVING;
    this.crouch = false;
    this.running = false;
    this.curAnimSet = mobWalkerConfig.DEFAULT_ANIM_STANDING;
    this.ptWaitTime = mobWalkerConfig.DEFAULT_WAIT_TIME;
    this.scheduledSound = null;
    this.lastIndex = null;
    this.lastLookIndex = null;

    scriptCommandMonster(
      this.object,
      new move(move.walk_fwd, new patrol(this.state.pathWalk, patrol.next, patrol.continue)),
      new cond(cond.move_end)
    );
  }

  public override deactivate(): void {
    scriptCaptureMonster(this.object, true);
    scriptCommandMonster(this.object, new move(move.steal, this.patrolWalk!.point(0)), new cond(cond.move_end));
  }

  public update(): void {
    if (!isMonsterScriptCaptured(this.object)) {
      return this.activate();
    }

    if (this.mobState === EMobWalkerState.STANDING) {
      if (!this.object.action()) {
        const patrolWalkCount: TCount = this.patrolWalk!.count();

        if (patrolWalkCount === 1 && isObjectAtWaypoint(this.object, this.patrolWalk!, 0)) {
          this.mobState = EMobWalkerState.MOVING;
          this.onWaypoint(this.object, null, this.lastIndex);
        } else {
          this.lastLookIndex = null;
          this.mobState = EMobWalkerState.MOVING;
          this.updateMovementState();
        }
      }
    }
  }

  public override onWaypoint(object: GameObject, actionType: Nillable<TName>, index: Nillable<TIndex>): void {
    if (index === -1 || $isNil(index)) {
      return;
    }

    this.lastIndex = index;

    const suggestedSound: Nillable<TSoundKey> = this.pathWalkInfo!.get(index).s as Nillable<TSoundKey>;

    if (suggestedSound) {
      this.scheduledSound = suggestedSound;
    }

    this.crouch = this.pathWalkInfo!.get(index).c === TRUE;
    this.running = this.pathWalkInfo!.get(index).r === TRUE;

    const signal: Nillable<TName> = this.pathWalkInfo!.get(index).sig as TName;

    if (signal !== null) {
      // -- HACK, fixme:
      const objectId: TNumberId = this.object.id();
      const scheme: EScheme = registry.objects.get(objectId).activeScheme!;
      const signals: LuaTable<TName, boolean> = registry.objects.get(objectId)[scheme!]!.signals!;

      signals.set(signal, true);
    }

    const beh: Nillable<EMonsterState> = this.pathWalkInfo!.get(index).b as Nillable<EMonsterState>;

    setMonsterState(this.object, beh ? beh : this.state.state);

    const searchForFlags: Flags32 = this.pathWalkInfo!.get(index).flags as Flags32;

    if (searchForFlags.get() === 0) {
      return this.updateMovementState();
    }

    const [ptChosenIdx] = choosePatrolWaypointByFlags(this.patrolLook!, this.pathLookInfo!, searchForFlags);

    if ($isNotNil(ptChosenIdx)) {
      const suggestedWaitTime = this.pathLookInfo!.get(ptChosenIdx).t;

      if (suggestedWaitTime) {
        this.ptWaitTime = tonumber(suggestedWaitTime)!;
      } else {
        const patrolWalkCount: TCount = this.patrolWalk!.count();

        if (patrolWalkCount === 1 && isObjectAtWaypoint(this.object, this.patrolWalk!, 0)) {
          this.ptWaitTime = 100_000_000;
        } else {
          this.ptWaitTime = mobWalkerConfig.DEFAULT_WAIT_TIME;
        }
      }

      const suggestedAnimSet = this.pathLookInfo!.get(ptChosenIdx).a;

      if (suggestedAnimSet) {
        this.curAnimSet = anim[pickSectionFromCondList(registry.actor, this.object, suggestedAnimSet) as TAnimationKey];
      } else {
        this.curAnimSet = mobWalkerConfig.DEFAULT_ANIM_STANDING;
      }

      const beh: Nillable<TName> = this.pathWalkInfo!.get(index).b as Nillable<TName>;

      setMonsterState(this.object, (beh ? beh : this.state.state) as EMonsterState);

      if (ptChosenIdx !== this.lastLookIndex) {
        this.lookAtWaypoint(ptChosenIdx);
      }

      this.mobState = EMobWalkerState.STANDING;
      this.updateStandingState();

      this.update();
    } else {
      abort("Object '%s': cannot find corresponding point(s) on path_look '%s'.", this.object.name(), index);
    }
  }

  /**
   * Command the monster to move along the walk patrol using the running, crouching or walking movement type.
   */
  public updateMovementState(): void {
    scriptCaptureMonster(this.object, true);

    let movementType: TMoveType;

    if (this.running) {
      movementType = move.run_fwd;
    } else if (this.crouch) {
      movementType = move.steal;
    } else {
      movementType = move.walk_fwd;
    }

    if (this.scheduledSound) {
      scriptCommandMonster(
        this.object,
        new move(movementType, new patrol(this.state.pathWalk, patrol.next, patrol.continue)),
        new sound(sound[this.scheduledSound]),
        new cond(cond.move_end)
      );
      this.scheduledSound = null;
    } else {
      scriptCommandMonster(
        this.object,
        new move(movementType, new patrol(this.state.pathWalk, patrol.next, patrol.continue)),
        new cond(cond.move_end)
      );
    }
  }

  /**
   * Command the monster to play the current standing animation for the configured wait time.
   */
  public updateStandingState(): void {
    scriptCaptureMonster(this.object, true);

    if (this.scheduledSound) {
      scriptCommandMonster(
        this.object,
        new anim(this.curAnimSet as TAnimationType, 0),
        new sound(sound[this.scheduledSound]),
        new cond(cond.time_end, this.ptWaitTime as TDuration)
      );
      this.scheduledSound = null;
    } else {
      scriptCommandMonster(
        this.object,
        new anim(this.curAnimSet as TAnimationType, 0),
        new cond(cond.time_end, this.ptWaitTime as TDuration)
      );
    }
  }

  /**
   * Command the monster to look towards the given look patrol waypoint.
   *
   * @param index - Index of the look patrol waypoint to face.
   */
  public lookAtWaypoint(index: TIndex): void {
    if (!this.patrolLook) {
      return;
    }

    const lookPoint: Vector = copyVector(this.patrolLook.point(index)).sub(this.object.position());

    lookPoint.normalize();

    scriptCaptureMonster(this.object, true);
    scriptCommandMonster(this.object, new look(look.direction, lookPoint), new cond(cond.look_end));

    this.lastLookIndex = index;
  }
}
