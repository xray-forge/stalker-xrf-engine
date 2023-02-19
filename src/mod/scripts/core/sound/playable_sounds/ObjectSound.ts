import {
  get_hud,
  getFS,
  sound_object,
  time_global,
  vector,
  XR_ini_file,
  XR_net_packet,
  XR_reader,
  XR_sound_object,
} from "xray16";

import { Optional } from "@/mod/lib/types";
import { registry, storage } from "@/mod/scripts/core/db";
import { send_sound } from "@/mod/scripts/core/NewsManager";
import { AbstractPlayableSound } from "@/mod/scripts/core/sound/playable_sounds/AbstractPlayableSound";
import { EPlayableSound } from "@/mod/scripts/core/sound/playable_sounds/EPlayableSound";
import { getConfigString, parseNames } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ObjectSound");

export class ObjectSound extends AbstractPlayableSound {
  public static readonly type: EPlayableSound = EPlayableSound["3D"];

  public readonly type: EPlayableSound = ObjectSound.type;
  public sound: LuaTable;
  public shuffle: string;

  public pda_snd_obj: Optional<XR_sound_object> = null;

  public min_idle: number;
  public max_idle: number;
  public rnd: number;

  public can_play_sound: boolean;
  public played_id: Optional<number>;

  public faction: string;
  public point: string;
  public msg: string;

  public idle_time: Optional<number> = null;
  public played_time: Optional<number> = null;

  public constructor(snd_ini: XR_ini_file, section: string) {
    super(snd_ini, section);

    this.shuffle = getConfigString(snd_ini, section, "shuffle", null, false, "", "rnd");

    const interval = parseNames(getConfigString(snd_ini, section, "idle", null, false, "", "3,5,100"));

    this.min_idle = tonumber(interval.get(1))!;
    this.max_idle = tonumber(interval.get(2))!;

    this.sound = new LuaTable();
    this.rnd = tonumber(interval.get(3))!;
    this.snd_obj = null;
    this.can_play_sound = true;
    this.section = section;
    this.played_id = null;
    this.faction = getConfigString(snd_ini, section, "faction", null, false, "", "");
    this.point = getConfigString(snd_ini, section, "point", null, false, "", "");
    this.msg = getConfigString(snd_ini, section, "message", null, false, "", "");

    const f = getFS();

    if (f.exist("$game_sounds$", this.path + ".ogg") !== null) {
      this.sound.set(1, this.path);
    } else {
      let num = 1;

      while (f.exist("$game_sounds$", this.path + num + ".ogg")) {
        this.sound.set(num, this.path + num);
        num = num + 1;
      }
    }

    if (this.sound.length() === 0) {
      abort("There are no sound collection with path: %s", this.path);
    }
  }

  public play(obj_id: number, faction: string, point: string, msg: string): boolean {
    const obj = storage.get(obj_id) && storage.get(obj_id).object!;

    if (obj === null) {
      return false;
    }

    if (!this.can_play_sound) {
      return false;
    }

    if (this.played_time !== null && time_global() - this.played_time < this.idle_time!) {
      return false;
    }

    this.played_time = null;
    // --' ����� �����, ������� ������.
    this.played_id = this.select_next_sound();
    if (this.played_id === -1) {
      // --' ����������.
      return false;
    }

    // --    printf("object played_id = %s", this.played_id)
    const snd = this.sound.get(this.played_id!);
    const f = getFS();

    if (
      snd &&
      f.exist("$game_sounds$", snd + "_pda.ogg") !== null &&
      obj.position().distance_to_sqr(registry.actor.position()) >= 5
    ) {
      this.pda_snd_obj = new sound_object(snd + "_pda");
      this.pda_snd_obj.play_at_pos(registry.actor, new vector().set(0, 0, 0), 0, sound_object.s2d);
      this.pda_snd_obj.volume = 0.8;
    }

    this.snd_obj = new sound_object(snd);
    this.snd_obj.play_at_pos(obj, obj.position(), 0, sound_object.s3d);

    const [snd_st, num_copy] = string.gsub(snd, "\\", "_");

    /* --[[
    if game.translate_string(snd_st) !== snd_st {
      const hud_demo = get_hud()
      --        printf("uraaaa!!!")
      this.custom_static_demo = hud_demo:GetCustomStatic("cs_subtitles_object")
      if this.custom_static_demo === null {
        hud_demo:AddCustomStatic("cs_subtitles_object", true)
        this.custom_static_demo = hud_demo:GetCustomStatic("cs_subtitles_object")
      }
      this.custom_static_demo:wnd():SetTextST(snd_st)
    }
  ]]*/
    this.can_play_sound = false;

    send_sound(null, faction, point, snd, null, null);

    return true;
  }

  public stop(): void {
    super.stop();

    if (this.pda_snd_obj !== null && this.pda_snd_obj.playing()) {
      this.pda_snd_obj.stop();
      this.pda_snd_obj = null;
    }
  }

  public save(net_packet: XR_net_packet): void {
    net_packet.w_stringZ(tostring(this.played_id));
  }

  public load(reader: XR_reader): void {
    const id = reader.r_stringZ();

    if (id !== "nil") {
      this.played_id = tonumber(id)!;
    } else {
      this.played_id = null;
    }
  }

  public callback(npc_id: number): void {
    this.played_time = time_global();
    this.idle_time = math.random(this.min_idle, this.max_idle) * 1000;
    this.snd_obj = null;
    this.can_play_sound = true;

    // --    printf("object_sound:callback for object !!!!!!!!")
    get_hud().RemoveCustomStatic("cs_subtitles_object");

    const st = storage.get(npc_id);

    if (st.active_scheme === null) {
      return;
    }

    const it = st[st.active_scheme!];

    if (it.signals === null) {
      return;
    }

    if (this.played_id === this.sound.length() && this.shuffle !== "rnd") {
      it.signals["theme_end"] = true;
      it.signals["sound_end"] = true;
    } else {
      it.signals["sound_end"] = true;
    }
  }

  public select_next_sound(): Optional<number> {
    const sound_table_size: number = this.sound.length();

    if (this.shuffle === "rnd") {
      if (sound_table_size === 1) {
        return 1;
      }

      if (this.played_id !== null) {
        const played_id = math.random(1, sound_table_size - 1);

        if (played_id >= this.played_id) {
          return played_id + 1;
        }

        return played_id;
      }

      return math.random(1, sound_table_size);
    }

    if (this.shuffle === "seq") {
      if (this.played_id === -1) {
        return -1;
      }

      if (this.played_id === null) {
        return 1;
      }

      if (this.played_id < sound_table_size) {
        return this.played_id + 1;
      }

      return -1;
    }

    if (this.shuffle === "loop") {
      if (this.played_id === null) {
        return 1;
      }

      if (this.played_id < sound_table_size) {
        return this.played_id + 1;
      }

      return 1;
    }

    return null;
  }
}
