/**
 * Global-level configuration for configs/scripts/forms.
 * Used to define some dev flags/features.
 */
export const gameConfig = {
  /**
   * Affects label in game menu.
   */
  VERSION: "ver %s XRTS 0.1",
  /**
   * Debug settings.
   */
  DEBUG: {
    /**
     * Is debug mode enabled.
     */
    IS_ENABLED: true,
    /**
     * Is debug mode for smarts enabled (display on map).
     */
    IS_SMARTS_DEBUG_ENABLED: true,
    /**
     * Is debug mode for state management / animations enabled.
     */
    IS_STATE_MANAGEMENT_DEBUG_ENABLED: true,
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
    GLOBAL_LOG_PREFIX: "[XRTS]"
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
