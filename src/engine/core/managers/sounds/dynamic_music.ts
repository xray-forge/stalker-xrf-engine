import { LuaArray, Optional, TName } from "@/engine/lib/types";

/**
 * Dynamic theme playlist descriptor.
 */
export interface IDynamicMusicDescriptor {
  maps?: Optional<TName>;
  files: LuaArray<TName>;
}

/**
 * List of possible themes for dynamic music playback if it is turned on.
 */
export const dynamicMusicThemes: LuaArray<IDynamicMusicDescriptor> = $fromArray<IDynamicMusicDescriptor>([
  {
    files: $fromArray(["music_combat_theme1_part_1", "music_combat_theme1_part_2", "music_combat_theme1_part_3"]),
  },
  {
    files: $fromArray(["music_combat_theme2_part_1", "music_combat_theme2_part_2", "music_combat_theme2_part_3"]),
  },
  {
    files: $fromArray(["music_combat_theme3_part_1", "music_combat_theme3_part_2", "music_combat_theme3_part_3"]),
  },
  {
    files: $fromArray(["music_combat_theme4_part_1", "music_combat_theme4_part_2", "music_combat_theme4_part_3"]),
  },
]);
