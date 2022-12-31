import { JSXNode, JSXXML } from "jsx-xml";

import { IBaseXmlNode } from "@/mod/lib/types";

import { normalizeBaseNodeProps } from "#/utils";

export interface IXrContainerProps extends IBaseXmlNode {}

export function XrContainer(props: IXrContainerProps): JSXNode {
  const { x, y, width, height } = normalizeBaseNodeProps(props);

  return JSXXML(props.tag ?? "container", { x, y, width, height }, props.children ?? null);
}
