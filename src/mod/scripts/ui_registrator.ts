import type { Definable } from "@/mod/lib/types";

// todo: Magic constants.
function get_ui_clsid_impl(game_type_option: string): Definable<string> {
  if (game_type_option == "single") {
    return "UI_SINGL";
  }

  if (game_type_option == "deathmatch") {
    return "UI_DM";
  }

  if (game_type_option == "teamdeathmatch") {
    return "UI_TDM";
  }

  if (game_type_option == "artefacthunt") {
    return "UI_AHUNT";
  }

  if (game_type_option == "capturetheartefact") {
    return "UI_CTA";
  }
}

get_ui_clsid = get_ui_clsid_impl;
