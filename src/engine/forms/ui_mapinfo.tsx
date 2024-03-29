import { JSXNode, JSXXML } from "jsx-xml";

/**
 * Creation of generic UI forms related to map information labels.
 */
export function create(): JSXNode {
  return (
    <ui_mapinfo>
      <map_name x={"0"} y={"0"} width={"200"} height={"50"}>
        <text font={"graffiti22"} r={"145"} g={"112"} b={"43"} />
      </map_name>
      <header>
        <text font={"letterica16"} r={"129"} g={"123"} b={"113"} />
      </header>
      <txt>
        <text font={"letterica16"} r={"215"} g={"195"} b={"170"} />
      </txt>
    </ui_mapinfo>
  );
}
