import { JSXNode, JSXXML } from "jsx-xml";

import { fonts } from "@/mod/globals/fonts";
import { IBaseXmlNode } from "@/mod/lib/types";

import { normalizeBaseNodeCoordinates } from "#/utils";

export interface IXrListRendererComponentProps extends IBaseXmlNode {}

export function XrListRenderer(props: IXrListRendererComponentProps): JSXNode {
  const { tag = "list_renderer", x, y, width, height, children = null } = normalizeBaseNodeCoordinates(props);

  return JSXXML(
    tag,
    {
      x,
      y,
      width,
      height
    },
    [
      /* <!-- options_item entry={"renderer" group={"mm_opt_video"} depend="restart"}/ -->*/
      children,

      <text_color>
        <e r={216} g={186} b={140} />
        <d color={"ui_gray"} />
      </text_color>,

      <list_font_s r={240} g={217} b={182} />,
      <list_font r={216} g={186} b={140} font={fonts.letterica16} />
    ]
  );
}
