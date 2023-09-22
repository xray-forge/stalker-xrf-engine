import { JSXNode, JSXXML } from "jsx-xml";

import { normalizeBaseNodeProps } from "#/utils/xml";

import { IBaseXmlNode } from "@/engine/lib/types";

export interface IXrRootProps extends IBaseXmlNode {}

/**
 * todo;
 */
export function XrRoot(props: IXrRootProps): JSXNode {
  const { width, height, x, y } = normalizeBaseNodeProps(props);

  return JSXXML(props.tag ?? "w", { width, height, x, y }, props.children ?? null);
}
