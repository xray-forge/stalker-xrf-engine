export const BUILD_PARAMS = {
  IS_CLEAN_BUILD: process.argv.includes("--clean"),
  IS_LUA_LOGGER_DISABLED: process.argv.includes("--no-lua-logs"),
  IS_VERBOSE_BUILD: process.argv.includes("--verbose"),
  ARE_STATIC_RESOURCES_ENABLED: !process.argv.includes("--no-resources"),
  ARE_UI_RESOURCES_ENABLED: !process.argv.includes("--no-ui"),
  ARE_SCRIPT_RESOURCES_ENABLED: !process.argv.includes("--no-scripts"),
  ARE_CONFIG_RESOURCES_ENABLED: !process.argv.includes("--no-configs"),
  ARE_TRANSLATION_RESOURCES_ENABLED: !process.argv.includes("--no-translations"),
};
