import { JSXNode, JSXXML } from "jsx-xml";

import { createLoadout, ILoadoutItemDescriptor } from "@/engine/configs/gameplay/utils/create_loadout";

export interface ICharacterDescriptionProps {
  id: string;
  className?: string;
  comment?: string;
  name: string;
  icon: string;
  bio?: string;
  soundConfig?: string;
  team?: string;
  visual: string;
  rank?: number;
  reputation?: number;
  moneyMin?: number;
  moneyMax?: number;
  crouchType?: number;
  community: string;
  terrainSection?: string;
  supplies?: Array<ILoadoutItemDescriptor>;
  noRandom?: boolean;
  infiniteMoney?: boolean;
  mapIcon?: JSXNode;
  children?: JSXNode;
}

export function CharacterDescriptionMapIcon({ x, y }: { x: number; y: number }): JSXNode {
  return <map_icon x={x} y={y}></map_icon>;
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
  crouchType,
  community,
  moneyMin,
  moneyMax,
  rank,
  reputation,
  visual,
  soundConfig,
  supplies = [],
  noRandom,
  infiniteMoney,
  terrainSection,
  mapIcon = <CharacterDescriptionMapIcon x={1} y={0} />,
  children,
}: ICharacterDescriptionProps): JSXNode {
  return (
    <specific_character id={id} no_random={noRandom ? 1 : 0} team_default={team ? 0 : 1}>
      <name>{name}</name>
      <icon>{icon}</icon>
      {mapIcon}
      <bio>{bio ?? "Опытный сталкер. Детальная информация отсутствует."}</bio>
      {team ? <team>{team}</team> : null}
      <class>{className ?? id}</class>
      <community>{community}</community>
      <rank>{rank ?? 0}</rank>
      <reputation>{reputation ?? 0}</reputation>
      {typeof moneyMin === "number" ? (
        <money min={moneyMin} max={moneyMax ?? moneyMin} infinitive={infiniteMoney ? 1 : 0} />
      ) : null}
      {typeof crouchType === "number" ? <crouch_type>{crouchType}</crouch_type> : null}
      <visual>{visual}</visual>
      {terrainSection ? <terrain_sect>{terrainSection}</terrain_sect> : null}
      {soundConfig ? <snd_config>{soundConfig}</snd_config> : null}
      {children}
      {supplies.length ? <supplies>{`\n[spawn]\\n\n${createLoadout(supplies, "\n")}`}</supplies> : <supplies />}
    </specific_character>
  );
}
