import { JSXNode, JSXXML } from "jsx-xml";

import { includeXmlFile } from "#/utils/xml";

import { MercenaryLoadout } from "@/engine/configs/gameplay/characters/MercenaryLoadout";
import { ZombiedLoadout } from "@/engine/configs/gameplay/characters/ZombiedLoadout";

import { ActorLoadout } from "./characters/ActorLoadout";
import { ArmyLoadout } from "./characters/ArmyLoadout";
import { BanditLoadout } from "./characters/BanditLoadout";

export function create(): JSXNode {
  return (
    <xml>
      <ActorLoadout />
      <ArmyLoadout />
      <BanditLoadout />
      <ZombiedLoadout />
      <MercenaryLoadout />

      {includeXmlFile("gameplay\\characters\\character_desc_general_duty.xml")}
      {includeXmlFile("gameplay\\characters\\character_desc_general_freedom.xml")}
      {includeXmlFile("gameplay\\characters\\character_desc_general_monolith.xml")}
      {includeXmlFile("gameplay\\characters\\character_desc_general_stalker.xml")}
    </xml>
  );
}
