import { JSXNode, JSXXML } from "jsx-xml";

/**
 * Generate UI forms related to item hints in PDA.
 */
export function create(): JSXNode {
  return (
    <window>
      <button_hint x={"0"} y={"0"} width={"210"} height={"100"}>
        <texture>ui_icons_PDA_tooltips</texture>

        <frame_line x={"0"} y={"0"} width={"210"} height={"30"}>
          <texture>ui_icons_PDA_tooltips</texture>
        </frame_line>

        <description
          x={"10"}
          y={"10"}
          width={"190"}
          height={"20"}
          complex_mode={"1"}
          light_anim={"ui_btn_hint"}
          la_cyclic={"0"}
          la_texture={"0"}
          la_text={"1"}
          la_alpha={"1"}
        >
          <text font={"letterica18"} align={"l"} />
        </description>
      </button_hint>
    </window>
  );
}
