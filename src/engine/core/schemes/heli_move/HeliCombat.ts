import { CHelicopter, level, time_global } from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  getIdBySid,
  IRegistryObjectState,
  openLoadMarker,
  openSaveMarker,
  registry,
  SYSTEM_INI,
} from "@/engine/core/database";
import { getHeliHealth } from "@/engine/core/schemes/heli_move/heli_utils";
import { isGameLevelChanging } from "@/engine/core/utils/game";
import {
  parseConditionsList,
  pickSectionFromCondList,
  readIniBoolean,
  readIniNumber,
  readIniString,
  TConditionList,
} from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { pickRandom } from "@/engine/core/utils/random";
import { copyVector, createEmptyVector, createVector, distanceBetween2d } from "@/engine/core/utils/vector";
import { ACTOR, NIL } from "@/engine/lib/constants/words";
import { ClientObject, IniFile, NetPacket, Optional, Reader, TNumberId, TRate, Vector } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

const COMBAT_TYPE_FLYBY = 0;
const COMBAT_TYPE_ROUND = 1;
const COMBAT_TYPE_SEARCH = 2;
const COMBAT_TYPE_RETREAT = 3;

const FLYBY_STATE_TO_ATTACK_DIST = 0;
const FLYBY_STATE_TO_ENEMY = 1;

const COMBAT_TYPE_CHANGE_DELAY = 5000;
const VISIBILITY_DELAY = 3000;
const SEARCH_SHOOT_DELAY = 2000;
const ROUND_SHOOT_DELAY = 2000;
const DUMMY_VECTOR: Vector = createEmptyVector();

export class HeliCombat {
  public readonly object: ClientObject;
  public readonly heliObject: CHelicopter;
  public readonly st: IRegistryObjectState;

  public initialized: boolean;
  public retreatInitialized: boolean = false;

  public flybyInitialized: boolean = false;
  public roundInitialized: boolean = false;
  public searchInitialized: boolean = false;
  public wasCallback!: boolean;
  public stateInitialized!: boolean;

  public levelMaxY: number;

  public flybyAttackDist: number;
  public searchAttackDist: number;
  public defaultVelocity: number;
  public searchVelocity: number;
  public roundVelocity: number;
  public mMaxMGunDist: number;
  public defaultSafeAltitude: number;
  public visThreshold: number;
  public visInc: number;
  public visDec: number;
  public vis: number;
  public visNextTime: number;
  public visTimeQuant: number;

  public maxVelocity!: number;
  public safeAltitude!: number;

  public forgetTimeout: number;
  public flameStartHealth: number;

  public attackBeforeRetreat: boolean;
  public enemyForgetable: boolean;
  public sectionChanged: boolean;
  public canForgetEnemy!: boolean;
  public changeCombatTypeAllowed!: boolean;
  public flybyStatesForOnePass!: number;
  public roundBeginShootTime: Optional<number> = null;

  public combatUseRocket!: boolean;
  public combatUseMgun!: boolean;
  public combatIgnore!: Optional<TConditionList>;

  public combatType!: number;
  public enemyId: Optional<TNumberId> = null;
  public enemy: Optional<ClientObject> = null;
  public enemyLastSeenPos: Optional<Vector> = null;
  public enemyLastSeenTime: Optional<number> = null;
  public enemyLastSpotTime: Optional<number> = null;
  public changeCombatTypeTime: Optional<number> = null;
  public flightDirection!: boolean;
  public centerPos!: Vector;
  public speedIs0!: boolean;

  public changeDirTime!: number;
  public changePosTime!: number;
  public changeSpeedTime!: number;

  public searchBeginShootTime: Optional<number> = null;

  public state!: number;

  public constructor(object: ClientObject, heliObject: CHelicopter) {
    this.st = registry.objects.get(object.id());
    this.object = object;
    this.heliObject = heliObject;
    this.initialized = false;

    this.levelMaxY = level.get_bounding_volume().max.y;

    const ltx: IniFile = SYSTEM_INI;

    this.flybyAttackDist = readIniNumber(ltx, "helicopter", "flyby_attack_dist", true);
    this.searchAttackDist = readIniNumber(ltx, "helicopter", "search_attack_dist", true);
    this.defaultSafeAltitude = readIniNumber(ltx, "helicopter", "safe_altitude", true) + this.levelMaxY;
    this.mMaxMGunDist = readIniNumber(ltx, "helicopter", "max_mgun_attack_dist", true);

    this.defaultVelocity = readIniNumber(ltx, "helicopter", "velocity", true);
    this.searchVelocity = readIniNumber(ltx, "helicopter", "search_velocity", true);
    this.roundVelocity = readIniNumber(ltx, "helicopter", "round_velocity", true);

    this.visTimeQuant = readIniNumber(ltx, "helicopter", "vis_time_quant", true);
    this.visThreshold = readIniNumber(ltx, "helicopter", "vis_threshold", true);
    this.visInc = readIniNumber(ltx, "helicopter", "vis_inc", true) * this.visTimeQuant * 0.001;
    this.visDec = readIniNumber(ltx, "helicopter", "vis_dec", true) * this.visTimeQuant * 0.001;
    this.vis = 0;
    this.visNextTime = 0;

    this.forgetTimeout = readIniNumber(ltx, "helicopter", "forget_timeout", true) * 1000;

    this.flameStartHealth = readIniNumber(ltx, "helicopter", "flame_start_health", true);

    this.attackBeforeRetreat = false;
    this.enemyForgetable = true;
    this.sectionChanged = false;
  }

  public readCustomData(ini: IniFile, section: string): void {
    this.combatUseRocket = readIniBoolean(ini, section, "combat_use_rocket", false, true);
    this.combatUseMgun = readIniBoolean(ini, section, "combat_use_mgun", false, true);

    const combatIgnore: Optional<string> = readIniString(ini, section, "combat_ignore", false, "", null);

    if (combatIgnore !== null) {
      this.combatIgnore = parseConditionsList(combatIgnore);
    } else {
      this.combatIgnore = null;
    }

    const combaEnemy: Optional<string> = readIniString(ini, section, "combat_enemy", false, "", null);

    this.setEnemyFromCustomData(combaEnemy);
    this.maxVelocity = readIniNumber(ini, section, "combat_velocity", false, this.defaultVelocity);
    this.safeAltitude =
      readIniNumber(ini, section, "combat_safe_altitude", false, this.defaultSafeAltitude) + this.levelMaxY;

    this.sectionChanged = true;
  }

  public setEnemyFromCustomData(combatEnemy: Optional<string>): void {
    if (combatEnemy === null) {
      this.enemyForgetable = true;
    } else {
      if (combatEnemy === ACTOR) {
        if (registry.actor !== null) {
          this.enemyId = registry.actor.id();
        } else {
          this.forgetEnemy();
        }
      } else if (combatEnemy === NIL) {
        this.forgetEnemy();
      } else {
        this.enemyId = getIdBySid(tonumber(combatEnemy)!);
      }

      if (this.enemyId) {
        this.enemyForgetable = false;
        this.initialized = false;
      } else {
        this.enemyForgetable = true;
        this.forgetEnemy();
      }
    }
  }

  public setCombatType(newCombatType: number): void {
    if (newCombatType !== this.combatType) {
      this.flybyInitialized = false;
      this.roundInitialized = false;
      this.searchInitialized = false;

      this.combatType = newCombatType;
    }
  }

  public initialize(): void {
    this.enemyLastSeenPos = this.enemy!.position();
    this.enemyLastSeenTime = 0;
    this.enemyLastSpotTime = null;
    this.canForgetEnemy = false;
    this.sectionChanged = true;

    this.combatType = COMBAT_TYPE_FLYBY;
    this.changeCombatTypeTime = null;
    this.changeCombatTypeAllowed = true;

    this.heliObject.m_max_mgun_dist = this.mMaxMGunDist;

    this.flybyStatesForOnePass = 2;

    this.object.set_fastcall(this.fastcall, this);

    this.initialized = true;
  }

  public save(packet: NetPacket): void {
    openSaveMarker(packet, HeliCombat.name);

    if (isGameLevelChanging()) {
      packet.w_bool(false);
      closeSaveMarker(packet, HeliCombat.name);

      return;
    }

    packet.w_bool(this.initialized);

    if (this.initialized) {
      const t = time_global();

      packet.w_s16(this.enemyId!);
      packet.w_u32(t - this.enemyLastSeenTime!);
      packet.w_bool(this.canForgetEnemy);
      packet.w_bool(this.enemyForgetable);
      packet.w_vec3(this.enemyLastSeenPos!);

      packet.w_u8(this.combatType);

      if (this.combatType === COMBAT_TYPE_SEARCH) {
        packet.w_u32(this.changeDirTime! - t);
        packet.w_u32(this.changePosTime! - t);
        packet.w_bool(this.flightDirection);
        packet.w_vec3(this.centerPos);
      } else if (this.combatType === COMBAT_TYPE_FLYBY) {
        packet.w_s16(this.flybyStatesForOnePass);
      }
    }

    closeSaveMarker(packet, HeliCombat.name);
  }

  public load(reader: Reader): void {
    openLoadMarker(reader, HeliCombat.name);

    this.initialized = reader.r_bool();

    if (this.initialized) {
      const t = time_global();

      this.enemyLastSeenPos = createEmptyVector();

      this.enemyId = reader.r_s16();
      this.enemyLastSeenTime = t - reader.r_u32();
      this.canForgetEnemy = reader.r_bool();
      this.enemyForgetable = reader.r_bool();
      reader.r_vec3(this.enemyLastSeenPos);
      this.combatType = reader.r_u8();

      if (this.combatType === COMBAT_TYPE_SEARCH) {
        this.centerPos = createEmptyVector();

        this.changeDirTime = reader.r_u32() + t;
        this.changePosTime = reader.r_u32() + t;
        this.flightDirection = reader.r_bool();
        reader.r_vec3(this.centerPos);
      } else if (this.combatType === COMBAT_TYPE_FLYBY) {
        this.flybyStatesForOnePass = reader.r_s16();
      }
    }

    closeLoadMarker(reader, HeliCombat.name);
  }

  public onWaypoint(): boolean {
    if (this.enemyId && !this.combatIgnoreCheck()) {
      this.wasCallback = true;

      return true;
    } else {
      return false;
    }
  }

  public updateCustomDataSettings(): void {
    if (this.sectionChanged) {
      this.heliObject.m_use_rocket_on_attack = this.combatUseRocket;
      this.heliObject.m_use_mgun_on_attack = this.combatUseMgun;

      if (this.combatType === COMBAT_TYPE_FLYBY) {
        this.heliObject.SetMaxVelocity(this.maxVelocity);
      }

      this.sectionChanged = false;
    }
  }

  public updateEnemyVisibility(): boolean {
    if (this.vis >= this.visThreshold) {
      this.enemyLastSeenTime = time_global();
      this.enemyLastSeenPos = this.enemy!.position();

      return true;
    } else {
      return false;
    }
  }

  public forgetEnemy(): void {
    this.enemyId = null;
    this.enemy = null;

    this.initialized = false;
  }

  public updateForgetting(): void {
    if (
      (this.enemyForgetable && this.canForgetEnemy && time_global() - this.enemyLastSeenTime! > this.forgetTimeout) ||
      !this.enemy!.alive()
    ) {
      this.forgetEnemy();
    }
  }

  public updateCombatType(seeEnemy?: boolean): void {
    let ct = this.combatType;

    if (this.combatType === COMBAT_TYPE_FLYBY) {
      if (this.flybyStatesForOnePass <= 0) {
        if (this.attackBeforeRetreat) {
          ct = COMBAT_TYPE_RETREAT;
        } else {
          ct = COMBAT_TYPE_ROUND;
        }
      }
    } else if (this.combatType === COMBAT_TYPE_ROUND) {
      if (seeEnemy) {
        if (distanceBetween2d(this.object.position(), this.enemy!.position()) > this.flybyAttackDist + 70) {
          // --               not this.flyby_pass_finished
          ct = COMBAT_TYPE_FLYBY;
        }
      } else {
        ct = COMBAT_TYPE_SEARCH;
      }

      if (getHeliHealth(this.heliObject, this.st) < this.flameStartHealth) {
        this.attackBeforeRetreat = true;

        this.heliObject.m_use_rocket_on_attack = true;

        ct = COMBAT_TYPE_FLYBY;
      }
    } else if (this.combatType === COMBAT_TYPE_SEARCH) {
      if (seeEnemy) {
        if (distanceBetween2d(this.object.position(), this.enemy!.position()) > this.flybyAttackDist) {
          ct = COMBAT_TYPE_FLYBY;
        } else {
          ct = COMBAT_TYPE_ROUND;
        }
      }

      if (getHeliHealth(this.heliObject, this.st) < this.flameStartHealth) {
        this.attackBeforeRetreat = true;

        this.heliObject.m_use_rocket_on_attack = true;

        ct = COMBAT_TYPE_FLYBY;
      }
    }

    this.setCombatType(ct);
  }

  public combatIgnoreCheck(): boolean {
    return (
      this.combatIgnore !== null && pickSectionFromCondList(registry.actor, this.object, this.combatIgnore) !== null
    );
  }

  public fastcall(): boolean {
    if (this.initialized) {
      if (this.visNextTime < time_global()) {
        this.visNextTime = time_global() + this.visTimeQuant;

        if (this.heliObject.isVisible(this.enemy!)) {
          this.vis = this.vis + this.visInc;

          if (this.vis > 100) {
            this.vis = 100;
          }
        } else {
          this.vis = this.vis - this.visDec;

          if (this.vis < 0) {
            this.vis = 0;
          }
        }
      }

      return false;
    } else {
      return true;
    }
  }

  public update(): boolean {
    if (this.enemyId) {
      this.enemy = level.object_by_id(this.enemyId);
      if (!this.enemy) {
        this.forgetEnemy();

        return false;
      }
    } else {
      return false;
    }

    if (this.combatIgnoreCheck()) {
      return false;
    }

    this.updateCustomDataSettings();

    if (!this.initialized) {
      this.initialize();
    }

    const seeEnemy: boolean = this.updateEnemyVisibility();

    this.updateCombatType(seeEnemy);
    // -- FIXME
    // --    this.heliObject.GetSpeedInDestPoint(0)

    if (this.combatType === COMBAT_TYPE_SEARCH) {
      this.searchUpdate(seeEnemy);
    } else if (this.combatType === COMBAT_TYPE_ROUND) {
      this.roundUpdate(seeEnemy);
    } else if (this.combatType === COMBAT_TYPE_FLYBY) {
      this.flybyUpdate(seeEnemy);
    } else if (this.combatType === COMBAT_TYPE_RETREAT) {
      this.retreatUpdate();
    }

    this.updateForgetting();

    return true;
  }

  public calcPositionInRadius(r: number): Vector {
    const p: Vector = this.object.position();

    p.y = 0;

    const v: Vector = this.heliObject.GetCurrVelocityVec();

    v.y = 0;
    v.normalize();

    const o: Vector = this.enemyLastSeenPos!;

    o.y = 0;

    const ret: Vector = crossRayCircle(p, v, o, r);

    ret.y = this.safeAltitude;

    return ret;
  }

  public roundInitialize(): void {
    this.changeDirTime = 0;
    this.changePosTime = 0;
    this.centerPos = this.enemyLastSeenPos!;
    this.flightDirection = pickRandom(true, false);
    this.changeCombatTypeAllowed = true;
    this.roundBeginShootTime = 0;

    this.heliObject.SetMaxVelocity(this.roundVelocity);
    this.heliObject.SetSpeedInDestPoint(this.roundVelocity);
    this.heliObject.UseFireTrail(false);

    this.roundInitialized = true;

    this.roundSetupFlight(this.flightDirection!);
  }

  public roundSetupFlight(direction: boolean): void {
    this.centerPos = this.enemyLastSeenPos!;
    this.centerPos.y = this.safeAltitude;

    this.heliObject.GoPatrolByRoundPath(this.centerPos, this.searchAttackDist, direction);
    this.heliObject.LookAtPoint(this.enemy!.position(), true);
  }

  public roundUpdateShooting(seeEnemy: boolean): void {
    if (seeEnemy) {
      if (this.roundBeginShootTime) {
        if (this.roundBeginShootTime < time_global()) {
          this.heliObject.SetEnemy(this.enemy);
        }
      } else {
        this.roundBeginShootTime = time_global() + ROUND_SHOOT_DELAY;
      }
    } else {
      this.heliObject.ClearEnemy();

      this.roundBeginShootTime = null;
    }
  }

  public roundUpdateFlight(seeEnemy: boolean): void {
    // -- ������ ����� �� ������� ����������� �����
    /* --[[    if this.change_dir_time < time_global() {
        const t

        if see_enemy {
          t = math.random( 6000, 10000 )
        else
          t = math.random( 15000, 20000 )
        }

        this.change_dir_time = time_global() + t // --+ 1000000

        printf( "heli_combat: going by round path, t=%d", t )

        this.flight_direction = not this.flight_direction
        this:round_setup_flight( this.flight_direction )

        return
      }
    ]]*/
    // -- ������������ ��������, �� ������������ �� ���� � ���������� �� � �������� ��������
    if (this.changePosTime < time_global()) {
      this.changePosTime = time_global() + 2000;

      if (
        !this.canForgetEnemy &&
        distanceBetween2d(this.object.position(), this.enemyLastSeenPos!) <= this.searchAttackDist
      ) {
        this.canForgetEnemy = true;
      }

      if (distanceBetween2d(this.centerPos, this.enemyLastSeenPos!) > 10) {
        this.roundSetupFlight(this.flightDirection);
      }
    }
  }

  public roundUpdate(seeEnemy: boolean): void {
    if (!this.roundInitialized) {
      this.roundInitialize();
    }

    // --    printf( "heli_combat: round_update" )

    this.roundUpdateShooting(seeEnemy);
    this.roundUpdateFlight(seeEnemy);
  }

  public searchInitialize(): void {
    this.changeSpeedTime = time_global() + math.random(5000, 7000);
    this.speedIs0 = true;

    this.changePosTime = 0;
    this.centerPos = this.enemyLastSeenPos!;

    this.flightDirection = pickRandom(true, false);
    this.changeCombatTypeAllowed = true;
    this.searchBeginShootTime = 0;

    this.heliObject.UseFireTrail(false);

    this.searchInitialized = true;

    this.searchSetupFlight();
  }

  public searchSetupFlight(direction?: boolean): void {
    this.centerPos = this.enemyLastSeenPos!;
    this.centerPos.y = this.safeAltitude;

    let v: number;

    if (this.speedIs0) {
      v = 0;
    } else {
      v = this.searchVelocity;
    }

    this.heliObject.SetMaxVelocity(v);
    this.heliObject.SetSpeedInDestPoint(v);

    this.heliObject.GoPatrolByRoundPath(this.centerPos, this.searchAttackDist, this.flightDirection);
    this.heliObject.LookAtPoint(this.enemy!.position(), true);
  }

  public searchUpdateShooting(seeEnemy: boolean): void {
    if (seeEnemy) {
      if (this.searchBeginShootTime) {
        if (this.searchBeginShootTime < time_global()) {
          this.heliObject.SetEnemy(this.enemy);
        }
      } else {
        this.searchBeginShootTime = time_global() + SEARCH_SHOOT_DELAY;
      }
    } else {
      this.heliObject.ClearEnemy();

      this.searchBeginShootTime = null;
    }
  }

  public searchUpdateFlight(seeEnemy: boolean): void {
    if (this.changeSpeedTime < time_global()) {
      const t = math.random(8000, 12000);

      this.changeSpeedTime = time_global() + t;

      this.speedIs0 = !this.speedIs0;

      // --        this.flight_direction = not this.flight_direction
      this.searchSetupFlight(this.flightDirection);

      return;
    }

    if (this.changePosTime < time_global()) {
      this.changePosTime = time_global() + 2000;

      if (
        !this.canForgetEnemy &&
        distanceBetween2d(this.object.position(), this.enemyLastSeenPos!) <= this.searchAttackDist
      ) {
        this.canForgetEnemy = true;
      }

      if (distanceBetween2d(this.centerPos, this.enemyLastSeenPos!) > 10) {
        this.searchSetupFlight(this.flightDirection);
      }
    }
  }

  public searchUpdate(seeEnemy: boolean): void {
    if (!this.searchInitialized) {
      this.searchInitialize();
    }

    // --    printf( "heli_combat: search_update" )

    this.searchUpdateShooting(seeEnemy);
    this.searchUpdateFlight(seeEnemy);
  }

  public flybyInitialize(): void {
    this.flybySetInitialState();

    this.stateInitialized = false;
    this.wasCallback = false;
    this.flybyStatesForOnePass = 2;
    this.flybyInitialized = true;

    this.heliObject.SetMaxVelocity(this.maxVelocity);
    this.heliObject.SetSpeedInDestPoint(this.maxVelocity);
    this.heliObject.LookAtPoint(DUMMY_VECTOR, false);
  }

  public flybySetInitialState(): void {
    // --    if this.object:position():distance_to( this.enemy_last_seen_pos ) < this.flyby_attack_dist {
    if (distanceBetween2d(this.object.position(), this.enemyLastSeenPos!) < this.flybyAttackDist) {
      // --        this.heliObject.LookAtPoint( dummy_vector, false )

      this.state = FLYBY_STATE_TO_ATTACK_DIST;
    } else {
      // --        this.heliObject.LookAtPoint( this.enemy:position(), true )

      this.state = FLYBY_STATE_TO_ENEMY;
    }
  }

  public flybyUpdateFlight(seeEnemy: boolean): void {
    if (this.wasCallback) {
      if (this.state === FLYBY_STATE_TO_ATTACK_DIST) {
        this.state = FLYBY_STATE_TO_ENEMY;
      } else if (this.state === FLYBY_STATE_TO_ENEMY) {
        this.state = FLYBY_STATE_TO_ATTACK_DIST;
      }

      this.wasCallback = false;
      this.stateInitialized = false;
    }

    if (this.state === FLYBY_STATE_TO_ATTACK_DIST) {
      if (!this.stateInitialized) {
        const p = this.calcPositionInRadius(this.flybyAttackDist);

        // --            printf( "heli_combat:flyby_update_flight 1 SetDestPosition %f %f %f", p.x, p.y, p.z )
        this.heliObject.SetDestPosition(p);

        this.heliObject.ClearEnemy();

        this.changeCombatTypeAllowed = false;

        this.stateInitialized = true;
      }
    } else if (this.state === FLYBY_STATE_TO_ENEMY) {
      if (!this.stateInitialized) {
        this.heliObject.SetEnemy(this.enemy);
        this.heliObject.UseFireTrail(true);

        this.flybyStatesForOnePass = this.flybyStatesForOnePass - 1;

        this.stateInitialized = true;
      }

      const p = this.enemyLastSeenPos!;

      p.set(p.x, this.safeAltitude, p.z);

      this.changeCombatTypeAllowed = distanceBetween2d(this.object.position(), p) > this.searchAttackDist;

      // --        printf( "heli_combat:flyby_update_flight 2 SetDestPosition %f %f %f", p.x, p.y, p.z )
      this.heliObject.SetDestPosition(p);
    }
  }

  public flybyUpdate(seeEnemy: boolean): void {
    if (!this.flybyInitialized) {
      this.flybyInitialize();
    }

    // --    printf( "heli_combat: flyby_update" )
    this.flybyUpdateFlight(seeEnemy);
    // --    printf( "speed in dest point %d", this.heliObject.GetSpeedInDestPoint(0) )
  }

  public retreatInitialize(): void {
    this.retreatInitialized = true;

    this.heliObject.SetMaxVelocity(this.maxVelocity);
    this.heliObject.SetSpeedInDestPoint(this.maxVelocity);
    this.heliObject.LookAtPoint(DUMMY_VECTOR, false);
    this.heliObject.SetDestPosition(this.calcPositionInRadius(5000));
    this.heliObject.ClearEnemy();
  }

  public retreatUpdate(): void {
    if (!this.retreatInitialized) {
      this.retreatInitialize();
    }

    // --    printf( "heli_combat: retreat_update" )
  }
}

/**
 * todo;
 */
export function crossRayCircle(p: Vector, v: Vector, o: Vector, r: number): Vector {
  const po: Vector = copyVector(o).sub(p);
  const vperp: Vector = createVector(-v.z, 0, v.x);
  const l: TRate = math.sqrt(r ** 2 - copyVector(po).dotproduct(vperp) ** 2);

  return copyVector(p).add(copyVector(v).mul(copyVector(po).dotproduct(v) + l));
}
