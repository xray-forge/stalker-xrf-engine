import { JSXNode, JSXXML } from "jsx-xml";

import { XrCheckBox, XrContainer, XrRoot, XrText } from "@/mod/ui/components/base";
import { XrScrollView } from "@/mod/ui/components/base/XrScrollView.component";
import { SECTION_HEIGHT, SECTION_WIDTH } from "@/mod/ui/debug/DebugDialog.component";
import { on_off_cmds, zero_one_cmds } from "@/mod/ui/debug/sections";

export const IS_XML: boolean = true;

const BASE_WIDTH: number = SECTION_WIDTH;
const BASE_HEIGHT: number = SECTION_HEIGHT;

export function create(): JSXNode {
  return (
    <XrRoot width={BASE_WIDTH} height={BASE_HEIGHT}>
      <XrScrollView
        tag={"commands_list"}
        x={24}
        y={24}
        width={168}
        height={SECTION_HEIGHT}
        rightIndent={0}
        leftIndent={0}
        topIndent={0}
        bottomIndent={0}
        vertInterval={0}
        alwaysShowScroll={false}
      />

      <XrContainer x={12} tag={"command_item"} width={40} height={30} />

      <XrText x={24} tag={"command_label"} label={"test"} />

      {on_off_cmds.concat(zero_one_cmds).map((it) => (
        <XrCheckBox tag={"command_item_" + it} x={4} height={16} width={16} />
      ))}
    </XrRoot>
  );
}
