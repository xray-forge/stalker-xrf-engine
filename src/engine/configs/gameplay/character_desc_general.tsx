import { JSXNode, JSXXML } from "jsx-xml";

import { ActorLoadout } from "@/engine/configs/gameplay/character_descriptions/ActorLoadout";
import { ArmyLoadout } from "@/engine/configs/gameplay/character_descriptions/ArmyLoadout";
import { BanditLoadout } from "@/engine/configs/gameplay/character_descriptions/BanditLoadout";
import { DutyLoadout } from "@/engine/configs/gameplay/character_descriptions/DutyLoadout";
import { FreedomLoadout } from "@/engine/configs/gameplay/character_descriptions/FreedomLoadout";
import { MercenaryLoadout } from "@/engine/configs/gameplay/character_descriptions/MercenaryLoadout";
import { MonolithLoadout } from "@/engine/configs/gameplay/character_descriptions/MonolithLoadout";
import { StalkerLoadout } from "@/engine/configs/gameplay/character_descriptions/StalkerLoadout";
import { ZombiedLoadout } from "@/engine/configs/gameplay/character_descriptions/ZombiedLoadout";

export function create(): JSXNode {
  return (
    <xml>
      <ActorLoadout />
      <ArmyLoadout />
      <BanditLoadout />
      <DutyLoadout />
      <FreedomLoadout />
      <MercenaryLoadout />
      <MonolithLoadout />
      <StalkerLoadout />
      <ZombiedLoadout />
    </xml>
  );
}
