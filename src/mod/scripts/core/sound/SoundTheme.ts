import { ini_file, XR_game_object } from "xray16";

import { getActor, sound_themes } from "@/mod/scripts/core/db";
import { ActorSound } from "@/mod/scripts/core/sound/playable_sounds/ActorSound";
import { EPlayableSound } from "@/mod/scripts/core/sound/playable_sounds/EPlayableSound";
import { LoopedSound } from "@/mod/scripts/core/sound/playable_sounds/LoopedSound";
import { NpcSound } from "@/mod/scripts/core/sound/playable_sounds/NpcSound";
import { ObjectSound } from "@/mod/scripts/core/sound/playable_sounds/ObjectSound";
import { getCharacterCommunity } from "@/mod/scripts/utils/alife";
import { getConfigString } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { resetTable } from "@/mod/scripts/utils/table";

const logger: LuaLogger = new LuaLogger("SoundTheme");

export class SoundTheme {
  public static load_sound(): void {
    const snd_ini = new ini_file("misc\\script_sound.ltx");

    if (!snd_ini.section_exist("list")) {
      abort("There is no section [list] in script_sound.ltx");
    }

    const n: number = snd_ini.line_count("list");

    resetTable(sound_themes);

    for (const i of $range(0, n - 1)) {
      const [result, section, value] = snd_ini.r_line("list", i, "", "");

      const type: EPlayableSound = getConfigString<EPlayableSound>(
        snd_ini,
        section,
        "type",
        getActor(),
        true,
        ""
      ) as EPlayableSound;

      switch (type) {
        case ObjectSound.type:
          sound_themes.set(section, new ObjectSound(snd_ini, section));
          break;

        case NpcSound.type:
          sound_themes.set(section, new NpcSound(snd_ini, section));
          break;

        case ActorSound.type:
          sound_themes.set(section, new ActorSound(snd_ini, section));
          break;

        case LoopedSound.type:
          sound_themes.set(section, new LoopedSound(snd_ini, section));
          break;

        default:
          abort("Unexpected sound type provided for loading: %s", type);
      }
    }
  }

  public static init_npc_sound(npc: XR_game_object): void {
    for (const [key, sound] of sound_themes) {
      if (sound.type === NpcSound.type) {
        // --printf("checking %s for %s (%s)", v.section, npc:name(), character_community(npc))
        if ((sound as NpcSound).avail_communities.has(getCharacterCommunity(npc))) {
          (sound as NpcSound).init_npc(npc);
        }
      }
    }
  }
}
