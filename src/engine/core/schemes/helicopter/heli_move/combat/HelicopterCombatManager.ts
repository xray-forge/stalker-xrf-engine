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
import { updateHelicopterCombatFlyby } from "@/engine/core/schemes/helicopter/heli_move/combat/helicopter_combat_fly_by";
import { updateHelicopterCombatRetreat } from "@/engine/core/schemes/helicopter/heli_move/combat/helicopter_combat_reatreat";
import { updateHelicopterCombatRound } from "@/engine/core/schemes/helicopter/heli_move/combat/helicopter_combat_round";
import { updateHelicopterCombatSearch } from "@/engine/core/schemes/helicopter/heli_move/combat/helicopter_combat_search";
import {
  EHelicopterCombatType,
  EHelicopterFlyByState,
} from "@/engine/core/schemes/helicopter/heli_move/helicopter_types";
import { calculatePositionInRadius } from "@/engine/core/schemes/helicopter/heli_move/utils";
import { isGameLevelChanging } from "@/engine/core/utils/game";
import { getHelicopterHealth } from "@/engine/core/utils/helicopter";
import { pickSectionFromCondList, readIniNumber, TConditionList } from "@/engine/core/utils/ini";
import { createEmptyVector, distanceBetween2d } from "@/engine/core/utils/vector";
import {
  GameObject,
  IniFile,
  NetPacket,
  Optional,
  Reader,
  TCount,
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

  public visibilityThreshold: TRate;
  public visibilityIncrement: TRate;
  public visibilityDecrement: TRate;
  public visibility: TRate = 0;
  public visibilityNextTime: TTimestamp = 0;
  public visibilityTimeQuantity: TCount;

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

  public constructor(object: GameObject) {
    this.object = object;
    this.helicopter = object.get_helicopter();
    this.state = registry.objects.get(object.id());

    const ini: IniFile = SYSTEM_INI;

    this.flybyAttackDist = readIniNumber(ini, "helicopter", "flyby_attack_dist", true);
    this.searchAttackDist = readIniNumber(ini, "helicopter", "search_attack_dist", true);
    this.defaultSafeAltitude = readIniNumber(ini, "helicopter", "safe_altitude", true) + this.levelMaxY;
    this.mMaxMGunDist = readIniNumber(ini, "helicopter", "max_mgun_attack_dist", true);

    this.defaultVelocity = readIniNumber(ini, "helicopter", "velocity", true);
    this.searchVelocity = readIniNumber(ini, "helicopter", "search_velocity", true);
    this.roundVelocity = readIniNumber(ini, "helicopter", "round_velocity", true);

    this.visibilityTimeQuantity = readIniNumber(ini, "helicopter", "vis_time_quant", true);
    this.visibilityThreshold = readIniNumber(ini, "helicopter", "vis_threshold", true);
    this.visibilityIncrement = readIniNumber(ini, "helicopter", "vis_inc", true) * this.visibilityTimeQuantity * 0.001;
    this.visibilityDecrement = readIniNumber(ini, "helicopter", "vis_dec", true) * this.visibilityTimeQuantity * 0.001;

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
  public setCombatType(newCombatType: EHelicopterCombatType): void {
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
    if (this.visibility >= this.visibilityThreshold) {
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
  public getCombatType(seeEnemy?: boolean): EHelicopterCombatType {
    let combatType: EHelicopterCombatType = this.combatType;

    if (this.combatType === EHelicopterCombatType.FLY_BY) {
      if (this.flybyStatesForOnePass <= 0) {
        combatType = this.attackBeforeRetreat ? EHelicopterCombatType.RETREAT : EHelicopterCombatType.ROUND;
      }
    } else if (this.combatType === EHelicopterCombatType.ROUND) {
      if (seeEnemy) {
        if (distanceBetween2d(this.object.position(), this.enemy!.position()) > this.flybyAttackDist + 70) {
          combatType = EHelicopterCombatType.FLY_BY;
        }
      } else {
        combatType = EHelicopterCombatType.SEARCH;
      }

      if (getHelicopterHealth(this.helicopter, this.state.invulnerable) < this.flameStartHealth) {
        this.attackBeforeRetreat = true;

        this.helicopter.m_use_rocket_on_attack = true;

        combatType = EHelicopterCombatType.FLY_BY;
      }
    } else if (this.combatType === EHelicopterCombatType.SEARCH) {
      if (seeEnemy) {
        combatType =
          distanceBetween2d(this.object.position(), this.enemy!.position()) > this.flybyAttackDist
            ? EHelicopterCombatType.FLY_BY
            : EHelicopterCombatType.ROUND;
      }

      if (getHelicopterHealth(this.helicopter, this.state.invulnerable) < this.flameStartHealth) {
        this.attackBeforeRetreat = true;
        this.helicopter.m_use_rocket_on_attack = true;

        combatType = EHelicopterCombatType.FLY_BY;
      }
    }

    return combatType;
  }

  /**
   * todo: Description.
   */
  public fastcall(): boolean {
    if (this.isInitialized) {
      const now: TTimestamp = time_global();

      if (this.visibilityNextTime < now) {
        this.visibilityNextTime = now + this.visibilityTimeQuantity;

        if (this.helicopter.isVisible(this.enemy!)) {
          this.visibility = this.visibility + this.visibilityIncrement;

          if (this.visibility > 100) {
            this.visibility = 100;
          }
        } else {
          this.visibility = this.visibility - this.visibilityDecrement;

          if (this.visibility < 0) {
            this.visibility = 0;
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

    this.setCombatType(this.getCombatType(seeEnemy));

    switch (this.combatType) {
      case EHelicopterCombatType.SEARCH:
        updateHelicopterCombatSearch(this, seeEnemy);
        break;

      case EHelicopterCombatType.ROUND:
        updateHelicopterCombatRound(this, seeEnemy);
        break;

      case EHelicopterCombatType.FLY_BY:
        updateHelicopterCombatFlyby(this);
        break;

      case EHelicopterCombatType.RETREAT:
        updateHelicopterCombatRetreat(this);
        break;
    }

    this.updateForgetting();

    return true;
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
