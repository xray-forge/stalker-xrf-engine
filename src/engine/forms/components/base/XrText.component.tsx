import { JSXNode, JSXXML } from "jsx-xml";
import { Nullable } from "xray16/lib";

import { normalizeBaseNodeProps } from "#/utils/xml";

import { IRgbColor } from "@/engine/constants/colors";
import { fonts, TFontId } from "@/engine/constants/fonts";
import { IBaseXmlNode, THorizontalTextAlign, TVerticalTextAlign } from "@/engine/forms/types";

export interface IXrTextProps extends IBaseXmlNode {
  tag?: string;
  label?: Nullable<string>;
  children?: string;
  complexMode?: boolean;
  color?: IRgbColor | string;
  font?: TFontId;
  align?: THorizontalTextAlign;
  vertAlign?: TVerticalTextAlign;
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
    complexMode,
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
      complex_mode: complexMode,
      x,
      y,
      r: typeof color === "object" ? color.r : undefined,
      g: typeof color === "object" ? color.g : undefined,
      b: typeof color === "object" ? color.b : undefined,
    },
    label || children
  );
}
