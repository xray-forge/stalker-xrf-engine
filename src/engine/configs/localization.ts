import { default as projectConfig } from "#/config.json";

/**
 * Configuration of game active locale.
 */
export const config = {
  string_table: {
    language: projectConfig.locale,
    font_prefix: "", // ;_west ;_cent
  },
};
