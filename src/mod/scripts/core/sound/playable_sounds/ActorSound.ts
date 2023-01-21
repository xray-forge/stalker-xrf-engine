import { AnyObject, Optional } from "lib/types";
import {
  getFS,
  get_hud,
  time_global,
  XR_FS,
  XR_ini_file,
  XR_net_packet,
  sound_object,
  vector,
  XR_game_object
} from "xray16";

import { TSection } from "@/mod/lib/types/configuration";
import { getActor, storage } from "@/mod/scripts/core/db";
import { send_sound } from "@/mod/scripts/core/NewsManager";
import { AbstractPlayableSound } from "@/mod/scripts/core/sound/playable_sounds/AbstractPlayableSound";
import { EPlayableSound } from "@/mod/scripts/core/sound/playable_sounds/EPlayableSound";
import { getConfigBoolean, getConfigString, parseNames } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("ActorSound");

export class ActorSound extends AbstractPlayableSound {
  public static readonly type: EPlayableSound = EPlayableSound.ACTOR;

  public type: string = ActorSound.type;

  public stereo: boolean;
  public prefix: boolean;
  public play_always: boolean;
  public can_play_sound: boolean;

  public faction: string;
  public point: string;
  public msg: string;

  public shuffle: string;
  public played_id: Optional<number> = null;
  public played_time: Optional<number> = null;
  public idle_time: Optional<number> = null;

  public min_idle: number;
  public max_idle: number;
  public rnd: number;

  public sound: LuaTable;

  public constructor(snd_ini: XR_ini_file, section: TSection) {
    super(snd_ini, section);

    this.stereo = getConfigBoolean(snd_ini, section, "actor_stereo", null, false, false);
    this.prefix = getConfigBoolean(snd_ini, section, "npc_prefix", null, false, false);
    this.shuffle = getConfigString(snd_ini, section, "shuffle", null, false, "", "rnd");
    this.play_always = getConfigBoolean(snd_ini, section, "play_always", null, false, false);
    this.section = section;

    if (this.prefix) {
      this.path = "characters_voice\\" + this.path;
    }

    const interval = parseNames(getConfigString(snd_ini, section, "idle", null, false, "", "3,5,100"));

    this.min_idle = tonumber(interval.get(1))!;
    this.max_idle = tonumber(interval.get(2))!;
    this.rnd = tonumber(interval.get(3))!;

    this.sound = new LuaTable();
    this.snd_obj = null;
    this.can_play_sound = true;
    this.faction = getConfigString(snd_ini, section, "faction", null, false, "", "");
    this.point = getConfigString(snd_ini, section, "point", null, false, "", "");
    this.msg = getConfigString(snd_ini, section, "message", null, false, "", "");

    const fs: XR_FS = getFS();

    if (fs.exist("$game_sounds$", this.path + ".ogg") !== null) {
      this.sound.set(1, this.path);
    } else {
      let num: number = 1;

      while (fs.exist("$game_sounds$", this.path + num + ".ogg")) {
        this.sound.set(num, this.path + num);
        num = num + 1;
      }
    }

    if (this.sound.length() === 0) {
      abort("There are no sound collection with path: %s", this.path);
    }
  }

  public play(npc: XR_game_object, faction: string, point: string, msg: string): boolean {
    if (!this.can_play_sound) {
      return false;
    }

    if (this.played_time !== null && time_global() - this.played_time < this.idle_time!) {
      return false;
    }

    this.played_time = null;

    this.played_id = this.select_next_sound();

    if (this.played_id === -1) {
      return false;
    }

    const snd = this.sound.get(this.played_id!);

    this.snd_obj = new sound_object(snd);
    this.snd_obj.volume = 0.8;
    this.snd_obj.play_at_pos(getActor()!, new vector().set(0, 0, 0), 0, sound_object.s2d);
    this.snd_obj.volume = 0.8;

    /**
     * const [snd_st, num_copy] = string.gsub(snd, "\\", "_");
     *
     *   --[[
     *     if game.translate_string(snd_st) !== snd_st {
     *       const hud_demo = get_hud()
     *       --printf("uraaaa!!!")
     *       this.custom_static_demo = hud_demo:GetCustomStatic("cs_subtitles_actor")
     *       if this.custom_static_demo === null {
     *         hud_demo:AddCustomStatic("cs_subtitles_actor", true)
     *         this.custom_static_demo = hud_demo:GetCustomStatic("cs_subtitles_actor")
     *       }
     *       this.custom_static_demo:wnd():SetTextST(snd_st)
     *     }
     *   ]]

     */

    this.can_play_sound = false;

    send_sound(null, faction, point, snd, null, null);

    return true;
  }

  public callback(npc_id: number): void {
    this.played_time = time_global();
    this.idle_time = math.random(this.min_idle, this.max_idle) * 1000;
    this.snd_obj = null;
    this.can_play_sound = true;

    get_hud().RemoveCustomStatic("cs_subtitles_actor");

    const st = storage.get(npc_id);

    if (st.active_scheme === null) {
      return;
    }

    if (st.get(st.active_scheme).signals === null) {
      return;
    }

    const schemeState: AnyObject = st.get(st.active_scheme);

    if (this.played_id === this.sound.length() && this.shuffle !== "rnd") {
      schemeState.signals["theme_end"] = true;
      schemeState.signals["sound_end"] = true;
    } else {
      schemeState.signals["sound_end"] = true;
    }
  }

  public select_next_sound(): Optional<number> {
    const sound_table_size = this.sound.length();

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

  public reset(): void {
    this.played_time = null;
    this.played_id = null;
  }

  public save(net_packet: XR_net_packet): void {
    net_packet.w_stringZ(tostring(this.played_id));
  }

  public load(net_packet: XR_net_packet): void {
    const id = net_packet.r_stringZ();

    if (id !== "nil") {
      this.played_id = tonumber(id)!;
    } else {
      this.played_id = null;
    }
  }
}
