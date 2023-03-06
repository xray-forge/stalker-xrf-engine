import {
  callback,
  clsid,
  level,
  LuabindClass,
  object_binder,
  system_ini,
  time_global,
  TXR_cls_id,
  XR_CHelicopter,
  XR_cse_alife_object,
  XR_game_object,
  XR_ini_file,
  XR_net_packet,
  XR_reader,
  XR_vector,
} from "xray16";

import { ESchemeType, Optional, TDistance, TIndex, TNumberId, TRate, TSection } from "@/mod/lib/types";
import {
  addHelicopter,
  deleteHelicopter,
  IRegistryObjectState,
  registry,
  resetObject,
} from "@/mod/scripts/core/database";
import { GlobalSoundManager } from "@/mod/scripts/core/managers/GlobalSoundManager";
import { ESchemeEvent, IBaseSchemeState } from "@/mod/scripts/core/schemes/base";
import { get_heli_health } from "@/mod/scripts/core/schemes/heli_move/heli_utils";
import { HeliCombat } from "@/mod/scripts/core/schemes/heli_move/HeliCombat";
import { get_heli_firer, HeliFire } from "@/mod/scripts/core/schemes/heli_move/HeliFire";
import { initializeGameObject } from "@/mod/scripts/core/schemes/initializeGameObject";
import { issueSchemeEvent } from "@/mod/scripts/core/schemes/issueSchemeEvent";
import { loadObject, saveObject } from "@/mod/scripts/core/schemes/storing";
import { getConfigNumber, getConfigString } from "@/mod/scripts/utils/configs";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { getClsId } from "@/mod/scripts/utils/ids";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("HelicopterBinder");

/**
 * todo;
 */
@LuabindClass()
export class HelicopterBinder extends object_binder {
  public readonly ini: XR_ini_file;

  public state!: IRegistryObjectState;
  public loaded: boolean = false;
  public initialized: boolean = false;
  public heli_fire: HeliFire;
  public last_hit_snd_timeout: number = 0;
  public flame_start_health: number = 0;

  public snd_hit!: string;
  public snd_damage!: string;
  public snd_down!: string;

  public heliObject!: XR_CHelicopter;

  /**
   * todo;
   */
  public constructor(object: XR_game_object, ini: XR_ini_file) {
    super(object);

    this.ini = ini;
    this.heli_fire = get_heli_firer(object);
  }

  /**
   * todo;
   */
  public override reload(section: TSection): void {
    super.reload(section);
  }

  /**
   * todo;
   */
  public override reinit(): void {
    super.reinit();

    this.state = resetObject(this.object);
    this.heliObject = this.object.get_helicopter();

    this.object.set_callback(callback.helicopter_on_point, this.on_point, this);
    this.object.set_callback(callback.helicopter_on_hit, this.on_hit, this);

    // todo: Needs revisit.
    this.state.combat = new HeliCombat(this.object, this.heliObject) as unknown as IBaseSchemeState;

    this.last_hit_snd_timeout = 0;

    const ltx: XR_ini_file = system_ini();

    this.flame_start_health = getConfigNumber(ltx, "helicopter", "flame_start_health", this.object, true);

    const object_ini = this.object.spawn_ini();

    this.snd_hit = getConfigString(object_ini, "helicopter", "snd_hit", this.object, false, "", "heli_hit");
    this.snd_damage = getConfigString(object_ini, "helicopter", "snd_damage", this.object, false, "", "heli_damaged");
    this.snd_down = getConfigString(object_ini, "helicopter", "snd_down", this.object, false, "", "heli_down");
  }

  /**
   * todo;
   */
  public override update(delta: number): void {
    super.update(delta);

    const actor: Optional<XR_game_object> = registry.actor;

    if (!this.initialized && actor) {
      this.initialized = true;
      initializeGameObject(this.object, this.state, this.loaded, actor, ESchemeType.HELI);
    }

    if (this.state.active_section !== null) {
      issueSchemeEvent(this.object, this.state[this.state.active_scheme!]!, ESchemeEvent.UPDATE, delta);
    }

    this.object.info_clear();

    const active_section = registry.objects.get(this.object.id()).active_section;

    if (active_section) {
      this.object.info_add("section -- " + active_section);
    }

    this.check_health();

    GlobalSoundManager.getInstance().updateForObjectId(this.object.id());
  }

  /**
   * todo;
   */
  public override net_spawn(object: XR_cse_alife_object): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    addHelicopter(this.object);

    return true;
  }

  /**
   * todo;
   */
  public override net_destroy(): void {
    deleteHelicopter(this.object);

    super.net_destroy();
  }

  /**
   * todo;
   */
  public override net_save_relevant(): boolean {
    return true;
  }

  /**
   * todo;
   */
  public override save(packet: XR_net_packet): void {
    super.save(packet);
    setSaveMarker(packet, false, HelicopterBinder.__name);
    // --printf( "heli_binder: save")

    saveObject(this.object, packet);
    setSaveMarker(packet, true, HelicopterBinder.__name);
    (this.state.combat as unknown as HeliCombat).save(packet);
  }

  /**
   * todo;
   */
  public override load(reader: XR_reader): void {
    this.loaded = true;
    setLoadMarker(reader, false, HelicopterBinder.__name);
    // --printf("generic_object_binder:load(): this.object:name()='%s'", this.object:name())
    super.load(reader);

    // --printf( "heli_binder: load")

    loadObject(this.object, reader);
    setLoadMarker(reader, true, HelicopterBinder.__name);
    (this.state.combat as unknown as HeliCombat).load(reader);
  }

  /**
   * todo;
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
        deleteHelicopter(this.object);
      }
    }
  }

  /**
   * todo;
   */
  public on_hit(power: TRate, impulse: TRate, hit_type: TNumberId, enemy_id: TNumberId): void {
    const enemy: Optional<XR_game_object> = level.object_by_id(enemy_id);
    const enemy_cls_id: Optional<TXR_cls_id> = getClsId(enemy);

    this.heli_fire.enemy = enemy;
    this.heli_fire.update_hit();

    if (enemy_cls_id === clsid.actor || enemy_cls_id === clsid.script_stalker) {
      if (this.state.hit) {
        issueSchemeEvent(this.object, this.state.hit, ESchemeEvent.HIT, this.object, power, null, enemy, null);
      }
    }

    if (this.last_hit_snd_timeout < time_global()) {
      // -- GlobalSound.set_sound_play(this.object:id(), this.snd_hit)
      this.last_hit_snd_timeout = time_global() + math.random(4000, 8000);
    }
  }

  /**
   * todo;
   */
  public on_point(distance: TDistance, position: XR_vector, path_idx: TIndex): void {
    if (this.state.active_section !== null) {
      issueSchemeEvent(
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
