import { JSXNode, JSXXML } from "jsx-xml";

import { fonts, TFontId } from "@/mod/globals/fonts";
import { TTextureId } from "@/mod/globals/textures";
import { IBaseXmlNode, IRgbColor, TTextAlign } from "@/mod/lib/types";
import { XrText } from "@/mod/ui/components/base/XrText.component";
import { XrTexture } from "@/mod/ui/components/base/XrTexture.component";

interface IXrEditBoxProps extends IBaseXmlNode {
  texture?: TTextureId;
  color?: IRgbColor;
  font?: TFontId;
  align?: TTextAlign;
  vertAlign?: TTextAlign;
  maxSymbolsCount?: number;
}

export function XrEditBox({
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
  color = { r: 170, g: 170, b: 170 }
}: IXrEditBoxProps): JSXNode {
  return JSXXML(tag, { width, height, x, y, max_symb_count: maxSymbolsCount }, [
    <XrTexture id={texture} />,
    <XrText x={4} font={font || fonts.letterica18} color={color} align={align} vertAlign={vertAlign} />
  ]);
}
