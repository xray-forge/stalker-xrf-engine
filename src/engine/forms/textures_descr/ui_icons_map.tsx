import { JSXNode, JSXXML } from "jsx-xml";

export const IS_XML: boolean = true;

export function create(): JSXNode {
  return (
    <w>
      <file name="ui\ui_icons_map">
        <texture id="death" x="32" y="160" width="32" height="32" />
        <texture id="artefact" x="64" y="128" width="32" height="32" />
      </file>
    </w>
  );
}
