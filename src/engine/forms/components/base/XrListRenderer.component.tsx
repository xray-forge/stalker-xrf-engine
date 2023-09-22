import { JSXNode, JSXXML } from "jsx-xml";

import { normalizeBaseNodeProps } from "#/utils/xml";

import { fonts } from "@/engine/lib/constants/fonts";
import { IBaseXmlNode } from "@/engine/lib/types";

export interface IXrComboBoxProps extends IBaseXmlNode {}

/**
 * todo;
 */
export function XrComboBox(props: IXrComboBoxProps): JSXNode {
  const { tag = "list_renderer", x, y, width, height, children = null } = normalizeBaseNodeProps(props);

  return JSXXML(
    tag,
    {
      x,
      y,
      width,
      height,
    },
    [
      /* <!-- options_item entry={"renderer" group={"mm_opt_video"} depend="restart"}/ -->*/
      children,

      <text_color>
        <e r={216} g={186} b={140} />
        <d color={"ui_gray"} />
      </text_color>,

      <list_font_s r={240} g={217} b={182} />,
      <list_font r={216} g={186} b={140} font={fonts.letterica16} />,
    ]
  );
}
