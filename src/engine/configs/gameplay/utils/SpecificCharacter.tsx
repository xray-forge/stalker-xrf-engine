import { JSXNode, JSXXML } from "jsx-xml";

import { createLoadout, ILoadoutItemDescriptor } from "@/engine/configs/gameplay/utils/create_loadout";
import { Optional } from "@/engine/lib/types";

export interface ICharacterDescriptionProps {
  id: string;
  class?: string;
  comment?: string;
  name: string;
  icon: string;
  bio?: string;
  team?: string;
  community: string;
  soundConfig?: string;
  visual: string;
  rank?: number;
  reputation?: number;
  moneyMin?: number;
  moneyMax?: number;
  moneyInfinite?: boolean;
  crouchType?: number;
  terrainSection?: Optional<string>;
  supplies?: Array<ILoadoutItemDescriptor>;
  noRandom?: boolean;
  mechanicMode?: boolean;
  mapIcon?: JSXNode;
  children?: JSXNode;
}

export function CharacterDescriptionMapIcon({ x, y }: { x: number; y: number }): JSXNode {
  return <map_icon x={x} y={y}></map_icon>;
}

/**
 * Record describing specific character.
 * C++ parses is implemented in `specific_character.cpp`.
 */
export function SpecificCharacter(props: ICharacterDescriptionProps): JSXNode {
  const {
    id,
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
    moneyInfinite,
    terrainSection = "stalker_terrain",
    mapIcon = <CharacterDescriptionMapIcon x={1} y={0} />,
    mechanicMode,
    children,
  } = props;

  return (
    <specific_character
      id={id}
      no_random={typeof noRandom === "boolean" ? (noRandom ? 1 : 0) : null}
      team_default={team ? 0 : 1}
    >
      <name>{name}</name>
      <icon>{icon}</icon>
      {mapIcon}
      <bio>{bio ?? "Опытный сталкер. Детальная информация отсутствует."}</bio>
      {team ? <team>{team}</team> : null}
      <class>{props.class ?? id}</class>
      <community>{community}</community>
      <rank>{rank ?? 0}</rank>
      <reputation>{reputation ?? 0}</reputation>
      {typeof moneyMin === "number" ? (
        <money min={moneyMin} max={moneyMax ?? moneyMin} infinitive={moneyInfinite ? 1 : 0} />
      ) : null}
      {typeof crouchType === "number" ? <crouch_type>{crouchType}</crouch_type> : null}
      {typeof mechanicMode === "boolean" ? <mechanic_mode>{mechanicMode ? 1 : 0}</mechanic_mode> : null}
      <visual>{visual}</visual>
      {terrainSection ? <terrain_sect>{terrainSection}</terrain_sect> : null}
      {soundConfig ? <snd_config>{soundConfig}</snd_config> : null}
      {children}
      {supplies.length ? <supplies>{`\n[spawn]\\n\n${createLoadout(supplies, "\n")}`}</supplies> : <supplies />}
    </specific_character>
  );
}
