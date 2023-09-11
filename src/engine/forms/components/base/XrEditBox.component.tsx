import { JSXNode, JSXXML } from "jsx-xml";

import { normalizeBaseNodeProps } from "#/utils";

import { XrText } from "@/engine/forms/components/base/XrText.component";
import { XrTexture } from "@/engine/forms/components/base/XrTexture.component";
import { fonts, TFontId } from "@/engine/lib/constants/fonts";
import { IBaseXmlNode, IRgbColor, THorizontalTextAlign, TName, TVerticalTextAlign } from "@/engine/lib/types";

export interface IXrEditBoxProps extends IBaseXmlNode {
  texture?: TName;
  color?: IRgbColor;
  font?: TFontId;
  align?: THorizontalTextAlign;
  vertAlign?: TVerticalTextAlign;
  maxSymbolsCount?: number;
}

/**
 * todo;
 */
export function XrEditBox(props: IXrEditBoxProps): JSXNode {
  const {
    tag = "edit_box",
    x,
    y,
    width,
    height,
    texture,
    font,
    align,
    vertAlign,
    maxSymbolsCount,
    color = { r: 170, g: 170, b: 170 },
  } = normalizeBaseNodeProps(props);

  return JSXXML(tag, { width, height, x, y, max_symb_count: maxSymbolsCount }, [
    <XrTexture id={texture} />,
    <XrText x={4} font={font || fonts.letterica18} color={color} align={align} vertAlign={vertAlign} />,
  ]);
}
