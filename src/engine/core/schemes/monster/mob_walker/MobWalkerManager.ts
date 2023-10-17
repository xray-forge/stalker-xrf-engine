import { anim, cond, look, move, patrol, sound } from "xray16";

import { registry, setMonsterState } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/objects/ai/scheme";
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
  Optional,
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

  public crouch: Optional<boolean> = null;
  public running: Optional<boolean> = null;
  public mobState: Optional<number> = null;

  public pathWalkInfo!: Optional<LuaArray<IWaypointData>>;
  public pathLookInfo: Optional<LuaArray<IWaypointData>> = null;

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

  public override onWaypoint(object: GameObject, actionType: Optional<TName>, index: Optional<TIndex>): void {
    if (index === -1 || index === null) {
      return;
    }

    this.lastIndex = index;

    const suggestedSound: Optional<TSoundKey> = this.pathWalkInfo!.get(index).s as Optional<TSoundKey>;

    if (suggestedSound) {
      this.scheduledSound = suggestedSound;
    }

    this.crouch = this.pathWalkInfo!.get(index).c === TRUE;
    this.running = this.pathWalkInfo!.get(index).r === TRUE;

    const signal: Optional<TName> = this.pathWalkInfo!.get(index).sig as TName;

    if (signal !== null) {
      // -- HACK, fixme:
      const objectId: TNumberId = this.object.id();
      const scheme: EScheme = registry.objects.get(objectId).activeScheme!;
      const signals: LuaTable<TName, boolean> = registry.objects.get(objectId)[scheme!]!.signals!;

      signals.set(signal, true);
    }

    const beh: Optional<EMonsterState> = this.pathWalkInfo!.get(index).b as Optional<EMonsterState>;

    setMonsterState(this.object, beh ? beh : this.state.state);

    const searchForFlags: Flags32 = this.pathWalkInfo!.get(index).flags as Flags32;

    if (searchForFlags.get() === 0) {
      return this.updateMovementState();
    }

    const [ptChosenIdx] = choosePatrolWaypointByFlags(this.patrolLook!, this.pathLookInfo!, searchForFlags);

    if (ptChosenIdx) {
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

      const beh: Optional<TName> = this.pathWalkInfo!.get(index).b as Optional<TName>;

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
   * todo: Description.
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
   * todo: Description.
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
   * todo: Description.
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
