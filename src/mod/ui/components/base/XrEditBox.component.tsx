import { JSXNode, JSXXML } from "jsx-xml";

import { fonts, TFontId } from "@/mod/globals/fonts";
import { TTextureId } from "@/mod/globals/textures";
import { IBaseXmlNode, IRgbColor } from "@/mod/lib/types";
import { XrText } from "@/mod/ui/components/base/XrText.component";
import { XrTexture } from "@/mod/ui/components/base/XrTexture.component";

interface IXrEditBoxProps extends IBaseXmlNode {
  texture?: TTextureId;
  color?: IRgbColor;
  font?: TFontId;
}

export function XrEditBox({
  tag = "edit_box",
  x,
  y,
  width,
  height,
  texture,
  font,
  color = { r: 170, g: 170, b: 170 }
}: IXrEditBoxProps): JSXNode {
  return JSXXML(tag, { width, height, x, y }, [
    <XrTexture id={texture} />,
    <XrText font={font || fonts.letterica16} color={color} />
  ]);
}
