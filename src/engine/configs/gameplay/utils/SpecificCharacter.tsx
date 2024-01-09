import { JSXNode, JSXXML } from "jsx-xml";

import { profileVisuals } from "@/engine/configs/gameplay/loadouts/profile_presets";
import {
  createSpawnList,
  createSpawnLoadout,
  ILoadoutItemDescriptor,
  ISpawnItemDescriptor,
} from "@/engine/configs/gameplay/utils/create_loadout";
import { Optional, TName } from "@/engine/lib/types";

/**
 * Typing for character descriptor.
 * Aliasing all variants to create nested XML nodes required for character profile descriptors.
 */
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
  visual?: string;
  rank?: number;
  reputation?: number;
  moneyMin?: number;
  moneyMax?: number;
  moneyInfinite?: boolean;
  crouchType?: number;
  terrainSection?: Optional<string>;
  supplies?: Array<ISpawnItemDescriptor>;
  loadout?: Array<ILoadoutItemDescriptor>;
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
    loadout = [],
    noRandom,
    moneyInfinite,
    terrainSection = "stalker_terrain",
    mapIcon = <CharacterDescriptionMapIcon x={1} y={0} />,
    mechanicMode,
    children,
  } = props;

  const characterVisual: Optional<TName> = visual ?? profileVisuals[icon as keyof typeof profileVisuals];

  if (!characterVisual) {
    throw new Error(`Expected visual to be present for character profile with icon '${icon}'.`);
  }

  return (
    <specific_character
      id={id}
      no_random={typeof noRandom === "boolean" ? (noRandom ? 1 : 0) : null}
      team_default={team ? 0 : 1}
    >
      <name>{name}</name>
      <icon>{icon}</icon>
      <bio>{bio ?? "Опытный сталкер. Детальная информация отсутствует."}</bio>
      <class>{props.class ?? id}</class>
      <community>{community}</community>
      <rank>{rank ?? 0}</rank>
      <reputation>{reputation ?? 0}</reputation>
      <visual>{characterVisual}</visual>

      {typeof moneyMin === "number" ? (
        <money min={moneyMin} max={moneyMax ?? moneyMin} infinitive={moneyInfinite ? 1 : 0} />
      ) : null}
      {typeof crouchType === "number" ? <crouch_type>{crouchType}</crouch_type> : null}
      {typeof mechanicMode === "boolean" ? <mechanic_mode>{mechanicMode ? 1 : 0}</mechanic_mode> : null}

      {mapIcon}
      {team ? <team>{team}</team> : null}
      {terrainSection ? <terrain_sect>{terrainSection}</terrain_sect> : null}
      {soundConfig ? <snd_config>{soundConfig}</snd_config> : null}
      {loadout.length || supplies.length ? (
        <supplies>
          {supplies.length ? `\n[spawn]\\n\n${createSpawnList(supplies, "\n")}` : null}
          {loadout.length ? `\n[spawn_loadout]\\n\n${createSpawnLoadout(loadout)}` : null}
        </supplies>
      ) : (
        <supplies />
      )}

      {children}
    </specific_character>
  );
}
