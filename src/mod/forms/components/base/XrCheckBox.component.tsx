import { JSXNode, JSXXML } from "jsx-xml";

import { normalizeBaseNodeProps } from "#/utils";

import { XrTexture } from "@/mod/forms/components/base/XrTexture.component";
import { texturesIngame, TTexture } from "@/mod/globals/textures";
import { IBaseXmlNode } from "@/mod/lib/types";

export interface IXrCheckBoxProps extends IBaseXmlNode {
  itemTag?: string;

  stretch?: boolean;
  texture?: TTexture;

  entry?: string;
  group?: string;
}

export function XrCheckBox(props: IXrCheckBoxProps): JSXNode {
  const {
    tag = "check",
    itemTag,
    x,
    y,
    width,
    height,
    stretch,
    texture = texturesIngame.ui_inGame2_checkbox,
    entry,
    group,
    children = null,
  } = normalizeBaseNodeProps(props);

  return JSXXML(tag, { x, y, width, height, stretch: stretch === undefined ? "1" : stretch }, [
    <XrTexture>{texture}</XrTexture>,
    JSXXML(itemTag || tag + "_item", { entry, group }),
    children,
  ]);
}
