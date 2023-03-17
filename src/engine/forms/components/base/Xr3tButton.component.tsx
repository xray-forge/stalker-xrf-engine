import { JSXNode, JSXXML } from "jsx-xml";

import { normalizeBaseNodeProps } from "#/utils";

import { XrTextColor } from "@/engine/forms/components/base/XrTextColor.component";
import { XrTexture } from "@/engine/forms/components/base/XrTexture.component";
import { TFontId } from "@/engine/lib/constants/fonts";
import { TTexture } from "@/engine/lib/constants/textures";
import { IBaseXmlNode, IRgbColor, TTextAlign } from "@/engine/lib/types";

export interface IXrButtonProps extends IBaseXmlNode {
  id?: string;
  /**
   * Enable custom tag name for button elements.
   */
  tag?: string;
  label: string;
  font: TFontId;
  textColor: IRgbColor;
  texture: TTexture;
  align?: TTextAlign;
  stretch?: boolean;
}

/**
 * Generic component for button rendering.
 */
export function Xr3tButton(props: IXrButtonProps): JSXNode {
  const {
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
    stretch = true,
  } = normalizeBaseNodeProps(props);

  return JSXXML(
    tag,
    {
      id,
      x,
      y,
      width,
      height,
      stretch: stretch ? "1" : "0",
    },
    [
      <text font={font} align={align}>
        {label}
      </text>,
      <XrTexture id={texture} />,
      <XrTextColor textColor={textColor} />,
    ]
  );
}
