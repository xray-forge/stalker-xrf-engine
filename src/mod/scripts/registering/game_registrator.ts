import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("game_registrator");

export function getGameClsId(gameTypeOption: string, isServer: boolean): string {
  log.info("Return game clsId:", gameTypeOption, isServer);

  if (isServer === true) {
    if (gameTypeOption === "single") {
      return "SV_SINGL";
    }

    if (gameTypeOption === "deathmatch") {
      return "SV_DM";
    }

    if (gameTypeOption === "teamdeathmatch") {
      return "SV_TDM";
    }

    if (gameTypeOption === "artefacthunt") {
      return "SV_AHUNT";
    }

    if (gameTypeOption === "capturetheartefact") {
      return "SV_CTA";
    }
  }

  if (isServer === false) {
    if (gameTypeOption === "single") {
      return "CL_SINGL";
    }

    if (gameTypeOption === "deathmatch") {
      return "CL_DM";
    }

    if (gameTypeOption === "teamdeathmatch") {
      return "CL_TDM";
    }

    if (gameTypeOption === "artefacthunt") {
      return "CL_AHUNT";
    }

    if (gameTypeOption === "capturetheartefact") {
      return "CL_CTA";
    }
  }

  return "";
}
