import { JSXNode, JSXXML } from "jsx-xml";

import { IBaseXmlNode } from "@/mod/lib/types";

import { normalizeBaseNodeCoordinates } from "#/utils";

export interface IXrBackgroundProps extends IBaseXmlNode {
  stretch?: boolean;
}

export function XrBackground(props: IXrBackgroundProps): JSXNode {
  const { x, y, width, height, stretch } = normalizeBaseNodeCoordinates(props);

  return JSXXML(props.tag ?? "background", { x, y, width, height, stretch }, props.children ?? null);
}
