import { JSXNode, JSXXML } from "jsx-xml";

import { normalizeBaseNodeProps } from "#/utils/xml";

import { IBaseXmlNode } from "@/engine/forms/types";
import { fonts, TFontId } from "@/engine/lib/constants/fonts";

export interface IXrListComponentProps extends IBaseXmlNode {
  font?: TFontId;
  itemHeight: number;
  canSelect?: boolean;
}
/**
 * Create a reusable list UI component rendering a set of items with a configurable font.
 *
 * @param props - Configuration of the list node, including position, size, item height and font.
 * @returns Rendered list component.
 */
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
