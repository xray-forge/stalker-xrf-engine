import { JSXNode, JSXXML } from "jsx-xml";

import { normalizeBaseNodeProps } from "#/utils";

import { fonts, TFontId } from "@/engine/lib/constants/fonts";
import { IBaseXmlNode } from "@/engine/lib/types";

export interface IXrListComponentProps extends IBaseXmlNode {
  font?: TFontId;
  itemHeight: number;
  canSelect?: boolean;
}

export function XrList(props: IXrListComponentProps): JSXNode {
  const {
    tag = "list",
    x,
    y,
    width,
    height,
    canSelect,
    itemHeight,
    font = fonts.letterica16,
    children = null,
  } = normalizeBaseNodeProps(props);

  return JSXXML(
    tag,
    {
      x,
      y,
      width,
      height,
      item_height: itemHeight,
      can_select: canSelect,
    },
    [children, <font font={font} />]
  );
}
