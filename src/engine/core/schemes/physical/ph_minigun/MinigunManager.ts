import { CCar, level, move, patrol, time_global } from "xray16";

import { AbstractSchemeManager } from "@/engine/core/ai/scheme";
import { getObjectByStoryId, IBaseSchemeLogic, registry } from "@/engine/core/database";
import { minigunConfig } from "@/engine/core/schemes/physical/ph_minigun/MinigunConfig";
import {
  EMinigunCannonState,
  EMinigunFireTargetState,
  EMinigunState,
  ISchemeMinigunState,
} from "@/engine/core/schemes/physical/ph_minigun/ph_minigun_types";
import { abort } from "@/engine/core/utils/assertion";
import { pickSectionFromCondList } from "@/engine/core/utils/ini";
import { isObjectWounded } from "@/engine/core/utils/planner";
import {
  isActiveSection,
  isMonsterScriptCaptured,
  scriptReleaseMonster,
  switchObjectSchemeToSection,
  trySwitchToAnotherSection,
} from "@/engine/core/utils/scheme";
import { createEmptyVector, createVector, yaw } from "@/engine/core/utils/vector";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { ACTOR, NIL } from "@/engine/lib/constants/words";
import { Car, GameObject, Optional, TSection, TStringId, TTimestamp, Vector } from "@/engine/lib/types";

/**
 * todo;
 */
export class MinigunManager extends AbstractSchemeManager<ISchemeMinigunState> {
  public mgun: Car;
  public startDirection: Vector;
  public startLookPos: Vector;

  public destroyed: boolean = false;
  public stateCannon: EMinigunCannonState = EMinigunCannonState.NONE;
  public stateFiretarget: EMinigunFireTargetState = EMinigunFireTargetState.NONE;
  public stateShooting: EMinigunState = EMinigunState.NONE;

  public startDelayingTime: number = 0;
  public startShootingTime: number = 0;
  public fcUpdNum: number = 0;
  public fcUpdAvg: number = 0;
  public fcLastUpdTm: number = 0;

  public lastPosition: Optional<Vector> = null;
  public lastPositionTime: number = 0;
  public stateDelaying: boolean = false;
  public hasWeapon: boolean = false;

  public targetObject: Optional<GameObject> = null;
  public targetFirePt: Optional<Vector> = null;
  public targetFirePtIdx: number = 0;
  public fireRangeSqr: number = 0;
  public defFireTime: number = 0;
  public defFireRep: number = 0;
  public fireRep: number = 0;

  public fireTrackTarget: Optional<boolean> = null;
  public pathFire: Optional<string> = null;
  public pathFirePoint: Optional<Vector> = null;
  public onTargetVis: Optional<IBaseSchemeLogic> = null;
  public onTargetNvis: Optional<IBaseSchemeLogic> = null;

  public constructor(object: GameObject, state: ISchemeMinigunState) {
    super(object, state);

    this.mgun = this.object.get_car();
    this.startDirection = this.object.direction();
    this.startLookPos = createEmptyVector();
    this.startLookPos.x = this.object.position().x + 5 * math.sin(this.startDirection.x);
    this.startLookPos.z = this.object.position().z + 5 * math.cos(this.startDirection.x);
    this.startLookPos.y = this.object.position().y;
  }

  public override activate(): void {
    this.startDelayingTime = time_global();
    this.startShootingTime = time_global();

    this.fcUpdNum = 0; // -- fastcall updates num
    this.fcUpdAvg = 10; // -- average time of the fastcall updates (in millisecond)
    this.fcLastUpdTm = -1; // -- fastcall last update time

    this.state.signals = new LuaTable();
    this.lastPosition = null;
    this.lastPositionTime = 0;

    this.stateDelaying = false;
    this.destroyed = false;

    this.object.set_nonscript_usable(false);
    this.object.set_tip_text("");

    if (this.mgun.HasWeapon()) {
      this.mgun.Action(CCar.eWpnActivate, 1);
      this.hasWeapon = true;
    } else {
      this.hasWeapon = false;
    }

    this.stateFiretarget = EMinigunFireTargetState.NONE;
    this.stateCannon = EMinigunCannonState.NONE;
    this.stateShooting = EMinigunState.NONE;

    this.targetFirePt = null;
    this.targetFirePtIdx = 0;
    this.targetObject = null;

    this.onTargetVis = null;
    this.onTargetNvis = null;

    const actor: GameObject = registry.actor;

    if (this.hasWeapon) {
      if (this.state.fireTarget === "points") {
        this.stateFiretarget = EMinigunFireTargetState.POINTS;
      } else {
        if (this.state.fireTarget === ACTOR && actor.alive()) {
          this.targetObject = actor;
          this.stateFiretarget = EMinigunFireTargetState.ENEMY;
        } else {
          const n = this.state.fireTarget;

          if (n !== null) {
            const obj = getObjectByStoryId(n);

            if (obj && obj.alive()) {
              this.targetObject = obj;
              this.stateFiretarget = EMinigunFireTargetState.ENEMY;
            }
          }
        }
      }

      this.fireTrackTarget = this.state.fireTrackTarget;

      if (this.state.onTargetVis) {
        const vis = this.state.onTargetVis;

        if (vis.p1 !== null) {
          const storyObject = getObjectByStoryId(vis.p1 as TStringId);

          if (storyObject && storyObject.alive()) {
            vis.p1 = storyObject as any;
            this.onTargetVis = vis as any;
          }
        }
      }

      if (this.state.onTargetNvis) {
        const nvis = this.state.onTargetNvis;

        if (nvis.p1 !== null) {
          const storyObject = getObjectByStoryId(nvis.p1 as TStringId);

          if (storyObject && storyObject.alive()) {
            nvis.p1 = storyObject as any;
            this.onTargetNvis = nvis;
          }
        }
      }

      this.pathFire = this.state.pathFire;
      this.pathFirePoint = null;

      if (this.pathFire !== null) {
        if (level.patrol_path_exists(this.pathFire)) {
          this.pathFirePoint = new patrol(this.pathFire).point(0);
        } else {
          abort("[ph_minigun] patrol path %s doesnt exist.", tostring(this.pathFire));
        }
      }

      this.defFireTime = this.state.fireTime;
      this.defFireRep = this.state.fireRep;
      this.fireRep = this.defFireRep;

      this.fireRangeSqr = this.state.fireRange * this.state.fireRange;

      if (this.stateFiretarget === EMinigunFireTargetState.POINTS && this.pathFire) {
        this.stateCannon = EMinigunCannonState.FOLLOW;
        this.stateShooting = EMinigunState.NONE;
      } else if (this.stateFiretarget === EMinigunFireTargetState.ENEMY) {
        this.stateShooting = EMinigunState.NONE;
        this.stateCannon = EMinigunCannonState.FOLLOW;
      } else {
        this.stateFiretarget = EMinigunFireTargetState.NONE;
        this.stateCannon = EMinigunCannonState.NONE;
        this.stateShooting = EMinigunState.NONE;
      }
    }

    this.object.set_fastcall(this.fastcall, this);
  }

  public update(): void {
    if (trySwitchToAnotherSection(this.object, this.state)) {
      return;
    }

    if (this.destroyed) {
      switchObjectSchemeToSection(this.object, this.state.ini, NIL);

      return;
    }

    this.checkFireTime();
  }
  /**
   * todo: Description.
   */
  public setShooting(shooting: number): void {
    this.mgun.Action(CCar.eWpnFire, shooting);
  }

  /**
   * todo: Description.
   */
  public checkFireTime(): void {
    if (this.state.fireRep === -1) {
      return;
    }

    if (1000 * this.state.fireTime + this.startShootingTime >= time_global() && !this.stateDelaying) {
      this.stateDelaying = false;
      this.startDelayingTime = time_global() + math.random(-0.2, 0.2) * 1000 * this.state.fireTime;

      return;
    } else {
      this.stateDelaying = true;
    }

    if (this.startDelayingTime + 1000 * this.state.fireRep >= time_global() && this.stateDelaying) {
      this.stateDelaying = true;
      this.startShootingTime = time_global();
    } else {
      this.stateDelaying = false;
    }
  }

  /**
   * todo: Description.
   */
  public save(): void {}

  /**
   * todo: Description.
   */
  public rotToFiredir(direction: Optional<Vector>): void {
    if (direction) {
      this.mgun.SetParam(CCar.eWpnDesiredPos, direction);
    }
  }

  /**
   * todo: Description.
   */
  public rotToFirepoint(pt: Optional<Vector>): void {
    if (pt) {
      this.mgun.SetParam(CCar.eWpnDesiredPos, pt);
    }
  }

  /**
   * todo: Description.
   */
  public fastcall(): boolean {
    if (isActiveSection(this.object, this.state.section)) {
      this.setShooting(0);

      return true;
    }

    return this.fastUpdate();
  }

  /**
   * todo: Description.
   */
  public fastUpdate(): boolean {
    if (this.mgun.GetfHealth() <= 0) {
      this.destroyCar();

      return true;
    }

    const now: number = time_global();

    if (this.fcUpdNum < minigunConfig.DEFAULT_MAX_FC_UPD_NUM) {
      const lastUpdate: TTimestamp = this.fcLastUpdTm;

      if (lastUpdate !== -1) {
        const n = this.fcUpdNum;

        if (n < 3000) {
          this.fcUpdAvg = (this.fcUpdAvg * n + (now - lastUpdate)) / (n + 1);
          this.fcUpdNum = n + 1;
        } else {
          this.fcUpdNum = 1;
        }
      }

      this.fcLastUpdTm = now;
    }

    if (this.stateCannon === EMinigunCannonState.STOP && this.stateFiretarget === EMinigunFireTargetState.NONE) {
      if (isMonsterScriptCaptured(this.object) && !this.object.action()) {
        this.destroyCar();

        return true;
      }

      return false;
    }

    if (this.hasWeapon) {
      if (
        this.onTargetVis &&
        (this.onTargetVis.p1 as any).alive() &&
        this.mgun.IsObjectVisible(this.onTargetVis.p1 as any)
      ) {
        const newSection: Optional<TSection> = pickSectionFromCondList(
          registry.actor,
          this.object,
          this.onTargetVis.condlist
        );

        if (newSection) {
          switchObjectSchemeToSection(this.object, this.state.ini!, newSection);
        }
      }

      if (
        this.onTargetNvis &&
        (this.onTargetNvis.p1 as any).alive() &&
        !this.mgun.IsObjectVisible(this.onTargetNvis.p1 as any)
      ) {
        const newSection: Optional<TSection> = pickSectionFromCondList(
          registry.actor,
          this.object,
          this.onTargetNvis.condlist
        );

        if (newSection) {
          switchObjectSchemeToSection(this.object, this.state.ini!, newSection);
        }
      }

      if (this.stateFiretarget === EMinigunFireTargetState.POINTS) {
        const fireAngle = this.getAngleXZ(this.object, this.pathFirePoint!, this.startDirection);
        const canRotate =
          fireAngle <= (this.state.fireAngle * math.pi) / 360 && fireAngle >= -((this.state.fireAngle * math.pi) / 360);

        if (canRotate) {
          this.rotToFirepoint(this.pathFirePoint);
          if (this.stateDelaying) {
            if (this.stateShooting !== EMinigunState.NONE && this.state.autoFire) {
              this.stateShooting = EMinigunState.NONE;
              this.setShooting(this.stateShooting);
            }
          } else {
            if (this.stateShooting === EMinigunState.NONE) {
              this.stateShooting = EMinigunState.SHOOTING_ON;
              this.setShooting(this.stateShooting);
            }
          }
        }
      } else if (this.stateFiretarget === EMinigunFireTargetState.ENEMY) {
        const fireAngle = this.getAngleXZ(this.object, this.targetObject!.position(), this.startDirection);
        const canRotate =
          fireAngle <= (this.state.fireAngle * math.pi) / 360 && fireAngle >= -((this.state.fireAngle * math.pi) / 360);
        const objectVisible = this.mgun.IsObjectVisible(this.targetObject!) || !this.state.shootOnlyOnVisible;

        if (
          this.targetObject!.alive() &&
          this.object.position().distance_to_sqr(this.targetObject!.position()) <= this.fireRangeSqr &&
          objectVisible &&
          canRotate
        ) {
          if (!this.stateDelaying) {
            this.targetFirePt = this.targetObject!.position();
            if (this.targetObject!.id() !== ACTOR_ID) {
              if (this.targetObject!.target_body_state() === move.crouch) {
                this.targetFirePt.y = this.targetFirePt.y + 0.5;
              } else if (!isObjectWounded(this.targetObject!.id())) {
                this.targetFirePt.y = this.targetFirePt.y + 1.2;
              } else {
                this.targetFirePt.y = this.targetFirePt.y + 0.1;
              }
            } else {
              this.targetFirePt.y = this.targetFirePt.y + 1.0;
            }

            this.rotToFirepoint(this.targetFirePt);

            if (this.mgun.CanHit()) {
              if (this.stateShooting === EMinigunState.NONE && this.state.autoFire) {
                this.stateShooting = EMinigunState.SHOOTING_ON;
                this.setShooting(this.stateShooting);
              }
            } else {
              if (this.stateShooting !== EMinigunState.NONE) {
                this.stateShooting = EMinigunState.NONE;
                this.setShooting(this.stateShooting);
              }
            }
          } else {
            this.stateShooting = EMinigunState.NONE;
            this.setShooting(this.stateShooting);
          }
        } else {
          if (this.stateShooting !== EMinigunState.NONE || !canRotate || this.stateDelaying) {
            this.stateShooting = EMinigunState.NONE;
            this.setShooting(this.stateShooting);
            this.rotToFiredir(this.startLookPos);
          }

          if (this.fireTrackTarget !== null) {
            this.targetFirePt = this.targetObject!.position();
            this.targetFirePt.y = this.targetFirePt.y + 1.0;
            this.rotToFirepoint(this.targetFirePt);
          }
        }
      }
    }

    return false;
  }

  /**
   * todo: Description.
   */
  public destroyCar(): void {
    this.stateCannon = EMinigunCannonState.NONE;
    this.stateFiretarget = EMinigunFireTargetState.NONE;
    this.stateShooting = EMinigunState.NONE;
    this.mgun.Action(CCar.eWpnAutoFire, 0);
    this.setShooting(this.stateShooting);

    scriptReleaseMonster(this.object);

    if (this.state.onDeathInfo !== null) {
      registry.actor.give_info_portion(this.state.onDeathInfo);
    }

    this.destroyed = true;
  }

  /**
   * todo: Description.
   */
  public getAngleXZ(object: GameObject, position: Vector, direction: Vector): number {
    const dir1: Vector = direction;

    dir1.y = 0;

    // todo: just sub vectors?
    const dir2: Vector = createVector(position.x, position.y, position.z).sub(object.position());

    dir2.y = 0;

    return yaw(dir1, dir2);
  }
}
