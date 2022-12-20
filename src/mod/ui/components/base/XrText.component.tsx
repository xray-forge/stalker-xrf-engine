import { JSXNode, JSXXML } from "jsx-xml";

import { TFontId } from "@/mod/globals/fonts";
import { IRgbColor, Optional, TTextAlign } from "@/mod/lib/types";

interface IXrTextProps {
  tag?: string;
  color?: IRgbColor;
  label?: Optional<string>;
  font: TFontId;
  align?: TTextAlign;
  vertAlign?: TTextAlign;
  x?: number;
  y?: number;
}

/**
 * Generic component for text rendering.
 */
export function XrText({ tag = "text", font, align, color, x, y, vertAlign, label = null }: IXrTextProps): JSXNode {
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
    label
  );
}
