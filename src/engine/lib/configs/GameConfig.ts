/**
 * Global-level configuration for configs/scripts/forms.
 * Used to define some dev flags/features.
 *
 * todo: Move some fields to ltx file?
 */
export const gameConfig = {
  /**
   * Affects label in game menu.
   */
  VERSION: "ver %s XRF 0.5",
  /**
   * Whether extensions are enabled.
   */
  EXTENSIONS_ENABLED: true,
  /**
   * Debug settings.
   */
  DEBUG: {
    /**
     * Is debug mode enabled.
     */
    IS_ENABLED: true,
    /**
     * Enable debugging log modules.
     */
    IS_LOG_ENABLED: true,
    /**
     * Enable profiling manager utils at game init.
     */
    IS_PROFILING_ENABLED: false,
    /**
     * Is debug mode for smarts enabled (display on map).
     */
    IS_SIMULATION_DEBUG_ENABLED: false,
    /**
     * Is resolving debug enabled.
     * Printing messages each time logger instance is created.
     * Useful to debug circular dependencies and resolving problems.
     */
    IS_RESOLVE_LOG_ENABLED: false,
    /**
     * Whether lua console logs should be also redirected into separate lua log file.
     */
    IS_SEPARATE_LUA_LOG_ENABLED: true,
  },
  /**
   * Base sizing for templates in UI.
   */
  UI: {
    ARE_INTRO_VIDEOS_ENABLED: false,
    BASE_WIDTH: 1024,
    BASE_HEIGHT: 768,
  },
  /**
   * Game save file extension by default.
   */
  GAME_SAVE_EXTENSION: ".scop",
  /**
   * Game save file extension for dynamic data.
   */
  GAME_SAVE_DYNAMIC_EXTENSION: ".scop_a",
  /**
   * Game save preview file extension by default.
   */
  GAME_SAVE_PREVIEW_EXTENSION: ".dds",
  /**
   * Game save extensions order file name.
   */
  GAME_SAVE_EXTENSIONS_ORDER_FILE: "extensions_order.scop_e",
};
