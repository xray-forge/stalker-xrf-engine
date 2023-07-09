import { JSXNode, JSXXML } from "jsx-xml";

import { normalizeBaseNodeProps } from "#/utils";

import { IBaseXmlNode } from "@/engine/lib/types";

export interface IXrScrollViewProps extends IBaseXmlNode {
  rightIndent: number;
  leftIndent: number;
  topIndent: number;
  bottomIndent: number;
  vertInterval: number;
  alwaysShowScroll?: boolean;
  flipVert?: boolean;
  inverseDirection?: boolean;
  canSelect?: boolean;
  scrollProfile?: string;
}

/**
 * todo;
 */
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
    inverseDirection,
    flipVert,
    canSelect,
    scrollProfile,
  } = normalizeBaseNodeProps(props);

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
    scroll_profile: scrollProfile,
    can_select: canSelect,
    inverse_dir: inverseDirection,
  });
}
