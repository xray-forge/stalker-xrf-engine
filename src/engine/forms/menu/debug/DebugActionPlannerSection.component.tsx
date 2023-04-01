import { JSXNode, JSXXML } from "jsx-xml";

import { Xr3tButton, XrCheckBox, XrText } from "@/engine/forms/components/base";
import { SECTION_HEIGHT, SECTION_WIDTH } from "@/engine/forms/menu/debug/DebugDialog.component";
import { WHITE } from "@/engine/lib/constants/colors";
import { fonts } from "@/engine/lib/constants/fonts";

export const IS_XML: boolean = true;

const BASE_WIDTH: number = SECTION_WIDTH;
const BASE_HEIGHT: number = SECTION_HEIGHT;

export function create(): JSXNode {
  return (
    <w>
      <XrText tag={"nearest_stalker_label"} x={12} y={12} label={"none"} />
      <XrText tag={"target_stalker_label"} x={12} y={32} label={"none"} />
      <XrCheckBox tag={"use_target_object_check"} x={12} y={48} width={24} height={20} />
      <XrText tag={"use_target_object_label"} x={40} y={48} label={"Use target object"} height={20} width={64} />

      <Xr3tButton
        tag={"log_planner_state"}
        label={"Log planner state"}
        x={12}
        y={72}
        width={72}
        height={16}
        textColor={WHITE}
        font={fonts.letterica16}
      />

      <Xr3tButton
        tag={"log_inventory_state"}
        label={"Log inventory state"}
        x={12}
        y={92}
        width={72}
        height={16}
        textColor={WHITE}
        font={fonts.letterica16}
      />
    </w>
  );
}
