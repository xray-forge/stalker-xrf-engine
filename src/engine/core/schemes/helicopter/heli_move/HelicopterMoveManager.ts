import { CHelicopter, level, patrol } from "xray16";

import { AbstractSchemeManager } from "@/engine/core/ai/scheme";
import { getPortableStoreValue, registry, setPortableStoreValue } from "@/engine/core/database";
import {
  getHelicopterFireManager,
  HelicopterFireManager,
} from "@/engine/core/schemes/helicopter/heli_move/control/HelicopterFireManager";
import {
  getHelicopterFlyManager,
  HelicopterFlyManager,
} from "@/engine/core/schemes/helicopter/heli_move/control/HelicopterFlyManager";
import {
  getHelicopterLookManager,
  HelicopterLookManager,
} from "@/engine/core/schemes/helicopter/heli_move/control/HelicopterLookManager";
import { ISchemeHelicopterMoveState } from "@/engine/core/schemes/helicopter/heli_move/helicopter_types";
import { abort, assert } from "@/engine/core/utils/assertion";
import { IWaypointData, parseWaypointsData } from "@/engine/core/utils/ini";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme";
import { ACTOR } from "@/engine/lib/constants/words";
import {
  GameObject,
  LuaArray,
  Optional,
  Patrol,
  TDuration,
  TIndex,
  TName,
  TNumberId,
  TRate,
  Vector,
} from "@/engine/lib/types";

/**
 * todo;
 */
export class HelicopterMoveManager extends AbstractSchemeManager<ISchemeHelicopterMoveState> {
  public readonly helicopter: CHelicopter;

  public helicopterLookManager: HelicopterLookManager;
  public helicopterFireManager: HelicopterFireManager;
  public helicopterFlyManager: HelicopterFlyManager;

  public patrolMove: Optional<Patrol> = null;
  public patrolMoveInfo!: LuaArray<IWaypointData>;
  public patrolLook: Optional<Patrol> = null;

  public isHelicopterMoving: boolean = false;
  public maxVelocity!: TRate;
  public lastIndex: Optional<number> = null;
  public nextIndex: Optional<number> = null;
  public _flagToWpCallback: Optional<boolean> = null;
  public wasCallback: Optional<boolean> = null;
  public byStopFireFly: Optional<boolean> = null;
  public stopPoint: Optional<Vector> = null;

  public constructor(object: GameObject, state: ISchemeHelicopterMoveState) {
    super(object, state);

    this.helicopter = object.get_helicopter();

    this.helicopterFlyManager = getHelicopterFlyManager(object);
    this.helicopterFireManager = getHelicopterFireManager(object);
    this.helicopterLookManager = getHelicopterLookManager(object);
  }

  public override activate(object: GameObject, loading?: boolean): void {
    this.state.signals = new LuaTable();

    this.helicopter.TurnEngineSound(this.state.isEngineSoundEnabled);

    if (!level.patrol_path_exists(this.state.pathMove)) {
      abort("Patrol path %s doesnt exist", this.state.pathMove);
    }

    this.patrolMove = new patrol(this.state.pathMove);
    this.patrolMoveInfo = parseWaypointsData(this.state.pathMove)!;

    if (this.state.pathLook) {
      if (this.state.pathLook === ACTOR) {
        this.helicopterFlyManager.setLookPoint(registry.actor.position());
      } else {
        this.patrolLook = new patrol(this.state.pathLook);
        this.helicopterFlyManager.setLookPoint(this.patrolLook.point(0));

        assert(
          this.patrolLook,
          "Object '%s': unable to find path_look '%s' on the level.",
          object.name(),
          this.state.pathLook
        );
      }

      this.updateLookState();
    } else {
      this.patrolLook = null;
    }

    this.maxVelocity = this.state.maxVelocity;

    if (loading) {
      const objectId: TNumberId = object.id();

      this.isHelicopterMoving = getPortableStoreValue(objectId, "st") === true;
      this.lastIndex = getPortableStoreValue(objectId, "li") || null;
      this.nextIndex = getPortableStoreValue(objectId, "ni") || null;
      this.wasCallback = getPortableStoreValue(objectId, "wc");
    } else {
      this.lastIndex = null;
      this.nextIndex = null;

      this.helicopterFlyManager.maxVelocity = this.maxVelocity;
      this.helicopterFlyManager.heliLAccFW = this.maxVelocity / 15;
      this.helicopterFlyManager.heliLAccBW = (2 * this.helicopterFlyManager.heliLAccFW) / 3;

      this.helicopter.SetLinearAcc(this.helicopterFlyManager.heliLAccFW, this.helicopterFlyManager.heliLAccBW);
      this.helicopter.SetMaxVelocity(this.maxVelocity);

      this.isHelicopterMoving = false;
      this.stopPoint = null;
      this.byStopFireFly = false;

      this.wasCallback = false;
      this._flagToWpCallback = false;
      this.helicopterFireManager.enemyPreference = this.state.enemyPreference;
      this.helicopterFireManager.enemy = null;
      this.helicopterFireManager.flagByEnemy = true;

      if (this.state.firePoint) {
        this.helicopterFireManager.firePoint = new patrol(this.state.firePoint).point(0);
      }

      if (this.state.maxMinigunDistance) {
        this.helicopter.m_max_mgun_dist = this.state.maxMinigunDistance;
      }

      if (this.state.maxRocketDistance) {
        this.helicopter.m_max_rocket_dist = this.state.maxRocketDistance;
      }

      if (this.state.minMinigunDistance) {
        this.helicopter.m_min_mgun_dist = this.state.minMinigunDistance;
      }

      if (this.state.minRocketDistance) {
        this.helicopter.m_min_rocket_dist = this.state.minRocketDistance;
      }

      this.helicopter.m_use_mgun_on_attack = this.state.isMinigunEnabled;

      if (this.state.isRocketEnabled) {
        this.helicopter.m_use_rocket_on_attack = true;
      } else {
        this.helicopter.m_use_rocket_on_attack = false;
      }

      this.helicopterFireManager.updVis = this.state.updVis;
      this.helicopterFireManager.updateEnemyState();
      this.updateMovementState();

      if (this.state.showHealth) {
        this.helicopterFireManager.csRemove();
        this.helicopterFireManager.showHealth = true;
        this.helicopterFireManager.csHeli();
      } else {
        this.helicopterFireManager.showHealth = false;
        this.helicopterFireManager.csRemove();
      }

      this.helicopter.UseFireTrail(this.state.fireTrail);
    }
  }

  public save(): void {
    const objectId: TNumberId = this.object.id();

    setPortableStoreValue(objectId, "st", this.isHelicopterMoving);
    setPortableStoreValue(objectId, "li", this.lastIndex || false);
    setPortableStoreValue(objectId, "ni", this.nextIndex || false);
    setPortableStoreValue(objectId, "wc", this.wasCallback);
  }

  public update(delta: TDuration): void {
    if (trySwitchToAnotherSection(this.object, this.state)) {
      return;
    }

    if (this.wasCallback) {
      this.updateMovementState();
      this.wasCallback = false;
    }

    if (this.state.pathLook) {
      if (this.state.pathLook === ACTOR) {
        this.helicopterFlyManager.setLookPoint(registry.actor.position());
        if (this.state.stopFire) {
          if (this.helicopter.isVisible(registry.actor)) {
            if (!this.byStopFireFly) {
              this.stopPoint = this.object.position();
              this.byStopFireFly = true;
              this.wasCallback = true;
            }
          } else {
            this.byStopFireFly = false;
            this.wasCallback = true;
          }
        }
      }

      this.updateLookState();
    }

    if (!this.state.pathLook && this.helicopterLookManager.lookState) {
      this.helicopterLookManager.calculateLookPoint(this.helicopterFlyManager.destPoint, true);
    }
  }

  /**
   * todo: Description.
   */
  public updateMovementState(): void {
    this.isHelicopterMoving = true;

    if (this.patrolMove) {
      if (this.lastIndex) {
        this.nextIndex = this.lastIndex + 1;

        if (this.nextIndex >= this.patrolMove.count()) {
          this.nextIndex = 0;
        }
      } else {
        this.lastIndex = 0;
        this.nextIndex = 1;
      }
    }

    if (!this.byStopFireFly) {
      if (this.patrolMove!.count() > 2) {
        this._flagToWpCallback = this.helicopterFlyManager.flyOnPointWithVector(
          this.patrolMove!.point(this.lastIndex!),
          this.patrolMove!.point(this.nextIndex!),
          this.maxVelocity,
          this._flagToWpCallback!,
          false
        );
      } else {
        if (this.patrolMove!.count() > 1) {
          this._flagToWpCallback = this.helicopterFlyManager.flyOnPointWithVector(
            this.patrolMove!.point(this.lastIndex!),
            this.patrolMove!.point(this.nextIndex!),
            this.maxVelocity,
            true,
            true
          );
        } else {
          this._flagToWpCallback = this.helicopterFlyManager.flyOnPointWithVector(
            this.patrolMove!.point(this.lastIndex!),
            this.patrolMove!.point(this.lastIndex!),
            this.maxVelocity,
            true,
            true
          );
        }
      }
    } else {
      this._flagToWpCallback = this.helicopterFlyManager.flyOnPointWithVector(
        this.stopPoint!,
        this.stopPoint!,
        this.maxVelocity,
        true,
        false
      );
      this._flagToWpCallback = true;
    }
  }

  /**
   * todo: Description.
   */
  public updateLookState(): void {
    this.helicopterFlyManager.setBlockFlook(true);
    this.helicopterFlyManager.lookAtPosition();
  }

  /**
   * todo: Description.
   */
  public override onWaypoint(object: GameObject, actionType: TName, index: TIndex): void {
    if (!this._flagToWpCallback) {
      if (this.patrolMove) {
        if (index === this.lastIndex) {
          return;
        }

        if (index !== -1) {
          this.lastIndex = index;
        } else {
          if (this.patrolMoveInfo.has(this.lastIndex!)) {
            const signal: Optional<TName> = this.patrolMoveInfo.get(this.lastIndex!)["sig"];

            if (signal) {
              this.state.signals!.set(signal, true);
            }
          }

          if (this.patrolMove.count() > 1) {
            this.lastIndex = this.nextIndex;
          }
        }
      }
    }

    this.wasCallback = true;
  }
}
