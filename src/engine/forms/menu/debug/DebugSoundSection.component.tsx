import { JSXNode, JSXXML } from "jsx-xml";

import { SECTION_HEIGHT, SECTION_WIDTH } from "@/engine/forms/menu/debug/DebugDialog.component";

/**
 * todo;
 */
export function create(): JSXNode {
  return (
    <w>
      <background width={SECTION_WIDTH} height={SECTION_HEIGHT}>
        <auto_static width={SECTION_WIDTH} height={SECTION_HEIGHT} stretch={"1"}>
          <texture>ui_inGame2_picture_window</texture>
        </auto_static>
      </background>
    </w>
  );
}
