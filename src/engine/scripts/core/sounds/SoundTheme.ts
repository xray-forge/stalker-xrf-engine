import { XR_game_object } from "xray16";

import { registry, SCRIPT_SOUND_LTX } from "@/engine/scripts/core/database";
import { ActorSound } from "@/engine/scripts/core/sounds/playable_sounds/ActorSound";
import { EPlayableSound } from "@/engine/scripts/core/sounds/playable_sounds/EPlayableSound";
import { LoopedSound } from "@/engine/scripts/core/sounds/playable_sounds/LoopedSound";
import { NpcSound } from "@/engine/scripts/core/sounds/playable_sounds/NpcSound";
import { ObjectSound } from "@/engine/scripts/core/sounds/playable_sounds/ObjectSound";
import { getCharacterCommunity } from "@/engine/scripts/utils/alife";
import { getConfigString } from "@/engine/scripts/utils/config";
import { abort } from "@/engine/scripts/utils/debug";
import { LuaLogger } from "@/engine/scripts/utils/logging";
import { resetTable } from "@/engine/scripts/utils/table";

const logger: LuaLogger = new LuaLogger($filename);

export class SoundTheme {
  public static loadSound(): void {
    if (!SCRIPT_SOUND_LTX.section_exist("list")) {
      abort("There is no section [list] in script_sound.ltx");
    }

    const n: number = SCRIPT_SOUND_LTX.line_count("list");

    resetTable(registry.sounds.themes);

    for (const i of $range(0, n - 1)) {
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
