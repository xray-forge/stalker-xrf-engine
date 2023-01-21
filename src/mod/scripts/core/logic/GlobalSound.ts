import { XR_net_packet } from "xray16";

import { Optional } from "@/mod/lib/types";
import { sound_themes } from "@/mod/scripts/core/db";
import { AbstractPlayableSound } from "@/mod/scripts/core/sound/playable_sounds/AbstractPlayableSound";
import { abort } from "@/mod/scripts/utils/debug";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("GlobalSound");

export class GlobalSound {
  public static sound_table: LuaTable = new LuaTable();
  public static looped_sound: LuaTable<number, LuaTable<string, AbstractPlayableSound>> = new LuaTable();

  public static set_sound_play(
    npc_id: number,
    sound: Optional<string>,
    faction: Optional<string>,
    point: Optional<number>
  ): void {
    log.info("Set sound play:", npc_id);

    if (sound === null) {
      return;
    }

    if (sound_themes.get(sound) === null) {
      abort("set_sound_play. Wrong sound theme [%s], npc[%s]", tostring(sound), npc_id);

      return;
    }

    const snd_theme = sound_themes.get(sound);

    if (snd_theme.class_id === "looped_sound") {
      abort("You trying to play sound [%s] which type is looped", sound);
    }

    const sound_item = GlobalSound.sound_table.get(npc_id);

    if (sound_item === null || snd_theme.play_always) {
      if (sound_item !== null) {
        // --printf("sound table not null")
        if (sound_item.reset !== null) {
          GlobalSound.sound_table.get(npc_id).reset(npc_id);
        } else {
          // --printf("--------------"..type(sound_table[npc_id]))
          // --printf("npc_id="..npc_id)
          // --printf("sound="..sound)
        }
      }

      // --printf("PLAY. theme[%s] object[%s]", tostring(sound), npc_id)
      if (snd_theme.play(npc_id, faction, point)) {
        // --printf("PLAY2. theme[%s] object[%s]", tostring(sound), npc_id)
        // --' fill table
        GlobalSound.sound_table.set(npc_id, snd_theme);
      }
    } else {
      // --printf("Global sound: cannot play sound [%s] because i'm [%s] already play snd [%s]",
      // tostring(sound), npc_id, sound_table[npc_id].path)
      return GlobalSound.sound_table.get(npc_id).snd_obj;
    }

    return GlobalSound.sound_table.get(npc_id).snd_obj;
  }

  public static stop_sounds_by_id(objectId: number): void {
    log.info("Stop sound play:", objectId);

    const sound = GlobalSound.sound_table.get(objectId);

    if (sound && sound.stop) {
      sound.stop(objectId);
    }

    const looped_snd = GlobalSound.looped_sound.get(objectId);

    if (looped_snd !== null) {
      for (const [k, v] of looped_snd) {
        if (v && v.is_playing(objectId)) {
          v.stop(objectId);
        }
      }
    }
  }

  public static update(npc_id: number): void {
    const sound_item = GlobalSound.sound_table.get(npc_id);

    if (sound_item) {
      // --        const t = type(sound_table[npc_id])
      if (!sound_item.is_playing(npc_id)) {
        // --        if((t=="string") || !(sound_table[npc_id]:is_playing(npc_id))) {
        // --            if(t=="string") {
        // --                sound_table[npc_id] = SoundTheme.themes[sound_table[npc_id]]
        // --            }}

        // --printf("SOUND_CALLBACK from [%s] sound_path [%s]",npc_id,sound_table[npc_id].path)
        sound_item.callback(npc_id);
        GlobalSound.sound_table.delete(npc_id);
      }
    }
  }

  public static play_sound_looped(npc_id: number, sound: string): void {
    log.info();

    const snd_theme = sound_themes.get(sound);

    if (snd_theme === null) {
      abort("play_sound_looped. Wrong sound theme [%s], npc[%s]", tostring(sound), npc_id);
    }

    if (snd_theme.class_id !== "looped_sound") {
      abort("You trying to play sound [%s] which type is not looped", sound);
    }

    const looped_item = GlobalSound.looped_sound.get(npc_id);

    if (looped_item !== null && looped_item.get(sound) !== null && looped_item.get(sound).is_playing(npc_id)) {
      return;
    }

    if (snd_theme.play(npc_id)) {
      let new_item = looped_item;

      if (new_item === null) {
        new_item = new LuaTable();
        GlobalSound.looped_sound.set(npc_id, new_item);
      }

      new_item.set(sound, snd_theme);
    }
  }

  public static stop_sound_looped(npc_id: number, sound: string): void {
    const looped_item = GlobalSound.looped_sound.get(npc_id);
    const looped_sound_item = looped_item.get(sound);

    if (sound !== null) {
      if (type(looped_sound_item) !== "string") {
        if (looped_sound_item && looped_sound_item.is_playing(npc_id)) {
          looped_sound_item.stop();
          looped_item.delete(sound);
        }
      }
    } else {
      if (looped_item !== null) {
        for (const [k, v] of pairs(looped_item)) {
          if (v && type(v) !== "string" && v.is_playing(npc_id)) {
            v.stop();
          }
        }

        GlobalSound.looped_sound.delete(npc_id);
      }
    }
  }

  public static set_volume_sound_looped(npc_id: number, sound: string, level: number): void {
    const looped_item = GlobalSound.looped_sound.get(npc_id);

    if (looped_item !== null) {
      const sound_item = looped_item.get(sound);

      if (sound_item && sound_item.is_playing(npc_id)) {
        sound_item.set_volume(level);
      }
    }
  }

  public static actor_save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, "sound_actor_save");

    for (const [k, v] of sound_themes) {
      v.save(packet);
    }

    let n: number = 0;

    for (const [k, v] of GlobalSound.sound_table) {
      n = n + 1;
    }

    packet.w_u16(n);

    for (const [k, v] of GlobalSound.sound_table) {
      packet.w_u16(k as number);
      /* --[[
      if(type(v.section) !== "string") then
      thread:w_stringZ(v)
    } else {
    ]] */
      packet.w_stringZ(v.section);
      // --        }
    }

    n = 0;
    for (const [k, v] of GlobalSound.looped_sound) {
      n = n + 1;
    }

    packet.w_u16(n);

    for (const [k, v] of GlobalSound.looped_sound) {
      packet.w_u16(k);
      n = 0;
      for (const [kk, vv] of GlobalSound.looped_sound.get(k)) {
        n = n + 1;
      }

      packet.w_u16(n);
      for (const [kk, vv] of GlobalSound.looped_sound.get(k)) {
        packet.w_stringZ(kk);
        /* --[[
      if(type(vv.section) !== "string") {
        thread.w_stringZ(vv)
      } else {
        thread.w_stringZ(vv.section)
      }
    ]] */
      }
    }

    setSaveMarker(packet, true, "sound_actor_save");
  }

  public static set_save_marker(packet: XR_net_packet): void {
    setSaveMarker(packet, false, "sound_actor_save");

    for (const [k, v] of sound_themes) {
      v.save(packet);
    }

    let n = 0;

    for (const [k, v] of GlobalSound.sound_table) {
      n = n + 1;
    }

    packet.w_u16(n);

    for (const [k, v] of GlobalSound.sound_table) {
      packet.w_u16(k as number);
      /* --[[
      if(type(v.section)!=="string") {
        thread:w_stringZ(v)
      } else {
      ]] */
      packet.w_stringZ(v.section);
      //  --        end
    }

    n = 0;

    for (const [k, v] of GlobalSound.looped_sound) {
      n = n + 1;
    }

    packet.w_u16(n);

    for (const [k, v] of GlobalSound.looped_sound) {
      packet.w_u16(k);
      n = 0;

      for (const [kk, vv] of GlobalSound.looped_sound.get(k)) {
        n = n + 1;
      }

      packet.w_u16(n);

      for (const [kk, vv] of GlobalSound.looped_sound.get(k)) {
        packet.w_stringZ(kk);
        /* --[[
        if(type(vv.section)!=="string") {
          packet:w_stringZ(vv)
        } else {
          packet:w_stringZ(vv.section)
        }
      ]]*/
      }
    }

    setSaveMarker(packet, true, "sound_actor_save");
  }

  public stop_all_sounds(): void {
    for (const [k, v] of GlobalSound.sound_table) {
      if (type(v) !== "string") {
        v.stop();
      }
    }

    for (const [k, v] of GlobalSound.looped_sound) {
      for (const [kk, vv] of GlobalSound.looped_sound.get(k)) {
        if (vv && vv.is_playing()) {
          vv.stop();
        }
      }
    }
  }

  public static start_game_callback(): void {
    GlobalSound.sound_table = new LuaTable();
  }

  public static actor_load(packet: XR_net_packet): void {
    setLoadMarker(packet, false, "sound_actor_save");

    for (const [k, v] of sound_themes) {
      v.load(packet);
    }

    GlobalSound.sound_table = new LuaTable();

    let n: number = packet.r_u16();

    for (const i of $range(1, n)) {
      const id = packet.r_u16();
      const theme = packet.r_stringZ();

      // --        sound_table[id] = thread:r_stringZ()
      GlobalSound.sound_table.set(id, sound_themes.get(theme));
    }

    GlobalSound.looped_sound = new LuaTable();
    n = packet.r_u16();

    for (const i of $range(1, n)) {
      const id = packet.r_u16();

      GlobalSound.looped_sound.set(id, new LuaTable());
      n = packet.r_u16();
      for (const j of $range(1, n)) {
        const sound = packet.r_stringZ();

        // --            looped_sound[id][sound] = thread:r_stringZ()
        GlobalSound.looped_sound.get(id).set(sound, sound_themes.get(sound));
      }
    }

    setLoadMarker(packet, true, "sound_actor_save");
  }

  public static save_npc(packet: XR_net_packet, npc_id: number): void {
    setSaveMarker(packet, false, "sound_npc_save");

    for (const [k, v] of sound_themes) {
      v.save_npc(packet, npc_id);
    }

    setSaveMarker(packet, true, "sound_npc_save");
  }

  public static load_npc(packet: XR_net_packet, npc_id: number): void {
    setLoadMarker(packet, false, "sound_npc_save");

    for (const [k, v] of sound_themes) {
      v.load_npc(packet, npc_id);
    }

    setLoadMarker(packet, true, "sound_npc_save");
  }
}
