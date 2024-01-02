import { JSXNode, JSXXML } from "jsx-xml";

import { includeXmlFile } from "#/utils/xml";

import { ActorLoadout } from "./characters/ActorLoadout";
import { ArmyLoadout } from "./characters/ArmyLoadout";
import { BanditLoadout } from "./characters/BanditLoadout";

export function create(): JSXNode {
  return (
    <xml>
      <ActorLoadout />
      <ArmyLoadout />
      <BanditLoadout />

      {includeXmlFile("gameplay\\characters\\character_desc_general_duty.xml")}
      {includeXmlFile("gameplay\\characters\\character_desc_general_freedom.xml")}
      {includeXmlFile("gameplay\\characters\\character_desc_general_killer.xml")}
      {includeXmlFile("gameplay\\characters\\character_desc_general_monolith.xml")}
      {includeXmlFile("gameplay\\characters\\character_desc_general_stalker.xml")}
      {includeXmlFile("gameplay\\characters\\character_desc_general_zombied.xml")}
    </xml>
  );
}
