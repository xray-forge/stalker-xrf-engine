import { callback, CHelicopter, clsid, level, LuabindClass, object_binder, time_global } from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  getManager,
  IBaseSchemeState,
  IRegistryObjectState,
  openLoadMarker,
  openSaveMarker,
  registerHelicopter,
  registry,
  resetObject,
  SYSTEM_INI,
  unregisterHelicopter,
} from "@/engine/core/database";
import { loadObjectLogic, saveObjectLogic } from "@/engine/core/database/logic";
import { SoundManager } from "@/engine/core/managers/sounds/SoundManager";
import { HelicopterCombatManager } from "@/engine/core/schemes/helicopter/heli_move/combat/HelicopterCombatManager";
import { HelicopterFireManager } from "@/engine/core/schemes/helicopter/heli_move/fire/HelicopterFireManager";
import { getHelicopterFireManager } from "@/engine/core/schemes/helicopter/heli_move/utils";
import { getHelicopterHealth } from "@/engine/core/utils/helicopter";
import { readIniNumber, readIniString } from "@/engine/core/utils/ini";
import { emitSchemeEvent, initializeObjectSchemeLogic } from "@/engine/core/utils/scheme";
import {
  ESchemeEvent,
  ESchemeType,
  GameObject,
  IniFile,
  NetPacket,
  Optional,
  Reader,
  ServerObject,
  TClassId,
  TDistance,
  TDuration,
  TIndex,
  TNumberId,
  TRate,
  TTimestamp,
  Vector,
} from "@/engine/lib/types";

/**
 * Binder for helicopter game object events and logics.
 */
@LuabindClass()
export class HelicopterBinder extends object_binder {
  public readonly ini: IniFile;

  public isLoaded: boolean = false;
  public inInitialized: boolean = false;

  public state!: IRegistryObjectState;
  public helicopter!: CHelicopter;
  public helicopterFireManager: HelicopterFireManager;

  public lastHitSndTimeout: TDuration = 0;
  public flameStartHealth: TRate = 0;

  public sndHit!: string;
  public sndDamage!: string;
  public sndDown!: string;

  public constructor(object: GameObject, ini: IniFile) {
    super(object);

    this.ini = ini;
    this.helicopterFireManager = getHelicopterFireManager(object);
  }

  public override reinit(): void {
    super.reinit();

    this.state = resetObject(this.object);
    this.helicopter = this.object.get_helicopter();

    this.object.set_callback(callback.helicopter_on_point, this.onPoint, this);
    this.object.set_callback(callback.helicopter_on_hit, this.onHit, this);

    // todo: Needs revisit.
    this.state.combat = new HelicopterCombatManager(this.object, this.helicopter) as unknown as IBaseSchemeState;

    this.lastHitSndTimeout = 0;

    this.flameStartHealth = readIniNumber(SYSTEM_INI, "helicopter", "flame_start_health", true);

    const ini: IniFile = this.object.spawn_ini() as IniFile;

    this.sndHit = readIniString(ini, "helicopter", "snd_hit", false, null, "heli_hit");
    this.sndDamage = readIniString(ini, "helicopter", "snd_damage", false, null, "heli_damaged");
    this.sndDown = readIniString(ini, "helicopter", "snd_down", false, null, "heli_down");
  }

  public override update(delta: TDuration): void {
    super.update(delta);

    if (!this.inInitialized && registry.actor !== null) {
      this.inInitialized = true;
      initializeObjectSchemeLogic(this.object, this.state, this.isLoaded, ESchemeType.HELICOPTER);
    }

    if (this.state.activeScheme) {
      emitSchemeEvent(this.object, this.state[this.state.activeScheme]!, ESchemeEvent.UPDATE, delta);
    }

    this.checkHealth();

    getManager(SoundManager).update(this.object.id());
  }

  public override net_spawn(object: ServerObject): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    registerHelicopter(this);

    return true;
  }

  public override net_destroy(): void {
    unregisterHelicopter(this);

    super.net_destroy();
  }

  public override net_save_relevant(): boolean {
    return true;
  }

  public override save(packet: NetPacket): void {
    openSaveMarker(packet, HelicopterBinder.__name);

    super.save(packet);
    saveObjectLogic(this.object, packet);

    closeSaveMarker(packet, HelicopterBinder.__name);

    (this.state.combat as unknown as HelicopterCombatManager).save(packet);
  }

  public override load(reader: Reader): void {
    this.isLoaded = true;

    openLoadMarker(reader, HelicopterBinder.__name);

    super.load(reader);
    loadObjectLogic(this.object, reader);

    closeLoadMarker(reader, HelicopterBinder.__name);

    (this.state.combat as unknown as HelicopterCombatManager).load(reader);
  }

  /**
   * todo: Description.
   */
  public checkHealth(): void {
    if (!this.helicopter.m_dead) {
      const health: TRate = getHelicopterHealth(this.helicopter, this.state.invulnerable);

      if (health < this.flameStartHealth && !this.helicopter.m_flame_started) {
        this.helicopter.StartFlame();
      }

      if (health <= 0.005 && !this.state.immortal) {
        this.helicopter.Die();
        unregisterHelicopter(this);
      }
    }
  }

  /**
   * todo: Description.
   */
  public onHit(power: TRate, impulse: TRate, hitType: TNumberId, enemyId: TNumberId): void {
    const now: TTimestamp = time_global();
    const enemy: Optional<GameObject> = level.object_by_id(enemyId);
    const enemyClassId: Optional<TClassId> = enemy?.clsid() as Optional<TClassId>;

    this.helicopterFireManager.enemy = enemy;
    this.helicopterFireManager.updateOnHit();

    if (enemyClassId === clsid.actor || enemyClassId === clsid.script_stalker) {
      if (this.state.hit) {
        emitSchemeEvent(this.object, this.state.hit, ESchemeEvent.HIT, this.object, power, null, enemy, null);
      }
    }

    if (this.lastHitSndTimeout < now) {
      this.lastHitSndTimeout = now + math.random(4000, 8000);
    }
  }

  /**
   * todo: Description.
   */
  public onPoint(distance: TDistance, position: Vector, pathIndex: TIndex): void {
    if (this.state.activeScheme) {
      emitSchemeEvent(
        this.object,
        this.state[this.state.activeScheme]!,
        ESchemeEvent.WAYPOINT,
        this.object,
        null,
        pathIndex
      );
    }
  }
}
