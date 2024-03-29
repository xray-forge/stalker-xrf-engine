import { JSXNode, JSXXML } from "jsx-xml";

// <!-- REMOVE THIS FILE -->-->

/**
 * Create UI forms related to trading with game NPC.
 */
export function create(): JSXNode {
  /*
   *
   *        <_rank_caption x="23" y="150" width="153" height="15">
   *            <text align="l" font="letterica16" r="216" g="186" b="140">
   *                ui_st_rank
   *            </text>
   *        </_rank_caption>
   *        <_rank_static x="23" y="150" width="153" height="15">
   *            <text align="r" font="letterica16" r="240" g="217" b="182" />
   *        </_rank_static>
   *
   *       <_relation_caption x="23" y="177" width="153" height="15">
   *         <text align="l" font="letterica16" r="216" g="186" b="140">
   *           ui_st_relation
   *         </text>
   *       </_relation_caption>
   *       <_relation_static x="23" y="177" width="153" height="15">
   *         <text align="r" font="letterica16" r="240" g="217" b="182" />
   *       </_relation_static>
   */

  return (
    <w>
      <icon_static x={"64"} y={"18"} width={"145"} height={"104"} />

      <name_static x={"19"} y={"145"} width={"190"} height={"20"}>
        <text font={"graffiti22"} color={"ui_6"} complex_mode={"0"} />
      </name_static>

      <community_caption x={"19"} y={"168"} width={"60"} height={"15"}>
        <text align={"l"} font={"letterica16"} color={"ui_9"}>
          ui_st_community
        </text>
      </community_caption>
      <community_static x={"80"} y={"168"} width={"130"} height={"15"}>
        <text align={"l"} font={"letterica16"} color={"ui_9"} />
      </community_static>
    </w>
  );
}
