/**
 * List of alias normally configured in fsgame.ltx file.
 * Used in game engine to calculate paths for files access.
 * Part of filesystem protection mechanism.
 */
export const roots = {
  appDataRoot: "$app_data_root$", // _appdata_\
  gameArchMp: "$game_arch_mp$", // mp\
  archDirLevels: "$arch_dir_levels$", //  levels\
  archDirResources: "$arch_dir_resources$", //  resources\
  archDirLocalization: "$arch_dir_localization$", //  localization\
  archDirPatches: "$arch_dir_patches$", //  patches\
  logs: "$logs$", // _appdata_\logs\
  screenshots: "$screenshots$", // _appdata_\screenshots\
  gameSaves: "$game_saves$", // _appdata_\savedgames\
  downloads: "$downloads$", // _appdata_\
  gameData: "$game_data$", //  gamedata\
  gameAi: "$game_ai$", //  gamedata\ai\
  gameSpawn: "$game_spawn$", //  gamedata\spawns\
  gameLevels: "$game_levels$", //  gamedata\levels\
  gameMeshes: "$game_meshes$", //  gamedata\meshes\ *.ogf;*.omf
  gameAnims: "$game_anims$", //  gamedata\anims\ *.anm;*.anms
  gameDm: "$game_dm$", //  gamedata\meshes\ *.dm
  gameShaders: "$game_shaders$", //  gamedata\shaders\
  gameSounds: "$game_sounds$", //  gamedata\sounds\
  gameTextures: "$game_textures$", //  gamedata\textures\
  gameConfig: "$game_config$", //  gamedata\configs\
  gameWeatherEffects: "$game_weather_effects$", //  gamedata\configs\ environment\weather_effects
  gameWeathers: "$game_weathers$", //  gamedata\configs\environment\weathers
  gameScripts: "$game_scripts$", //  gamedata\scripts\ *.script
  level: "$level$", //  gamedata\levels\
  textures: "$textures$", //  gamedata\textures\
} as const;
