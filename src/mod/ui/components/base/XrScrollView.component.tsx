import { JSXNode, JSXXML } from "jsx-xml";

import { IBaseXmlNode } from "@/mod/lib/types";

import { normalizeBaseNodeCoordinates } from "#/utils";

export interface IXrScrollViewProps extends IBaseXmlNode {
  rightIndent: number;
  leftIndent: number;
  topIndent: number;
  bottomIndent: number;
  vertInterval: number;
  alwaysShowScroll?: boolean;
  flipVert?: boolean;
  canSelect?: boolean;
}

export function XrScrollView(props: IXrScrollViewProps): JSXNode {
  const {
    tag = "scroll_view",
    x,
    y,
    width,
    height,
    topIndent,
    rightIndent,
    bottomIndent,
    leftIndent,
    vertInterval,
    alwaysShowScroll,
    flipVert,
    canSelect
  } = normalizeBaseNodeCoordinates(props);

  return JSXXML(tag, {
    x,
    y,
    width,
    height,
    top_indent: topIndent,
    right_ident: rightIndent,
    bottom_indent: bottomIndent,
    left_ident: leftIndent,
    vert_interval: vertInterval,
    always_show_scroll: alwaysShowScroll,
    flip_vert: flipVert,
    can_select: canSelect
  });
}
