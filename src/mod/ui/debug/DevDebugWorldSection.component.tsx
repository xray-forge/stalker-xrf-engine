import { JSXNode, JSXXML } from "jsx-xml";

import { textures } from "@/mod/globals/textures";
import { SECTION_HEIGHT, SECTION_WIDTH } from "@/mod/ui/debug/DevDebugDialog.component";

export const IS_XML: boolean = true;

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
