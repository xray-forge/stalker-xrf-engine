import { JSXNode, JSXXML } from "jsx-xml";

export const IS_XML: boolean = true;

export function create(): JSXNode {
  return (
    <window>
      <strelok_health x="37" y="6" width="256" height="10" horz="1" min="0" max="100">
        <progress>
          <texture>ui_sega_healph_progress</texture>
        </progress>
      </strelok_health>
    </window>
  );
}
