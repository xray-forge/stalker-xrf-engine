import { JSXNode, JSXXML } from "jsx-xml";

export const IS_XML: boolean = true;

/**
 *  Used.
 *  Defined in C++ codebase: src/xrGame/UIAchivementsIndicator.h
 *  Defined in C++ codebase: src/xrGame/UIAchivementsIndicator.cpp
 */
export function create(): JSXNode {
  return (
    <w>
      <mp_achivement_wnd x="896" y="160" width="128" height="384">
        <achivement_list x="0" y="0" width="128" height="384" always_show_scroll="0" inverse_dir="1" />
      </mp_achivement_wnd>
    </w>
  );
}
