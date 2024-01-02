import { JSXNode, JSXXML } from "jsx-xml";

import { includeXmlFile } from "#/utils/xml";

import { ActorLoadout } from "@/engine/configs/gameplay/characters/ActorLoadout";
import { ArmyLoadout } from "@/engine/configs/gameplay/characters/ArmyLoadout";
import { BanditLoadout } from "@/engine/configs/gameplay/characters/BanditLoadout";
import { DutyLoadout } from "@/engine/configs/gameplay/characters/DutyLoadout";
import { MercenaryLoadout } from "@/engine/configs/gameplay/characters/MercenaryLoadout";
import { MonolithLoadout } from "@/engine/configs/gameplay/characters/MonolithLoadout";
import { ZombiedLoadout } from "@/engine/configs/gameplay/characters/ZombiedLoadout";

export function create(): JSXNode {
  return (
    <xml>
      <ActorLoadout />
      <ArmyLoadout />
      <BanditLoadout />
      <ZombiedLoadout />
      <MercenaryLoadout />
      <MonolithLoadout />
      <DutyLoadout />

      {includeXmlFile("gameplay\\characters\\character_desc_general_freedom.xml")}
      {includeXmlFile("gameplay\\characters\\character_desc_general_stalker.xml")}
    </xml>
  );
}
