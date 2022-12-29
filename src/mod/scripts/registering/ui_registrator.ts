import type { Maybe } from "@/mod/lib/types";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("ui_registrator");

// todo: Magic constants.
export function getUiClsId(gameType: string): Maybe<string> {
  if (gameType == "single") {
    return "UI_SINGL";
  }

  if (gameType == "deathmatch") {
    return "UI_DM";
  }

  if (gameType == "teamdeathmatch") {
    return "UI_TDM";
  }

  if (gameType == "artefacthunt") {
    return "UI_AHUNT";
  }

  if (gameType == "capturetheartefact") {
    return "UI_CTA";
  }
}
