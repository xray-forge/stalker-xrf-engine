import { Fragment, JSXNode, JSXXML } from "jsx-xml";

import {
  CharacterProfileCriticals,
  DefaultCharacterDialogs,
  loadoutCharacterDrugs,
  loadoutCharacterDrugs2,
  loadoutCharacterDrugs3,
  loadoutCharacterDrugs4,
  loadoutCharacterDrugsMilitary,
  loadoutCharacterDrugsScientific,
  loadoutCharacterFood,
  loadoutCharacterItems,
  loadoutCharacterItemsMonolith,
  profileIcon,
} from "@/engine/configs/gameplay/loadouts";
import { SpecificCharacter } from "@/engine/configs/gameplay/utils";
import { communities } from "@/engine/lib/constants/communities";
import { ammo } from "@/engine/lib/constants/items/ammo";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { GENERATE_STALKER_NAME } from "@/engine/lib/constants/names";

export function MonolithLoadout(): JSXNode {
  return (
    <Fragment>
      <SpecificCharacter
        id={"stalker_monolith_default"}
        class={"stalker_monolith_default"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_monolit_2}
        community={communities.monolith}
        soundConfig={"characters_voice\\human_01\\monolith\\"}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_fort },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_fmj },
          ...loadoutCharacterItems(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugs(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_0_default_0"}
        class={"sim_default_monolith_0"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_monolit_2}
        community={communities.monolith}
        rank={30}
        soundConfig={"characters_voice\\human_01\\monolith\\"}
        supplies={[
          { section: weapons.wpn_ak74u },
          { section: weapons.wpn_fort },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_fmj },
          ...loadoutCharacterItemsMonolith(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugs(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_0_default_1"}
        class={"sim_default_monolith_0"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_monolit_2}
        community={communities.monolith}
        rank={30}
        soundConfig={"characters_voice\\human_01\\monolith\\"}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_pm },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_fmj },
          ...loadoutCharacterItemsMonolith(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugs(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_0_default_2"}
        class={"sim_default_monolith_0"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_monolit_2}
        community={communities.monolith}
        rank={30}
        soundConfig={"characters_voice\\human_01\\monolith\\"}
        supplies={[
          { section: weapons.wpn_ak74u },
          { section: weapons.wpn_fort },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_fmj },
          ...loadoutCharacterItemsMonolith(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugs(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_1_default_0"}
        class={"sim_default_monolith_1"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_monolit_2}
        community={communities.monolith}
        rank={35}
        soundConfig={"characters_voice\\human_01\\monolith\\"}
        supplies={[
          { section: weapons.wpn_wincheaster1300 },
          { section: weapons.wpn_fort },
          { section: ammo.ammo_12x70_buck },
          { section: ammo.ammo_9x18_fmj },
          ...loadoutCharacterItemsMonolith(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugs2(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_1_default_1"}
        class={"sim_default_monolith_1"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_monolit_2}
        community={communities.monolith}
        rank={35}
        soundConfig={"characters_voice\\human_01\\monolith\\"}
        supplies={[
          { section: weapons.wpn_l85 },
          { section: weapons.wpn_pm },
          { section: weapons.grenade_rgd5 },
          { section: ammo["ammo_5.56x45_ss190"] },
          { section: ammo.ammo_9x18_fmj },
          ...loadoutCharacterItemsMonolith(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugs2(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_1_default_2"}
        class={"sim_default_monolith_1"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_monolit_2}
        community={communities.monolith}
        rank={35}
        soundConfig={"characters_voice\\human_01\\monolith\\"}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_pm },
          { section: weapons.grenade_rgd5 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_fmj },
          ...loadoutCharacterItemsMonolith(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugs2(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_1_default_3"}
        class={"sim_default_monolith_1"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_monolit_2}
        community={communities.monolith}
        rank={35}
        soundConfig={"characters_voice\\human_01\\monolith\\"}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_fort },
          { section: weapons.grenade_rgd5 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_fmj },
          ...loadoutCharacterItemsMonolith(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugs2(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_2_default_0"}
        class={"sim_default_monolith_2"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_monolit_2}
        community={communities.monolith}
        rank={45}
        soundConfig={"characters_voice\\human_01\\monolith\\"}
        supplies={[
          { section: weapons.wpn_l85 },
          { section: weapons.wpn_walther },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo["ammo_5.56x45_ap"] },
          { section: ammo.ammo_9x19_fmj },
          ...loadoutCharacterItemsMonolith(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugs3(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_2_default_1"}
        class={"sim_default_monolith_2"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_monolit_1}
        community={communities.monolith}
        rank={45}
        soundConfig={"characters_voice\\human_01\\monolith\\"}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_pm },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo["ammo_5.45x39_ap"] },
          { section: ammo.ammo_9x18_pmm },
          ...loadoutCharacterItemsMonolith(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugs3(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_2_default_2"}
        class={"sim_default_monolith_2"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_monolit_1}
        community={communities.monolith}
        rank={45}
        soundConfig={"characters_voice\\human_01\\monolith\\"}
        supplies={[
          { section: weapons.wpn_lr300 },
          { section: weapons.wpn_fort },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo["ammo_5.56x45_ss190"] },
          { section: ammo.ammo_9x18_pmm },
          ...loadoutCharacterItemsMonolith(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugs3(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_2_default_3"}
        class={"sim_default_monolith_2"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_monolit_1}
        community={communities.monolith}
        rank={45}
        soundConfig={"characters_voice\\human_01\\monolith\\"}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_beretta },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x19_fmj },
          ...loadoutCharacterItemsMonolith(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugs3(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_2_default_4"}
        class={"sim_default_monolith_2"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_monolit_2}
        community={communities.monolith}
        rank={45}
        soundConfig={"characters_voice\\human_01\\monolith\\"}
        supplies={[
          { section: weapons.wpn_lr300 },
          { section: weapons.wpn_hpsa },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo["ammo_5.56x45_ss190"] },
          { section: ammo.ammo_9x19_fmj },
          ...loadoutCharacterItemsMonolith(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugs3(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_2_default_5"}
        class={"sim_default_monolith_2"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_monolit_2}
        community={communities.monolith}
        rank={45}
        soundConfig={"characters_voice\\human_01\\monolith\\"}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_pm },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo["ammo_5.56x45_ap"] },
          { section: ammo.ammo_9x18_pmm },
          ...loadoutCharacterItemsMonolith(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugs3(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_2_default_6"}
        class={"sim_default_monolith_2"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_monolit_2}
        community={communities.monolith}
        rank={45}
        soundConfig={"characters_voice\\human_01\\monolith\\"}
        supplies={[
          { section: weapons.wpn_l85 },
          { section: weapons.wpn_pm },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo["ammo_5.56x45_ap"] },
          { section: ammo.ammo_9x18_pmm },
          ...loadoutCharacterItemsMonolith(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugs3(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_2_default_7"}
        class={"sim_default_monolith_2"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_monolit_2}
        community={communities.monolith}
        rank={45}
        soundConfig={"characters_voice\\human_01\\monolith\\"}
        supplies={[
          { section: weapons.wpn_abakan },
          { section: weapons.wpn_fort },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo["ammo_5.45x39_ap"] },
          { section: ammo.ammo_9x18_pmm },
          ...loadoutCharacterItemsMonolith(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugs3(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_3_default_0"}
        class={"sim_default_monolith_3"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_monolit_2}
        community={communities.monolith}
        rank={55}
        soundConfig={"characters_voice\\human_02\\monolith\\"}
        supplies={[
          { section: weapons.wpn_sig550 },
          { section: weapons.wpn_walther },
          { section: weapons.grenade_f1, count: 3 },
          { section: ammo["ammo_5.56x45_ap"] },
          { section: ammo.ammo_9x19_pbp },
          ...loadoutCharacterItemsMonolith(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugs3(),
          ...loadoutCharacterDrugsMilitary(),
          ...loadoutCharacterDrugsScientific(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_3_default_1"}
        class={"sim_default_monolith_3"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_monolit_2}
        community={communities.monolith}
        rank={55}
        soundConfig={"characters_voice\\human_02\\monolith\\"}
        supplies={[
          { section: weapons.wpn_val },
          { section: weapons.wpn_sig220 },
          { section: weapons.grenade_f1, count: 3 },
          { section: ammo.ammo_9x39_ap },
          { section: ammo["ammo_11.43x23_fmj"] },
          ...loadoutCharacterItemsMonolith(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugs3(),
          ...loadoutCharacterDrugsMilitary(),
          ...loadoutCharacterDrugsScientific(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_3_default_2"}
        class={"sim_default_monolith_3"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_monolit_3}
        community={communities.monolith}
        rank={55}
        soundConfig={"characters_voice\\human_02\\monolith\\"}
        supplies={[
          { section: weapons.wpn_val, scope: true },
          { section: weapons.wpn_sig220, silencer: true },
          { section: weapons.grenade_f1, count: 3 },
          { section: ammo.ammo_9x39_ap },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...loadoutCharacterItemsMonolith(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugs3(),
          ...loadoutCharacterDrugsMilitary(),
          ...loadoutCharacterDrugsScientific(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_3_default_3"}
        class={"sim_default_monolith_3"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_monolit_1}
        community={communities.monolith}
        rank={55}
        soundConfig={"characters_voice\\human_02\\monolith\\"}
        supplies={[
          { section: weapons.wpn_svd },
          { section: weapons.wpn_usp, silencer: true },
          { section: ammo["ammo_7.62x54_7h1"] },
          { section: ammo["ammo_11.43x23_fmj"] },
          ...loadoutCharacterItemsMonolith(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugs3(),
          ...loadoutCharacterDrugsMilitary(),
          ...loadoutCharacterDrugsScientific(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_3_default_4"}
        class={"sim_default_monolith_3"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_monolit_3}
        community={communities.monolith}
        rank={55}
        soundConfig={"characters_voice\\human_02\\monolith\\"}
        supplies={[
          { section: weapons.wpn_sig550 },
          { section: weapons.wpn_usp },
          { section: ammo["ammo_5.56x45_ap"] },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...loadoutCharacterItemsMonolith(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugs3(),
          ...loadoutCharacterDrugsMilitary(),
          ...loadoutCharacterDrugsScientific(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_4_default_0"}
        class={"sim_default_monolith_4"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_monolit_2}
        community={communities.monolith}
        rank={60}
        soundConfig={"characters_voice\\human_02\\monolith\\"}
        supplies={[
          { section: weapons.wpn_vintorez },
          { section: weapons.wpn_sig220, silencer: true },
          { section: ammo.ammo_9x39_ap },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...loadoutCharacterItemsMonolith(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugs4(),
          ...loadoutCharacterDrugsMilitary(),
          ...loadoutCharacterDrugsScientific(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_4_default_1"}
        class={"sim_default_monolith_4"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_monolit_4}
        community={communities.monolith}
        rank={60}
        soundConfig={"characters_voice\\human_02\\monolith\\"}
        supplies={[
          { section: weapons.wpn_groza },
          { section: weapons.wpn_sig220 },
          { section: weapons.grenade_f1, count: 4 },
          { section: ammo.ammo_9x39_ap },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...loadoutCharacterItemsMonolith(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugs4(),
          ...loadoutCharacterDrugsMilitary(),
          ...loadoutCharacterDrugsScientific(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_4_default_2"}
        class={"sim_default_monolith_4"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_monolit_4}
        community={communities.monolith}
        rank={60}
        soundConfig={"characters_voice\\human_02\\monolith\\"}
        supplies={[
          { section: weapons.wpn_protecta },
          { section: weapons.wpn_usp },
          { section: weapons.grenade_f1, count: 4 },
          { section: ammo.ammo_12x76_zhekan },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...loadoutCharacterItemsMonolith(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugs4(),
          ...loadoutCharacterDrugsMilitary(),
          ...loadoutCharacterDrugsScientific(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_4_default_3"}
        class={"sim_default_monolith_4"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_monolit_4}
        community={communities.monolith}
        rank={60}
        soundConfig={"characters_voice\\human_02\\monolith\\"}
        supplies={[
          { section: weapons.wpn_g36 },
          { section: weapons.wpn_usp },
          { section: weapons.grenade_f1, count: 4 },
          { section: ammo["ammo_5.56x45_ap"] },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...loadoutCharacterItemsMonolith(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugs4(),
          ...loadoutCharacterDrugsMilitary(),
          ...loadoutCharacterDrugsScientific(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>
    </Fragment>
  );
}
