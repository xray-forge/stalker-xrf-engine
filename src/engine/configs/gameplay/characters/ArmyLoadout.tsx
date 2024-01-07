import { Fragment, JSXNode, JSXXML } from "jsx-xml";

import {
  characterProfileCriticals,
  defaultCharacterDialogs,
  loadoutCharacterDrugs,
  loadoutCharacterFood,
  loadoutCharacterItemsWithoutDetector,
} from "@/engine/configs/gameplay/loadouts";
import { SpecificCharacter } from "@/engine/configs/gameplay/utils";
import { communities } from "@/engine/lib/constants/communities";
import { ammo } from "@/engine/lib/constants/items/ammo";
import { weapons } from "@/engine/lib/constants/items/weapons";
import {
  GENERATE_ARMY_CAPTAIN_NAME,
  GENERATE_ARMY_LIEUTENANT_NAME,
  GENERATE_ARMY_PRIVATE_NAME,
  GENERATE_ARMY_SERGEANT_NAME,
} from "@/engine/lib/constants/names";

export function ArmyLoadout(): JSXNode {
  return (
    <Fragment>
      <SpecificCharacter
        id={"sim_default_military_0_default"}
        class={"sim_default_military_0"}
        name={GENERATE_ARMY_PRIVATE_NAME}
        community={communities.army}
        icon={"ui_inGame2_Soldier_2"}
        soundConfig={"characters_voice\\human_01\\military\\"}
        visual={"actors\\stalker_soldier\\stalker_soldier_2"}
        rank={30}
        supplies={[
          { section: weapons.wpn_ak74u },
          { section: weapons.wpn_pm },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_fmj },
          ...loadoutCharacterItemsWithoutDetector,
          ...loadoutCharacterDrugs,
          ...loadoutCharacterFood,
        ]}
      >
        {characterProfileCriticals}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_military_1_default"}
        class={"sim_default_military_1"}
        name={GENERATE_ARMY_PRIVATE_NAME}
        community={communities.army}
        icon={"ui_inGame2_Soldier_2"}
        soundConfig={"characters_voice\\human_01\\military\\"}
        visual={"actors\\stalker_soldier\\stalker_soldier_2"}
        rank={35}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_pm },
          { section: weapons.grenade_rgd5 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_fmj },
          ...loadoutCharacterItemsWithoutDetector,
          ...loadoutCharacterDrugs,
          ...loadoutCharacterFood,
        ]}
      >
        {characterProfileCriticals}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_military_2_default_0"}
        class={"sim_default_military_2"}
        name={GENERATE_ARMY_SERGEANT_NAME}
        community={communities.army}
        icon={"ui_inGame2_Soldier_2"}
        soundConfig={"characters_voice\\human_02\\military\\"}
        visual={"actors\\stalker_soldier\\stalker_soldier_2"}
        rank={45}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_fort },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_fmj },
          ...loadoutCharacterItemsWithoutDetector,
          ...loadoutCharacterDrugs,
          ...loadoutCharacterFood,
        ]}
      >
        {characterProfileCriticals}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_military_2_default_1"}
        class={"sim_default_military_2"}
        name={GENERATE_ARMY_SERGEANT_NAME}
        community={communities.army}
        icon={"ui_inGame2_Soldier_2"}
        soundConfig={"characters_voice\\human_02\\military\\"}
        visual={"actors\\stalker_soldier\\stalker_soldier_2"}
        rank={45}
        supplies={[
          { section: weapons.wpn_abakan },
          { section: weapons.wpn_fort },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_fmj },
          ...loadoutCharacterItemsWithoutDetector,
          ...loadoutCharacterDrugs,
          ...loadoutCharacterFood,
        ]}
      >
        {characterProfileCriticals}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_military_3_default_0"}
        class={"sim_default_military_3"}
        name={GENERATE_ARMY_LIEUTENANT_NAME}
        community={communities.army}
        icon={"ui_inGame2_Soldier_3"}
        soundConfig={"characters_voice\\human_03\\military\\"}
        visual={"actors\\stalker_soldier\\stalker_soldier_3"}
        rank={55}
        supplies={[
          { section: weapons.wpn_abakan },
          { section: weapons.wpn_fort },
          { section: weapons.grenade_f1, count: 3 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_fmj },
          ...loadoutCharacterItemsWithoutDetector,
          ...loadoutCharacterDrugs,
          ...loadoutCharacterFood,
        ]}
      >
        {characterProfileCriticals}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_military_4_default_0"}
        class={"sim_default_military_4"}
        name={GENERATE_ARMY_CAPTAIN_NAME}
        community={communities.army}
        icon={"ui_inGame2_Soldier_4"}
        soundConfig={"characters_voice\\human_03\\military\\"}
        visual={"actors\\stalker_soldier\\stalker_soldier_4"}
        rank={60}
        supplies={[
          { section: weapons.wpn_groza },
          { section: weapons.wpn_fort },
          { section: weapons.grenade_f1, count: 4 },
          { section: ammo.ammo_9x39_ap },
          { section: ammo.ammo_9x18_fmj },
          ...loadoutCharacterItemsWithoutDetector,
          ...loadoutCharacterDrugs,
          ...loadoutCharacterFood,
        ]}
      >
        {characterProfileCriticals}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_military_4_default_1"}
        class={"sim_default_military_4"}
        name={GENERATE_ARMY_CAPTAIN_NAME}
        community={communities.army}
        icon={"ui_inGame2_Soldier_4"}
        soundConfig={"characters_voice\\human_03\\military\\"}
        visual={"actors\\stalker_soldier\\stalker_soldier_4"}
        rank={60}
        supplies={[
          { section: weapons.wpn_val },
          { section: weapons.wpn_fort },
          { section: weapons.grenade_f1, count: 4 },
          { section: ammo.ammo_9x39_ap },
          { section: ammo.ammo_9x18_fmj },
          ...loadoutCharacterItemsWithoutDetector,
          ...loadoutCharacterDrugs,
          ...loadoutCharacterFood,
        ]}
      >
        {characterProfileCriticals}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_military_4_default_2"}
        class={"sim_default_military_4"}
        name={GENERATE_ARMY_CAPTAIN_NAME}
        community={communities.army}
        icon={"ui_inGame2_Soldier_4"}
        soundConfig={"characters_voice\\human_03\\military\\"}
        visual={"actors\\stalker_soldier\\stalker_soldier_4"}
        rank={60}
        supplies={[
          { section: weapons.wpn_abakan, scope: true },
          { section: weapons.wpn_fort },
          { section: weapons.grenade_f1, count: 4 },
          { section: ammo["ammo_5.45x39_ap"] },
          { section: ammo.ammo_9x18_fmj },
          ...loadoutCharacterItemsWithoutDetector,
          ...loadoutCharacterDrugs,
          ...loadoutCharacterFood,
        ]}
      >
        {characterProfileCriticals}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_military_3_default_sniper"}
        class={"sim_default_military_3_sniper"}
        name={GENERATE_ARMY_CAPTAIN_NAME}
        community={communities.army}
        icon={"ui_inGame2_Soldier_2"}
        soundConfig={"characters_voice\\human_02\\military\\"}
        visual={"actors\\stalker_soldier\\stalker_soldier_2"}
        rank={60}
        supplies={[
          { section: weapons.wpn_svd },
          { section: weapons.wpn_fort },
          { section: weapons.grenade_f1, count: 4 },
          { section: ammo["ammo_7.62x54_7h1"] },
          { section: ammo.ammo_9x18_fmj },
          ...loadoutCharacterItemsWithoutDetector,
          ...loadoutCharacterDrugs,
          ...loadoutCharacterFood,
        ]}
      >
        {characterProfileCriticals}
        {defaultCharacterDialogs}
      </SpecificCharacter>
    </Fragment>
  );
}
