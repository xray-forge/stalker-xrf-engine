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
import {
  EHelicopterCombatType,
  EHelicopterFlyByState,
} from "@/engine/core/schemes/helicopter/heli_move/helicopter_types";
import { helicopterConfig } from "@/engine/core/schemes/helicopter/heli_move/HelicopterConfig";
import { calculatePositionInRadius } from "@/engine/core/schemes/helicopter/heli_move/utils";
import { isGameLevelChanging } from "@/engine/core/utils/game";
import { getHelicopterHealth } from "@/engine/core/utils/helicopter";
import {
  parseConditionsList,
  pickSectionFromCondList,
  readIniBoolean,
  readIniNumber,
  readIniString,
  TConditionList,
} from "@/engine/core/utils/ini";
import { pickRandom } from "@/engine/core/utils/random";
import { createEmptyVector, distanceBetween2d } from "@/engine/core/utils/vector";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { ZERO_VECTOR } from "@/engine/lib/constants/vectors";
import { ACTOR, NIL } from "@/engine/lib/constants/words";
import {
  GameObject,
  IniFile,
  NetPacket,
  Optional,
  Reader,
  TDistance,
  TNumberId,
  TTimestamp,
  Vector,
} from "@/engine/lib/types";

export class HeliCombat {
  public readonly object: GameObject;
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

  public combatType!: EHelicopterCombatType;
  public enemyId: Optional<TNumberId> = null;
  public enemy: Optional<GameObject> = null;
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

  public state!: EHelicopterFlyByState;

  public constructor(object: GameObject, heliObject: CHelicopter) {
    this.st = registry.objects.get(object.id());
    this.object = object;
    this.heliObject = heliObject;
    this.initialized = false;

    this.levelMaxY = level.get_bounding_volume().max.y;

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
    this.vis = 0;
    this.visNextTime = 0;

    this.forgetTimeout = readIniNumber(ini, "helicopter", "forget_timeout", true) * 1000;

    this.flameStartHealth = readIniNumber(ini, "helicopter", "flame_start_health", true);

    this.attackBeforeRetreat = false;
    this.enemyForgetable = true;
    this.sectionChanged = false;
  }

  public readCustomData(ini: IniFile, section: string): void {
    this.combatUseRocket = readIniBoolean(ini, section, "combat_use_rocket", false, true);
    this.combatUseMgun = readIniBoolean(ini, section, "combat_use_mgun", false, true);

    const combatIgnore: Optional<string> = readIniString(ini, section, "combat_ignore", false);

    if (combatIgnore !== null) {
      this.combatIgnore = parseConditionsList(combatIgnore);
    } else {
      this.combatIgnore = null;
    }

    const combaEnemy: Optional<string> = readIniString(ini, section, "combat_enemy", false);

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
          this.enemyId = ACTOR_ID;
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

    this.combatType = EHelicopterCombatType.FLY_BY;
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

    closeSaveMarker(packet, HeliCombat.name);
  }

  public load(reader: Reader): void {
    openLoadMarker(reader, HeliCombat.name);

    this.initialized = reader.r_bool();

    if (this.initialized) {
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

      if (this.combatType === EHelicopterCombatType.FLY_BY) {
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

      if (getHelicopterHealth(this.heliObject, this.st.invulnerable) < this.flameStartHealth) {
        this.attackBeforeRetreat = true;

        this.heliObject.m_use_rocket_on_attack = true;

        ct = EHelicopterCombatType.FLY_BY;
      }
    } else if (this.combatType === EHelicopterCombatType.SEARCH) {
      if (seeEnemy) {
        ct =
          distanceBetween2d(this.object.position(), this.enemy!.position()) > this.flybyAttackDist
            ? EHelicopterCombatType.FLY_BY
            : EHelicopterCombatType.ROUND;
      }

      if (getHelicopterHealth(this.heliObject, this.st.invulnerable) < this.flameStartHealth) {
        this.attackBeforeRetreat = true;

        this.heliObject.m_use_rocket_on_attack = true;

        ct = EHelicopterCombatType.FLY_BY;
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
      const now: TTimestamp = time_global();

      if (this.visNextTime < now) {
        this.visNextTime = now + this.visTimeQuant;

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

    if (this.combatType === EHelicopterCombatType.SEARCH) {
      this.searchUpdate(seeEnemy);
    } else if (this.combatType === EHelicopterCombatType.ROUND) {
      this.roundUpdate(seeEnemy);
    } else if (this.combatType === EHelicopterCombatType.FLY_BY) {
      this.flybyUpdate(seeEnemy);
    } else if (this.combatType === EHelicopterCombatType.RETREAT) {
      this.retreatUpdate();
    }

    this.updateForgetting();

    return true;
  }

  public calcPositionInRadius(radius: TDistance): Vector {
    const position: Vector = this.object.position();
    const velocity: Vector = this.heliObject.GetCurrVelocityVec();
    const destination: Vector = this.enemyLastSeenPos as Vector;

    destination.y = 0;
    position.y = 0;
    velocity.y = 0;
    velocity.normalize();

    const target: Vector = calculatePositionInRadius(position, velocity, destination, radius);

    target.y = this.safeAltitude;

    return target;
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
      const now: TTimestamp = time_global();

      if (this.roundBeginShootTime) {
        if (this.roundBeginShootTime < now) {
          this.heliObject.SetEnemy(this.enemy);
        }
      } else {
        this.roundBeginShootTime = now + helicopterConfig.ROUND_SHOOT_DELAY;
      }
    } else {
      this.heliObject.ClearEnemy();

      this.roundBeginShootTime = null;
    }
  }

  public roundUpdateFlight(seeEnemy: boolean): void {
    const now: TTimestamp = time_global();

    // -- ������������ ��������, �� ������������ �� ���� � ���������� �� � �������� ��������
    if (this.changePosTime < now) {
      this.changePosTime = now + 2000;

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
      const now: TTimestamp = time_global();

      if (this.searchBeginShootTime) {
        if (this.searchBeginShootTime < now) {
          this.heliObject.SetEnemy(this.enemy);
        }
      } else {
        this.searchBeginShootTime = now + helicopterConfig.SEARCH_SHOOT_DELAY;
      }
    } else {
      this.heliObject.ClearEnemy();

      this.searchBeginShootTime = null;
    }
  }

  public searchUpdateFlight(seeEnemy: boolean): void {
    const now: TTimestamp = time_global();

    if (this.changeSpeedTime < now) {
      const t = math.random(8000, 12000);

      this.changeSpeedTime = now + t;

      this.speedIs0 = !this.speedIs0;

      // --        this.flight_direction = not this.flight_direction
      this.searchSetupFlight(this.flightDirection);

      return;
    }

    if (this.changePosTime < now) {
      this.changePosTime = now + 2000;

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
    this.heliObject.LookAtPoint(ZERO_VECTOR, false);
  }

  public flybySetInitialState(): void {
    // --    if this.object:position():distance_to( this.enemy_last_seen_pos ) < this.flyby_attack_dist {
    if (distanceBetween2d(this.object.position(), this.enemyLastSeenPos!) < this.flybyAttackDist) {
      // --        this.heliObject.LookAtPoint( dummy_vector, false )

      this.state = EHelicopterFlyByState.TO_ATTACK_DIST;
    } else {
      // --        this.heliObject.LookAtPoint( this.enemy:position(), true )

      this.state = EHelicopterFlyByState.TO_ENEMY;
    }
  }

  public flybyUpdateFlight(seeEnemy: boolean): void {
    if (this.wasCallback) {
      if (this.state === EHelicopterFlyByState.TO_ATTACK_DIST) {
        this.state = EHelicopterFlyByState.TO_ENEMY;
      } else if (this.state === EHelicopterFlyByState.TO_ENEMY) {
        this.state = EHelicopterFlyByState.TO_ATTACK_DIST;
      }

      this.wasCallback = false;
      this.stateInitialized = false;
    }

    if (this.state === EHelicopterFlyByState.TO_ATTACK_DIST) {
      if (!this.stateInitialized) {
        const p = this.calcPositionInRadius(this.flybyAttackDist);

        // --            printf( "heli_combat:flyby_update_flight 1 SetDestPosition %f %f %f", p.x, p.y, p.z )
        this.heliObject.SetDestPosition(p);

        this.heliObject.ClearEnemy();

        this.changeCombatTypeAllowed = false;

        this.stateInitialized = true;
      }
    } else if (this.state === EHelicopterFlyByState.TO_ENEMY) {
      if (!this.stateInitialized) {
        this.heliObject.SetEnemy(this.enemy);
        this.heliObject.UseFireTrail(true);

        this.flybyStatesForOnePass = this.flybyStatesForOnePass - 1;

        this.stateInitialized = true;
      }

      const position: Vector = this.enemyLastSeenPos!;

      position.set(position.x, this.safeAltitude, position.z);

      this.changeCombatTypeAllowed = distanceBetween2d(this.object.position(), position) > this.searchAttackDist;

      this.heliObject.SetDestPosition(position);
    }
  }

  public flybyUpdate(seeEnemy: boolean): void {
    if (!this.flybyInitialized) {
      this.flybyInitialize();
    }

    this.flybyUpdateFlight(seeEnemy);
  }

  public retreatInitialize(): void {
    this.retreatInitialized = true;

    this.heliObject.SetMaxVelocity(this.maxVelocity);
    this.heliObject.SetSpeedInDestPoint(this.maxVelocity);
    this.heliObject.LookAtPoint(ZERO_VECTOR, false);
    this.heliObject.SetDestPosition(this.calcPositionInRadius(5000));
    this.heliObject.ClearEnemy();
  }

  public retreatUpdate(): void {
    if (!this.retreatInitialized) {
      this.retreatInitialize();
    }
  }
}
