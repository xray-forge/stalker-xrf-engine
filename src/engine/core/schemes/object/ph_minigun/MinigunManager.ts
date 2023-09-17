import { CCar, level, move, patrol, time_global } from "xray16";

import { getObjectByStoryId, IBaseSchemeLogic, registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/objects/ai/scheme";
import { ISchemeMinigunState } from "@/engine/core/schemes/object/ph_minigun/ISchemeMinigunState";
import { abort } from "@/engine/core/utils/assertion";
import { pickSectionFromCondList } from "@/engine/core/utils/ini";
import { isObjectWounded } from "@/engine/core/utils/object";
import {
  isActiveSection,
  isMonsterScriptCaptured,
  scriptReleaseMonster,
  switchObjectSchemeToSection,
  trySwitchToAnotherSection,
} from "@/engine/core/utils/scheme";
import { createEmptyVector, createVector, yaw } from "@/engine/core/utils/vector";
import { ACTOR, NIL } from "@/engine/lib/constants/words";
import { Car, ClientObject, Optional, TSection, TStringId, TTimestamp, Vector } from "@/engine/lib/types";

const STATE_CANNON_ROTATE: number = 1;
const STATE_CANNON_FOLLOW: number = 2;
const STATE_CANNON_DELAY: number = 3;
const STATE_CANNON_STOP: number = 4;
const STATE_SHOOTING_ON: number = 1;
const STATE_NONE: number = 0;
const STATE_FIRETARGET_POINTS: number = 1;
const STATE_FIRETARGET_ENEMY: number = 2;
const DEF_MAX_FC_UPD_NUM: number = 1;

/**
 * todo;
 */
export class MinigunManager extends AbstractSchemeManager<ISchemeMinigunState> {
  public mgun: Car;
  public startDirection: Vector;
  public startLookPos: Vector;

  public destroyed: boolean = false;
  public stateCannon: number = -1;
  public stateFiretarget: number = -1;
  public stateShooting: number = -1;

  public startDelayingTime: number = 0;
  public startShootingTime: number = 0;
  public fcUpdNum: number = 0;
  public fcUpdAvg: number = 0;
  public fcLastUpdTm: number = 0;

  public lastPosition: Optional<Vector> = null;
  public lastPositionTime: number = 0;
  public stateDelaying: boolean = false;
  public hasWeapon: boolean = false;

  public targetObject: Optional<ClientObject> = null;
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

  public constructor(object: ClientObject, state: ISchemeMinigunState) {
    super(object, state);

    this.mgun = this.object.get_car();
    this.startDirection = this.object.direction();
    this.startLookPos = createEmptyVector();
    this.startLookPos.x = this.object.position().x + 5 * math.sin(this.startDirection.x);
    this.startLookPos.z = this.object.position().z + 5 * math.cos(this.startDirection.x);
    this.startLookPos.y = this.object.position().y;
  }

  /**
   * todo: Description.
   */
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

    this.stateFiretarget = STATE_NONE;
    this.stateCannon = STATE_NONE;
    this.stateShooting = STATE_NONE;

    this.targetFirePt = null;
    this.targetFirePtIdx = 0;
    this.targetObject = null;

    this.onTargetVis = null;
    this.onTargetNvis = null;

    const actor: ClientObject = registry.actor;

    if (this.hasWeapon) {
      if (this.state.fire_target === "points") {
        this.stateFiretarget = STATE_FIRETARGET_POINTS;
      } else {
        if (this.state.fire_target === ACTOR && actor.alive()) {
          this.targetObject = actor;
          this.stateFiretarget = STATE_FIRETARGET_ENEMY;
        } else {
          const n = this.state.fire_target;

          if (n !== null) {
            const obj = getObjectByStoryId(n);

            if (obj && obj.alive()) {
              this.targetObject = obj;
              this.stateFiretarget = STATE_FIRETARGET_ENEMY;
            }
          }
        }
      }

      this.fireTrackTarget = this.state.fire_track_target;

      if (this.state.on_target_vis) {
        const vis = this.state.on_target_vis;

        if (vis.p1 !== null) {
          const storyObject = getObjectByStoryId(vis.p1 as TStringId);

          if (storyObject && storyObject.alive()) {
            vis.p1 = storyObject as any;
            this.onTargetVis = vis as any;
          }
        }
      }

      if (this.state.on_target_nvis) {
        const nvis = this.state.on_target_nvis;

        if (nvis.p1 !== null) {
          const storyObject = getObjectByStoryId(nvis.p1 as TStringId);

          if (storyObject && storyObject.alive()) {
            nvis.p1 = storyObject as any;
            this.onTargetNvis = nvis;
          }
        }
      }

      this.pathFire = this.state.path_fire;
      this.pathFirePoint = null;

      if (this.pathFire !== null) {
        if (level.patrol_path_exists(this.pathFire)) {
          this.pathFirePoint = new patrol(this.pathFire).point(0);
        } else {
          abort("[ph_minigun] patrol path %s doesnt exist.", tostring(this.pathFire));
        }
      }

      this.defFireTime = this.state.fire_time;
      this.defFireRep = this.state.fire_rep;
      this.fireRep = this.defFireRep;

      this.fireRangeSqr = this.state.fire_range * this.state.fire_range;

      if (this.stateFiretarget === STATE_FIRETARGET_POINTS && this.pathFire) {
        this.stateCannon = STATE_CANNON_FOLLOW;
        this.stateShooting = STATE_NONE;
      } else if (this.stateFiretarget === STATE_FIRETARGET_ENEMY) {
        this.stateShooting = STATE_NONE;
        this.stateCannon = STATE_CANNON_FOLLOW;
      } else {
        this.stateFiretarget = STATE_NONE;
        this.stateCannon = STATE_NONE;
        this.stateShooting = STATE_NONE;
      }
    }

    this.object.set_fastcall(this.fastcall, this);
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
    if (this.state.fire_rep === -1) {
      return;
    }

    if (1000 * this.state.fire_time + this.startShootingTime >= time_global() && this.stateDelaying === false) {
      this.stateDelaying = false;
      this.startDelayingTime = time_global() + math.random(-0.2, 0.2) * 1000 * this.state.fire_time;

      return;
    } else {
      this.stateDelaying = true;
    }

    if (this.startDelayingTime + 1000 * this.state.fire_rep >= time_global() && this.stateDelaying === true) {
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
  public fastUpdate(): boolean {
    if (this.mgun.GetfHealth() <= 0) {
      this.destroyCar();

      return true;
    }

    const now: number = time_global();

    if (this.fcUpdNum < DEF_MAX_FC_UPD_NUM) {
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

    if (this.stateCannon === STATE_CANNON_STOP && this.stateFiretarget === STATE_NONE) {
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

      if (this.stateFiretarget === STATE_FIRETARGET_POINTS) {
        const fireAngle = this.getAngleXZ(this.object, this.pathFirePoint!, this.startDirection);
        const canRotate =
          fireAngle <= (this.state.fire_angle * math.pi) / 360 &&
          fireAngle >= -((this.state.fire_angle * math.pi) / 360);

        if (canRotate) {
          this.rotToFirepoint(this.pathFirePoint);
          if (this.stateDelaying) {
            if (this.stateShooting !== STATE_NONE && this.state.auto_fire === true) {
              this.stateShooting = STATE_NONE;
              this.setShooting(this.stateShooting);
            }
          } else {
            if (this.stateShooting === STATE_NONE) {
              this.stateShooting = STATE_SHOOTING_ON;
              this.setShooting(this.stateShooting);
            }
          }
        }
      } else if (this.stateFiretarget === STATE_FIRETARGET_ENEMY) {
        const fireAngle = this.getAngleXZ(this.object, this.targetObject!.position(), this.startDirection);
        const canRotate =
          fireAngle <= (this.state.fire_angle * math.pi) / 360 &&
          fireAngle >= -((this.state.fire_angle * math.pi) / 360);
        const objectVisible =
          this.mgun.IsObjectVisible(this.targetObject!) || this.state.shoot_only_on_visible === false;

        if (
          this.targetObject!.alive() &&
          this.object.position().distance_to_sqr(this.targetObject!.position()) <= this.fireRangeSqr &&
          objectVisible &&
          canRotate
        ) {
          if (!this.stateDelaying) {
            this.targetFirePt = this.targetObject!.position();
            if (this.targetObject!.id() !== registry.actor.id()) {
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
              if (this.stateShooting === STATE_NONE && this.state.auto_fire === true) {
                this.stateShooting = STATE_SHOOTING_ON;
                this.setShooting(this.stateShooting);
              }
            } else {
              if (this.stateShooting !== STATE_NONE) {
                this.stateShooting = STATE_NONE;
                this.setShooting(this.stateShooting);
              }
            }
          } else {
            this.stateShooting = STATE_NONE;
            this.setShooting(this.stateShooting);
          }
        } else {
          if (this.stateShooting !== STATE_NONE || !canRotate || this.stateDelaying) {
            this.stateShooting = STATE_NONE;
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
    this.stateCannon = STATE_NONE;
    this.stateFiretarget = STATE_NONE;
    this.stateShooting = STATE_NONE;
    this.mgun.Action(CCar.eWpnAutoFire, 0);
    this.setShooting(this.stateShooting);

    scriptReleaseMonster(this.object);

    if (this.state.on_death_info !== null) {
      registry.actor.give_info_portion(this.state.on_death_info);
    }

    this.destroyed = true;
  }

  /**
   * todo: Description.
   */
  public getAngleXZ(object: ClientObject, position: Vector, direction: Vector): number {
    const dir1: Vector = direction;

    dir1.y = 0;

    // todo: just sub vectors?
    const dir2: Vector = createVector(position.x, position.y, position.z).sub(object.position());

    dir2.y = 0;

    return yaw(dir1, dir2);
  }
}
