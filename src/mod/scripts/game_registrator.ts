export function register_impl(object_factory: XR_object_factory): void {}

export function get_game_clsid_impl(game_type_option: any, isServer: boolean): string {
  if (isServer === true) {
    if (game_type_option === "single") {
      return "SV_SINGL";
    }

    if (game_type_option === "deathmatch") {
      return "SV_DM";
    }

    if (game_type_option === "teamdeathmatch") {
      return "SV_TDM";
    }

    if (game_type_option === "artefacthunt") {
      return "SV_AHUNT";
    }

    if (game_type_option === "capturetheartefact") {
      return "SV_CTA";
    }
  }

  if (isServer === false) {
    if (game_type_option === "single") {
      return "CL_SINGL";
    }

    if (game_type_option === "deathmatch") {
      return "CL_DM";
    }

    if (game_type_option === "teamdeathmatch") {
      return "CL_TDM";
    }

    if (game_type_option === "artefacthunt") {
      return "CL_AHUNT";
    }

    if (game_type_option === "capturetheartefact") {
      return "CL_CTA";
    }
  }

  return "";
}

register = register_impl;
get_game_clsid = get_game_clsid_impl;
