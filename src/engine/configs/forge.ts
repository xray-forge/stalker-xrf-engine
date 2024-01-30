/**
 * Configuration of forge with tooling/core description.
 */
export const config = {
  config: {
    // label to display in game menu
    version: `"ver. %s XRF ${0.7}"`,
    intro_videos_enabled: false,
  },
  extensions: {
    enabled: true,
    order_file: "extensions_order.scopo",
  },
  save: {
    // Game save file extension by default.
    extension: ".scop",
    // Game save file extension for dynamic data.
    dynamic_extension: ".scopx",
    // Game save preview file extension by default.
    preview_extension: ".dds",
  },
  debug: {
    enabled: true,
    log_enabled: true,
    profiling_enabled: false,
    simulation_enabled: false,
    /**
     * Is resolving debug enabled.
     * Printing messages each time logger instance is created.
     * Useful to debug circular dependencies and resolving problems.
     */
    resolve_log_enabled: false,
    // Whether lua console logs should be also redirected into separate lua log file.
    separate_lua_log_enabled: true,
  },
};
