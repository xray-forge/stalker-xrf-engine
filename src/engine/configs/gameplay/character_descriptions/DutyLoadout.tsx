import { Fragment, JSXNode, JSXXML } from "jsx-xml";

import { SpecificCharacter } from "@/engine/configs/gameplay/components";
import {
  CharacterProfileCriticals,
  DefaultCharacterDialogs,
  loadoutAbakan,
  loadoutAk74,
  loadoutAk74u,
  loadoutBeretta,
  loadoutCharacterDrugsAdvanced,
  loadoutCharacterDrugsBase,
  loadoutCharacterDrugsElite,
  loadoutCharacterDrugsExtended,
  loadoutCharacterDrugsMilitary,
  loadoutCharacterFood,
  loadoutCharacterItems,
  loadoutCharacterItems2,
  loadoutCharacterItems3,
  loadoutCharacterSellWeapons,
  loadoutF1Grenades,
  loadoutFort,
  loadoutGroza,
  loadoutPkm,
  loadoutPm,
  loadoutProtecta,
  loadoutRgd5Grenades,
  loadoutSig220,
  loadoutSig550,
  loadoutSpas12,
  loadoutUsp,
  loadoutVal,
  loadoutWalther,
  profileIcon,
} from "@/engine/configs/gameplay/loadouts";
import { communities } from "@/engine/lib/constants/communities";
import {
  GENERATE_CAPTAIN_NAME,
  GENERATE_LIEUTENANT_NAME,
  GENERATE_PRIVATE_NAME,
  GENERATE_SERGEANT_NAME,
  GENERATE_STALKER_NAME,
} from "@/engine/lib/constants/names";

export function DutyLoadout(): JSXNode {
  return (
    <Fragment>
      <SpecificCharacter
        id={"stalker_dolg_default"}
        class={"Stalker_dolg"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Dolg_2}
        community={communities.dolg}
        soundConfig={"characters_voice\\human_01\\dolg\\"}
        supplies={[
          ...loadoutSig550(),
          ...loadoutBeretta(),
          ...loadoutRgd5Grenades(),
          ...loadoutCharacterItems(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsBase(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_0_default_0"}
        class={"sim_default_duty_0"}
        name={GENERATE_PRIVATE_NAME}
        icon={profileIcon.ui_inGame2_Dolg_2}
        community={communities.dolg}
        moneyMin={500}
        moneyMax={1500}
        rank={30}
        soundConfig={"characters_voice\\human_01\\dolg\\"}
        supplies={[
          ...loadoutAk74u(),
          ...loadoutFort(),
          ...loadoutCharacterItems(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsBase(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_0_default_1"}
        class={"sim_default_duty_0"}
        name={GENERATE_PRIVATE_NAME}
        icon={profileIcon.ui_inGame2_Dolg_2}
        community={communities.dolg}
        moneyMin={500}
        moneyMax={1500}
        rank={30}
        soundConfig={"characters_voice\\human_01\\dolg\\"}
        supplies={[
          ...loadoutAk74u(),
          ...loadoutPm(),
          ...loadoutCharacterItems(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsBase(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_0_default_2"}
        class={"sim_default_duty_0"}
        name={GENERATE_PRIVATE_NAME}
        icon={profileIcon.ui_inGame2_Dolg_2}
        community={communities.dolg}
        moneyMin={500}
        moneyMax={1500}
        rank={30}
        soundConfig={"characters_voice\\human_01\\dolg\\"}
        supplies={[
          ...loadoutAk74(),
          ...loadoutFort(),
          ...loadoutCharacterItems(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsBase(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_0_default_3"}
        class={"sim_default_duty_0"}
        name={GENERATE_PRIVATE_NAME}
        icon={profileIcon.ui_inGame2_Dolg_2}
        community={communities.dolg}
        moneyMin={500}
        moneyMax={1500}
        rank={30}
        soundConfig={"characters_voice\\human_01\\dolg\\"}
        supplies={[
          ...loadoutAk74(),
          ...loadoutPm(),
          ...loadoutCharacterItems(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsBase(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_1_default_0"}
        class={"sim_default_duty_1"}
        name={GENERATE_PRIVATE_NAME}
        icon={profileIcon.ui_inGame2_Dolg_2}
        community={communities.dolg}
        moneyMin={1000}
        moneyMax={3000}
        rank={35}
        soundConfig={"characters_voice\\human_01\\dolg\\"}
        supplies={[
          ...loadoutAk74(),
          ...loadoutFort(),
          ...loadoutRgd5Grenades(),
          ...loadoutCharacterItems(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsExtended(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_1_default_1"}
        class={"sim_default_duty_1"}
        name={GENERATE_PRIVATE_NAME}
        icon={profileIcon.ui_inGame2_Dolg_2}
        community={communities.dolg}
        moneyMin={1000}
        moneyMax={3000}
        rank={35}
        soundConfig={"characters_voice\\human_01\\dolg\\"}
        supplies={[
          ...loadoutAk74(),
          ...loadoutPm(),
          ...loadoutRgd5Grenades(),
          ...loadoutCharacterItems(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsExtended(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_1_default_2"}
        class={"sim_default_duty_1"}
        name={GENERATE_SERGEANT_NAME}
        icon={profileIcon.ui_inGame2_Dolg_2}
        community={communities.dolg}
        moneyMin={1000}
        moneyMax={3000}
        rank={35}
        soundConfig={"characters_voice\\human_01\\dolg\\"}
        supplies={[
          ...loadoutAk74(),
          ...loadoutPm(),
          ...loadoutRgd5Grenades(),
          ...loadoutCharacterItems(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsExtended(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_1_default_3"}
        class={"sim_default_duty_1"}
        name={GENERATE_SERGEANT_NAME}
        icon={profileIcon.ui_inGame2_Dolg_2}
        community={communities.dolg}
        moneyMin={1000}
        moneyMax={3000}
        rank={35}
        soundConfig={"characters_voice\\human_01\\dolg\\"}
        supplies={[
          ...loadoutAk74(),
          ...loadoutFort(),
          ...loadoutRgd5Grenades(),
          ...loadoutCharacterItems(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsExtended(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_2_default_0"}
        class={"sim_default_duty_2"}
        name={GENERATE_SERGEANT_NAME}
        icon={profileIcon.ui_inGame2_Dolg_2}
        community={communities.dolg}
        moneyMin={1500}
        moneyMax={3500}
        rank={45}
        soundConfig={"characters_voice\\human_01\\dolg\\"}
        supplies={[
          ...loadoutAk74(),
          ...loadoutPm(),
          ...loadoutRgd5Grenades(2),
          ...loadoutCharacterItems2(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_2_default_1"}
        class={"sim_default_duty_2"}
        name={GENERATE_SERGEANT_NAME}
        icon={profileIcon.ui_inGame2_Dolg_2}
        community={communities.dolg}
        moneyMin={1500}
        moneyMax={3500}
        rank={45}
        soundConfig={"characters_voice\\human_01\\dolg\\"}
        supplies={[
          ...loadoutAbakan(),
          ...loadoutFort(),
          ...loadoutRgd5Grenades(2),
          ...loadoutCharacterItems2(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_2_default_2"}
        class={"sim_default_duty_2"}
        name={GENERATE_SERGEANT_NAME}
        icon={profileIcon.ui_inGame2_Dolg_2}
        community={communities.dolg}
        moneyMin={1500}
        moneyMax={3500}
        rank={45}
        soundConfig={"characters_voice\\human_01\\dolg\\"}
        supplies={[
          ...loadoutSpas12(),
          ...loadoutFort(),
          ...loadoutRgd5Grenades(2),
          ...loadoutCharacterItems2(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_2_default_3"}
        class={"sim_default_duty_2"}
        name={GENERATE_SERGEANT_NAME}
        icon={profileIcon.ui_inGame2_Dolg_2}
        community={communities.dolg}
        moneyMin={1500}
        moneyMax={3500}
        rank={45}
        soundConfig={"characters_voice\\human_01\\dolg\\"}
        supplies={[
          ...loadoutSpas12(),
          ...loadoutWalther(),
          ...loadoutRgd5Grenades(2),
          ...loadoutCharacterItems2(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_2_default_4"}
        class={"sim_default_duty_2"}
        name={GENERATE_SERGEANT_NAME}
        icon={profileIcon.ui_inGame2_Dolg_2}
        community={communities.dolg}
        moneyMin={1500}
        moneyMax={3500}
        rank={45}
        soundConfig={"characters_voice\\human_01\\dolg\\"}
        supplies={[
          ...loadoutAbakan(),
          ...loadoutPm(),
          ...loadoutRgd5Grenades(2),
          ...loadoutCharacterItems2(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_2_default_5"}
        class={"sim_default_duty_2"}
        name={GENERATE_SERGEANT_NAME}
        icon={profileIcon.ui_inGame2_Dolg_2}
        community={communities.dolg}
        moneyMin={1500}
        moneyMax={3500}
        rank={45}
        soundConfig={"characters_voice\\human_01\\dolg\\"}
        supplies={[
          ...loadoutAk74(),
          ...loadoutPm(),
          ...loadoutRgd5Grenades(2),
          ...loadoutCharacterItems2(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_2_default_6"}
        class={"sim_default_duty_2"}
        name={GENERATE_SERGEANT_NAME}
        icon={profileIcon.ui_inGame2_Dolg_1}
        community={communities.dolg}
        moneyMin={1500}
        moneyMax={3500}
        rank={45}
        soundConfig={"characters_voice\\human_01\\dolg\\"}
        supplies={[
          ...loadoutAk74(),
          ...loadoutWalther(),
          ...loadoutRgd5Grenades(2),
          ...loadoutCharacterItems2(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_2_default_7"}
        class={"sim_default_duty_2"}
        name={GENERATE_SERGEANT_NAME}
        icon={profileIcon.ui_inGame2_Dolg_1}
        community={communities.dolg}
        moneyMin={1500}
        moneyMax={3500}
        rank={45}
        soundConfig={"characters_voice\\human_01\\dolg\\"}
        supplies={[
          ...loadoutAbakan(),
          ...loadoutWalther(),
          ...loadoutRgd5Grenades(2),
          ...loadoutCharacterItems2(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_3_default_0"}
        class={"sim_default_duty_3"}
        name={GENERATE_LIEUTENANT_NAME}
        icon={profileIcon.ui_inGame2_Dolg_3}
        community={communities.dolg}
        moneyMin={2500}
        moneyMax={5000}
        rank={55}
        soundConfig={"characters_voice\\human_01\\dolg\\"}
        supplies={[
          ...loadoutAbakan({ scope: true }),
          ...loadoutWalther(true),
          ...loadoutF1Grenades(3),
          ...loadoutCharacterItems2(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsAdvanced(),
          ...loadoutCharacterDrugsMilitary(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_3_default_1"}
        class={"sim_default_duty_3"}
        name={GENERATE_LIEUTENANT_NAME}
        icon={profileIcon.ui_inGame2_Dolg_3}
        community={communities.dolg}
        moneyMin={2500}
        moneyMax={5000}
        rank={55}
        soundConfig={"characters_voice\\human_02\\dolg\\"}
        supplies={[
          ...loadoutAbakan({ ap: true }),
          ...loadoutSig220(),
          ...loadoutF1Grenades(3),
          ...loadoutCharacterItems2(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsAdvanced(),
          ...loadoutCharacterDrugsMilitary(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_3_default_2"}
        class={"sim_default_duty_3"}
        name={GENERATE_LIEUTENANT_NAME}
        icon={profileIcon.ui_inGame2_Dolg_3}
        community={communities.dolg}
        moneyMin={2500}
        moneyMax={5000}
        rank={55}
        soundConfig={"characters_voice\\human_02\\dolg\\"}
        supplies={[
          ...loadoutVal(),
          ...loadoutWalther(),
          ...loadoutF1Grenades(3),
          ...loadoutCharacterItems2(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsAdvanced(),
          ...loadoutCharacterDrugsMilitary(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_3_default_3"}
        class={"sim_default_duty_3"}
        name={GENERATE_LIEUTENANT_NAME}
        icon={profileIcon.ui_inGame2_Dolg_3}
        community={communities.dolg}
        moneyMin={2500}
        moneyMax={5000}
        rank={55}
        soundConfig={"characters_voice\\human_02\\dolg\\"}
        supplies={[
          ...loadoutProtecta(true),
          ...loadoutFort(),
          ...loadoutF1Grenades(3),
          ...loadoutCharacterItems2(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsAdvanced(),
          ...loadoutCharacterDrugsMilitary(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_3_default_4"}
        class={"sim_default_duty_3"}
        name={GENERATE_LIEUTENANT_NAME}
        icon={profileIcon.ui_inGame2_Dolg_3}
        community={communities.dolg}
        moneyMin={2500}
        moneyMax={5000}
        rank={55}
        soundConfig={"characters_voice\\human_02\\dolg\\"}
        supplies={[
          ...loadoutGroza(),
          ...loadoutSig220(),
          ...loadoutF1Grenades(3),
          ...loadoutCharacterItems2(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsAdvanced(),
          ...loadoutCharacterDrugsMilitary(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_4_default_0"}
        class={"sim_default_duty_4"}
        name={GENERATE_CAPTAIN_NAME}
        icon={profileIcon.ui_inGame2_Dolg_4}
        community={communities.dolg}
        moneyMin={5000}
        moneyMax={10000}
        rank={60}
        soundConfig={"characters_voice\\human_02\\dolg\\"}
        supplies={[
          ...loadoutGroza({ ap: true }),
          ...loadoutSig220(),
          ...loadoutF1Grenades(3),
          ...loadoutCharacterItems3(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsElite(),
          ...loadoutCharacterDrugsMilitary(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_4_default_1"}
        class={"sim_default_duty_4"}
        name={GENERATE_CAPTAIN_NAME}
        icon={profileIcon.ui_inGame2_Dolg_4}
        community={communities.dolg}
        moneyMin={5000}
        moneyMax={10000}
        rank={60}
        soundConfig={"characters_voice\\human_02\\dolg\\"}
        supplies={[
          ...loadoutGroza({ ap: true }),
          ...loadoutUsp({ ap: true }),
          ...loadoutF1Grenades(3),
          ...loadoutCharacterItems3(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsElite(),
          ...loadoutCharacterDrugsMilitary(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_4_default_2"}
        class={"sim_default_duty_4"}
        name={GENERATE_CAPTAIN_NAME}
        icon={profileIcon.ui_inGame2_Dolg_4}
        community={communities.dolg}
        moneyMin={5000}
        moneyMax={10000}
        rank={60}
        soundConfig={"characters_voice\\human_02\\dolg\\"}
        supplies={[
          ...loadoutAbakan({ ap: true }),
          ...loadoutSig220({ ap: true }),
          ...loadoutF1Grenades(),
          ...loadoutCharacterItems3(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsElite(),
          ...loadoutCharacterDrugsMilitary(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_4_default_3"}
        class={"sim_default_duty_4"}
        name={GENERATE_CAPTAIN_NAME}
        icon={profileIcon.ui_inGame2_Dolg_4}
        community={communities.dolg}
        moneyMin={5000}
        moneyMax={10000}
        rank={60}
        soundConfig={"characters_voice\\human_02\\dolg\\"}
        supplies={[
          ...loadoutPkm(),
          ...loadoutUsp(),
          ...loadoutF1Grenades(),
          ...loadoutCharacterItems3(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsElite(),
          ...loadoutCharacterDrugsMilitary(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_4_default_4"}
        class={"sim_default_duty_4"}
        name={GENERATE_CAPTAIN_NAME}
        icon={profileIcon.ui_inGame2_Dolg_4}
        community={communities.dolg}
        moneyMin={5000}
        moneyMax={10000}
        rank={60}
        soundConfig={"characters_voice\\human_02\\dolg\\"}
        supplies={[
          ...loadoutProtecta(),
          ...loadoutUsp(),
          ...loadoutF1Grenades(),
          ...loadoutCharacterItems3(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsElite(),
          ...loadoutCharacterDrugsMilitary(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_4_default_5"}
        class={"sim_default_duty_4"}
        name={GENERATE_CAPTAIN_NAME}
        icon={profileIcon.ui_inGame2_Dolg_4}
        community={communities.dolg}
        moneyMin={5000}
        moneyMax={10000}
        rank={60}
        soundConfig={"characters_voice\\human_02\\dolg\\"}
        supplies={[
          ...loadoutVal({ ap: true }),
          ...loadoutUsp({ ap: true }),
          ...loadoutF1Grenades(),
          ...loadoutCharacterItems3(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsElite(),
          ...loadoutCharacterDrugsMilitary(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>
    </Fragment>
  );
}
