import { JSXNode, JSXXML } from "jsx-xml";

import { normalizeBaseNodeProps } from "#/utils";

import { IBaseXmlNode } from "@/engine/lib/types";

export interface IXrContainerProps extends IBaseXmlNode {}

export function XrComponent(props: IXrContainerProps): JSXNode {
  const { x, y, width, height, stretch } = normalizeBaseNodeProps(props);

  return JSXXML(props.tag ?? "container", { x, y, width, height, stretch }, props.children ?? null);
}
