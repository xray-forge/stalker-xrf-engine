import { action_base, danger_object, LuabindClass, patrol, stalker_ids, time_global } from "xray16";

import { registry, setStalkerState } from "@/engine/core/database";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { StalkerPatrolManager } from "@/engine/core/objects/ai/patrol/StalkerPatrolManager";
import { EStalkerState, ILookTargetDescriptor } from "@/engine/core/objects/animation/types";
import { ICampPoint, ISchemeCamperState } from "@/engine/core/schemes/stalker/camper/camper_types";
import { getNextCampPatrolPoint, isOnCampPatrolPlace } from "@/engine/core/schemes/stalker/camper/utils/camper_utils";
import { isObjectFacingDanger } from "@/engine/core/schemes/stalker/danger/utils";
import { abort } from "@/engine/core/utils/assertion";
import { parseWaypointsData } from "@/engine/core/utils/ini";
import { isObjectAtTerminalWaypoint } from "@/engine/core/utils/patrol";
import { createVector } from "@/engine/core/utils/vector";
import {
  DangerObject,
  GameObject,
  ISchemeEventHandler,
  Optional,
  Patrol,
  TTimestamp,
  Vector,
} from "@/engine/lib/types";

/**
 * todo;
 */
@LuabindClass()
export class ActionCloseCombat extends action_base implements ISchemeEventHandler {
  public state: ISchemeCamperState;
  public patrolManager: StalkerPatrolManager;

  public flag: Optional<number> = null;
  public danger: boolean = false;
  public nextPoint: Optional<ICampPoint> = null;
  public scantime: Optional<TTimestamp> = null;
  public direction: Optional<Vector> = null;
  public position: Optional<Vector> = null;
  public lookPosition: Optional<Vector> = null;
  public destPosition: Optional<Vector> = null;
  public lookPoint: Optional<Vector> = null;
  public point0: Optional<Vector> = null;
  public point2: Optional<Vector> = null;
  public enemy: Optional<GameObject> = null;
  public enemyPosition: Optional<Vector> = null;

  public constructor(state: ISchemeCamperState, object: GameObject) {
    super(null, ActionCloseCombat.__name);

    this.state = state;
    this.patrolManager = registry.objects.get(object.id()).patrolManager!;
    this.state.scanTable = new LuaTable();
  }

  /**
   * todo: Description.
   */
  public override initialize(): void {
    super.initialize();

    this.object.set_desired_position();
    this.object.set_desired_direction();

    this.reset();
    this.enemyPosition = null;
  }

  /**
   * todo: Description.
   */
  public activate(): void {
    this.reset();
  }

  /**
   * todo: Description.
   */
  public reset(): void {
    setStalkerState(this.object, EStalkerState.PATROL);

    this.state.signals = new LuaTable();
    this.state.scanTable = new LuaTable();

    if (this.state.sniper === true) {
      this.patrolManager.reset(
        this.state.pathWalk,
        parseWaypointsData(this.state.pathWalk)!,
        null,
        null,
        null,
        this.state.suggestedState,
        { context: this, callback: () => false }
      );

      const lookPatrol: Patrol = new patrol(this.state.pathLook);

      if (lookPatrol !== null) {
        for (const k of $range(0, lookPatrol.count() - 1)) {
          for (const i of $range(0, 31)) {
            if (lookPatrol.flag(k, i)) {
              if (this.state.scanTable.get(i) === null) {
                this.state.scanTable.set(i, new LuaTable());
              }

              table.insert(this.state.scanTable.get(i), { key: k, pos: lookPatrol.point(k) });
            }
          }
        }
      }

      if (!this.object.sniper_update_rate()) {
        this.object.sniper_update_rate(true);
      }
    } else {
      this.patrolManager.reset(
        this.state.pathWalk,
        parseWaypointsData(this.state.pathWalk)!,
        this.state.pathLook,
        parseWaypointsData(this.state.pathLook),
        null,
        this.state.suggestedState,
        { context: this, callback: () => false }
      );

      if (this.object.sniper_update_rate()) {
        this.object.sniper_update_rate(false);
      }
    }

    this.state.lastLookPoint = null;
    this.state.curLookPoint = null;
    this.state.scanBegin = null;
  }

  public override finalize(): void {
    this.patrolManager.finalize();
    super.finalize();
  }

  /**
   * todo: Description.
   */
  public override execute(): void {
    super.execute();
    this.enemy = this.object.best_enemy();

    if (this.enemy !== null) {
      this.state.memEnemy = this.object.memory_time(this.enemy);

      if (this.state.memEnemy === null || time_global() - this.state.memEnemy > this.state.idle) {
        this.enemy = null;
        this.state.memEnemy = null;
        this.patrolManager.setup();
      }
    } else {
      if (this.state.memEnemy !== null) {
        this.state.memEnemy = null;
        this.patrolManager.setup();
      }
    }

    if (this.enemy) {
      if (this.object.see(this.enemy) === true && this.canShoot()) {
        setStalkerState(
          this.object,
          this.state.suggestedState.camperingFire ??
            (this.state.sniper ? EStalkerState.HIDE_SNIPER_FIRE : EStalkerState.HIDE_FIRE),
          null,
          null,
          { lookObjectId: this.enemy.id(), lookPosition: this.enemy.position() },
          { animation: true }
        );

        GlobalSoundManager.getInstance().playSound(this.object.id(), this.state.attackSound);
      } else {
        const memoryPosition: Vector = this.object.memory_position(this.enemy);

        if (
          this.enemyPosition === null ||
          this.enemyPosition.x !== memoryPosition.x ||
          this.enemyPosition.y !== memoryPosition.y ||
          this.enemyPosition.z !== memoryPosition.z
        ) {
          this.enemyPosition = memoryPosition;

          if (this.state.sniper === true) {
            this.position = this.object.position();

            this.direction = createVector(
              this.enemyPosition.x - this.position.x,
              0,
              this.enemyPosition.z - this.position.z
            );
            this.direction.normalize();

            const wideSight = this.position.distance_to(this.enemyPosition) * math.tan(this.state.enemyDisp);

            this.point0 = createVector(
              this.enemyPosition.x + wideSight * this.direction.z,
              this.enemyPosition.y,
              this.enemyPosition.z - wideSight * this.direction.x
            );

            this.point2 = createVector(
              this.enemyPosition.x - wideSight * this.direction.z,
              this.enemyPosition.y,
              this.enemyPosition.z + wideSight * this.direction.x
            );

            // todo: Optimize.
            this.state.scanTable!.set(-1, new LuaTable());
            table.insert(this.state.scanTable!.get(-1), { key: 0, pos: this.point0 });
            table.insert(this.state.scanTable!.get(-1), { key: 1, pos: this.enemyPosition });
            table.insert(this.state.scanTable!.get(-1), { key: 2, pos: this.point2 });
          }
        }

        if (this.state.sniper === true) {
          if (time_global() - this.state.memEnemy! < this.state.postEnemyWait) {
            const position: Optional<ILookTargetDescriptor> =
              this.enemyPosition !== null ? { lookPosition: this.enemyPosition } : null;

            setStalkerState(
              this.object,
              this.state.suggestedState.campering ?? EStalkerState.HIDE_NA,
              null,
              null,
              position
            );
          } else {
            this.scan(-1);
          }
        } else {
          if (isOnCampPatrolPlace(this.object, this.state)) {
            const position: Optional<ILookTargetDescriptor> =
              this.enemyPosition !== null ? { lookPosition: this.enemyPosition, lookObjectId: null } : null;

            setStalkerState(
              this.object,
              this.state.suggestedState.campering ?? EStalkerState.HIDE,
              null,
              null,
              position
            );
          } else {
            this.patrolManager.setup();
            this.patrolManager.update();
          }
        }
      }

      return;
    }

    if (this.processDanger()) {
      this.danger = true;

      return;
    }

    if (this.danger) {
      this.danger = false;
      this.patrolManager.setup();
    }

    if (this.state.sniper === true) {
      if (isOnCampPatrolPlace(this.object, this.state)) {
        if (this.scantime === null) {
          this.scantime = time_global();
        }

        this.scan(this.state.wpFlag as number);

        const [isOnWaypoint] = isObjectAtTerminalWaypoint(
          this.patrolManager.object,
          this.patrolManager.patrolWalk as Patrol
        );

        if (isOnWaypoint) {
          return;
        }

        if (this.scantime !== null && time_global() - this.scantime >= this.state.scantimeFree) {
          this.patrolManager.setup();
        }
      } else {
        this.scantime = null;
        this.patrolManager.update();
      }
    } else {
      this.patrolManager.update();
    }
  }

  /**
   * todo: Description.
   */
  public canShoot(): boolean {
    switch (this.state.shoot) {
      case "always":
        return true;

      case "none":
        return false;

      case "terminal": {
        const [isOnTerminalWaypoint] = isObjectAtTerminalWaypoint(
          this.patrolManager.object,
          this.patrolManager.patrolWalk as Patrol
        );

        return isOnTerminalWaypoint;
      }

      default:
        abort(
          "%s: unrecognized shoot type '%s' for '%s'.",
          ActionCloseCombat.__name,
          this.state.shoot,
          this.object.name()
        );
    }
  }

  /**
   * todo: Description.
   */
  public processDanger(): boolean {
    if (!isObjectFacingDanger(this.object)) {
      return false;
    }

    const bestDanger: Optional<DangerObject> = this.object.best_danger();

    if (bestDanger === null) {
      return false;
    }

    const bestDangerObject: GameObject = bestDanger.object();

    if (!this.danger) {
      this.object.play_sound(stalker_ids.sound_alarm, 1, 0, 1, 0);
    }

    const isUrgentDanger: boolean =
      bestDangerObject !== null &&
      bestDanger.type() === danger_object.attacked &&
      time_global() - bestDanger.time() < 5000;

    if (isUrgentDanger) {
      setStalkerState(this.object, this.state.suggestedState.camperingFire ?? EStalkerState.HIDE_FIRE, null, null, {
        lookPosition: bestDangerObject.position(),
      });
    } else {
      setStalkerState(
        this.object,
        this.state.suggestedState.campering ?? (this.state.sniper ? EStalkerState.HIDE_NA : EStalkerState.HIDE),
        null,
        null,
        { lookPosition: bestDanger.position() }
      );
    }

    return true;
  }

  /**
   * todo: Description.
   */
  public scan(flag: number): void {
    if (this.state.scanTable!.get(flag) === null) {
      return;
    }

    const now: TTimestamp = time_global();

    if (this.flag !== flag) {
      this.flag = flag;
      this.state.scanBegin = null;
      this.state.curLookPoint = null;
      this.state.lastLookPoint = null;
    }

    if (this.state.scanBegin === null || now - this.state.scanBegin > this.state.timeScanDelta) {
      this.nextPoint = getNextCampPatrolPoint(flag, this.state);
      if (this.state.curLookPoint === null) {
        this.state.curLookPoint = 1;
      }

      if (this.state.lastLookPoint === null) {
        this.state.lastLookPoint = this.nextPoint;
      }

      this.lookPosition = this.state.lastLookPoint.pos;
      this.destPosition = this.nextPoint.pos;
      this.lookPoint = createVector(
        this.lookPosition!.x +
          (this.state.curLookPoint * (this.destPosition.x - this.lookPosition!.x)) / this.state.scandelta,
        this.lookPosition!.y +
          (this.state.curLookPoint * (this.destPosition.y - this.lookPosition!.y)) / this.state.scandelta,
        this.lookPosition!.z +
          (this.state.curLookPoint * (this.destPosition.z - this.lookPosition!.z)) / this.state.scandelta
      );

      setStalkerState(this.object, this.state.suggestedState.campering ?? EStalkerState.HIDE_NA, null, null, {
        lookPosition: this.lookPoint,
      });

      if (this.state.curLookPoint >= this.state.scandelta) {
        this.state.curLookPoint = null;
        this.state.lastLookPoint = this.nextPoint;
      } else {
        this.state.curLookPoint += this.state.scanBegin ? (now - this.state.scanBegin) / this.state.timeScanDelta : 1;
      }

      this.state.scanBegin = now;
    }
  }
}
