import {
  get_hud,
  getFS,
  sound_object,
  time_global,
  vector,
  XR_FS,
  XR_ini_file,
  XR_net_packet,
  XR_reader,
  XR_sound_object,
} from "xray16";

import { registry } from "@/engine/core/database";
import { NotificationManager } from "@/engine/core/managers/notifications/NotificationManager";
import { AbstractPlayableSound } from "@/engine/core/sounds/playable_sounds/AbstractPlayableSound";
import { EPlayableSound } from "@/engine/core/sounds/playable_sounds/EPlayableSound";
import { abort } from "@/engine/core/utils/assertion";
import { readIniString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { parseStringsList } from "@/engine/core/utils/parse";
import { roots } from "@/engine/lib/constants/roots";
import { NIL } from "@/engine/lib/constants/words";
import { Optional, TDuration, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class ObjectSound extends AbstractPlayableSound {
  public static readonly type: EPlayableSound = EPlayableSound["3D"];

  public readonly type: EPlayableSound = ObjectSound.type;
  public sound: LuaTable;
  public shuffle: string;

  public pda_snd_obj: Optional<XR_sound_object> = null;

  public min_idle: TDuration;
  public max_idle: TDuration;
  public rnd: number;

  public can_play_sound: boolean;
  public played_id: Optional<number>;

  public faction: string;
  public point: string;
  public msg: string;

  public idle_time: Optional<number> = null;
  public played_time: Optional<TDuration> = null;

  public constructor(snd_ini: XR_ini_file, section: string) {
    super(snd_ini, section);

    this.shuffle = readIniString(snd_ini, section, "shuffle", false, "", "rnd");

    const interval = parseStringsList(readIniString(snd_ini, section, "idle", false, "", "3,5,100"));

    this.min_idle = tonumber(interval.get(1))!;
    this.max_idle = tonumber(interval.get(2))!;

    this.sound = new LuaTable();
    this.rnd = tonumber(interval.get(3))!;
    this.snd_obj = null;
    this.can_play_sound = true;
    this.section = section;
    this.played_id = null;
    this.faction = readIniString(snd_ini, section, "faction", false, "", "");
    this.point = readIniString(snd_ini, section, "point", false, "", "");
    this.msg = readIniString(snd_ini, section, "message", false, "", "");

    const fs: XR_FS = getFS();

    if (fs.exist(roots.gameSounds, this.path + ".ogg") !== null) {
      this.sound.set(1, this.path);
    } else {
      let num = 1;

      while (fs.exist(roots.gameSounds, this.path + num + ".ogg")) {
        this.sound.set(num, this.path + num);
        num = num + 1;
      }
    }

    if (this.sound.length() === 0) {
      abort("There are no sound collection with path: %s", this.path);
    }
  }

  public play(obj_id: number, faction: string, point: string, msg: string): boolean {
    const obj = registry.objects.get(obj_id) && registry.objects.get(obj_id).object!;

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
    const fs: XR_FS = getFS();

    if (
      snd &&
      fs.exist(roots.gameSounds, snd + "_pda.ogg") !== null &&
      obj.position().distance_to_sqr(registry.actor.position()) >= 5
    ) {
      this.pda_snd_obj = new sound_object(snd + "_pda");
      this.pda_snd_obj.play_at_pos(registry.actor, new vector().set(0, 0, 0), 0, sound_object.s2d);
      this.pda_snd_obj.volume = 0.8;
    }

    this.snd_obj = new sound_object(snd);
    this.snd_obj.play_at_pos(obj, obj.position(), 0, sound_object.s3d);
    this.can_play_sound = false;

    NotificationManager.getInstance().sendSoundNotification(null, faction, point, snd, null, null);

    return true;
  }

  public override stop(): void {
    super.stop();

    if (this.pda_snd_obj !== null && this.pda_snd_obj.playing()) {
      this.pda_snd_obj.stop();
      this.pda_snd_obj = null;
    }
  }

  public override save(net_packet: XR_net_packet): void {
    net_packet.w_stringZ(tostring(this.played_id));
  }

  public override load(reader: XR_reader): void {
    const id = reader.r_stringZ();

    if (id !== NIL) {
      this.played_id = tonumber(id)!;
    } else {
      this.played_id = null;
    }
  }

  public override callback(objectId: TNumberId): void {
    this.played_time = time_global();
    this.idle_time = math.random(this.min_idle, this.max_idle) * 1000;
    this.snd_obj = null;
    this.can_play_sound = true;

    // --    printf("object_sound:callback for object !!!!!!!!")
    get_hud().RemoveCustomStatic("cs_subtitles_object");

    const st = registry.objects.get(objectId);

    if (st.active_scheme === null) {
      return;
    }

    const it = st[st.active_scheme!]!;

    if (it.signals === null) {
      return;
    }

    if (this.played_id === this.sound.length() && this.shuffle !== "rnd") {
      it.signals.set("theme_end", true);
      it.signals.set("sound_end", true);
    } else {
      it.signals.set("sound_end", true);
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
