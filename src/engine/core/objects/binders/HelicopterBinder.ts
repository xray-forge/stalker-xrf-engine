import { callback, CHelicopter, clsid, level, LuabindClass, object_binder, system_ini, time_global } from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  IRegistryObjectState,
  openSaveMarker,
  registerHelicopter,
  registry,
  resetObject,
  unregisterHelicopter,
} from "@/engine/core/database";
import { loadObjectLogic, saveObjectLogic } from "@/engine/core/database/logic";
import { openLoadMarker } from "@/engine/core/database/save_markers";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { ESchemeEvent, IBaseSchemeState } from "@/engine/core/schemes";
import { emitSchemeEvent } from "@/engine/core/schemes/base/utils";
import { initializeObjectSchemeLogic } from "@/engine/core/schemes/base/utils/initializeObjectSchemeLogic";
import { get_heli_health } from "@/engine/core/schemes/heli_move/heli_utils";
import { HeliCombat } from "@/engine/core/schemes/heli_move/HeliCombat";
import { get_heli_firer, HeliFire } from "@/engine/core/schemes/heli_move/HeliFire";
import { readIniNumber, readIniString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
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
  public heli_fire: HeliFire;
  public last_hit_snd_timeout: number = 0;
  public flame_start_health: number = 0;

  public snd_hit!: string;
  public snd_damage!: string;
  public snd_down!: string;

  public heliObject!: CHelicopter;

  public constructor(object: ClientObject, ini: IniFile) {
    super(object);

    this.ini = ini;
    this.heli_fire = get_heli_firer(object);
  }

  public override reinit(): void {
    super.reinit();

    this.state = resetObject(this.object);
    this.heliObject = this.object.get_helicopter();

    this.object.set_callback(callback.helicopter_on_point, this.on_point, this);
    this.object.set_callback(callback.helicopter_on_hit, this.on_hit, this);

    // todo: Needs revisit.
    this.state.combat = new HeliCombat(this.object, this.heliObject) as unknown as IBaseSchemeState;

    this.last_hit_snd_timeout = 0;

    const ltx: IniFile = system_ini();

    this.flame_start_health = readIniNumber(ltx, "helicopter", "flame_start_health", true);

    const object_ini = this.object.spawn_ini();

    this.snd_hit = readIniString(object_ini, "helicopter", "snd_hit", false, "", "heli_hit");
    this.snd_damage = readIniString(object_ini, "helicopter", "snd_damage", false, "", "heli_damaged");
    this.snd_down = readIniString(object_ini, "helicopter", "snd_down", false, "", "heli_down");
  }

  public override update(delta: number): void {
    super.update(delta);

    const actor: Optional<ClientObject> = registry.actor;

    if (!this.initialized && actor) {
      this.initialized = true;
      initializeObjectSchemeLogic(this.object, this.state, this.loaded, actor, ESchemeType.HELI);
    }

    if (this.state.active_section !== null) {
      emitSchemeEvent(this.object, this.state[this.state.active_scheme!]!, ESchemeEvent.UPDATE, delta);
    }

    this.check_health();

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
  public check_health(): void {
    const heli = this.heliObject;

    // --printf( "heli health: %d", heli:GetfHealth() )

    if (!heli.m_dead) {
      const health = get_heli_health(this.heliObject, this.state);

      if (health < this.flame_start_health && !heli.m_flame_started) {
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
  public on_hit(power: TRate, impulse: TRate, hit_type: TNumberId, enemy_id: TNumberId): void {
    const enemy: Optional<ClientObject> = level.object_by_id(enemy_id);
    const enemyClassId: Optional<TClassId> = enemy?.clsid() as Optional<TClassId>;

    this.heli_fire.enemy = enemy;
    this.heli_fire.update_hit();

    if (enemyClassId === clsid.actor || enemyClassId === clsid.script_stalker) {
      if (this.state.hit) {
        emitSchemeEvent(this.object, this.state.hit, ESchemeEvent.HIT, this.object, power, null, enemy, null);
      }
    }

    if (this.last_hit_snd_timeout < time_global()) {
      // -- GlobalSound.set_sound_play(this.object:id(), this.snd_hit)
      this.last_hit_snd_timeout = time_global() + math.random(4000, 8000);
    }
  }

  /**
   * todo: Description.
   */
  public on_point(distance: TDistance, position: Vector, path_idx: TIndex): void {
    if (this.state.active_section !== null) {
      emitSchemeEvent(
        this.object,
        this.state[this.state.active_scheme!]!,
        ESchemeEvent.WAYPOINT,
        this.object,
        null,
        path_idx
      );
    }
  }
}
