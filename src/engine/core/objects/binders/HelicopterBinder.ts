import { callback, CHelicopter, clsid, level, LuabindClass, object_binder, time_global } from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
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
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { ESchemeEvent, IBaseSchemeState } from "@/engine/core/objects/ai/scheme";
import { getHeliHealth } from "@/engine/core/schemes/heli_move/heli_utils";
import { HeliCombat } from "@/engine/core/schemes/heli_move/HeliCombat";
import { getHeliFirer, HeliFire } from "@/engine/core/schemes/heli_move/HeliFire";
import { readIniNumber, readIniString } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { emitSchemeEvent, initializeObjectSchemeLogic } from "@/engine/core/utils/scheme";
import {
  ClientObject,
  ESchemeType,
  IniFile,
  NetPacket,
  Optional,
  Reader,
  ServerObject,
  TClassId,
  TDistance,
  TIndex,
  TNumberId,
  TRate,
  Vector,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class HelicopterBinder extends object_binder {
  public readonly ini: IniFile;

  public state!: IRegistryObjectState;
  public loaded: boolean = false;
  public initialized: boolean = false;
  public heliFire: HeliFire;
  public lastHitSndTimeout: number = 0;
  public flameStartHealth: number = 0;

  public sndHit!: string;
  public sndDamage!: string;
  public sndDown!: string;

  public heliObject!: CHelicopter;

  public constructor(object: ClientObject, ini: IniFile) {
    super(object);

    this.ini = ini;
    this.heliFire = getHeliFirer(object);
  }

  public override reinit(): void {
    super.reinit();

    this.state = resetObject(this.object);
    this.heliObject = this.object.get_helicopter();

    this.object.set_callback(callback.helicopter_on_point, this.onPoint, this);
    this.object.set_callback(callback.helicopter_on_hit, this.onHit, this);

    // todo: Needs revisit.
    this.state.combat = new HeliCombat(this.object, this.heliObject) as unknown as IBaseSchemeState;

    this.lastHitSndTimeout = 0;

    this.flameStartHealth = readIniNumber(SYSTEM_INI, "helicopter", "flame_start_health", true);

    const objectIni: IniFile = this.object.spawn_ini();

    this.sndHit = readIniString(objectIni, "helicopter", "snd_hit", false, "", "heli_hit");
    this.sndDamage = readIniString(objectIni, "helicopter", "snd_damage", false, "", "heli_damaged");
    this.sndDown = readIniString(objectIni, "helicopter", "snd_down", false, "", "heli_down");
  }

  public override update(delta: number): void {
    super.update(delta);

    const actor: Optional<ClientObject> = registry.actor;

    if (!this.initialized && actor) {
      this.initialized = true;
      initializeObjectSchemeLogic(this.object, this.state, this.loaded, ESchemeType.HELICOPTER);
    }

    if (this.state.activeSection !== null) {
      emitSchemeEvent(this.object, this.state[this.state.activeScheme!]!, ESchemeEvent.UPDATE, delta);
    }

    this.checkHealth();

    GlobalSoundManager.getInstance().update(this.object.id());
  }

  public override net_spawn(object: ServerObject): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    registerHelicopter(this);

    return true;
  }

  /**
   * todo: Description.
   */
  public override net_destroy(): void {
    unregisterHelicopter(this);

    super.net_destroy();
  }

  /**
   * todo: Description.
   */
  public override net_save_relevant(): boolean {
    return true;
  }

  /**
   * todo: Description.
   */
  public override save(packet: NetPacket): void {
    openSaveMarker(packet, HelicopterBinder.__name);
    super.save(packet);
    saveObjectLogic(this.object, packet);
    closeSaveMarker(packet, HelicopterBinder.__name);

    (this.state.combat as unknown as HeliCombat).save(packet);
  }

  /**
   * todo: Description.
   */
  public override load(reader: Reader): void {
    this.loaded = true;

    openLoadMarker(reader, HelicopterBinder.__name);
    super.load(reader);
    loadObjectLogic(this.object, reader);
    closeLoadMarker(reader, HelicopterBinder.__name);

    (this.state.combat as unknown as HeliCombat).load(reader);
  }

  /**
   * todo: Description.
   */
  public checkHealth(): void {
    const heli = this.heliObject;

    // --printf( "heli health: %d", heli:GetfHealth() )

    if (!heli.m_dead) {
      const health = getHeliHealth(this.heliObject, this.state);

      if (health < this.flameStartHealth && !heli.m_flame_started) {
        this.heliObject.StartFlame();
        // --        GlobalSound.set_sound_play(this.object:id(), this.snd_damage)
      }

      if (health <= 0.005 && !this.state.immortal) {
        this.heliObject.Die();
        unregisterHelicopter(this);
      }
    }
  }

  /**
   * todo: Description.
   */
  public onHit(power: TRate, impulse: TRate, hitType: TNumberId, enemyId: TNumberId): void {
    const enemy: Optional<ClientObject> = level.object_by_id(enemyId);
    const enemyClassId: Optional<TClassId> = enemy?.clsid() as Optional<TClassId>;

    this.heliFire.enemy = enemy;
    this.heliFire.updateHit();

    if (enemyClassId === clsid.actor || enemyClassId === clsid.script_stalker) {
      if (this.state.hit) {
        emitSchemeEvent(this.object, this.state.hit, ESchemeEvent.HIT, this.object, power, null, enemy, null);
      }
    }

    if (this.lastHitSndTimeout < time_global()) {
      // -- GlobalSound.set_sound_play(this.object:id(), this.snd_hit)
      this.lastHitSndTimeout = time_global() + math.random(4000, 8000);
    }
  }

  /**
   * todo: Description.
   */
  public onPoint(distance: TDistance, position: Vector, pathIndex: TIndex): void {
    if (this.state.activeSection !== null) {
      emitSchemeEvent(
        this.object,
        this.state[this.state.activeScheme!]!,
        ESchemeEvent.WAYPOINT,
        this.object,
        null,
        pathIndex
      );
    }
  }
}
