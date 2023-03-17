import { JSXNode, JSXXML } from "jsx-xml";

import { normalizeBaseNodeProps } from "#/utils";

import { IBaseXmlNode } from "@/engine/lib/types";

export interface IXrContainerProps extends IBaseXmlNode {}

export function XrContainer(props: IXrContainerProps): JSXNode {
  const { x, y, width, height } = normalizeBaseNodeProps(props);

  return JSXXML(props.tag ?? "container", { x, y, width, height }, props.children ?? null);
}
