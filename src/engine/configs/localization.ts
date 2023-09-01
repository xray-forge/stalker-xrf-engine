import { default as projectConfig } from "#/config.json";

/**
 * Configuration of game active locale.
 */
export const config = {
  string_table: {
    language: process.env.language ?? projectConfig.locale,
    font_prefix: "", // ;_west ;_cent
  },
};
