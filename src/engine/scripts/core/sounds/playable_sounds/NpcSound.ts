import {
  game,
  get_hud,
  getFS,
  snd_type,
  sound_object,
  stalker_ids,
  time_global,
  vector,
  XR_FS,
  XR_game_object,
  XR_ini_file,
  XR_net_packet,
  XR_reader,
  XR_sound_object,
} from "xray16";

import { communities, TCommunity } from "@/engine/lib/constants/communities";
import { AnyObject, Optional, TLabel, TName, TNumberId } from "@/engine/lib/types";
import { IRegistryObjectState, registry } from "@/engine/scripts/core/database";
import { NotificationManager } from "@/engine/scripts/core/managers/notifications/NotificationManager";
import { AbstractPlayableSound } from "@/engine/scripts/core/sounds/playable_sounds/AbstractPlayableSound";
import { EPlayableSound } from "@/engine/scripts/core/sounds/playable_sounds/EPlayableSound";
import { getCharacterCommunity } from "@/engine/scripts/utils/alife";
import { getConfigBoolean, getConfigNumber, getConfigString } from "@/engine/scripts/utils/config";
import { abort } from "@/engine/scripts/utils/debug";
import { LuaLogger } from "@/engine/scripts/utils/logging";
import { parseNames } from "@/engine/scripts/utils/parse";

const logger: LuaLogger = new LuaLogger($filename);
const nstl = 64;

export class NpcSound extends AbstractPlayableSound {
  // todo: probably can be simplified to increment removal
  public static getNextId(): number {
    const current: number = NpcSound.sound_base;

    NpcSound.sound_base += 1;

    return current;
  }

  public static sound_base: number = stalker_ids.sound_script + 10_000;
  public static readonly type: EPlayableSound = EPlayableSound.NPC;

  public override readonly type: EPlayableSound = NpcSound.type;

  public readonly prefix: boolean;
  public override readonly play_always: boolean;
  public readonly is_combat_sound: boolean;
  public readonly group_snd: boolean;
  public readonly shuffle: string;

  public readonly npc: LuaTable = new LuaTable();
  public readonly can_play_sound: LuaTable<number, boolean> = new LuaTable();
  public readonly sound_path: LuaTable = new LuaTable();
  public readonly avail_communities: LuaTable<TCommunity, boolean> = new LuaTable();

  public readonly min_idle: number;
  public readonly max_idle: number;
  public readonly rnd: number;
  public readonly delay_sound: number;

  public readonly faction: string;
  public readonly point: string;
  public readonly msg: string;

  public played_id: Optional<number> = null;
  public played_time: Optional<number> = null;
  public idle_time: Optional<number> = null;
  public can_play_group_sound: boolean = true;
  public pda_snd_obj: Optional<XR_sound_object> = null;

  public constructor(snd_ini: XR_ini_file, section: string) {
    super(snd_ini, section);

    this.prefix = getConfigBoolean(snd_ini, section, "npc_prefix", null, false, false);
    this.shuffle = getConfigString(snd_ini, section, "shuffle", null, false, "", "rnd");
    this.group_snd = getConfigBoolean(snd_ini, section, "group_snd", null, false, false);
    this.play_always = getConfigBoolean(snd_ini, section, "play_always", null, false, false);
    this.is_combat_sound = getConfigBoolean(snd_ini, section, "is_combat_sound", null, false, false);
    this.section = section;

    this.delay_sound = getConfigNumber(snd_ini, section, "delay_sound", this.npc, false, 0);

    const interval: LuaTable<number, string> = parseNames(
      getConfigString(snd_ini, section, "idle", null, false, "", "3,5,100")
    );

    this.min_idle = tonumber(interval.get(1))!;
    this.max_idle = tonumber(interval.get(2))!;
    this.rnd = tonumber(interval.get(3))!;

    this.faction = getConfigString(snd_ini, section, "faction", null, false, "", "");
    this.point = getConfigString(snd_ini, section, "point", null, false, "", "");
    this.msg = getConfigString(snd_ini, section, "message", null, false, "", "");

    const avail_communities: LuaTable<number, TCommunity> = parseNames<TCommunity>(
      getConfigString(
        snd_ini,
        section,
        "avail_communities",
        null,
        false,
        "",
        string.format(
          "%s, %s, %s, %s, %s, %s, %s, %s, %s",
          communities.stalker,
          communities.ecolog,
          communities.bandit,
          communities.dolg,
          communities.freedom,
          communities.army,
          communities.zombied,
          communities.monolith,
          communities.killer
        )
      )
    );

    for (const [k, v] of avail_communities) {
      this.avail_communities.set(v, true);
    }
  }

  public override reset(objectId: TNumberId): void {
    const npc: Optional<XR_game_object> = registry.objects.get(objectId) && registry.objects.get(objectId).object!;

    this.played_time = null;
    this.played_id = null;
    this.can_play_group_sound = true;
    this.can_play_sound.set(objectId, true);

    if (npc !== null) {
      npc.set_sound_mask(-1);
      npc.set_sound_mask(0);
    }

    if (this.pda_snd_obj !== null) {
      this.pda_snd_obj.stop();
      this.pda_snd_obj = null;
    }
  }

  public override is_playing(objectId: TNumberId): boolean {
    const obj: Optional<XR_game_object> = registry.objects.get(objectId) && registry.objects.get(objectId).object!;

    if (obj === null) {
      return false;
    }

    return obj.active_sound_count() !== 0 || this.pda_snd_obj?.playing() === true;
  }

  public init_npc(npc: XR_game_object): void {
    const npc_id = npc.id();
    const npcObj: AnyObject = {};

    this.npc.set(npc_id, npcObj);
    this.sound_path.set(npc_id, {});

    let character_prefix: string = "";

    if (this.prefix === false) {
      character_prefix = npc.sound_prefix();
      npc.sound_prefix("characters_voice\\");
    }

    npcObj.id = NpcSound.getNextId();

    if (this.is_combat_sound) {
      npcObj.max = npc.add_combat_sound(this.path, nstl, snd_type.talk, 2, 1, npcObj.id, "bip01_head") - 1;
    } else {
      npcObj.max = npc.add_sound(this.path, nstl, snd_type.talk, 2, 1, npcObj.id) - 1;
    }

    const fs: XR_FS = getFS();

    if (fs.exist("$game_sounds$", npc.sound_prefix() + this.path + ".ogg") !== null) {
      this.sound_path.get(npc_id)[1] = npc.sound_prefix() + this.path;
      // --        printf("adding sound ["..npc:sound_prefix()..this.path.."]")
    } else {
      let num = 1;

      while (fs.exist("$game_sounds$", npc.sound_prefix() + this.path + num + ".ogg")) {
        // --            printf("adding sound [" + npcюsound_prefix() + this.path + num +"] to table id = " + num)
        this.sound_path.get(npc_id)[num] = npc.sound_prefix() + this.path + num;
        num = num + 1;
      }
    }

    if (this.npc.get(npc_id).max < 0) {
      abort("Couldnt find sounds %s with prefix %s", tostring(this.path), npc.sound_prefix());
    }

    if (this.prefix === false) {
      npc.sound_prefix(character_prefix);
    }

    if (this.group_snd) {
      this.can_play_group_sound = true;
    } else {
      if (this.can_play_sound.get(npc_id) !== false) {
        this.can_play_sound.set(npc_id, true);
      }
    }
  }

  /**
   * todo;
   */
  public override callback(objectId: TNumberId): void {
    this.played_time = time_global();
    this.idle_time = math.random(this.min_idle, this.max_idle) * 1000;

    if (this.group_snd) {
      this.can_play_group_sound = true;
    } else {
      this.can_play_sound.set(objectId, true);
    }

    // --    printf("npc_sound:callback!!!!!!!!")
    get_hud().RemoveCustomStatic("cs_subtitles_npc");

    const state: IRegistryObjectState = registry.objects.get(objectId);

    if (state.active_scheme === null) {
      return;
    }

    const signals: Optional<LuaTable<TName, boolean>> = state[state.active_scheme!]!.signals;

    if (signals === null) {
      return;
    }

    if (this.npc.get(objectId) === null) {
      return;
    }

    if (this.played_id === this.npc.get(objectId).max && this.shuffle !== "rnd") {
      signals.set("theme_end", true);
      signals.set("sound_end", true);
    } else {
      signals.set("sound_end", true);
    }
  }

  /**
   * todo;
   */
  public play(objectId: TNumberId, faction: string, point: Optional<string>, message: TLabel): boolean {
    logger.info("Play:", objectId, faction, point, message, "#");

    const object: Optional<XR_game_object> = registry.objects.get(objectId)?.object;

    if (object === null) {
      return false;
    }

    if (this.group_snd) {
      if (!this.can_play_group_sound) {
        return false;
      }
    } else {
      if (!this.can_play_sound.get(objectId)) {
        return false;
      }
    }

    if (this.played_time !== null && time_global() - this.played_time < this.idle_time!) {
      return false;
    }

    this.played_time = null;

    const objectData = this.npc.get(objectId);

    if (objectData === null) {
      return false;
    }

    this.played_id = this.select_next_sound(objectId);

    if (this.played_id === -1) {
      return false;
    }

    object.play_sound(objectData.id, this.delay_sound + 0.06, this.delay_sound + 0.05, 1, 0, this.played_id);

    const table_id = this.played_id + 1;
    const snd = this.sound_path.get(objectId)[table_id];
    const fs: XR_FS = getFS();

    if (
      snd &&
      fs.exist("$game_sounds$", snd + "_pda.ogg") !== null &&
      object.position().distance_to_sqr(registry.actor.position()) >= 100
    ) {
      if (this.pda_snd_obj !== null && this.pda_snd_obj.playing()) {
        this.pda_snd_obj.stop();
      }

      this.pda_snd_obj = new sound_object(snd + "_pda");
      this.pda_snd_obj.play_at_pos(registry.actor, new vector().set(0, 0, 0), this.delay_sound, sound_object.s2d);
      this.pda_snd_obj.volume = 0.8;
    }

    const [snd_st, num_copy] = string.gsub(snd, "\\", "_");

    if (this.group_snd) {
      this.can_play_group_sound = false;
    } else {
      this.can_play_sound.set(objectId, false);
    }

    if (game.translate_string(snd_st) !== snd_st) {
      if (!faction) {
        faction = getCharacterCommunity(object);
      }

      // Attempt to auto-translate npc goal.
      if (!point) {
        point = object.profile_name() + "_name";
        if (game.translate_string(point) === point) {
          point = null;
        }
      }

      NotificationManager.getInstance().sendSoundNotification(object, faction, point, snd, snd_st, this.delay_sound);
    } else {
      NotificationManager.getInstance().sendSoundNotification(object, faction, point, snd, null, this.delay_sound);
    }

    return true;
  }

  public select_next_sound(objectId: TNumberId): number {
    const npc_data = this.npc.get(objectId);

    if (this.shuffle === "rnd") {
      if (npc_data.max === 0) {
        return 0;
      }

      if (this.played_id !== null) {
        const played_id = math.random(0, npc_data.max - 1);

        if (played_id >= this.played_id) {
          return played_id + 1;
        }

        return played_id;
      }

      return math.random(0, npc_data.max);
    }

    if (this.shuffle === "seq") {
      if (this.played_id === -1) {
        return -1;
      }

      if (this.played_id === null) {
        return 0;
      }

      if (this.played_id < npc_data.max) {
        return this.played_id + 1;
      }

      return -1;
    }

    if (this.shuffle === "loop") {
      if (this.played_id === null) {
        return 0;
      }

      if (this.played_id < npc_data.max) {
        return this.played_id + 1;
      }

      return 0;
    }

    abort("Unexpected shuffle type provided: %s,", this.shuffle);
  }

  public override stop(objectId: TNumberId): void {
    const npc: Optional<XR_game_object> = registry.objects.get(objectId)?.object as Optional<XR_game_object>;

    if (npc !== null && npc.alive()) {
      npc.set_sound_mask(-1);
      npc.set_sound_mask(0);
    }

    if (this.pda_snd_obj !== null && this.pda_snd_obj.playing()) {
      this.pda_snd_obj.stop();
      this.pda_snd_obj = null;
    }
  }

  public override save(net_packet: XR_net_packet): void {
    net_packet.w_stringZ(tostring(this.played_id));

    if (this.group_snd) {
      net_packet.w_bool(this.can_play_group_sound);
    }
  }

  public override load(reader: XR_reader): void {
    const id: string = reader.r_stringZ();

    this.played_id = id === "nil" ? null : tonumber(id)!;

    if (this.group_snd) {
      this.can_play_group_sound = reader.r_bool();
    }
  }

  public override save_npc(net_packet: XR_net_packet, npcId: number): void {
    if (!this.group_snd) {
      net_packet.w_bool(this.can_play_sound.get(npcId) === true);
    }
  }

  public override load_npc(reader: XR_reader, npcId: number): void {
    if (!this.group_snd) {
      this.can_play_sound.set(npcId, reader.r_bool());
    }
  }
}
