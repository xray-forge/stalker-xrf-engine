import { Fragment, JSXNode, JSXXML } from "jsx-xml";

import {
  characterProfileCriticals,
  defaultCharacterDialogs,
  loadoutCharacterDrugs,
  loadoutCharacterDrugs2,
  loadoutCharacterDrugs4,
  loadoutCharacterDrugsMilitary,
  loadoutCharacterFood,
  loadoutCharacterItemsWithoutTorch,
  loadoutCharacterItemsWithoutTorch2,
  loadoutCharacterItemsWithoutTorch3,
} from "@/engine/configs/gameplay/loadouts";
import { SpecificCharacter } from "@/engine/configs/gameplay/utils";
import { communities } from "@/engine/lib/constants/communities";
import { ammo } from "@/engine/lib/constants/items/ammo";
import { weapons } from "@/engine/lib/constants/items/weapons";
import {
  GENERATE_ARMY_LIEUTENANT_NAME,
  GENERATE_ARMY_PRIVATE_NAME,
  GENERATE_ARMY_SERGEANT_NAME,
  GENERATE_STALKER_NAME,
} from "@/engine/lib/constants/names";

export function ZombiedLoadout(): JSXNode {
  return (
    <Fragment>
      <SpecificCharacter
        id={"sim_default_zombied_1_default_0"}
        class={"sim_default_zombied_1"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Zombied_1"}
        bio={""}
        soundConfig={"characters_voice\\human_01\\zombied\\"}
        visual={"actors\\stalker_zombied\\stalker_zombied_1"}
        crouchType={0}
        community={communities.zombied}
        supplies={[
          { section: weapons.wpn_ak74u },
          { section: weapons.wpn_fort },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_fmj },
          ...loadoutCharacterItemsWithoutTorch,
          ...loadoutCharacterFood,
          ...loadoutCharacterDrugs,
        ]}
      >
        {characterProfileCriticals}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_zombied_1_default_1"}
        class={"sim_default_zombied_1"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Zombied_1"}
        bio={""}
        soundConfig={"characters_voice\\human_01\\zombied\\"}
        visual={"actors\\stalker_zombied\\stalker_zombied_1"}
        crouchType={0}
        community={communities.zombied}
        supplies={[
          { section: weapons.wpn_wincheaster1300 },
          { section: weapons.wpn_pm },
          { section: ammo.ammo_12x70_buck },
          { section: ammo.ammo_9x18_fmj },
          ...loadoutCharacterItemsWithoutTorch,
          ...loadoutCharacterFood,
          ...loadoutCharacterDrugs,
        ]}
      >
        {characterProfileCriticals}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_zombied_1_default_2"}
        class={"sim_default_zombied_1"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Zombied_1"}
        bio={""}
        soundConfig={"characters_voice\\human_01\\zombied\\"}
        visual={"actors\\stalker_zombied\\stalker_zombied_1"}
        crouchType={0}
        community={communities.zombied}
        supplies={[
          { section: weapons.wpn_mp5 },
          { section: weapons.wpn_pm },
          { section: ammo.ammo_9x19_fmj },
          { section: ammo.ammo_9x18_fmj },
          ...loadoutCharacterItemsWithoutTorch,
          ...loadoutCharacterFood,
          ...loadoutCharacterDrugs,
        ]}
      >
        {characterProfileCriticals}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_zombied_2_default_0"}
        class={"sim_default_zombied_2"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Zombied_2"}
        bio={""}
        soundConfig={"characters_voice\\human_01\\zombied\\"}
        visual={"actors\\stalker_zombied\\stalker_zombied_2"}
        crouchType={0}
        rank={10}
        community={communities.zombied}
        supplies={[
          { section: weapons.wpn_ak74u },
          { section: weapons.wpn_fort },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_fmj },
          ...loadoutCharacterItemsWithoutTorch,
          ...loadoutCharacterFood,
          ...loadoutCharacterDrugs2,
        ]}
      >
        {characterProfileCriticals}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_zombied_2_default_1"}
        class={"sim_default_zombied_2"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Zombied_2"}
        bio={""}
        soundConfig={"characters_voice\\human_01\\zombied\\"}
        visual={"actors\\stalker_zombied\\stalker_zombied_2"}
        crouchType={0}
        rank={10}
        community={communities.zombied}
        supplies={[
          { section: weapons.wpn_wincheaster1300 },
          { section: weapons.wpn_hpsa },
          { section: ammo.ammo_12x70_buck },
          { section: ammo.ammo_9x19_fmj },
          ...loadoutCharacterItemsWithoutTorch,
          ...loadoutCharacterFood,
          ...loadoutCharacterDrugs2,
        ]}
      >
        {characterProfileCriticals}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_zombied_2_default_2"}
        class={"sim_default_zombied_2"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Zombied_2"}
        bio={""}
        soundConfig={"characters_voice\\human_01\\zombied\\"}
        visual={"actors\\stalker_zombied\\stalker_zombied_2"}
        crouchType={0}
        rank={10}
        community={communities.zombied}
        supplies={[
          { section: weapons.wpn_mp5 },
          { section: weapons.wpn_hpsa },
          { section: ammo.ammo_9x19_fmj },
          ...loadoutCharacterItemsWithoutTorch,
          ...loadoutCharacterFood,
          ...loadoutCharacterDrugs2,
        ]}
      >
        {characterProfileCriticals}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_zombied_2_default_3"}
        class={"sim_default_zombied_2"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Zombied_2"}
        bio={""}
        soundConfig={"characters_voice\\human_01\\zombied\\"}
        visual={"actors\\stalker_zombied\\stalker_zombied_2"}
        crouchType={0}
        rank={10}
        community={communities.zombied}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_colt1911 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo["ammo_11.43x23_fmj"] },
          ...loadoutCharacterItemsWithoutTorch2,
          ...loadoutCharacterFood,
          ...loadoutCharacterDrugs2,
        ]}
      >
        {characterProfileCriticals}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_zombied_3_default_0"}
        class={"sim_default_zombied_3"}
        name={GENERATE_ARMY_PRIVATE_NAME}
        icon={"ui_inGame2_Zombied_3"}
        bio={""}
        soundConfig={"characters_voice\\human_01\\zombied\\"}
        visual={"actors\\stalker_zombied\\stalker_zombied_3"}
        crouchType={0}
        rank={20}
        community={communities.zombied}
        supplies={[
          { section: weapons.wpn_ak74u },
          { section: weapons.wpn_fort },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_fmj },
          ...loadoutCharacterItemsWithoutTorch2,
          ...loadoutCharacterFood,
          ...loadoutCharacterDrugs2,
          ...loadoutCharacterDrugsMilitary,
        ]}
      >
        {characterProfileCriticals}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_zombied_3_default_1"}
        class={"sim_default_zombied_3"}
        name={GENERATE_ARMY_SERGEANT_NAME}
        icon={"ui_inGame2_Zombied_3"}
        bio={""}
        soundConfig={"characters_voice\\human_01\\zombied\\"}
        visual={"actors\\stalker_zombied\\stalker_zombied_3"}
        crouchType={0}
        rank={20}
        community={communities.zombied}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_fort },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_fmj },
          ...loadoutCharacterItemsWithoutTorch2,
          ...loadoutCharacterFood,
          ...loadoutCharacterDrugs2,
          ...loadoutCharacterDrugsMilitary,
        ]}
      >
        {characterProfileCriticals}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_zombied_3_default_2"}
        class={"sim_default_zombied_3"}
        name={GENERATE_ARMY_LIEUTENANT_NAME}
        icon={"ui_inGame2_Zombied_3"}
        bio={""}
        soundConfig={"characters_voice\\human_01\\zombied\\"}
        visual={"actors\\stalker_zombied\\stalker_zombied_3"}
        crouchType={0}
        rank={20}
        community={communities.zombied}
        supplies={[
          { section: weapons.wpn_abakan },
          { section: weapons.wpn_fort },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_fmj },
          ...loadoutCharacterItemsWithoutTorch2,
          ...loadoutCharacterFood,
          ...loadoutCharacterDrugs2,
          ...loadoutCharacterDrugsMilitary,
        ]}
      >
        {characterProfileCriticals}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_zombied_3_default_3"}
        class={"sim_default_zombied_3"}
        name={GENERATE_ARMY_PRIVATE_NAME}
        icon={"ui_inGame2_Zombied_3"}
        bio={""}
        soundConfig={"characters_voice\\human_01\\zombied\\"}
        visual={"actors\\stalker_zombied\\stalker_zombied_3"}
        crouchType={0}
        rank={20}
        community={communities.zombied}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_fort },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_fmj },
          ...loadoutCharacterItemsWithoutTorch2,
          ...loadoutCharacterFood,
          ...loadoutCharacterDrugs2,
          ...loadoutCharacterDrugsMilitary,
        ]}
      >
        {characterProfileCriticals}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_zombied_4_default_0"}
        class={"sim_default_zombied_4"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Zombied_4"}
        bio={""}
        soundConfig={"characters_voice\\human_01\\zombied\\"}
        visual={"actors\\stalker_zombied\\stalker_zombied_4"}
        crouchType={0}
        rank={25}
        community={communities.zombied}
        supplies={[
          { section: weapons.wpn_sig550 },
          { section: weapons.wpn_walther },
          { section: ammo["ammo_5.56x45_ap"] },
          { section: ammo.ammo_9x19_pbp },
          ...loadoutCharacterItemsWithoutTorch3,
          ...loadoutCharacterFood,
          ...loadoutCharacterDrugs4,
          ...loadoutCharacterDrugsMilitary,
        ]}
      >
        {characterProfileCriticals}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_zombied_4_default_1"}
        class={"sim_default_zombied_4"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Zombied_4"}
        bio={""}
        soundConfig={"characters_voice\\human_01\\zombied\\"}
        visual={"actors\\stalker_zombied\\stalker_zombied_4"}
        crouchType={0}
        rank={25}
        community={communities.zombied}
        supplies={[
          { section: weapons.wpn_spas12 },
          { section: weapons.wpn_usp },
          { section: ammo.ammo_12x76_zhekan },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...loadoutCharacterItemsWithoutTorch3,
          ...loadoutCharacterFood,
          ...loadoutCharacterDrugs4,
          ...loadoutCharacterDrugsMilitary,
        ]}
      >
        {characterProfileCriticals}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_zombied_4_default_2"}
        class={"sim_default_zombied_4"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Zombied_4"}
        bio={""}
        soundConfig={"characters_voice\\human_01\\zombied\\"}
        visual={"actors\\stalker_zombied\\stalker_zombied_4"}
        crouchType={0}
        rank={25}
        community={communities.zombied}
        supplies={[
          { section: weapons.wpn_groza },
          { section: weapons.wpn_sig220 },
          { section: ammo.ammo_9x39_ap },
          { section: ammo["ammo_11.43x23_fmj"] },
          ...loadoutCharacterItemsWithoutTorch3,
          ...loadoutCharacterFood,
          ...loadoutCharacterDrugs4,
          ...loadoutCharacterDrugsMilitary,
        ]}
      >
        {characterProfileCriticals}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_zombied_4_default_3"}
        class={"sim_default_zombied_4"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Zombied_4"}
        bio={""}
        soundConfig={"characters_voice\\human_01\\zombied\\"}
        visual={"actors\\stalker_zombied\\stalker_zombied_4"}
        crouchType={0}
        rank={25}
        community={communities.zombied}
        supplies={[
          { section: weapons.wpn_pkm },
          { section: weapons.wpn_colt1911 },
          { section: ammo.ammo_pkm_100 },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...loadoutCharacterItemsWithoutTorch3,
          ...loadoutCharacterFood,
          ...loadoutCharacterDrugs4,
          ...loadoutCharacterDrugsMilitary,
        ]}
      >
        {characterProfileCriticals}
        {defaultCharacterDialogs}
      </SpecificCharacter>
    </Fragment>
  );
}
