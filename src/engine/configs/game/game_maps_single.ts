import { newFloatField, newFloatsField, newStringField } from "#/utils";

import { levels } from "@/engine/lib/constants/levels";

export const IS_LTX: boolean = true;

/**
 * todo;
 */
export const config = {
  ___level_music_tracks: {
    "music\\marsh_night": newFloatsField([0, 8, 0.25, 10, 20]),
    "music\\marsh_2  ": newFloatsField([8, 24, 0.25, 5, 25]),
  },
  def_map: {
    bound_rect: newFloatsField([-10000.0, -10000.0, 10000.0, 10000.0]),
    texture: newStringField("ui\\ui_nomap2"),
  },
  global_map: {
    bound_rect: newFloatsField([0.0, 0.0, 1024, 1024.0]),
    max_zoom: newFloatField(6.0),
    texture: newStringField("ui\\ui_global_map"),
  },
  level_maps_single: {
    [levels.zaton]: newStringField(""),
    [levels.jupiter]: newStringField(""),
    [levels.jupiter_underground]: newStringField(""),
    [levels.pripyat]: newStringField(""),
    [levels.labx8]: newStringField(""),
  },
  [levels.zaton]: {
    global_rect: newFloatsField([307.0, 90.0, 717.0, 500.0]),
    music_tracks: newStringField("zaton_musics"),
    weathers: newStringField("dynamic_default"),
  },
  [levels.jupiter]: {
    global_rect: newFloatsField([68.0, 563.0, 478.0, 973.0]),
    music_tracks: newStringField("jupiter_musics"),
    weathers: newStringField("dynamic_default"),
  },
  [levels.jupiter_underground]: {
    global_rect: newFloatsField([570.0, 884.0, 571.0, 885.0]),
    music_tracks: newStringField("underground_musics"),
    weathers: newStringField("indoor_ambient"),
  },
  [levels.pripyat]: {
    global_rect: newFloatsField([580.0, 564.0, 954.0, 938.0]),
    music_tracks: newStringField("pripyat_musics"),
    weathers: newStringField("dynamic_default"),
  },
  [levels.labx8]: {
    global_rect: newFloatsField([746.0, 719.0, 747.0, 720.0]),
    music_tracks: newStringField("underground_musics"),
    weathers: newStringField("indoor"),
  },
};
