import { JSXNode, JSXXML } from "jsx-xml";

import { textures, TTextureId } from "@/mod/globals/textures";
import { IBaseXmlNode } from "@/mod/lib/types";
import { XrTexture } from "@/mod/ui/components/base/XrTexture.component";

import { normalizeBaseNodeCoordinates } from "#/utils";

export interface IXrCheckBoxProps extends IBaseXmlNode {
  itemTag?: string;

  stretch?: boolean;
  texture?: TTextureId;

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
    texture = textures.ui_inGame2_checkbox,
    entry,
    group,
    children = null
  } = normalizeBaseNodeCoordinates(props);

  return JSXXML(tag, { x, y, width, height, stretch: stretch === undefined ? "1" : stretch }, [
    <XrTexture>{texture}</XrTexture>,
    JSXXML(itemTag || tag + "_item", { entry, group }),
    children
  ]);
}
