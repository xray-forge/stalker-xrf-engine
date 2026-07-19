import { JSXNode, JSXXML } from "jsx-xml";
import { TName } from "xray16/lib";

import { normalizeBaseNodeProps } from "#/utils/xml";

import { IRgbColor } from "@/engine/constants/colors";
import { fonts, TFontId } from "@/engine/constants/fonts";
import { XrText } from "@/engine/forms/components/base/XrText.component";
import { XrTexture } from "@/engine/forms/components/base/XrTexture.component";
import { IBaseXmlNode, THorizontalTextAlign, TVerticalTextAlign } from "@/engine/forms/types";

export interface IXrEditBoxProps extends IBaseXmlNode {
  texture?: TName;
  color?: IRgbColor;
  font?: TFontId;
  align?: THorizontalTextAlign;
  vertAlign?: TVerticalTextAlign;
  maxSymbolsCount?: number;
}

/**
 * Create a reusable text edit box UI component with a texture and text.
 *
 * @param props - Configuration of the edit box node, including position, size, texture, font and color.
 * @returns Rendered edit box component.
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
