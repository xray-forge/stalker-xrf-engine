import { JSXNode, JSXXML } from "jsx-xml";

import { SECTION_HEIGHT, SECTION_WIDTH } from "@/engine/forms/menu/debug/DebugDialog.component";
import { textures } from "@/engine/lib/constants/textures";

const BASE_WIDTH: number = SECTION_WIDTH;
const BASE_HEIGHT: number = SECTION_HEIGHT;

export function create(): JSXNode {
  return (
    <w>
      <background width={BASE_WIDTH} height={BASE_HEIGHT}>
        <auto_static width={BASE_WIDTH} height={BASE_HEIGHT} stretch="1">
          <texture>{textures.ui_inGame2_picture_window}</texture>
        </auto_static>
      </background>
    </w>
  );
}
