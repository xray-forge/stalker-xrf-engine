import {
  callback,
  clsid,
  level,
  object_binder,
  system_ini,
  time_global,
  TXR_cls_id,
  XR_CHelicopter,
  XR_cse_alife_object,
  XR_game_object,
  XR_ini_file,
  XR_net_packet,
  XR_object_binder,
  XR_reader,
  XR_vector,
} from "xray16";

import { ESchemeType, Optional, TSection } from "@/mod/lib/types";
import { addHelicopter, deleteHelicopter, IStoredObject, registry, resetObject } from "@/mod/scripts/core/database";
import { GlobalSoundManager } from "@/mod/scripts/core/GlobalSoundManager";
import { get_heli_health } from "@/mod/scripts/core/schemes/heli_move/heli_utils";
import { HeliCombat } from "@/mod/scripts/core/schemes/heli_move/HeliCombat";
import { get_heli_firer, HeliFire } from "@/mod/scripts/core/schemes/heli_move/HeliFire";
import { initializeGameObject } from "@/mod/scripts/core/schemes/initializeGameObject";
import { issueEvent } from "@/mod/scripts/core/schemes/issueEvent";
import { load_obj, save_obj } from "@/mod/scripts/core/schemes/storing";
import { getConfigNumber, getConfigString } from "@/mod/scripts/utils/configs";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { getClsId } from "@/mod/scripts/utils/ids";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("HeliBinder");

/**
 * todo;
 */
@LuabindClass()
export class HeliBinder extends object_binder {
  public readonly ini: XR_ini_file;

  public st: IStoredObject = {};
  public loaded: boolean = false;
  public initialized: boolean = false;
  public heli_fire: HeliFire;
  public last_hit_snd_timeout: number = 0;
  public flame_start_health: number = 0;

  public snd_hit!: string;
  public snd_damage!: string;
  public snd_down!: string;

  public heliObject!: XR_CHelicopter;

  public constructor(object: XR_game_object, ini: XR_ini_file) {
    super(object);

    this.ini = ini;
    this.heli_fire = get_heli_firer(object);
  }

  public override reload(section: TSection): void {
    super.reload(section);
  }

  public override reinit(): void {
    super.reinit();

    this.st = resetObject(this.object);
    this.heliObject = this.object.get_helicopter();

    this.object.set_callback(callback.helicopter_on_point, this.on_point, this);
    this.object.set_callback(callback.helicopter_on_hit, this.on_hit, this);

    this.st.combat = new HeliCombat(this.object, this.heliObject);

    this.last_hit_snd_timeout = 0;

    const ltx: XR_ini_file = system_ini();

    this.flame_start_health = getConfigNumber(ltx, "helicopter", "flame_start_health", this.object, true);

    const object_ini = this.object.spawn_ini();

    this.snd_hit = getConfigString(object_ini, "helicopter", "snd_hit", this.object, false, "", "heli_hit");
    this.snd_damage = getConfigString(object_ini, "helicopter", "snd_damage", this.object, false, "", "heli_damaged");
    this.snd_down = getConfigString(object_ini, "helicopter", "snd_down", this.object, false, "", "heli_down");

    this.st.last_alt = this.heliObject.GetRealAltitude();
    this.st.alt_check_time = time_global() + 1000;
  }

  public override update(delta: number): void {
    super.update(delta);

    const actor: Optional<XR_game_object> = registry.actor;

    if (!this.initialized && actor) {
      this.initialized = true;
      initializeGameObject(this.object, this.st, this.loaded, actor, ESchemeType.HELI);
    }

    if (this.st.active_section !== null) {
      issueEvent(this.object, this.st[this.st.active_scheme!], "update", delta);
    }

    this.object.info_clear();

    const active_section = registry.objects.get(this.object.id()).active_section;

    if (active_section) {
      this.object.info_add("section -- " + active_section);
    }

    this.check_health();

    GlobalSoundManager.updateForId(this.object.id());
  }

  public override net_spawn(object: XR_cse_alife_object): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    addHelicopter(this.object);

    return true;
  }

  public override net_destroy(): void {
    deleteHelicopter(this.object);

    super.net_destroy();
  }

  public override net_save_relevant(): boolean {
    return true;
  }

  public override save(packet: XR_net_packet): void {
    super.save(packet);
    setSaveMarker(packet, false, HeliBinder.__name);
    // --printf( "heli_binder: save")

    save_obj(this.object, packet);
    setSaveMarker(packet, true, HeliBinder.__name);
    this.st.combat!.save(packet);
  }

  public override load(reader: XR_reader): void {
    this.loaded = true;
    setLoadMarker(reader, false, HeliBinder.__name);
    // --printf("generic_object_binder:load(): this.object:name()='%s'", this.object:name())
    super.load(reader);

    // --printf( "heli_binder: load")

    load_obj(this.object, reader);
    setLoadMarker(reader, true, HeliBinder.__name);
    this.st.combat!.load(reader);
  }

  public check_health(): void {
    const heli = this.heliObject;

    // --printf( "heli health: %d", heli:GetfHealth() )

    if (!heli.m_dead) {
      const health = get_heli_health(this.heliObject, this.st);

      if (health < this.flame_start_health && !heli.m_flame_started) {
        this.heliObject.StartFlame();
        // --        GlobalSound.set_sound_play(this.object:id(), this.snd_damage)
      }

      if (health <= 0.005 && !this.st.immortal) {
        this.heliObject.Die();
        deleteHelicopter(this.object);
        this.st.last_alt = heli.GetRealAltitude();
        this.st.alt_check_time = time_global() + 1000;
        // --            GlobalSound.set_sound_play(this.object:id(), this.snd_down)
      }
    }
  }

  public on_hit(power: number, impulse: number, hit_type: number, enemy_id: number): void {
    const enemy: Optional<XR_game_object> = level.object_by_id(enemy_id);
    const enemy_cls_id: Optional<TXR_cls_id> = getClsId(enemy);

    this.heli_fire.enemy = enemy;
    this.heli_fire.update_hit();

    if (enemy_cls_id === clsid.actor || enemy_cls_id === clsid.script_stalker) {
      if (this.st.hit) {
        issueEvent(this.object, this.st.hit, "hit_callback", this.object, power, null, enemy, null);
      }
    }

    if (this.last_hit_snd_timeout < time_global()) {
      // -- GlobalSound.set_sound_play(this.object:id(), this.snd_hit)
      this.last_hit_snd_timeout = time_global() + math.random(4000, 8000);
    }
  }

  public on_point(distance: number, position: XR_vector, path_idx: number): void {
    if (this.st.active_section !== null) {
      issueEvent(this.object, this.st[this.st.active_scheme!], "waypoint_callback", this.object, null, path_idx);
    }
  }
}
