import { JSXNode, JSXXML } from "jsx-xml";

import { SECTION_HEIGHT, SECTION_WIDTH } from "@/engine/forms/menu/debug/DebugDialog.component";

const BASE_WIDTH: number = SECTION_WIDTH;
const BASE_HEIGHT: number = SECTION_HEIGHT;

/**
 * todo;
 */
export function create(): JSXNode {
  return (
    <w>
      <background width={BASE_WIDTH} height={BASE_HEIGHT}>
        <auto_static width={BASE_WIDTH} height={BASE_HEIGHT} stretch={"1"}>
          <texture>ui_inGame2_picture_window</texture>
        </auto_static>
      </background>
    </w>
  );
}
