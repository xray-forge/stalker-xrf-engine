import { sounds, TSound } from "@/engine/lib/constants/sound/sounds";
import { LuaArray, Optional, TName } from "@/engine/lib/types";

/**
 * todo: Description.
 */
export interface IDynamicMusicDescriptor {
  maps?: Optional<TName>;
  files: LuaArray<TSound>;
}

/**
 * todo: Description.
 */
export const dynamicMusicThemes: LuaArray<IDynamicMusicDescriptor> = [
  {
    files: [sounds.music_combat_theme1_part_1, sounds.music_combat_theme1_part_2, sounds.music_combat_theme1_part_3],
  },
  {
    files: [sounds.music_combat_theme2_part_1, sounds.music_combat_theme2_part_2, sounds.music_combat_theme2_part_3],
  },
  {
    files: [sounds.music_combat_theme3_part_1, sounds.music_combat_theme3_part_2, sounds.music_combat_theme3_part_3],
  },
  {
    files: [sounds.music_combat_theme4_part_1, sounds.music_combat_theme4_part_2, sounds.music_combat_theme4_part_3],
  },
] as unknown as LuaArray<IDynamicMusicDescriptor>;
