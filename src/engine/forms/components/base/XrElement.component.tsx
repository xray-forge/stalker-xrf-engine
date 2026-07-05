import { JSXNode, JSXXML } from "jsx-xml";
import { TName } from "xray16/lib";

import { normalizeBaseNodeProps } from "#/utils/xml";

import { IBaseXmlNode } from "@/engine/lib/types";

export interface IXrElementProps extends IBaseXmlNode {
  tag: TName;
}

/**
 * Basic element to use in forms.
 * Does not bring any component-specific logic.
 */
export function XrElement(props: IXrElementProps & Record<string, number | string | JSXNode>): JSXNode {
  const { width, height, x, y, ...rest } = normalizeBaseNodeProps(props);

  return JSXXML(props.tag, { width, height, x, y, ...rest }, props.children ?? null);
}
