import { newStringField } from "#/utils";

export const IS_LTX: boolean = true;

/**
 * todo;
 */
export const config = {
  common: {
    script: newStringField("_G"),
    levels: null,
    class_registrators: newStringField("register.register_classes"),
    game_type_clsid_factory: newStringField("register.get_game_clsid"),
    ui_type_clsid_factory: newStringField("register.get_ui_clsid"),
  },
  single: {
    script: null,
  },
  deathmatch: {
    script: null,
  },
  teamdeathmatch: {
    script: null,
  },
  artefacthunt: {
    script: null,
  },
  lastingame: {
    script: null,
  },
};
