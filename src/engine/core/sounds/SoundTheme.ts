import { XR_game_object } from "xray16";

import { registry, SCRIPT_SOUND_LTX } from "@/engine/core/database";
import { ActorSound } from "@/engine/core/sounds/playable_sounds/ActorSound";
import { EPlayableSound } from "@/engine/core/sounds/playable_sounds/EPlayableSound";
import { LoopedSound } from "@/engine/core/sounds/playable_sounds/LoopedSound";
import { NpcSound } from "@/engine/core/sounds/playable_sounds/NpcSound";
import { ObjectSound } from "@/engine/core/sounds/playable_sounds/ObjectSound";
import { abort } from "@/engine/core/utils/debug";
import { getConfigString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getCharacterCommunity } from "@/engine/core/utils/object";
import { resetTable } from "@/engine/core/utils/table";
import { TCount } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

export class SoundTheme {
  public static loadSound(): void {
    if (!SCRIPT_SOUND_LTX.section_exist("list")) {
      abort("There is no section [list] in script_sound.ltx");
    }

    const linesCount: TCount = SCRIPT_SOUND_LTX.line_count("list");

    resetTable(registry.sounds.themes);

    for (const i of $range(0, linesCount - 1)) {
      const [result, section, value] = SCRIPT_SOUND_LTX.r_line("list", i, "", "");

      const type: EPlayableSound = getConfigString<EPlayableSound>(
        SCRIPT_SOUND_LTX,
        section,
        "type",
        registry.actor,
        true,
        ""
      ) as EPlayableSound;

      switch (type) {
        case ObjectSound.type:
          registry.sounds.themes.set(section, new ObjectSound(SCRIPT_SOUND_LTX, section));
          break;

        case NpcSound.type:
          registry.sounds.themes.set(section, new NpcSound(SCRIPT_SOUND_LTX, section));
          break;

        case ActorSound.type:
          registry.sounds.themes.set(section, new ActorSound(SCRIPT_SOUND_LTX, section));
          break;

        case LoopedSound.type:
          registry.sounds.themes.set(section, new LoopedSound(SCRIPT_SOUND_LTX, section));
          break;

        default:
          abort("Unexpected sound type provided for loading: %s", type);
      }
    }
  }

  public static init_npc_sound(npc: XR_game_object): void {
    for (const [key, sound] of registry.sounds.themes) {
      if (sound.type === NpcSound.type) {
        // --printf("checking %s for %s (%s)", v.section, npc:name(), character_community(npc))
        if ((sound as NpcSound).avail_communities.has(getCharacterCommunity(npc))) {
          (sound as NpcSound).init_npc(npc);
        }
      }
    }
  }
}
