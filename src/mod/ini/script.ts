import { newStringField } from "#/utils";

export const IS_LTX: boolean = true;

/**
 * todo;
 */
export const config = {
  common: {
    script: newStringField("_G"),
    levels: null,
    class_registrators: newStringField("register.registerGameClasses"),
    game_type_clsid_factory: newStringField("register.getGameClassId"),
    ui_type_clsid_factory: newStringField("register.getUiClassId"),
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
