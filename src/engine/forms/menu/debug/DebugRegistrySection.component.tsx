import { JSXNode, JSXXML } from "jsx-xml";

import { Xr3tButton } from "@/engine/forms/components/base";
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
    </w>
  );
}
