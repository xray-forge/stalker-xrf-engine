import { JSXNode, JSXXML } from "jsx-xml";

export const IS_XML: boolean = true;

export function create(): JSXNode {
  return (
    <w>
      <file name="ui\ui_alife">
        <texture id="ui_alife_squad" x="0" y="0" width="32" height="32" />
        <texture id="ui_alife_smart" x="32" y="0" width="32" height="32" />
        <texture id="ui_alife_combat" x="64" y="0" width="32" height="32" />
      </file>
    </w>
  );
}
