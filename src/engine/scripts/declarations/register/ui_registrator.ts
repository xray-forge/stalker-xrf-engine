import type { Maybe } from "@/engine/lib/types";
import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo; Magic constants.
 */
export function getUiClassId(gameType: string): Maybe<string> {
  if (gameType === "single") {
    return "UI_SINGL";
  }

  if (gameType === "deathmatch") {
    return "UI_DM";
  }

  if (gameType === "teamdeathmatch") {
    return "UI_TDM";
  }

  if (gameType === "artefacthunt") {
    return "UI_AHUNT";
  }

  if (gameType === "capturetheartefact") {
    return "UI_CTA";
  }
}
