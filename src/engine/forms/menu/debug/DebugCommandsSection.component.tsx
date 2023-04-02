import { JSXNode, JSXXML } from "jsx-xml";

import { XrCheckBox, XrComponent, XrRoot, XrText } from "@/engine/forms/components/base";
import { XrScrollView } from "@/engine/forms/components/base/XrScrollView.component";
import { SECTION_HEIGHT, SECTION_WIDTH } from "@/engine/forms/menu/debug/DebugDialog.component";

export const IS_XML: boolean = true;

export function create(): JSXNode {
  return (
    <XrRoot width={SECTION_WIDTH} height={SECTION_HEIGHT}>
      <XrScrollView
        tag={"commands_list"}
        x={12}
        y={12}
        width={168}
        height={SECTION_HEIGHT}
        rightIndent={0}
        leftIndent={0}
        topIndent={0}
        bottomIndent={0}
        vertInterval={0}
        alwaysShowScroll={false}
      />

      <XrComponent tag={"command_item"} width={40} height={20} />
      <XrCheckBox tag={"command_check"} height={16} width={16} />
      <XrText tag={"command_label"} x={20} label={"?"} />
    </XrRoot>
  );
}
