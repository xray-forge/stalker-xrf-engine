import { JSXNode, JSXXML } from "jsx-xml";

/**
 * Creates UI forms related to grenade indicator when it is near player.
 */
export function create(): JSXNode {
  return (
    <w>
      <progress x={"467"} y={"338"} width={"91"} height={"92"} sector_count={"30"} clockwise={"0"}>
        <texture>ui_hud_grenadetarget_e</texture>
      </progress>
    </w>
  );
}
