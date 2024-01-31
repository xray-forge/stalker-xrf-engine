import { IDynamicMusicDescriptor } from "@/engine/core/managers/sounds";

export const musicConfig = {
  MAX_DIST: 100,
  MIN_DIST: 75,
  TRACK_SWITCH_DELTA: 3000,
  THEME_FADE_UPDATE_STEP: 100,
  LOGIC_UPDATE_STEP: 300,
  AMBIENT_FADE_UPDATE_DELTA: 200,
  dynamicMusicThemes: $fromArray<IDynamicMusicDescriptor>([
    {
      files: $fromArray([
        "music\\combat\\theme1_part_1",
        "music\\combat\\theme1_part_2",
        "music\\combat\\theme1_part_3",
      ]),
    },
    {
      files: $fromArray([
        "music\\combat\\theme2_part_1",
        "music\\combat\\theme2_part_2",
        "music\\combat\\theme2_part_3",
      ]),
    },
    {
      files: $fromArray([
        "music\\combat\\theme3_part_1",
        "music\\combat\\theme3_part_2",
        "music\\combat\\theme3_part_3",
      ]),
    },
    {
      files: $fromArray([
        "music\\combat\\theme4_part_1",
        "music\\combat\\theme4_part_2",
        "music\\combat\\theme4_part_3",
      ]),
    },
  ]),
};
