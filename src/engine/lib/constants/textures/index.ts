import { fileTextures } from "@/engine/lib/constants/textures/file_textures";
import { iconTextures } from "@/engine/lib/constants/textures/icon_textures";
import { inGameTextures } from "@/engine/lib/constants/textures/ingame_textures";

export const textures = {
  ...fileTextures,
  ...inGameTextures,
  ...iconTextures,
};

/**
 * todo;
 */
export type TTextures = typeof fileTextures & typeof inGameTextures;

/**
 * todo;
 */
export type TTexture = TTextures[keyof TTextures];
