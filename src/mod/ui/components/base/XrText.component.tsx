import { JSXNode, JSXXML } from "jsx-xml";

import { TFontId } from "@/mod/globals/fonts";
import { IRgbColor, Optional, TTextAlign } from "@/mod/lib/types";

import { normalizeBaseNodeCoordinates } from "#/utils";

export interface IXrTextProps {
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
export function XrText(props: IXrTextProps): JSXNode {
  const { tag = "text", font, align, color, x, y, vertAlign, label = null } = normalizeBaseNodeCoordinates(props);

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
