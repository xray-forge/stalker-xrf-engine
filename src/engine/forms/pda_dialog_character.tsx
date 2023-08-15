import { JSXNode, JSXXML } from "jsx-xml";

import { captions } from "@/engine/lib/constants/captions";

/**
 * Generation of PDA character dialogs section UI forms.
 */
export function create(): JSXNode {
  return (
    <window>
      <icon_static x="0" y="0" width="165" height="108" />

      <rank_caption x="165" y="0" width="100" height="15">
        <text align="l" x="0" y="0" font="letterica16" r="128" g="128" b="128">
          {captions.ui_st_rank}
        </text>
      </rank_caption>
      <rank_static x="165" y="15" width="100" height="15">
        <text align="l" x="0" y="0" font="letterica18" r="150" g="150" b="180" />
      </rank_static>

      <reputation_caption x="165" y="90" width="100" height="15">
        <text x="0" y="0" font="letterica16" r="128" g="128" b="128" a="255">
          {captions.ui_st_reputation}
        </text>
      </reputation_caption>
      <reputation_static x="165" y="104" width="100" height="15">
        <text align="l" x="0" y="0" font="letterica18" r="150" g="150" b="180" />
      </reputation_static>

      <community_caption x="165" y="44" width="100" height="15">
        <text align="l" x="0" y="0" font="letterica16" r="128" g="128" b="128" a="255">
          {captions.ui_st_community}
        </text>
      </community_caption>
      <community_static x="165" y="59" width="100" height="15">
        <text align="l" x="0" y="0" font="letterica18" r="150" g="150" b="180" />
      </community_static>
    </window>
  );
}
