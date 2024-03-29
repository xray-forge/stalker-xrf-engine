import { JSXNode, JSXXML } from "jsx-xml";

/**
 * Create forms related to video settings configuration (?).
 */
export function create(): JSXNode {
  return (
    <xxx>
      <video_player x={"0"} y={"0"} width={"1024"} height={"768"} auto_play={"0"}>
        <surface x={"0"} y={"0"} width={"1024"} height={"768"} stretch={"1"} />

        <buttons_tab x={"0"} y={"0"} width={"1"} height={"1"} />
      </video_player>
    </xxx>
  );
}
