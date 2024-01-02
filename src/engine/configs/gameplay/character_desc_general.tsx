import { JSXNode, JSXXML } from "jsx-xml";

import { ActorLoadout } from "@/engine/configs/gameplay/characters/ActorLoadout";
import { ArmyLoadout } from "@/engine/configs/gameplay/characters/ArmyLoadout";
import { BanditLoadout } from "@/engine/configs/gameplay/characters/BanditLoadout";
import { DutyLoadout } from "@/engine/configs/gameplay/characters/DutyLoadout";
import { FreedomLoadout } from "@/engine/configs/gameplay/characters/FreedomLoadout";
import { MercenaryLoadout } from "@/engine/configs/gameplay/characters/MercenaryLoadout";
import { MonolithLoadout } from "@/engine/configs/gameplay/characters/MonolithLoadout";
import { StalkerLoadout } from "@/engine/configs/gameplay/characters/StalkerLoadout";
import { ZombiedLoadout } from "@/engine/configs/gameplay/characters/ZombiedLoadout";

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
