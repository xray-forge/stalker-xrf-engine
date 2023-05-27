import { default as projectConfig } from "#/config.json";
import { newStringField } from "#/utils";

export const IS_LTX: boolean = true;

/**
 * todo;
 */
export const config = {
  string_table: {
    language: projectConfig.locale,
    font_prefix: newStringField("", { comment: "_west | _cent" }),
  },
};
