import { CHelicopter, level, patrol } from "xray16";
import { GameObject, Patrol, Vector } from "xray16/alias";
import { ACTOR, assert, LuaArray, Nillable, TCount, TIndex, TName, TNumberId, TRate } from "xray16/lib";
import { $isNil } from "xray16/macros";

import { getPortableStoreValue, registry, setPortableStoreValue } from "@/engine/core/database";
import { IWaypointData, parseWaypointsData } from "@/engine/core/ini";
import { AbstractSchemeController } from "@/engine/core/schemes/base";
import { HelicopterFireController } from "@/engine/core/schemes/helicopter/heli_move/fire/HelicopterFireController";
import { HelicopterFlyController } from "@/engine/core/schemes/helicopter/heli_move/fly";
import { ISchemeHelicopterMoveState } from "@/engine/core/schemes/helicopter/heli_move/helicopter_types";
import {
  getHelicopterFireController,
  getHelicopterFlyController,
} from "@/engine/core/schemes/helicopter/heli_move/utils";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/runtime";

/**
 * Controller of helicopter movement scheme logics.
 */
export class HelicopterMoveController extends AbstractSchemeController<ISchemeHelicopterMoveState> {
  public readonly helicopter: CHelicopter;

  public helicopterFireController: HelicopterFireController;
  public helicopterFlyController: HelicopterFlyController;

  public isHelicopterMoving: boolean = false;
  public isWaypointCallbackHandled: boolean = false;

  public patrolMove: Nillable<Patrol> = null;
  public patrolMoveInfo: Nillable<LuaArray<IWaypointData>> = null;
  public patrolLook: Nillable<Patrol> = null;

  public lastIndex: Nillable<TIndex> = null;
  public nextIndex: Nillable<TIndex> = null;
  public maxVelocity!: TRate;
  public flagToWpCallback: Nillable<boolean> = null;
  public byStopFireFly: Nillable<boolean> = null;
  public stopPoint: Nillable<Vector> = null;

  public constructor(object: GameObject, state: ISchemeHelicopterMoveState) {
    super(object, state);

    this.helicopter = object.get_helicopter();

    this.helicopterFlyController = getHelicopterFlyController(object);
    this.helicopterFireController = getHelicopterFireController(object);
  }

  public override activate(object: GameObject, isLoading?: boolean): void {
    assert(level.patrol_path_exists(this.state.pathMove), "Patrol path '%s' does not exist.", this.state.pathMove);

    this.patrolMove = new patrol(this.state.pathMove);
    this.patrolMoveInfo = parseWaypointsData(this.state.pathMove)!;

    if (this.state.pathLook) {
      if (this.state.pathLook === ACTOR) {
        this.helicopterFlyController.setLookPoint(registry.actor.position());
      } else {
        assert(level.patrol_path_exists(this.state.pathLook), "Patrol path '%s' does not exist.", this.state.pathMove);

        this.patrolLook = new patrol(this.state.pathLook);
        this.helicopterFlyController.setLookPoint(this.patrolLook.point(0));
      }

      this.updateLookState();
    } else {
      this.patrolLook = null;
    }

    this.state.signals = new LuaTable();
    this.maxVelocity = this.state.maxVelocity;
    this.helicopter.TurnEngineSound(this.state.isEngineSoundEnabled);

    if (isLoading) {
      const objectId: TNumberId = object.id();

      this.isHelicopterMoving = getPortableStoreValue(objectId, "st") === true;
      this.lastIndex = getPortableStoreValue(objectId, "li");
      this.nextIndex = getPortableStoreValue(objectId, "ni");
      this.isWaypointCallbackHandled = getPortableStoreValue(objectId, "wc", false);
    } else {
      this.lastIndex = null;
      this.nextIndex = null;

      this.helicopterFlyController.maxVelocity = this.maxVelocity;
      this.helicopterFlyController.heliLAccFW = this.maxVelocity / 15;
      this.helicopterFlyController.heliLAccBW = (2 * this.helicopterFlyController.heliLAccFW) / 3;

      this.helicopter.SetLinearAcc(this.helicopterFlyController.heliLAccFW, this.helicopterFlyController.heliLAccBW);
      this.helicopter.SetMaxVelocity(this.maxVelocity);

      this.isHelicopterMoving = false;
      this.stopPoint = null;
      this.byStopFireFly = false;

      this.isWaypointCallbackHandled = false;
      this.flagToWpCallback = false;
      this.helicopterFireController.enemyPreference = this.state.enemyPreference;
      this.helicopterFireController.enemy = null;
      this.helicopterFireController.flagByEnemy = true;

      if (this.state.firePoint) {
        this.helicopterFireController.firePoint = new patrol(this.state.firePoint).point(0);
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

      this.helicopterFireController.updateVisibility = this.state.updVis;
      this.helicopterFireController.updateEnemyState();
      this.updateMovementState();

      this.helicopter.UseFireTrail(this.state.fireTrail);

      if (this.state.showHealth) {
        this.helicopterFireController.removeHelicopterFightUI();
        this.helicopterFireController.showHealth = true;
        this.helicopterFireController.showHelicopterFightUI();
      } else {
        this.helicopterFireController.showHealth = false;
        this.helicopterFireController.removeHelicopterFightUI();
      }
    }
  }

  public save(): void {
    const objectId: TNumberId = this.object.id();

    setPortableStoreValue(objectId, "st", this.isHelicopterMoving);
    setPortableStoreValue(objectId, "li", this.lastIndex);
    setPortableStoreValue(objectId, "ni", this.nextIndex);
    setPortableStoreValue(objectId, "wc", this.isWaypointCallbackHandled);
  }

  public update(): void {
    if (trySwitchToAnotherSection(this.object, this.state)) {
      return;
    }

    if (this.isWaypointCallbackHandled) {
      this.updateMovementState();
      this.isWaypointCallbackHandled = false;
    }

    if (this.state.pathLook) {
      if (this.state.pathLook === ACTOR) {
        this.helicopterFlyController.setLookPoint(registry.actor.position());

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
  }

  /**
   * Advance the helicopter along its patrol move path, flying to the next waypoint or stop point.
   */
  public updateMovementState(): void {
    this.isHelicopterMoving = true;

    // Handle index processing.
    if (this.patrolMove) {
      if ($isNil(this.lastIndex)) {
        this.lastIndex = 0;
        this.nextIndex = 1;
      } else {
        this.nextIndex = this.lastIndex + 1;

        if (this.nextIndex >= this.patrolMove.count()) {
          this.nextIndex = 0;
        }
      }
    }

    // Handle flying on point.
    if (this.byStopFireFly) {
      this.helicopterFlyController.flyOnPointWithVector(
        this.stopPoint!,
        this.stopPoint!,
        this.maxVelocity,
        true,
        false
      );
      this.flagToWpCallback = true;
    } else {
      const waypointsCount: TCount = this.patrolMove!.count();

      if (waypointsCount > 2) {
        this.flagToWpCallback = this.helicopterFlyController.flyOnPointWithVector(
          this.patrolMove!.point(this.lastIndex!),
          this.patrolMove!.point(this.nextIndex!),
          this.maxVelocity,
          this.flagToWpCallback!,
          false
        );
      } else {
        this.flagToWpCallback = this.helicopterFlyController.flyOnPointWithVector(
          this.patrolMove!.point(this.lastIndex!),
          this.patrolMove!.point(waypointsCount === 2 ? this.nextIndex! : this.lastIndex!),
          this.maxVelocity,
          true,
          true
        );
      }
    }
  }

  /**
   * Handle helicopter look state updates.
   */
  public updateLookState(): void {
    this.helicopterFlyController.setBlockFlook(true);
    this.helicopterFlyController.lookAtPosition();
  }

  public override onWaypoint(object: GameObject, actionType: TName, index: TIndex): void {
    if (this.flagToWpCallback) {
      return;
    }

    if (this.patrolMove) {
      // Repeated callback for the current waypoint - ignore without re-arming the movement update.
      if (index === this.lastIndex) {
        return;
      }

      if (index === -1) {
        if (this.patrolMoveInfo!.has(this.lastIndex!)) {
          const signal: Nillable<TName> = this.patrolMoveInfo!.get(this.lastIndex!)["sig"];

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
