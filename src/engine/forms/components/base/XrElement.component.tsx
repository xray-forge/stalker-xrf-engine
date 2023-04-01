import { JSXNode, JSXXML } from "jsx-xml";

import { normalizeBaseNodeProps } from "#/utils";

import { IBaseXmlNode, TName } from "@/engine/lib/types";

export interface IXrRootProps extends IBaseXmlNode {
  tag: TName;
}

/**
 * Basic element to use in forms.
 * Does not bring any component-specific logic.
 */
export function XrElement(props: IXrRootProps): JSXNode {
  const { width, height, x, y } = normalizeBaseNodeProps(props);

  return JSXXML(props.tag, { width, height, x, y }, props.children ?? null);
}
