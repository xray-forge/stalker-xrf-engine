/**
 * List of alias normally configured in fsgame.ltx file.
 * Used in game engine to calculate paths for files access.
 * Part of filesystem protection mechanism.
 */
export const roots = {
  appDataRoot: "$app_data_root$", // _appdata_\
  archDirLevels: "$arch_dir_levels$", //  levels\
  archDirLocalization: "$arch_dir_localization$", //  localization\
  archDirPatches: "$arch_dir_patches$", //  patches\
  archDirResources: "$arch_dir_resources$", //  resources\
  downloads: "$downloads$", // _appdata_\
  fsRoot: "$fs_root$", // \
  gameAi: "$game_ai$", //  gamedata\ai\
  gameAnims: "$game_anims$", //  gamedata\anims\ *.anm;*.anms
  gameArchMp: "$game_arch_mp$", // mp\
  gameConfig: "$game_config$", //  gamedata\configs\
  gameData: "$game_data$", //  gamedata\
  gameDm: "$game_dm$", //  gamedata\meshes\ *.dm
  gameLevels: "$game_levels$", //  gamedata\levels\
  gameMeshes: "$game_meshes$", //  gamedata\meshes\ *.ogf;*.omf
  gameSaves: "$game_saves$", // _appdata_\savedgames\
  gameScripts: "$game_scripts$", //  gamedata\scripts\ *.script
  gameShaders: "$game_shaders$", //  gamedata\shaders\
  gameSounds: "$game_sounds$", //  gamedata\sounds\
  gameSpawn: "$game_spawn$", //  gamedata\spawns\
  gameTextures: "$game_textures$", //  gamedata\textures\
  gameWeatherEffects: "$game_weather_effects$", //  gamedata\configs\ environment\weather_effects
  gameWeathers: "$game_weathers$", //  gamedata\configs\environment\weathers
  level: "$level$", //  gamedata\levels\
  logs: "$logs$", // _appdata_\logs\
  screenshots: "$screenshots$", // _appdata_\screenshots\
  textures: "$textures$", //  gamedata\textures\
} as const;
