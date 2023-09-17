import { JSXNode, JSXXML } from "jsx-xml";

import { Xr3tButton, XrCheckBox, XrStatic, XrText } from "@/engine/forms/components/base";
import { XrList } from "@/engine/forms/components/base/XrList.component";
import { WHITE } from "@/engine/lib/constants/colors";
import { fonts } from "@/engine/lib/constants/fonts";

/**
 * todo;
 */
export function create(): JSXNode {
  return (
    <w>
      <Xr3tButton
        tag={"log_general_report"}
        label={"Log registry summary"}
        x={12}
        y={12}
        width={76}
        height={16}
        textColor={WHITE}
        font={fonts.letterica16}
      />

      <XrText tag={"registry_filter_count"} label={"Total: 0"} x={12} y={80} width={40} height={16} />

      <XrCheckBox
        tag={"registry_filter_online"}
        label={"Is online"}
        x={12}
        y={100}
        width={16}
        height={16}
        textX={-12}
      />

      <XrStatic
        tag={"registry_list_frame"}
        x={12}
        y={120}
        width={860}
        height={400}
        texture={"ui_inGame2_servers_list_frame"}
      />

      <XrList tag={"registry_list"} x={12} y={120} width={860} height={400} itemHeight={18} canSelect={true} />
    </w>
  );
}
