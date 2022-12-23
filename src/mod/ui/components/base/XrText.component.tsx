import { JSXNode, JSXXML } from "jsx-xml";

import { fonts, TFontId } from "@/mod/globals/fonts";
import { IBaseXmlNode, IRgbColor, Optional, TTextAlign } from "@/mod/lib/types";

import { normalizeBaseNodeCoordinates } from "#/utils";

export interface IXrTextProps extends IBaseXmlNode {
  tag?: string;
  color?: IRgbColor;
  label?: Optional<string>;
  children?: string;
  font?: TFontId;
  align?: TTextAlign;
  vertAlign?: TTextAlign;
}

/**
 * Generic component for text rendering.
 */
export function XrText(props: IXrTextProps): JSXNode {
  const {
    tag = "text",
    font = fonts.letterica16,
    align,
    color,
    x,
    y,
    vertAlign,
    label = null,
    children = null
  } = normalizeBaseNodeCoordinates(props);

  return JSXXML(
    tag,
    {
      font,
      align,
      vert_align: vertAlign,
      x,
      y,
      r: color?.r,
      g: color?.g,
      b: color?.b
    },
    label || children
  );
}
