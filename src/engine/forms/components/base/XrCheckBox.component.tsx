import { JSXNode, JSXXML } from "jsx-xml";

import { normalizeBaseNodeProps } from "#/utils/xml";

import { XrText } from "@/engine/forms/components/base/XrText.component";
import { XrTexture } from "@/engine/forms/components/base/XrTexture.component";
import { TFontId } from "@/engine/lib/constants/fonts";
import { IBaseXmlNode, IRgbColor, THorizontalTextAlign, TLabel, TName, TVerticalTextAlign } from "@/engine/lib/types";

export interface IXrCheckBoxProps extends IBaseXmlNode {
  itemTag?: string;
  stretch?: boolean;
  texture?: TName;
  entry?: string;
  group?: string;
  label?: TLabel;
  color?: IRgbColor | string;
  font?: TFontId;
  align?: THorizontalTextAlign;
  vertAlign?: TVerticalTextAlign;
  textX?: number;
  textY?: number;
}

/**
 * Create a reusable checkbox UI component with an optional texture and label.
 *
 * @param props - Configuration of the checkbox node, including position, texture, entry, group and label.
 * @returns Rendered checkbox component.
 */
export function XrCheckBox(props: IXrCheckBoxProps): JSXNode {
  const {
    tag = "check",
    itemTag,
    x,
    y,
    width,
    height,
    stretch,
    texture = "ui_inGame2_checkbox",
    entry,
    group,
    children = null,
    color,
    font,
    align,
    vertAlign,
    label,
    textY,
    textX,
  } = normalizeBaseNodeProps(props);

  return JSXXML(tag, { x, y, width, height, stretch: stretch === undefined ? "1" : stretch }, [
    <XrTexture>{texture}</XrTexture>,
    JSXXML(itemTag || tag + "_item", { entry, group }),
    label ? (
      <XrText label={label} font={font} color={color} align={align} vertAlign={vertAlign} x={textX} y={textY} />
    ) : null,
    children,
  ]);
}
