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
  getHeliLooker,
  HelicopterLookManager,
} from "@/engine/core/schemes/helicopter/heli_move/control/HelicopterLookManager";
import { ISchemeHelicopterMoveState } from "@/engine/core/schemes/helicopter/heli_move/helicopter_types";
import { abort } from "@/engine/core/utils/assertion";
import { IWaypointData, parseWaypointsData } from "@/engine/core/utils/ini";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme";
import { ACTOR } from "@/engine/lib/constants/words";
import { GameObject, LuaArray, Optional, Patrol, TIndex, TName, TRate, Vector } from "@/engine/lib/types";

const state_move: number = 0;

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

  public maxVelocity!: TRate;
  public heliState: Optional<number> = null;
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
    this.helicopterLookManager = getHeliLooker(object);
  }

  public override activate(object: GameObject, loading?: boolean): void {
    this.state.signals = new LuaTable();
    this.helicopter.TurnEngineSound(this.state.engine_sound);

    if (!level.patrol_path_exists(this.state.path_move)) {
      abort("Patrol path %s doesnt exist", this.state.path_move);
    }

    this.patrolMove = new patrol(this.state.path_move);
    this.patrolMoveInfo = parseWaypointsData(this.state.path_move)!;

    if (this.state.path_look) {
      if (this.state.path_look === ACTOR) {
        this.helicopterFlyManager.setLookPoint(registry.actor.position());
        this.update_look_state();
      } else {
        this.patrolLook = new patrol(this.state.path_look);
        this.helicopterFlyManager.setLookPoint(this.patrolLook.point(0));
        this.update_look_state();

        if (!this.patrolLook) {
          abort("object '%s': unable to find path_look '%s' on the map", this.object.name(), this.state.path_look);
        }
      }
    } else {
      this.patrolLook = null;
    }

    this.maxVelocity = this.state.max_velocity;

    if (loading) {
      this.heliState = getPortableStoreValue(this.object.id(), "st");
      this.lastIndex = getPortableStoreValue(this.object.id(), "li") || null;
      this.nextIndex = getPortableStoreValue(this.object.id(), "ni") || null;
      this.wasCallback = getPortableStoreValue(this.object.id(), "wc");
    } else {
      this.lastIndex = null;
      this.nextIndex = null;

      this.helicopterFlyManager.maxVelocity = this.maxVelocity;
      this.helicopterFlyManager.heliLAccFW = this.maxVelocity / 15;
      this.helicopterFlyManager.heliLAccBW = (2 * this.helicopterFlyManager.heliLAccFW) / 3;

      this.helicopter.SetLinearAcc(this.helicopterFlyManager.heliLAccFW, this.helicopterFlyManager.heliLAccBW);
      this.helicopter.SetMaxVelocity(this.maxVelocity);

      this.heliState = null;
      this.stopPoint = null;
      this.byStopFireFly = false;

      this.wasCallback = false;
      this._flagToWpCallback = false;
      this.helicopterFireManager.enemy_ = this.state.enemy_;
      this.helicopterFireManager.enemy = null;
      this.helicopterFireManager.flagByEnemy = true;
      if (this.state.fire_point) {
        this.helicopterFireManager.firePoint = new patrol(this.state.fire_point).point(0);
      }

      if (this.state.max_mgun_dist) {
        this.helicopter.m_max_mgun_dist = this.state.max_mgun_dist;
      }

      if (this.state.max_rocket_dist) {
        this.helicopter.m_max_rocket_dist = this.state.max_rocket_dist;
      }

      if (this.state.min_mgun_dist) {
        this.helicopter.m_min_mgun_dist = this.state.min_mgun_dist;
      }

      if (this.state.min_rocket_dist) {
        this.helicopter.m_min_rocket_dist = this.state.min_rocket_dist;
      }

      if (this.state.use_mgun) {
        this.helicopter.m_use_mgun_on_attack = true;
      } else {
        this.helicopter.m_use_mgun_on_attack = false;
      }

      if (this.state.use_rocket) {
        this.helicopter.m_use_rocket_on_attack = true;
      } else {
        this.helicopter.m_use_rocket_on_attack = false;
      }

      this.helicopterFireManager.updVis = this.state.upd_vis;
      this.helicopterFireManager.updateEnemyState();
      this.updateMovementState();

      if (this.state.show_health) {
        this.helicopterFireManager.csRemove();
        this.helicopterFireManager.showHealth = true;
        this.helicopterFireManager.csHeli();
      } else {
        this.helicopterFireManager.showHealth = false;
        this.helicopterFireManager.csRemove();
      }

      this.helicopter.UseFireTrail(this.state.fire_trail);
    }
  }

  public save(): void {
    setPortableStoreValue(this.object.id(), "st", this.heliState);
    // ---
    setPortableStoreValue(this.object.id(), "li", this.lastIndex || false);
    setPortableStoreValue(this.object.id(), "ni", this.nextIndex || false);
    // ---
    setPortableStoreValue(this.object.id(), "wc", this.wasCallback);
  }

  public update(delta: number): void {
    if (trySwitchToAnotherSection(this.object, this.state)) {
      return;
    }

    // --this.heli_fire:update_enemy_state()
    if (this.wasCallback) {
      this.updateMovementState();
      this.wasCallback = false;
    }

    if (this.state.path_look) {
      const actor: GameObject = registry.actor;

      if (this.state.path_look === ACTOR) {
        this.helicopterFlyManager.setLookPoint(actor.position());
        if (this.state.stop_fire) {
          if (this.helicopter.isVisible(actor)) {
            if (!this.byStopFireFly) {
              this.stopPoint = this.object.position();
              this.byStopFireFly = true;
              this.wasCallback = true;
              // --'printf("Stop Fire!")
            }
          } else {
            // --'printf("Fly to next point!")
            this.byStopFireFly = false;
            this.wasCallback = true;
          }
        }
      }

      this.update_look_state();
    }

    if (!this.state.path_look && this.helicopterLookManager.lookState) {
      this.helicopterLookManager.calculateLookPoint(this.helicopterFlyManager.destPoint, true);
    }
  }

  /**
   * todo: Description.
   */
  public updateMovementState(): void {
    this.heliState = state_move;

    if (this.patrolMove !== null) {
      if (!this.lastIndex) {
        this.lastIndex = 0;
        this.nextIndex = 1;
      } else {
        this.nextIndex = this.lastIndex + 1;

        if (this.nextIndex >= this.patrolMove.count()) {
          this.nextIndex = 0;
        }
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
  public update_look_state(): void {
    // --'    printf("update_look_state()")
    this.helicopterFlyManager.setBlockFlook(true);
    this.helicopterFlyManager.lookAtPosition();
  }

  /**
   * todo: Description.
   */
  public override onWaypoint(object: GameObject, actionType: TName, index: TIndex): void {
    if (!this._flagToWpCallback) {
      if (this.patrolMove !== null) {
        if (index === this.lastIndex) {
          return;
        }

        if (index !== -1) {
          this.lastIndex = index;
        } else {
          if (this.patrolMoveInfo.has(this.lastIndex!)) {
            const signal: Optional<TName> = this.patrolMoveInfo.get(this.lastIndex!)["sig"];

            if (signal !== null) {
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
