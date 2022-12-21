/**
 * Global-level configuration for configs/scripts/forms.
 * Used to define some dev flags/features.
 */
export const gameConfig = {
  /**
   * Affects label in game menu.
   */
  VERSION: "ver %s XRTS 0.1",
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
     * Is resolving debug enabled.
     * Printing messages each time logger instance is created.
     * Based on DEBUG_LOG setting.
     */
    IS_RESOLVE_LOG_ENABLED: true,
    /**
     * Global prefix for lua debug logger in project.
     */
    GLOBAL_LOG_PREFIX: "[XRTS-DL]"
  },
  /**
   * Base sizing for templates in UI.
   */
  UI: {
    ARE_INTRO_VIDEOS_ENABLED: false,
    BASE_WIDTH: 1024,
    BASE_HEIGHT: 768
  },
  /**
   * Whether game intros are enabled.
   */
  GAME_SAVE_EXTENSION: ".scop"
};
