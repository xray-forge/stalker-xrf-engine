import { JSXNode, JSXXML } from "jsx-xml";

import { normalizeBaseNodeProps } from "#/utils";

import { XrText } from "@/mod/forms/components/base/XrText.component";
import { XrTexture } from "@/mod/forms/components/base/XrTexture.component";
import { fonts, TFontId } from "@/mod/globals/fonts";
import { TTexture } from "@/mod/globals/textures";
import { IBaseXmlNode, IRgbColor, TTextAlign } from "@/mod/lib/types";

export interface IXrEditBoxProps extends IBaseXmlNode {
  texture?: TTexture;
  color?: IRgbColor;
  font?: TFontId;
  align?: TTextAlign;
  vertAlign?: TTextAlign;
  maxSymbolsCount?: number;
}

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
