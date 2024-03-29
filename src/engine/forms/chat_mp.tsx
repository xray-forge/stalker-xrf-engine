import { JSXNode, JSXXML } from "jsx-xml";

/**
 * Generate UI forms related to multiplayer chat components.
 */
export function create(): JSXNode {
  return (
    <window>
      <prefix_static x={"20"} y={"385"} width={"50"} height={"30"}>
        <text font={"letterica18"} r={"225"} g={"225"} b={"250"}></text>
      </prefix_static>

      <edit_box x={"70"} y={"385"} width={"620"} height={"30"}>
        <text font={"letterica18"} r={"225"} g={"225"} b={"250"}></text>
      </edit_box>

      <chat_log_list x={"20"} y={"220"} width={"324"} height={"160"} item_height={"16"} fade={"1000"}>
        <font font={"letterica16"} r={"255"} g={"255"} b={"255"} />
      </chat_log_list>

      <game_log_list x={"20"} y={"410"} width={"344"} height={"270"} item_height={"30"} fade={"1000"}>
        <font font={"medium"} r={"255"} g={"255"} b={"255"} />
      </game_log_list>
    </window>
  );
}
