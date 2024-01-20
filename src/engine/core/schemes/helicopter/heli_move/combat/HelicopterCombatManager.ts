import { CHelicopter, level, time_global } from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  IRegistryObjectState,
  openLoadMarker,
  openSaveMarker,
  registry,
  SYSTEM_INI,
} from "@/engine/core/database";
import {
  EHelicopterCombatType,
  EHelicopterFlyByState,
} from "@/engine/core/schemes/helicopter/heli_move/helicopter_types";
import { helicopterConfig } from "@/engine/core/schemes/helicopter/heli_move/HelicopterConfig";
import { calculatePositionInRadius } from "@/engine/core/schemes/helicopter/heli_move/utils";
import { isGameLevelChanging } from "@/engine/core/utils/game";
import { getHelicopterHealth } from "@/engine/core/utils/helicopter";
import { pickSectionFromCondList, readIniNumber, TConditionList } from "@/engine/core/utils/ini";
import { pickRandom } from "@/engine/core/utils/random";
import { createEmptyVector, distanceBetween2d } from "@/engine/core/utils/vector";
import { ZERO_VECTOR } from "@/engine/lib/constants/vectors";
import {
  GameObject,
  IniFile,
  NetPacket,
  Optional,
  Reader,
  TDistance,
  TNumberId,
  TRate,
  TTimestamp,
  Vector,
} from "@/engine/lib/types";

/**
 * todo;
 */
export class HelicopterCombatManager {
  public readonly object: GameObject;
  public readonly helicopter: CHelicopter;
  public readonly state: IRegistryObjectState;

  public isInitialized: boolean = false;
  public isRetreatInitialized: boolean = false;
  public isStateInitialized!: boolean;
  public isFlybyInitialized: boolean = false;
  public isRoundInitialized: boolean = false;
  public isSearchInitialized: boolean = false;
  public wasCallback!: boolean;

  public levelMaxY: TDistance = level.get_bounding_volume().max.y;

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
  public vis: number = 0;
  public visNextTime: number = 0;
  public visTimeQuant: number;

  public maxVelocity!: number;
  public safeAltitude!: number;

  public forgetTimeout: number;
  public flameStartHealth: number;

  public isSectionChanged: boolean = false;
  public attackBeforeRetreat: boolean = false;
  public enemyForgetable: boolean = true;
  public canForgetEnemy!: boolean;
  public changeCombatTypeAllowed!: boolean;
  public flybyStatesForOnePass!: number;
  public roundBeginShootTime: Optional<number> = null;

  public combatUseRocket!: boolean;
  public combatUseMgun!: boolean;
  public combatIgnore!: Optional<TConditionList>;

  public enemyId: Optional<TNumberId> = null;
  public enemy: Optional<GameObject> = null;
  public enemyLastSeenPos: Optional<Vector> = null;
  public enemyLastSeenTime: Optional<TTimestamp> = null;
  public enemyLastSpotTime: Optional<TTimestamp> = null;

  public combatType!: EHelicopterCombatType;
  public changeCombatTypeTime: Optional<number> = null;
  public flightDirection!: boolean;
  public centerPos!: Vector;
  public speedIs0!: boolean;

  public changeDirTime!: number;
  public changePosTime!: number;
  public changeSpeedTime!: number;

  public searchBeginShootTime: Optional<number> = null;

  public flyByState!: EHelicopterFlyByState;

  public constructor(object: GameObject, helicopter: CHelicopter) {
    this.object = object;
    this.helicopter = helicopter;
    this.state = registry.objects.get(object.id());

    const ini: IniFile = SYSTEM_INI;

    this.flybyAttackDist = readIniNumber(ini, "helicopter", "flyby_attack_dist", true);
    this.searchAttackDist = readIniNumber(ini, "helicopter", "search_attack_dist", true);
    this.defaultSafeAltitude = readIniNumber(ini, "helicopter", "safe_altitude", true) + this.levelMaxY;
    this.mMaxMGunDist = readIniNumber(ini, "helicopter", "max_mgun_attack_dist", true);

    this.defaultVelocity = readIniNumber(ini, "helicopter", "velocity", true);
    this.searchVelocity = readIniNumber(ini, "helicopter", "search_velocity", true);
    this.roundVelocity = readIniNumber(ini, "helicopter", "round_velocity", true);

    this.visTimeQuant = readIniNumber(ini, "helicopter", "vis_time_quant", true);
    this.visThreshold = readIniNumber(ini, "helicopter", "vis_threshold", true);
    this.visInc = readIniNumber(ini, "helicopter", "vis_inc", true) * this.visTimeQuant * 0.001;
    this.visDec = readIniNumber(ini, "helicopter", "vis_dec", true) * this.visTimeQuant * 0.001;

    this.forgetTimeout = readIniNumber(ini, "helicopter", "forget_timeout", true) * 1000;
    this.flameStartHealth = readIniNumber(ini, "helicopter", "flame_start_health", true);
  }

  /**
   * todo: Description.
   */
  public initialize(): void {
    this.enemyLastSeenPos = this.enemy!.position();
    this.enemyLastSeenTime = 0;
    this.enemyLastSpotTime = null;
    this.canForgetEnemy = false;
    this.isSectionChanged = true;

    this.combatType = EHelicopterCombatType.FLY_BY;
    this.changeCombatTypeTime = null;
    this.changeCombatTypeAllowed = true;

    this.helicopter.m_max_mgun_dist = this.mMaxMGunDist;

    this.flybyStatesForOnePass = 2;

    this.object.set_fastcall(this.fastcall, this);

    this.isInitialized = true;
  }

  /**
   * todo: Description.
   */
  public save(packet: NetPacket): void {
    openSaveMarker(packet, HelicopterCombatManager.name);

    if (isGameLevelChanging()) {
      packet.w_bool(false);
      closeSaveMarker(packet, HelicopterCombatManager.name);

      return;
    }

    packet.w_bool(this.isInitialized);

    if (this.isInitialized) {
      const now: TTimestamp = time_global();

      packet.w_s16(this.enemyId!);
      packet.w_u32(now - this.enemyLastSeenTime!);
      packet.w_bool(this.canForgetEnemy);
      packet.w_bool(this.enemyForgetable);
      packet.w_vec3(this.enemyLastSeenPos!);

      packet.w_u8(this.combatType);

      if (this.combatType === EHelicopterCombatType.SEARCH) {
        packet.w_u32(this.changeDirTime! - now);
        packet.w_u32(this.changePosTime! - now);
        packet.w_bool(this.flightDirection);
        packet.w_vec3(this.centerPos);
      } else if (this.combatType === EHelicopterCombatType.FLY_BY) {
        packet.w_s16(this.flybyStatesForOnePass);
      }
    }

    closeSaveMarker(packet, HelicopterCombatManager.name);
  }

  /**
   * todo: Description.
   */
  public load(reader: Reader): void {
    openLoadMarker(reader, HelicopterCombatManager.name);

    this.isInitialized = reader.r_bool();

    if (this.isInitialized) {
      const now: TTimestamp = time_global();

      this.enemyLastSeenPos = createEmptyVector();

      this.enemyId = reader.r_s16();
      this.enemyLastSeenTime = now - reader.r_u32();
      this.canForgetEnemy = reader.r_bool();
      this.enemyForgetable = reader.r_bool();
      reader.r_vec3(this.enemyLastSeenPos);
      this.combatType = reader.r_u8();

      if (this.combatType === EHelicopterCombatType.SEARCH) {
        this.centerPos = createEmptyVector();

        this.changeDirTime = reader.r_u32() + now;
        this.changePosTime = reader.r_u32() + now;
        this.flightDirection = reader.r_bool();
        reader.r_vec3(this.centerPos);
      } else if (this.combatType === EHelicopterCombatType.FLY_BY) {
        this.flybyStatesForOnePass = reader.r_s16();
      }
    }

    closeLoadMarker(reader, HelicopterCombatManager.name);
  }

  /**
   * todo: Description.
   */
  public shouldCombatIgnore(): boolean {
    return (
      this.combatIgnore !== null && pickSectionFromCondList(registry.actor, this.object, this.combatIgnore) !== null
    );
  }

  /**
   * todo: Description.
   */
  public setCombatType(newCombatType: number): void {
    if (newCombatType !== this.combatType) {
      this.isFlybyInitialized = false;
      this.isRoundInitialized = false;
      this.isSearchInitialized = false;

      this.combatType = newCombatType;
    }
  }

  /**
   * todo: Description.
   */
  public updateCustomDataSettings(): void {
    if (this.isSectionChanged) {
      this.helicopter.m_use_rocket_on_attack = this.combatUseRocket;
      this.helicopter.m_use_mgun_on_attack = this.combatUseMgun;

      if (this.combatType === EHelicopterCombatType.FLY_BY) {
        this.helicopter.SetMaxVelocity(this.maxVelocity);
      }

      this.isSectionChanged = false;
    }
  }

  /**
   * todo: Description.
   */
  public updateEnemyVisibility(): boolean {
    if (this.vis >= this.visThreshold) {
      this.enemyLastSeenTime = time_global();
      this.enemyLastSeenPos = this.enemy!.position();

      return true;
    } else {
      return false;
    }
  }

  /**
   * todo: Description.
   */
  public forgetEnemy(): void {
    this.isInitialized = false;
    this.enemyId = null;
    this.enemy = null;
  }

  /**
   * todo: Description.
   */
  public updateForgetting(): void {
    if (
      (this.enemyForgetable && this.canForgetEnemy && time_global() - this.enemyLastSeenTime! > this.forgetTimeout) ||
      !this.enemy!.alive()
    ) {
      this.forgetEnemy();
    }
  }

  /**
   * todo: Description.
   */
  public updateCombatType(seeEnemy?: boolean): void {
    let ct = this.combatType;

    if (this.combatType === EHelicopterCombatType.FLY_BY) {
      if (this.flybyStatesForOnePass <= 0) {
        ct = this.attackBeforeRetreat ? EHelicopterCombatType.RETREAT : EHelicopterCombatType.ROUND;
      }
    } else if (this.combatType === EHelicopterCombatType.ROUND) {
      if (seeEnemy) {
        if (distanceBetween2d(this.object.position(), this.enemy!.position()) > this.flybyAttackDist + 70) {
          ct = EHelicopterCombatType.FLY_BY;
        }
      } else {
        ct = EHelicopterCombatType.SEARCH;
      }

      if (getHelicopterHealth(this.helicopter, this.state.invulnerable) < this.flameStartHealth) {
        this.attackBeforeRetreat = true;

        this.helicopter.m_use_rocket_on_attack = true;

        ct = EHelicopterCombatType.FLY_BY;
      }
    } else if (this.combatType === EHelicopterCombatType.SEARCH) {
      if (seeEnemy) {
        ct =
          distanceBetween2d(this.object.position(), this.enemy!.position()) > this.flybyAttackDist
            ? EHelicopterCombatType.FLY_BY
            : EHelicopterCombatType.ROUND;
      }

      if (getHelicopterHealth(this.helicopter, this.state.invulnerable) < this.flameStartHealth) {
        this.attackBeforeRetreat = true;

        this.helicopter.m_use_rocket_on_attack = true;

        ct = EHelicopterCombatType.FLY_BY;
      }
    }

    this.setCombatType(ct);
  }

  /**
   * todo: Description.
   */
  public fastcall(): boolean {
    if (this.isInitialized) {
      const now: TTimestamp = time_global();

      if (this.visNextTime < now) {
        this.visNextTime = now + this.visTimeQuant;

        if (this.helicopter.isVisible(this.enemy!)) {
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

  /**
   * todo: Description.
   */
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

    if (this.shouldCombatIgnore()) {
      return false;
    }

    this.updateCustomDataSettings();

    if (!this.isInitialized) {
      this.initialize();
    }

    const seeEnemy: boolean = this.updateEnemyVisibility();

    this.updateCombatType(seeEnemy);

    switch (this.combatType) {
      case EHelicopterCombatType.SEARCH:
        this.updateSearch(seeEnemy);
        break;

      case EHelicopterCombatType.ROUND:
        this.updateRound(seeEnemy);
        break;

      case EHelicopterCombatType.FLY_BY:
        this.updateFlyby();
        break;

      case EHelicopterCombatType.RETREAT:
        this.updateRetreat();
        break;
    }

    this.updateForgetting();

    return true;
  }

  /**
   * todo: Description.
   */
  public roundInitialize(): void {
    this.changeDirTime = 0;
    this.changePosTime = 0;
    this.centerPos = this.enemyLastSeenPos!;
    this.flightDirection = pickRandom(true, false);
    this.changeCombatTypeAllowed = true;
    this.roundBeginShootTime = 0;

    this.helicopter.SetMaxVelocity(this.roundVelocity);
    this.helicopter.SetSpeedInDestPoint(this.roundVelocity);
    this.helicopter.UseFireTrail(false);

    this.isRoundInitialized = true;

    this.roundSetupFlight(this.flightDirection!);
  }

  /**
   * todo: Description.
   */
  public roundSetupFlight(direction: boolean): void {
    this.centerPos = this.enemyLastSeenPos!;
    this.centerPos.y = this.safeAltitude;

    this.helicopter.GoPatrolByRoundPath(this.centerPos, this.searchAttackDist, direction);
    this.helicopter.LookAtPoint(this.enemy!.position(), true);
  }

  /**
   * todo: Description.
   */
  public updateRound(seeEnemy: boolean): void {
    if (!this.isRoundInitialized) {
      this.roundInitialize();
    }

    this.roundUpdateShooting(seeEnemy);
    this.roundUpdateFlight();
  }

  /**
   * todo: Description.
   */
  public roundUpdateShooting(seeEnemy: boolean): void {
    if (seeEnemy) {
      const now: TTimestamp = time_global();

      if (this.roundBeginShootTime) {
        if (this.roundBeginShootTime < now) {
          this.helicopter.SetEnemy(this.enemy);
        }
      } else {
        this.roundBeginShootTime = now + helicopterConfig.ROUND_SHOOT_DELAY;
      }
    } else {
      this.helicopter.ClearEnemy();
      this.roundBeginShootTime = null;
    }
  }

  /**
   * todo: Description.
   */
  public roundUpdateFlight(): void {
    const now: TTimestamp = time_global();

    if (this.changePosTime < now) {
      this.changePosTime = now + 2_000;

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

  /**
   * todo: Description.
   */
  public searchInitialize(): void {
    this.changeSpeedTime = time_global() + math.random(5_000, 7_000);
    this.speedIs0 = true;

    this.changePosTime = 0;
    this.centerPos = this.enemyLastSeenPos!;

    this.flightDirection = pickRandom(true, false);
    this.changeCombatTypeAllowed = true;
    this.searchBeginShootTime = 0;

    this.helicopter.UseFireTrail(false);

    this.isSearchInitialized = true;

    this.searchSetupFlight();
  }

  /**
   * todo: Description.
   */
  public searchSetupFlight(): void {
    this.centerPos = this.enemyLastSeenPos!;
    this.centerPos.y = this.safeAltitude;

    const velocity: TRate = this.speedIs0 ? 0 : this.searchVelocity;

    this.helicopter.SetMaxVelocity(velocity);
    this.helicopter.SetSpeedInDestPoint(velocity);

    this.helicopter.GoPatrolByRoundPath(this.centerPos, this.searchAttackDist, this.flightDirection);
    this.helicopter.LookAtPoint(this.enemy!.position(), true);
  }

  /**
   * todo: Description.
   */
  public searchUpdateShooting(seeEnemy: boolean): void {
    if (seeEnemy) {
      const now: TTimestamp = time_global();

      if (this.searchBeginShootTime) {
        if (this.searchBeginShootTime < now) {
          this.helicopter.SetEnemy(this.enemy);
        }
      } else {
        this.searchBeginShootTime = now + helicopterConfig.SEARCH_SHOOT_DELAY;
      }
    } else {
      this.helicopter.ClearEnemy();

      this.searchBeginShootTime = null;
    }
  }

  /**
   * todo: Description.
   */
  public searchUpdateFlight(seeEnemy: boolean): void {
    const now: TTimestamp = time_global();

    if (this.changeSpeedTime < now) {
      this.changeSpeedTime = now + math.random(8_000, 12_000);

      this.speedIs0 = !this.speedIs0;

      this.searchSetupFlight();

      return;
    }

    if (this.changePosTime < now) {
      this.changePosTime = now + 2_000;

      if (
        !this.canForgetEnemy &&
        distanceBetween2d(this.object.position(), this.enemyLastSeenPos!) <= this.searchAttackDist
      ) {
        this.canForgetEnemy = true;
      }

      if (distanceBetween2d(this.centerPos, this.enemyLastSeenPos!) > 10) {
        this.searchSetupFlight();
      }
    }
  }

  /**
   * todo: Description.
   */
  public updateSearch(seeEnemy: boolean): void {
    if (!this.isSearchInitialized) {
      this.searchInitialize();
    }

    this.searchUpdateShooting(seeEnemy);
    this.searchUpdateFlight(seeEnemy);
  }

  /**
   * todo: Description.
   */
  public flybyInitialize(): void {
    this.flybySetInitialState();

    this.isStateInitialized = false;
    this.wasCallback = false;
    this.flybyStatesForOnePass = 2;
    this.isFlybyInitialized = true;

    this.helicopter.SetMaxVelocity(this.maxVelocity);
    this.helicopter.SetSpeedInDestPoint(this.maxVelocity);
    this.helicopter.LookAtPoint(ZERO_VECTOR, false);
  }

  /**
   * todo: Description.
   */
  public flybySetInitialState(): void {
    this.flyByState =
      distanceBetween2d(this.object.position(), this.enemyLastSeenPos!) < this.flybyAttackDist
        ? EHelicopterFlyByState.TO_ATTACK_DIST
        : EHelicopterFlyByState.TO_ENEMY;
  }

  /**
   * todo: Description.
   */
  public flybyUpdateFlight(): void {
    if (this.wasCallback) {
      if (this.flyByState === EHelicopterFlyByState.TO_ATTACK_DIST) {
        this.flyByState = EHelicopterFlyByState.TO_ENEMY;
      } else if (this.flyByState === EHelicopterFlyByState.TO_ENEMY) {
        this.flyByState = EHelicopterFlyByState.TO_ATTACK_DIST;
      }

      this.wasCallback = false;
      this.isStateInitialized = false;
    }

    if (this.flyByState === EHelicopterFlyByState.TO_ATTACK_DIST) {
      if (!this.isStateInitialized) {
        const position: Vector = this.calculatePositionInRadius(this.flybyAttackDist);

        this.helicopter.SetDestPosition(position);
        this.helicopter.ClearEnemy();

        this.changeCombatTypeAllowed = false;
        this.isStateInitialized = true;
      }
    } else if (this.flyByState === EHelicopterFlyByState.TO_ENEMY) {
      if (!this.isStateInitialized) {
        this.helicopter.SetEnemy(this.enemy);
        this.helicopter.UseFireTrail(true);

        this.flybyStatesForOnePass = this.flybyStatesForOnePass - 1;

        this.isStateInitialized = true;
      }

      const position: Vector = this.enemyLastSeenPos!;

      position.set(position.x, this.safeAltitude, position.z);

      this.changeCombatTypeAllowed = distanceBetween2d(this.object.position(), position) > this.searchAttackDist;

      this.helicopter.SetDestPosition(position);
    }
  }

  /**
   * todo: Description.
   */
  public updateFlyby(): void {
    if (!this.isFlybyInitialized) {
      this.flybyInitialize();
    }

    this.flybyUpdateFlight();
  }

  /**
   * todo: Description.
   */
  public retreatInitialize(): void {
    this.isRetreatInitialized = true;

    this.helicopter.SetMaxVelocity(this.maxVelocity);
    this.helicopter.SetSpeedInDestPoint(this.maxVelocity);
    this.helicopter.LookAtPoint(ZERO_VECTOR, false);
    this.helicopter.SetDestPosition(this.calculatePositionInRadius(5000));
    this.helicopter.ClearEnemy();
  }

  /**
   * todo: Description.
   */
  public updateRetreat(): void {
    if (!this.isRetreatInitialized) {
      this.retreatInitialize();
    }
  }

  /**
   * todo: Description.
   */
  public calculatePositionInRadius(radius: TDistance): Vector {
    const position: Vector = this.object.position();
    const velocity: Vector = this.helicopter.GetCurrVelocityVec();
    const destination: Vector = this.enemyLastSeenPos as Vector;

    destination.y = 0;
    position.y = 0;
    velocity.y = 0;
    velocity.normalize();

    const target: Vector = calculatePositionInRadius(position, velocity, destination, radius);

    target.y = this.safeAltitude;

    return target;
  }

  /**
   * todo: Description.
   */
  public onWaypoint(): boolean {
    if (this.enemyId && !this.shouldCombatIgnore()) {
      this.wasCallback = true;

      return true;
    } else {
      return false;
    }
  }
}
