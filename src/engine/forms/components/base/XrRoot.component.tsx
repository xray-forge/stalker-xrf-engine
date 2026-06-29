import { JSXNode, JSXXML } from "jsx-xml";

import { normalizeBaseNodeProps } from "#/utils/xml";

import { IBaseXmlNode } from "@/engine/lib/types";

export interface IXrRootProps extends IBaseXmlNode {}

/**
 * Create a reusable root window UI component wrapping its children.
 *
 * @param props - Configuration of the root node, including position, size and children.
 * @returns Rendered root window component.
 */
export function XrRoot(props: IXrRootProps): JSXNode {
  const { width, height, x, y } = normalizeBaseNodeProps(props);

  return JSXXML(props.tag ?? "w", { width, height, x, y }, props.children ?? null);
}
