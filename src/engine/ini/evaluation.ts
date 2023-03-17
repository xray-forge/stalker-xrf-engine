import { newStringField, quoted } from "#/utils";

export const IS_LTX: boolean = true;

/**
 * todo;
 * todo: Probably not used anywhere.
 */
export const config = {
  evaluation: {
    line1: newStringField(quoted("")),
    line2: newStringField(quoted("")),
    line3: newStringField(quoted("")),
  },
};
