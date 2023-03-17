import { JSXNode, JSXXML } from "jsx-xml";

import { normalizeBaseNodeProps } from "#/utils";

import { fonts, TFontId } from "@/engine/globals/fonts";
import { IBaseXmlNode, IRgbColor, Optional, TTextAlign } from "@/engine/lib/types";

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
    children = null,
  } = normalizeBaseNodeProps(props);

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
      b: color?.b,
    },
    label || children
  );
}
