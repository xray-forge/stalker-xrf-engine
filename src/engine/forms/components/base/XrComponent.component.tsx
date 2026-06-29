import { JSXNode, JSXXML } from "jsx-xml";

import { normalizeBaseNodeProps } from "#/utils/xml";

import { IBaseXmlNode } from "@/engine/lib/types";

export interface IXrContainerProps extends IBaseXmlNode {}

/**
 * Create a reusable container UI component wrapping its children.
 *
 * @param props - Configuration of the container node, including position, size, stretch flag and children.
 * @returns Rendered container component.
 */
export function XrComponent(props: IXrContainerProps): JSXNode {
  const { x, y, width, height, stretch } = normalizeBaseNodeProps(props);

  return JSXXML(props.tag ?? "container", { x, y, width, height, stretch }, props.children ?? null);
}
