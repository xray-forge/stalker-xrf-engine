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

import { ESchemeType, Optional } from "@/mod/lib/types";
import { addHeli, addObject, deleteHeli, deleteObject, getActor, IStoredObject, storage } from "@/mod/scripts/core/db";
import { GlobalSound } from "@/mod/scripts/core/logic/GlobalSound";
import { get_heli_health } from "@/mod/scripts/core/logic/heli/heli_utils";
import { HeliCombat } from "@/mod/scripts/core/logic/heli/HeliCombat";
import { get_heli_firer } from "@/mod/scripts/core/logic/heli/HeliFire";
import { initializeGameObject } from "@/mod/scripts/core/schemes/initializeGameObject";
import { issueEvent } from "@/mod/scripts/core/schemes/issueEvent";
import { load_obj, save_obj } from "@/mod/scripts/core/schemes/storing";
import { getConfigNumber, getConfigString } from "@/mod/scripts/utils/configs";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { getClsId } from "@/mod/scripts/utils/ids";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("HeliBinder");

export interface IHeliBinder extends XR_object_binder {
  st: IStoredObject;

  ini: XR_ini_file;
  loaded: boolean;
  initialized: boolean;
  heli_fire: any;
  last_hit_snd_timeout: number;
  flame_start_health: number;

  snd_hit: string;
  snd_damage: string;
  snd_down: string;

  heliObject: XR_CHelicopter;

  check_health(): void;

  on_hit(power: number, impulse: number, hit_type: number, enemy_id: number): void;
  on_point(distance: number, position: XR_vector, path_idx: number): void;
}

export const HeliBinder: IHeliBinder = declare_xr_class("HeliBinder", object_binder, {
  __init(object: XR_game_object, ini: XR_ini_file): void {
    object_binder.__init(this, object);

    this.ini = ini;
    this.initialized = false;
    this.loaded = false;
    this.heli_fire = get_heli_firer(object);
  },
  reload(section: string): void {
    object_binder.reload(this, section);
  },
  reinit(): void {
    object_binder.reinit(this);

    this.st = {};
    storage.set(this.object.id(), this.st);

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
  },
  update(delta: number): void {
    object_binder.update(this, delta);

    const actor: Optional<XR_game_object> = getActor();

    if (!this.initialized && actor) {
      this.initialized = true;
      initializeGameObject(this.object, this.st, this.loaded, actor, ESchemeType.HELI);
    }

    if (this.st.active_section !== null) {
      issueEvent(this.object, this.st[this.st.active_scheme!], "update", delta);
    }

    this.object.info_clear();

    const active_section = storage.get(this.object.id()).active_section;

    if (active_section) {
      this.object.info_add("section -- " + active_section);
    }

    this.check_health();

    GlobalSound.update(this.object.id());
  },
  net_spawn(object: XR_cse_alife_object): boolean {
    if (!object_binder.net_spawn(this, object)) {
      return false;
    }

    addObject(this.object);
    addHeli(this.object);

    return true;
  },
  net_destroy(): void {
    deleteObject(this.object);
    deleteHeli(this.object);

    object_binder.net_destroy(this);
  },
  net_save_relevant(target: XR_object_binder): boolean {
    return true;
  },
  save(packet: XR_net_packet): void {
    object_binder.save(this, packet);
    setSaveMarker(packet, false, HeliBinder.__name);
    // --printf( "heli_binder: save")

    save_obj(this.object, packet);
    setSaveMarker(packet, true, HeliBinder.__name);
    this.st.combat!.save(packet);
  },
  load(reader: XR_reader): void {
    this.loaded = true;
    setLoadMarker(reader, false, HeliBinder.__name);
    // --printf("generic_object_binder:load(): this.object:name()='%s'", this.object:name())
    object_binder.load(this, reader);

    // --printf( "heli_binder: load")

    load_obj(this.object, reader);
    setLoadMarker(reader, true, HeliBinder.__name);
    this.st.combat!.load(reader);
  },
  check_health(): void {
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
        deleteHeli(this.object);
        this.st.last_alt = heli.GetRealAltitude();
        this.st.alt_check_time = time_global() + 1000;
        // --            GlobalSound.set_sound_play(this.object:id(), this.snd_down)
      }
    }
  },
  on_hit(power: number, impulse: number, hit_type: number, enemy_id: number): void {
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
  },
  on_point(distance: number, position: XR_vector, path_idx: number): void {
    if (this.st.active_section !== null) {
      issueEvent(this.object, this.st[this.st.active_scheme!], "waypoint_callback", this.object, null, path_idx);
    }
  },
} as IHeliBinder);
