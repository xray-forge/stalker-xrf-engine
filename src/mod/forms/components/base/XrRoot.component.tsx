import { JSXNode, JSXXML } from "jsx-xml";

import { IBaseXmlNode } from "@/mod/lib/types";

import { normalizeBaseNodeProps } from "#/utils";

export interface IXrRootProps extends IBaseXmlNode {}

export function XrRoot(props: IXrRootProps): JSXNode {
  const { width, height, x, y } = normalizeBaseNodeProps(props);

  return JSXXML(props.tag ?? "w", { width, height, x, y }, props.children ?? null);
}
