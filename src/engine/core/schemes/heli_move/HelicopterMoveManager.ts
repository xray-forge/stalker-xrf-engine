import { CHelicopter, level, patrol } from "xray16";

import { getPortableStoreValue, registry, setPortableStoreValue } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/schemes";
import { getHeliFirer, HeliFire } from "@/engine/core/schemes/heli_move/HeliFire";
import { getHeliFlyer, HeliFly } from "@/engine/core/schemes/heli_move/HeliFly";
import { getHeliLooker, HeliLook } from "@/engine/core/schemes/heli_move/HeliLook";
import { ISchemeHelicopterMoveState } from "@/engine/core/schemes/heli_move/ISchemeHelicopterMoveState";
import { abort } from "@/engine/core/utils/assertion";
import { parseWaypointsData } from "@/engine/core/utils/ini/parse";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme/switch";
import { ACTOR } from "@/engine/lib/constants/words";
import { ClientObject, Optional, Patrol, TIndex, TName, TRate, Vector } from "@/engine/lib/types";

const state_move: number = 0;

/**
 * todo;
 */
export class HelicopterMoveManager extends AbstractSchemeManager<ISchemeHelicopterMoveState> {
  public readonly heliObject: CHelicopter;

  public heliLook: HeliLook;
  public heliFire: HeliFire;
  public heliFly: HeliFly;

  public patrolMove: Optional<Patrol> = null;
  public patrolMoveInfo!: LuaTable<number>;
  public patrolLook: Optional<Patrol> = null;

  public maxVelocity!: TRate;
  public heliState: Optional<number> = null;
  public lastIndex: Optional<number> = null;
  public nextIndex: Optional<number> = null;
  public _flagToWpCallback: Optional<boolean> = null;
  public wasCallback: Optional<boolean> = null;
  public byStopFireFly: Optional<boolean> = null;
  public stopPoint: Optional<Vector> = null;

  /**
   * todo: Description.
   */
  public constructor(object: ClientObject, state: ISchemeHelicopterMoveState) {
    super(object, state);

    this.heliObject = object.get_helicopter();

    this.heliFly = getHeliFlyer(object);
    this.heliFire = getHeliFirer(object);
    this.heliLook = getHeliLooker(object);
  }

  /**
   * todo: Description.
   */
  public override resetScheme(loading?: boolean): void {
    this.state.signals = new LuaTable();
    this.heliObject.TurnEngineSound(this.state.engine_sound);

    if (!level.patrol_path_exists(this.state.path_move)) {
      abort("Patrol path %s doesnt exist", this.state.path_move);
    }

    this.patrolMove = new patrol(this.state.path_move);
    this.patrolMoveInfo = parseWaypointsData(this.state.path_move)!;

    if (this.state.path_look) {
      if (this.state.path_look === ACTOR) {
        this.heliFly.setLookPoint(registry.actor.position());
        this.update_look_state();
      } else {
        this.patrolLook = new patrol(this.state.path_look);
        this.heliFly.setLookPoint(this.patrolLook.point(0));
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
      this.heliState = getPortableStoreValue(this.object, "st");

      this.lastIndex = getPortableStoreValue(this.object, "li") || null;
      this.nextIndex = getPortableStoreValue(this.object, "ni") || null;

      this.wasCallback = getPortableStoreValue(this.object, "wc");
    } else {
      this.lastIndex = null;
      this.nextIndex = null;

      this.heliFly.maxVelocity = this.maxVelocity;
      this.heliFly.heliLAccFW = this.maxVelocity / 15;
      this.heliFly.heliLAccBW = (2 * this.heliFly.heliLAccFW) / 3;
      this.heliObject.SetLinearAcc(this.heliFly.heliLAccFW, this.heliFly.heliLAccBW);

      this.heliObject.SetMaxVelocity(this.maxVelocity);

      this.heliState = null;
      this.stopPoint = null;
      this.byStopFireFly = false;

      this.wasCallback = false;
      this._flagToWpCallback = false;
      this.heliFire.enemy_ = this.state.enemy_;
      this.heliFire.enemy = null;
      this.heliFire.flagByEnemy = true;
      if (this.state.fire_point) {
        this.heliFire.firePoint = new patrol(this.state.fire_point).point(0);
      }

      if (this.state.max_mgun_dist) {
        this.heliObject.m_max_mgun_dist = this.state.max_mgun_dist;
      }

      if (this.state.max_rocket_dist) {
        this.heliObject.m_max_rocket_dist = this.state.max_rocket_dist;
      }

      if (this.state.min_mgun_dist) {
        this.heliObject.m_min_mgun_dist = this.state.min_mgun_dist;
      }

      if (this.state.min_rocket_dist) {
        this.heliObject.m_min_rocket_dist = this.state.min_rocket_dist;
      }

      if (this.state.use_mgun) {
        this.heliObject.m_use_mgun_on_attack = true;
      } else {
        this.heliObject.m_use_mgun_on_attack = false;
      }

      if (this.state.use_rocket) {
        this.heliObject.m_use_rocket_on_attack = true;
      } else {
        this.heliObject.m_use_rocket_on_attack = false;
      }

      this.heliFire.updVis = this.state.upd_vis;
      this.heliFire.updateEnemyState();
      this.updateMovementState();

      if (this.state.show_health) {
        this.heliFire.csRemove();
        this.heliFire.showHealth = true;
        this.heliFire.csHeli();
      } else {
        this.heliFire.showHealth = false;
        this.heliFire.csRemove();
      }

      this.heliObject.UseFireTrail(this.state.fire_trail);
    }
  }

  /**
   * todo: Description.
   */
  public save(): void {
    setPortableStoreValue(this.object, "st", this.heliState);
    // ---
    setPortableStoreValue(this.object, "li", this.lastIndex || false);
    setPortableStoreValue(this.object, "ni", this.nextIndex || false);
    // ---
    setPortableStoreValue(this.object, "wc", this.wasCallback);
  }

  /**
   * todo: Description.
   */
  public override update(delta: number): void {
    const actor: ClientObject = registry.actor;

    if (trySwitchToAnotherSection(this.object, this.state, actor)) {
      return;
    }

    // --this.heli_fire:update_enemy_state()
    if (this.wasCallback) {
      this.updateMovementState();
      this.wasCallback = false;
    }

    if (this.state.path_look) {
      if (this.state.path_look === ACTOR) {
        this.heliFly.setLookPoint(actor.position());
        if (this.state.stop_fire) {
          if (this.heliObject.isVisible(actor)) {
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

    if (!this.state.path_look && this.heliLook.lookState) {
      this.heliLook.calcLookPoint(this.heliFly.destPoint, true);
    }
  }

  /**
   * todo: Description.
   */
  public updateMovementState(): void {
    // --'printf("update_movement_state()")
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
        this._flagToWpCallback = this.heliFly.flyOnPointWithVector(
          this.patrolMove!.point(this.lastIndex!),
          this.patrolMove!.point(this.nextIndex!),
          this.maxVelocity,
          this._flagToWpCallback!,
          false
        );
      } else {
        if (this.patrolMove!.count() > 1) {
          this._flagToWpCallback = this.heliFly.flyOnPointWithVector(
            this.patrolMove!.point(this.lastIndex!),
            this.patrolMove!.point(this.nextIndex!),
            this.maxVelocity,
            true,
            true
          );
        } else {
          this._flagToWpCallback = this.heliFly.flyOnPointWithVector(
            this.patrolMove!.point(this.lastIndex!),
            this.patrolMove!.point(this.lastIndex!),
            this.maxVelocity,
            true,
            true
          );
        }
      }
    } else {
      this._flagToWpCallback = this.heliFly.flyOnPointWithVector(
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
    this.heliFly.setBlockFlook(true);
    this.heliFly.lookAtPosition();
  }

  /**
   * todo: Description.
   */
  public override onWaypoint(object: ClientObject, actionType: TName, index: TIndex): void {
    if (!this._flagToWpCallback) {
      if (this.patrolMove !== null) {
        if (index === this.lastIndex) {
          return;
        }

        if (index !== -1) {
          this.lastIndex = index;
        } else {
          if (this.patrolMoveInfo.get(this.lastIndex!) !== null) {
            const signal = this.patrolMoveInfo.get(this.lastIndex!)["sig"];

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
