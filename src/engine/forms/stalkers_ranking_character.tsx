import { JSXNode, JSXXML } from "jsx-xml";

export const IS_XML: boolean = true;

export function create(): JSXNode {
  return (
    <window>
      <icon_static x="0" y="0" width="165" height="108" />

      <rank_static x="165" y="15" width="120" height="16">
        <text x="0" y="0" font="letterica18" r="150" g="150" b="180" />
      </rank_static>

      <rank_caption x="165" y="0" width="120" height="15">
        <text x="0" y="0" font="letterica16" r="128" g="128" b="128">
          ui_st_rank
        </text>
      </rank_caption>

      <community_static x="165" y="59" width="120" height="15">
        <text x="0" y="0" font="letterica18" r="150" g="150" b="180"></text>
      </community_static>

      <community_caption x="165" y="44" width="120" height="15">
        <text x="0" y="0" font="letterica16" r="128" g="128" b="128" a="255">
          ui_st_community
        </text>
      </community_caption>

      <relation_static x="165" y="104" width="120" height="15">
        <text x="0" y="0" font="letterica18" r="150" g="150" b="180" />
      </relation_static>

      <relation_caption x="165" y="91" width="120" height="15">
        <text x="0" y="0" font="letterica16" r="128" g="128" b="128" a="255">
          ui_st_relation
        </text>
      </relation_caption>
    </window>
  );
}
