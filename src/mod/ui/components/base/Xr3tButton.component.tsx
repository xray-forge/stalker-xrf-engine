import { JSXNode, JSXXML } from "jsx-xml";

import { TFontId } from "@/mod/globals/fonts";
import { TTextureId } from "@/mod/globals/textures";
import { IRgbColor, TTextAlign } from "@/mod/lib/types";
import { XrTextColor } from "@/mod/ui/components/base/XrTextColor.component";
import { XrTexture } from "@/mod/ui/components/base/XrTexture.component";

interface IXrButtonProps {
  id?: string;
  /**
   * Enable custom tag name for button elements.
   */
  tag?: string;
  x: number;
  y: number;
  height: number;
  width: number;
  label: string;
  font: TFontId;
  textColor: IRgbColor;
  texture: TTextureId;
  align?: TTextAlign;
  stretch?: boolean;
}

/**
 * Generic component for button rendering.
 */
export function Xr3tButton({
  tag = "button",
  id,
  x,
  y,
  width,
  height,
  align = "c",
  texture,
  font,
  label,
  textColor,
  stretch = true
}: IXrButtonProps): JSXNode {
  return JSXXML(tag, {
    id,
    x,
    y,
    width,
    height,
    stretch: stretch ? "1" : "0"
  }, [
    <text font={font} align={align}>{label}</text>,
    <XrTexture id={texture}/>,
    <XrTextColor textColor={textColor}/>
  ]);
}
