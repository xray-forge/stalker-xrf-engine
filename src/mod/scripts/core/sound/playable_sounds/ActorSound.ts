import { AnyObject, Optional, StringOptional, TNumberId, TStringId } from "lib/types";
import {
  get_hud,
  getFS,
  sound_object,
  time_global,
  vector,
  XR_FS,
  XR_game_object,
  XR_ini_file,
  XR_net_packet,
  XR_reader,
} from "xray16";

import { STRINGIFIED_NIL } from "@/mod/globals/lua";
import { TSection } from "@/mod/lib/types";
import { IRegistryObjectState, registry } from "@/mod/scripts/core/database";
import { NotificationManager } from "@/mod/scripts/core/managers/notifications/NotificationManager";
import { IBaseSchemeState } from "@/mod/scripts/core/schemes/base";
import { AbstractPlayableSound } from "@/mod/scripts/core/sound/playable_sounds/AbstractPlayableSound";
import { EPlayableSound } from "@/mod/scripts/core/sound/playable_sounds/EPlayableSound";
import { getConfigBoolean, getConfigString } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { parseNames } from "@/mod/scripts/utils/parse";

const logger: LuaLogger = new LuaLogger("ActorSound");

/**
 * todo;
 */
export class ActorSound extends AbstractPlayableSound {
  public static readonly type: EPlayableSound = EPlayableSound.ACTOR;

  public type: EPlayableSound = ActorSound.type;

  public stereo: boolean;
  public prefix: boolean;
  public override play_always: boolean;
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

  public play(object: XR_game_object, faction: string, point: string, msg: string): boolean {
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
    this.snd_obj.play_at_pos(registry.actor, new vector().set(0, 0, 0), 0, sound_object.s2d);
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

    NotificationManager.getInstance().sendSoundNotification(null, faction, point, snd, null, null);

    return true;
  }

  public override callback(objectId: TNumberId): void {
    this.played_time = time_global();
    this.idle_time = math.random(this.min_idle, this.max_idle) * 1000;
    this.snd_obj = null;
    this.can_play_sound = true;

    get_hud().RemoveCustomStatic("cs_subtitles_actor");

    const objectState: IRegistryObjectState = registry.objects.get(objectId);

    if (!objectState.active_scheme || objectState[objectState.active_scheme!]!.signals === null) {
      return;
    }

    const schemeState: IBaseSchemeState = objectState[objectState.active_scheme] as IBaseSchemeState;

    if (this.played_id === this.sound.length() && this.shuffle !== "rnd") {
      schemeState.signals!.set("theme_end", true);
      schemeState.signals!.set("sound_end", true);
    } else {
      schemeState.signals!.set("sound_end", true);
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

  public override reset(): void {
    this.played_time = null;
    this.played_id = null;
  }

  public override save(net_packet: XR_net_packet): void {
    net_packet.w_stringZ(tostring(this.played_id));
  }

  public override load(reader: XR_reader): void {
    const id: StringOptional<TStringId> = reader.r_stringZ();

    if (id !== STRINGIFIED_NIL) {
      this.played_id = tonumber(id)!;
    } else {
      this.played_id = null;
    }
  }
}
