import { JSXNode, JSXXML } from "jsx-xml";

import { normalizeBaseNodeProps } from "#/utils";

import { fonts, TFontId } from "@/engine/lib/constants/fonts";
import { IBaseXmlNode, IRgbColor, Optional, TTextAlign } from "@/engine/lib/types";

export interface IXrTextProps extends IBaseXmlNode {
  tag?: string;
  color?: IRgbColor | string;
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
      color: typeof color === "string" ? color : undefined,
      font,
      align,
      vert_align: vertAlign,
      x,
      y,
      r: typeof color === "object" ? color.r : undefined,
      g: typeof color === "object" ? color.g : undefined,
      b: typeof color === "object" ? color.b : undefined,
    },
    label || children
  );
}
