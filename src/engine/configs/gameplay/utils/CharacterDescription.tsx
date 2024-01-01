import { JSXNode, JSXXML } from "jsx-xml";

import { createLoadout, ILoadoutItemDescriptor } from "@/engine/configs/gameplay/utils/create_loadout";

export interface ICharacterDescriptionProps {
  id: string;
  name: string;
  icon: string;
  bio?: string;
  soundConfig?: string;
  team?: string;
  visual: string;
  rank?: number;
  reputation?: number;
  money?: number;
  community: string;
  className?: string;
  supplies?: Array<ILoadoutItemDescriptor>;
  noRandom?: boolean;
  infiniteMoney?: boolean;
  children?: JSXNode;
}

/**
 * Record describing specific character.
 */
export function CharacterDescription({
  id,
  className,
  name,
  bio,
  icon,
  team,
  community,
  money,
  rank,
  reputation,
  visual,
  soundConfig,
  supplies = [],
  noRandom,
  infiniteMoney,
  children,
}: ICharacterDescriptionProps): JSXNode {
  return (
    <specific_character id={id} no_random={noRandom ? 1 : 0} team_default={team ? 0 : 1}>
      <name>{name}</name>
      <icon>{icon}</icon>
      <bio>{bio ?? "Опытный сталкер. Детальная информация отсутствует."}</bio>
      {team ? <team>{team}</team> : null}
      <class>{className ?? id}</class>
      <community>{community}</community>
      <rank>{rank ?? 0}</rank>
      <reputation>{reputation ?? 0}</reputation>
      <money min={money ?? 0} max={money ?? 0} infinitive={infiniteMoney ? 1 : 0} />
      <visual>{visual}</visual>
      <map_icon x={2} y={5}></map_icon>
      {soundConfig ? <snd_config>{soundConfig}</snd_config> : null}
      {supplies.length ? <supplies>{`[spawn]\n${createLoadout(supplies, "\n")}`}</supplies> : <supplies />}
      {children}
    </specific_character>
  );
}
