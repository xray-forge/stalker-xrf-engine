import { action_base, danger_object, LuabindClass, patrol, stalker_ids, time_global } from "xray16";

import { registry, setStalkerState } from "@/engine/core/database";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { EStalkerState, ILookTargetDescriptor } from "@/engine/core/objects/state";
import { StalkerMoveManager } from "@/engine/core/objects/state/StalkerMoveManager";
import { ICampPoint, ISchemeCamperState } from "@/engine/core/schemes/camper/ISchemeCamperState";
import { abort } from "@/engine/core/utils/assertion";
import { parseWaypointsData } from "@/engine/core/utils/ini";
import { isObjectFacingDanger, isStalkerAtWaypoint } from "@/engine/core/utils/object";
import { createVector } from "@/engine/core/utils/vector";
import { ClientObject, DangerObject, Optional, Vector } from "@/engine/lib/types";

/**
 * todo;
 */
@LuabindClass()
export class ActionCamperPatrol extends action_base {
  public state: ISchemeCamperState;
  public moveManager: StalkerMoveManager;

  public flag: Optional<number> = null;
  public danger: boolean = false;
  public nextPoint: Optional<ICampPoint> = null;
  public scantime: Optional<number> = null;
  public direction: Optional<Vector> = null;
  public position: Optional<Vector> = null;
  public lookPosition: Optional<Vector> = null;
  public destPosition: Optional<Vector> = null;
  public lookPoint: Optional<Vector> = null;
  public point0: Optional<Vector> = null;
  public point2: Optional<Vector> = null;
  public enemy: Optional<ClientObject> = null;
  public enemyPosition: Optional<Vector> = null;

  /**
   * todo: Description.
   */
  public constructor(state: ISchemeCamperState, object: ClientObject) {
    super(null, ActionCamperPatrol.__name);

    this.state = state;
    this.moveManager = registry.objects.get(object.id()).moveManager!;
    this.state.scan_table = new LuaTable();
  }

  /**
   * todo: Description.
   */
  public override initialize(): void {
    super.initialize();

    this.object.set_desired_position();
    this.object.set_desired_direction();

    this.resetScheme();
    this.enemyPosition = null;
  }

  /**
   * todo: Description.
   */
  public resetScheme(): void {
    setStalkerState(this.object, EStalkerState.PATROL, null, null, null, null);

    this.state.signals = new LuaTable();
    this.state.scan_table = new LuaTable();

    if (this.state.sniper === true) {
      this.moveManager.reset(
        this.state.path_walk,
        parseWaypointsData(this.state.path_walk)!,
        null,
        null,
        null,
        this.state.suggested_state,
        { obj: this, func: this.processPoint },
        null,
        null,
        null
      );

      const path = new patrol(this.state.path_look);

      if (path !== null) {
        for (const k of $range(0, path.count() - 1)) {
          for (const i of $range(0, 31)) {
            if (path.flag(k, i)) {
              if (this.state.scan_table.get(i) === null) {
                this.state.scan_table.set(i, new LuaTable());
              }

              table.insert(this.state.scan_table.get(i), { key: k, pos: path.point(k) });
            }
          }
        }
      }

      if (!this.object.sniper_update_rate()) {
        this.object.sniper_update_rate(true);
      }
    } else {
      this.moveManager.reset(
        this.state.path_walk,
        parseWaypointsData(this.state.path_walk)!,
        this.state.path_look,
        parseWaypointsData(this.state.path_look),
        null,
        this.state.suggested_state,
        { obj: this, func: this.processPoint },
        null,
        null,
        null
      );

      if (this.object.sniper_update_rate()) {
        this.object.sniper_update_rate(false);
      }
    }

    this.state.last_look_point = null;
    this.state.cur_look_point = null;
    this.state.scan_begin = null;
  }

  /**
   * todo: Description.
   */
  public activateScheme(): void {
    this.resetScheme();
  }

  /**
   * todo: Description.
   */
  public can_shoot(): boolean {
    if (this.state.shoot === "always") {
      return true;
    }

    if (this.state.shoot === "none") {
      return false;
    }

    if (this.state.shoot === "terminal") {
      const [isOnTerminalWaypoint] = this.moveManager.isStandingOnTerminalWaypoint();

      return isOnTerminalWaypoint;
    }

    abort("Camper: unrecognized shoot type [%s] for [%s]", tostring(this.state.shoot), this.object.name());

    return true;
  }

  /**
   * todo: Description.
   */
  public override execute(): void {
    super.execute();
    this.enemy = this.object.best_enemy();

    if (this.enemy !== null) {
      this.state.mem_enemy = this.object.memory_time(this.enemy);

      if (this.state.mem_enemy === null || time_global() - this.state.mem_enemy > this.state.idle) {
        this.enemy = null;
        this.state.mem_enemy = null;
        this.moveManager.continue();
      }
    } else {
      if (this.state.mem_enemy !== null) {
        this.state.mem_enemy = null;
        this.moveManager.continue();
      }
    }

    if (this.enemy !== null) {
      if (this.object.see(this.enemy) === true && this.can_shoot()) {
        if (this.state.sniper === true) {
          if (this.state.suggested_state.campering_fire) {
            setStalkerState(
              this.object,
              this.state.suggested_state.campering_fire,
              null,
              null,
              { lookObject: this.enemy, lookPosition: this.enemy.position() },
              { animation: true }
            );
          } else {
            setStalkerState(
              this.object,
              EStalkerState.HIDE_SNIPER_FIRE,
              null,
              null,
              { lookObject: this.enemy, lookPosition: this.enemy.position() },
              { animation: true }
            );
          }
        } else {
          if (this.state.suggested_state.campering_fire) {
            setStalkerState(
              this.object,
              this.state.suggested_state.campering_fire,
              null,
              null,
              { lookObject: this.enemy, lookPosition: this.enemy.position() },
              { animation: true }
            );
          } else {
            setStalkerState(
              this.object,
              EStalkerState.HIDE_FIRE,
              null,
              null,
              { lookObject: this.enemy, lookPosition: this.enemy.position() },
              { animation: true }
            );
          }
        }

        GlobalSoundManager.getInstance().playSound(this.object.id(), this.state.attack_sound, null, null);
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

            const wideSight = this.position.distance_to(this.enemyPosition) * math.tan(this.state.enemy_disp);

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
            this.state.scan_table!.set(-1, new LuaTable());
            table.insert(this.state.scan_table!.get(-1), { key: 0, pos: this.point0 });
            table.insert(this.state.scan_table!.get(-1), { key: 1, pos: this.enemyPosition });
            table.insert(this.state.scan_table!.get(-1), { key: 2, pos: this.point2 });
          }
        }

        if (this.state.sniper === true) {
          if (time_global() - this.state.mem_enemy! < this.state.post_enemy_wait) {
            const position: Optional<ILookTargetDescriptor> =
              this.enemyPosition !== null ? { lookPosition: this.enemyPosition, lookObject: null } : null;

            if (this.state.suggested_state.campering) {
              setStalkerState(this.object, this.state.suggested_state.campering, null, null, position, null);
            } else {
              setStalkerState(this.object, EStalkerState.HIDE_NA, null, null, position, null);
            }
          } else {
            this.scan(-1);
          }
        } else {
          if (this.isOnPlace()) {
            const position: Optional<ILookTargetDescriptor> =
              this.enemyPosition !== null ? { lookPosition: this.enemyPosition, lookObject: null } : null;

            if (this.state.suggested_state.campering) {
              setStalkerState(this.object, this.state.suggested_state.campering, null, null, position, null);
            } else {
              setStalkerState(this.object, EStalkerState.HIDE, null, null, position, null);
            }
          } else {
            this.moveManager.continue();
            this.moveManager.update();
          }
        }
      }

      return;
    }

    const danger = this.processDanger();

    if (danger) {
      this.danger = true;

      return;
    }

    if (this.danger) {
      this.danger = false;
      this.moveManager.continue();
    }

    if (this.state.sniper === true) {
      if (this.isOnPlace()) {
        if (this.scantime === null) {
          this.scantime = time_global();
        }

        this.scan(this.state.wp_flag as number);

        const [isOnWaypoint] = this.moveManager.isStandingOnTerminalWaypoint();

        if (isOnWaypoint) {
          return;
        }

        if (this.scantime !== null && time_global() - this.scantime >= this.state.scantime_free) {
          this.moveManager.continue();
        }
      } else {
        this.scantime = null;
        this.moveManager.update();
      }
    } else {
      this.moveManager.update();
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

    const bestDangerObject: ClientObject = bestDanger.object();
    const bestDangerType = bestDanger.type();
    const position: ILookTargetDescriptor = { lookPosition: bestDanger.position(), lookObject: null };

    if (!this.danger) {
      this.object.play_sound(stalker_ids.sound_alarm, 1, 0, 1, 0);
    }

    const isUrgentDanger =
      bestDangerObject !== null &&
      bestDangerType === danger_object.attacked &&
      time_global() - bestDanger.time() < 5000;

    if (isUrgentDanger === true) {
      const dangerObjectPosition: ILookTargetDescriptor = {
        lookPosition: bestDangerObject.position(),
        lookObject: null,
      };

      if (this.state.suggested_state.campering_fire) {
        setStalkerState(this.object, this.state.suggested_state.campering_fire, null, null, dangerObjectPosition, null);
      } else {
        setStalkerState(this.object, EStalkerState.HIDE_FIRE, null, null, dangerObjectPosition, null);
      }
    } else {
      if (this.state.suggested_state.campering) {
        setStalkerState(this.object, this.state.suggested_state.campering, null, null, position, null);
      } else {
        if (this.state.sniper === true) {
          setStalkerState(this.object, EStalkerState.HIDE_NA, null, null, position, null);
        } else {
          setStalkerState(this.object, EStalkerState.HIDE, null, null, position, null);
        }
      }
    }

    return true;
  }

  /**
   * todo: Description.
   */
  public scan(flag: number): void {
    if (this.state.scan_table!.get(flag) === null) {
      return;
    }

    if (this.flag !== flag) {
      this.flag = flag;
      this.state.scan_begin = null;
      this.state.cur_look_point = null;
      this.state.last_look_point = null;
    }

    if (this.state.scan_begin === null || time_global() - this.state.scan_begin > this.state.time_scan_delta) {
      this.nextPoint = this.getNextPoint(flag);
      if (this.state.cur_look_point === null) {
        this.state.cur_look_point = 1;
      }

      if (this.state.last_look_point === null) {
        this.state.last_look_point = this.nextPoint;
      }

      this.lookPosition = this.state.last_look_point.pos;
      this.destPosition = this.nextPoint.pos;
      this.lookPoint = createVector(
        this.lookPosition!.x +
          (this.state.cur_look_point * (this.destPosition.x - this.lookPosition!.x)) / this.state.scandelta,
        this.lookPosition!.y +
          (this.state.cur_look_point * (this.destPosition.y - this.lookPosition!.y)) / this.state.scandelta,
        this.lookPosition!.z +
          (this.state.cur_look_point * (this.destPosition.z - this.lookPosition!.z)) / this.state.scandelta
      );
      if (this.state.suggested_state.campering) {
        setStalkerState(
          this.object,
          this.state.suggested_state.campering,
          null,
          null,
          { lookPosition: this.lookPoint, lookObject: null },
          null
        );
      } else {
        setStalkerState(this.object, EStalkerState.HIDE_NA, null, null, {
          lookPosition: this.lookPoint,
          lookObject: null,
        });
      }

      if (this.state.cur_look_point >= this.state.scandelta) {
        this.state.cur_look_point = null;
        this.state.last_look_point = this.nextPoint;
      } else {
        if (this.state.scan_begin !== null) {
          this.state.cur_look_point =
            this.state.cur_look_point + (time_global() - this.state.scan_begin) / this.state.time_scan_delta;
        } else {
          this.state.cur_look_point = this.state.cur_look_point + 1;
        }
      }

      this.state.scan_begin = time_global();
    }
  }

  /**
   * todo: Description.
   */
  public getNextPoint(flag: number): ICampPoint {
    let isNext: boolean = false;

    if (this.state.last_look_point === null) {
      table.sort(this.state.scan_table!.get(flag), (a, b) => {
        return a.key < b.key;
      });
    }

    for (const [k, v] of this.state.scan_table!.get(flag)) {
      if (this.state.last_look_point === null) {
        return v;
      }

      if (isNext === true) {
        return v;
      }

      if (this.state.last_look_point.key === v.key) {
        isNext = true;
      }
    }

    if (isNext === true) {
      if (this.state.last_look_point!.key === 0) {
        table.sort(this.state.scan_table!.get(flag), (a, b) => {
          return a.key < b.key;
        });
      } else {
        table.sort(this.state.scan_table!.get(flag), (a, b) => {
          return a.key > b.key;
        });
      }
    }

    return this.state.last_look_point!;
  }

  /**
   * todo: Description.
   */
  public processPoint(): boolean {
    return false;
  }

  /**
   * todo: Description.
   */
  public override finalize(): void {
    this.moveManager.finalize();
    super.finalize();
  }

  /**
   * todo: Description.
   */
  public isOnPlace(): boolean {
    if (this.state.no_retreat === true) {
      return false;
    }

    const path = new patrol(this.state.path_walk);

    if (path !== null) {
      for (const k of $range(0, path.count() - 1)) {
        if (isStalkerAtWaypoint(this.object, new patrol(this.state.path_walk), k)) {
          for (const i of $range(0, 31)) {
            if (path.flag(k, i)) {
              this.state.wp_flag = i;

              return true;
            }
          }

          this.state.wp_flag = null;

          return false;
        }
      }

      this.state.wp_flag = null;

      return false;
    }

    return false;
  }
}
