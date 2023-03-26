/**
 * Global-level configuration for configs/scripts/forms.
 * Used to define some dev flags/features.
 */
export const gameConfig = {
  /**
   * Affects label in game menu.
   */
  VERSION: "ver %s XRF 0.2",
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
    IS_SMARTS_DEBUG_ENABLED: false,
    /**
     * Is resolving debug enabled.
     * Printing messages each time logger instance is created.
     * Useful to debug circular dependencies and resolving problems.
     */
    IS_RESOLVE_LOG_ENABLED: false,
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
   * Whether game intros are enabled.
   */
  GAME_SAVE_EXTENSION: ".scop",
};
