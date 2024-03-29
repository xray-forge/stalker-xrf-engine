import { JSXNode, JSXXML } from "jsx-xml";

/**
 * Create UI forms related to PDA messages (16/9).
 */
export function create(): JSXNode {
  return (
    <w>
      <icon_static x={"0"} y={"0"} width={"41"} height={"29"} stretch={"1"} />

      <time_static x={"46"} y={"0"} width={"42"} height={"14"}>
        <text font={"letterica16"} color={"ui_1"} />
      </time_static>

      <caption_static x={"75"} y={"0"} width={"408"} height={"14"}>
        <text font={"letterica16"} color={"ui_5"} />
      </caption_static>

      <msg_static x={"46"} y={"20"} width={"454"} height={"14"} complex_mode={"1"}>
        <text font={"letterica16"} color={"ui_1"} />
      </msg_static>
    </w>
  );
}
