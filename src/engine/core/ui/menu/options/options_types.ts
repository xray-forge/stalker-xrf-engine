/* eslint sort-keys-fix/sort-keys-fix: "error" */

/**
 * Available option groups for toggling in game settings menu.
 */
export enum EOptionGroup {
  KEY_BINDINGS = "key_binding",
  MULTIPLAYER_CLIENT = "mm_mp_client",
  MULTIPLAYER_SERVER = "mm_mp_server",
  MULTIPLAYER_SERVER_FILTER = "mm_mp_srv_filter",
  OPTIONS_CONTROLS = "mm_opt_controls",
  OPTIONS_GAMEPLAY = "mm_opt_gameplay",
  OPTIONS_SOUND = "mm_opt_sound",
  OPTIONS_VIDEO = "mm_opt_video",
  OPTIONS_VIDEO_ADVANCED = "mm_opt_video_adv",
  OPTIONS_VIDEO_PRESET = "mm_opt_video_preset",
}

export enum EGameRenderer {
  R1 = 0,
  R2A = 1,
  R2 = 2,
  R25 = 3,
  R3 = 4,
  R4 = 5,
}

/**
 * todo;
 */
export const optionGroupsMessages = {
  set_default_value: "set_default_value",
} as const;
