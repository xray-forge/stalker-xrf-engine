import { CHelicopter, level, patrol } from "xray16";

import { AbstractSchemeManager } from "@/engine/core/ai/scheme";
import { getPortableStoreValue, registry, setPortableStoreValue } from "@/engine/core/database";
import { HelicopterFireManager } from "@/engine/core/schemes/helicopter/heli_move/fire/HelicopterFireManager";
import { HelicopterFlyManager } from "@/engine/core/schemes/helicopter/heli_move/fly";
import { ISchemeHelicopterMoveState } from "@/engine/core/schemes/helicopter/heli_move/helicopter_types";
import { HelicopterLookManager } from "@/engine/core/schemes/helicopter/heli_move/look";
import {
  getHelicopterFireManager,
  getHelicopterFlyManager,
  getHelicopterLookManager,
} from "@/engine/core/schemes/helicopter/heli_move/utils";
import { assert } from "@/engine/core/utils/assertion";
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
 * Manager of helicopter movement scheme logics.
 */
export class HelicopterMoveManager extends AbstractSchemeManager<ISchemeHelicopterMoveState> {
  public readonly helicopter: CHelicopter;

  public helicopterLookManager: HelicopterLookManager;
  public helicopterFireManager: HelicopterFireManager;
  public helicopterFlyManager: HelicopterFlyManager;

  public isHelicopterMoving: boolean = false;
  public isWaypointCallbackHandled: boolean = false;

  public patrolMove: Optional<Patrol> = null;
  public patrolMoveInfo: Optional<LuaArray<IWaypointData>> = null;
  public patrolLook: Optional<Patrol> = null;

  public lastIndex: Optional<TIndex> = null;
  public nextIndex: Optional<TIndex> = null;
  public maxVelocity!: TRate;
  public flagToWpCallback: Optional<boolean> = null;
  public byStopFireFly: Optional<boolean> = null;
  public stopPoint: Optional<Vector> = null;

  public constructor(object: GameObject, state: ISchemeHelicopterMoveState) {
    super(object, state);

    this.helicopter = object.get_helicopter();

    this.helicopterFlyManager = getHelicopterFlyManager(object);
    this.helicopterFireManager = getHelicopterFireManager(object);
    this.helicopterLookManager = getHelicopterLookManager(object);
  }

  public override activate(object: GameObject, isLoading?: boolean): void {
    this.state.signals = new LuaTable();

    this.helicopter.TurnEngineSound(this.state.isEngineSoundEnabled);

    assert(level.patrol_path_exists(this.state.pathMove), "Patrol path '%s' does not exist.", this.state.pathMove);

    this.patrolMove = new patrol(this.state.pathMove);
    this.patrolMoveInfo = parseWaypointsData(this.state.pathMove)!;

    if (this.state.pathLook) {
      if (this.state.pathLook === ACTOR) {
        this.helicopterFlyManager.setLookPoint(registry.actor.position());
      } else {
        assert(level.patrol_path_exists(this.state.pathLook), "Patrol path '%s' does not exist.", this.state.pathMove);

        this.patrolLook = new patrol(this.state.pathLook);
        this.helicopterFlyManager.setLookPoint(this.patrolLook.point(0));
      }

      this.updateLookState();
    } else {
      this.patrolLook = null;
    }

    this.maxVelocity = this.state.maxVelocity;

    if (isLoading) {
      const objectId: TNumberId = object.id();

      this.isHelicopterMoving = getPortableStoreValue(objectId, "st") === true;
      this.lastIndex = getPortableStoreValue(objectId, "li");
      this.nextIndex = getPortableStoreValue(objectId, "ni");
      this.isWaypointCallbackHandled = getPortableStoreValue(objectId, "wc", false);
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

      this.isWaypointCallbackHandled = false;
      this.flagToWpCallback = false;
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
      this.helicopter.m_use_rocket_on_attack = this.state.isRocketEnabled;

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
    setPortableStoreValue(objectId, "li", this.lastIndex);
    setPortableStoreValue(objectId, "ni", this.nextIndex);
    setPortableStoreValue(objectId, "wc", this.isWaypointCallbackHandled);
  }

  public update(delta: TDuration): void {
    if (trySwitchToAnotherSection(this.object, this.state)) {
      return;
    }

    if (this.isWaypointCallbackHandled) {
      this.updateMovementState();
      this.isWaypointCallbackHandled = false;
    }

    if (this.state.pathLook) {
      if (this.state.pathLook === ACTOR) {
        this.helicopterFlyManager.setLookPoint(registry.actor.position());
        if (this.state.stopFire) {
          if (this.helicopter.isVisible(registry.actor)) {
            if (!this.byStopFireFly) {
              this.stopPoint = this.object.position();
              this.byStopFireFly = true;
              this.isWaypointCallbackHandled = true;
            }
          } else {
            this.byStopFireFly = false;
            this.isWaypointCallbackHandled = true;
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
        this.flagToWpCallback = this.helicopterFlyManager.flyOnPointWithVector(
          this.patrolMove!.point(this.lastIndex!),
          this.patrolMove!.point(this.nextIndex!),
          this.maxVelocity,
          this.flagToWpCallback!,
          false
        );
      } else {
        if (this.patrolMove!.count() > 1) {
          this.flagToWpCallback = this.helicopterFlyManager.flyOnPointWithVector(
            this.patrolMove!.point(this.lastIndex!),
            this.patrolMove!.point(this.nextIndex!),
            this.maxVelocity,
            true,
            true
          );
        } else {
          this.flagToWpCallback = this.helicopterFlyManager.flyOnPointWithVector(
            this.patrolMove!.point(this.lastIndex!),
            this.patrolMove!.point(this.lastIndex!),
            this.maxVelocity,
            true,
            true
          );
        }
      }
    } else {
      this.helicopterFlyManager.flyOnPointWithVector(this.stopPoint!, this.stopPoint!, this.maxVelocity, true, false);
      this.flagToWpCallback = true;
    }
  }

  /**
   * todo: Description.
   */
  public updateLookState(): void {
    this.helicopterFlyManager.setBlockFlook(true);
    this.helicopterFlyManager.lookAtPosition();
  }

  public override onWaypoint(object: GameObject, actionType: TName, index: TIndex): void {
    if (this.patrolMove && !this.flagToWpCallback && index !== this.lastIndex) {
      if (index === -1) {
        if (this.patrolMoveInfo!.has(this.lastIndex!)) {
          const signal: Optional<TName> = this.patrolMoveInfo!.get(this.lastIndex!)["sig"];

          if (signal) {
            this.state.signals!.set(signal, true);
          }
        }

        if (this.patrolMove.count() > 1) {
          this.lastIndex = this.nextIndex;
        }
      } else {
        this.lastIndex = index;
      }
    }

    this.isWaypointCallbackHandled = true;
  }
}
