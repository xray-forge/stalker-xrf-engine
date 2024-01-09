import { Fragment, JSXNode, JSXXML } from "jsx-xml";

import { SpecificCharacter } from "@/engine/configs/gameplay/components";
import {
  CharacterProfileCriticals,
  DefaultCharacterDialogs,
  loadoutAk74,
  loadoutAk74u,
  loadoutBeretta,
  loadoutBm16,
  loadoutCharacterDrugsAdvanced,
  loadoutCharacterDrugsBase,
  loadoutCharacterDrugsElite,
  loadoutCharacterDrugsExtended,
  loadoutCharacterDrugsScientific,
  loadoutCharacterFood,
  loadoutCharacterItems,
  loadoutCharacterItems2,
  loadoutCharacterItems3,
  loadoutCharacterSellWeapons,
  loadoutColt1911,
  loadoutDesertEagle,
  loadoutF1Grenades,
  loadoutFn200,
  loadoutFort,
  loadoutG36,
  loadoutGroza,
  loadoutHpsa,
  loadoutL85,
  loadoutLr300,
  loadoutMp5,
  loadoutPm,
  loadoutProtecta,
  loadoutRgd5Grenades,
  loadoutSig220,
  loadoutSig550,
  loadoutSpas12,
  loadoutToz34,
  loadoutUsp,
  loadoutVal,
  loadoutVintorez,
  loadoutWincheaster1300,
  profileIcon,
} from "@/engine/configs/gameplay/loadouts";
import { communities } from "@/engine/lib/constants/communities";
import { GENERATE_STALKER_NAME } from "@/engine/lib/constants/names";

export function StalkerLoadout(): JSXNode {
  return (
    <Fragment>
      <SpecificCharacter
        id={"stalker_general_default"}
        class={"Stalker_general"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_neutral_1}
        community={communities.stalker}
        soundConfig={"characters_voice\\human_01\\stalker\\"}
        supplies={[
          ...loadoutSig550(),
          ...loadoutBeretta(),
          ...loadoutCharacterItems(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsBase(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"stalker_general_veteran_default"}
        class={"Stalker_general_veteran"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_neutral_3}
        community={communities.stalker}
        soundConfig={"characters_voice\\human_01\\stalker\\"}
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
        id={"sim_default_stalker_0_default_0"}
        class={"sim_default_stalker_0"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_neutral_1}
        community={communities.stalker}
        rank={25}
        moneyMin={250}
        moneyMax={1750}
        soundConfig={"characters_voice\\human_01\\stalker\\"}
        supplies={[
          ...loadoutBm16(),
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
        id={"sim_default_stalker_0_default_1"}
        class={"sim_default_stalker_0"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_neutral_1}
        community={communities.stalker}
        rank={25}
        moneyMin={250}
        moneyMax={1750}
        soundConfig={"characters_voice\\human_01\\stalker\\"}
        supplies={[
          ...loadoutToz34(),
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
        id={"sim_default_stalker_0_default_2"}
        class={"sim_default_stalker_0"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_neutral_1}
        community={communities.stalker}
        rank={25}
        moneyMin={250}
        moneyMax={1750}
        soundConfig={"characters_voice\\human_01\\stalker\\"}
        supplies={[
          ...loadoutToz34(),
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
        id={"sim_default_stalker_0_default_3"}
        class={"sim_default_stalker_0"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_neutral_1}
        community={communities.stalker}
        rank={25}
        moneyMin={250}
        moneyMax={1750}
        soundConfig={"characters_voice\\human_01\\stalker\\"}
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
        id={"sim_default_stalker_1_default_0"}
        class={"sim_default_stalker_1"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_neutral_2_mask}
        community={communities.stalker}
        rank={30}
        moneyMin={1000}
        moneyMax={2000}
        soundConfig={"characters_voice\\human_02\\stalker\\"}
        supplies={[
          ...loadoutAk74u(),
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
        id={"sim_default_stalker_1_default_1"}
        class={"sim_default_stalker_1"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_neutral_2_mask}
        community={communities.stalker}
        rank={30}
        moneyMin={1000}
        moneyMax={2000}
        soundConfig={"characters_voice\\human_02\\stalker\\"}
        supplies={[
          ...loadoutAk74u(),
          ...loadoutBeretta(),
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
        id={"sim_default_stalker_1_default_2"}
        class={"sim_default_stalker_1"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_neutral_2_mask}
        community={communities.stalker}
        rank={30}
        moneyMin={1000}
        moneyMax={2000}
        soundConfig={"characters_voice\\human_02\\stalker\\"}
        supplies={[
          ...loadoutToz34(true),
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
        id={"sim_default_stalker_1_default_3"}
        class={"sim_default_stalker_1"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_neutral_2_mask}
        community={communities.stalker}
        rank={30}
        moneyMin={1000}
        moneyMax={2000}
        soundConfig={"characters_voice\\human_02\\stalker\\"}
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
        id={"sim_default_stalker_1_default_4"}
        class={"sim_default_stalker_1"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_neutral_2_mask}
        community={communities.stalker}
        rank={30}
        moneyMin={1000}
        moneyMax={2000}
        soundConfig={"characters_voice\\human_02\\stalker\\"}
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
        id={"sim_default_stalker_1_default_5"}
        class={"sim_default_stalker_1"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_neutral_2}
        community={communities.stalker}
        rank={30}
        moneyMin={1000}
        moneyMax={2000}
        soundConfig={"characters_voice\\human_03\\stalker\\"}
        supplies={[
          ...loadoutAk74u(),
          ...loadoutHpsa(),
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
        id={"sim_default_stalker_1_default_6"}
        class={"sim_default_stalker_1"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_neutral_2}
        community={communities.stalker}
        rank={30}
        moneyMin={1000}
        moneyMax={2000}
        soundConfig={"characters_voice\\human_03\\stalker\\"}
        supplies={[
          ...loadoutAk74(),
          ...loadoutHpsa(),
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
        id={"sim_default_stalker_1_default_7"}
        class={"sim_default_stalker_1"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_neutral_2}
        community={communities.stalker}
        rank={30}
        moneyMin={1000}
        moneyMax={2000}
        soundConfig={"characters_voice\\human_03\\stalker\\"}
        supplies={[
          ...loadoutAk74u(),
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
        id={"sim_default_stalker_1_default_8"}
        class={"sim_default_stalker_1"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_neutral_2}
        community={communities.stalker}
        rank={30}
        moneyMin={1000}
        moneyMax={2000}
        soundConfig={"characters_voice\\human_03\\stalker\\"}
        supplies={[
          ...loadoutAk74(),
          ...loadoutBeretta(),
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
        id={"sim_default_stalker_1_default_9"}
        class={"sim_default_stalker_1"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_neutral_2}
        community={communities.stalker}
        rank={30}
        moneyMin={1000}
        moneyMax={2000}
        soundConfig={"characters_voice\\human_03\\stalker\\"}
        supplies={[
          ...loadoutL85(),
          ...loadoutHpsa(),
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
        id={"sim_default_stalker_2_default_0"}
        class={"sim_default_stalker_2"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_neutral_2_mask}
        community={communities.stalker}
        rank={40}
        moneyMin={1500}
        moneyMax={3500}
        soundConfig={"characters_voice\\human_02\\stalker\\"}
        supplies={[
          ...loadoutWincheaster1300(),
          ...loadoutBeretta(),
          ...loadoutRgd5Grenades(2),
          ...loadoutCharacterItems2(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsExtended(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_stalker_2_default_1"}
        class={"sim_default_stalker_2"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_neutral_2_mask}
        community={communities.stalker}
        rank={40}
        moneyMin={1500}
        moneyMax={3500}
        soundConfig={"characters_voice\\human_02\\stalker\\"}
        supplies={[
          ...loadoutL85(true),
          ...loadoutColt1911(),
          ...loadoutRgd5Grenades(2),
          ...loadoutCharacterItems2(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsExtended(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_stalker_2_default_2"}
        class={"sim_default_stalker_2"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_neutral_2_mask}
        community={communities.stalker}
        rank={40}
        moneyMin={1500}
        moneyMax={3500}
        soundConfig={"characters_voice\\human_02\\stalker\\"}
        supplies={[
          ...loadoutAk74({ ap: true }),
          ...loadoutBeretta(),
          ...loadoutRgd5Grenades(2),
          ...loadoutCharacterItems2(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsExtended(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_stalker_2_default_3"}
        class={"sim_default_stalker_2"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_neutral_2_mask}
        community={communities.stalker}
        rank={40}
        moneyMin={1500}
        moneyMax={3500}
        soundConfig={"characters_voice\\human_02\\stalker\\"}
        supplies={[
          ...loadoutLr300({ ap: true }),
          ...loadoutFort(),
          ...loadoutRgd5Grenades(2),
          ...loadoutCharacterItems2(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsExtended(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_stalker_2_default_4"}
        class={"sim_default_stalker_2"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_neutral_2_mask}
        community={communities.stalker}
        rank={40}
        moneyMin={1500}
        moneyMax={3500}
        soundConfig={"characters_voice\\human_02\\stalker\\"}
        supplies={[
          ...loadoutWincheaster1300(),
          ...loadoutHpsa(),
          ...loadoutRgd5Grenades(2),
          ...loadoutCharacterItems2(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsExtended(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_stalker_2_default_5"}
        class={"sim_default_stalker_2"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_neutral_2}
        community={communities.stalker}
        rank={40}
        moneyMin={1500}
        moneyMax={3500}
        soundConfig={"characters_voice\\human_03\\stalker\\"}
        supplies={[
          ...loadoutAk74(),
          ...loadoutBeretta(),
          ...loadoutRgd5Grenades(2),
          ...loadoutCharacterItems2(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsExtended(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_stalker_2_default_6"}
        class={"sim_default_stalker_2"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_neutral_2}
        community={communities.stalker}
        rank={40}
        moneyMin={1500}
        moneyMax={3500}
        soundConfig={"characters_voice\\human_03\\stalker\\"}
        supplies={[
          ...loadoutL85(true),
          ...loadoutColt1911(),
          ...loadoutRgd5Grenades(2),
          ...loadoutCharacterItems2(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsExtended(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_stalker_2_default_7"}
        class={"sim_default_stalker_2"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_neutral_2}
        community={communities.stalker}
        rank={40}
        moneyMin={1500}
        moneyMax={3500}
        soundConfig={"characters_voice\\human_03\\stalker\\"}
        supplies={[
          ...loadoutAk74({ ap: true }),
          ...loadoutBeretta(),
          ...loadoutRgd5Grenades(2),
          ...loadoutCharacterItems2(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsExtended(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_stalker_2_default_8"}
        class={"sim_default_stalker_2"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_neutral_2}
        community={communities.stalker}
        rank={40}
        moneyMin={1500}
        moneyMax={3500}
        soundConfig={"characters_voice\\human_03\\stalker\\"}
        supplies={[
          ...loadoutWincheaster1300(),
          ...loadoutColt1911(),
          ...loadoutRgd5Grenades(2),
          ...loadoutCharacterItems2(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsExtended(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_stalker_2_default_9"}
        class={"sim_default_stalker_2"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_neutral_2}
        community={communities.stalker}
        rank={40}
        moneyMin={1500}
        moneyMax={3500}
        soundConfig={"characters_voice\\human_03\\stalker\\"}
        supplies={[
          ...loadoutToz34(),
          ...loadoutMp5({ ap: true }),
          ...loadoutRgd5Grenades(2),
          ...loadoutCharacterItems2(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsExtended(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_stalker_3_default_0"}
        class={"sim_default_stalker_3"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_neutral_2_mask}
        community={communities.stalker}
        rank={50}
        moneyMin={2500}
        moneyMax={5000}
        soundConfig={"characters_voice\\human_02\\stalker\\"}
        supplies={[
          ...loadoutVal({ ap: true, scope: true }),
          ...loadoutSig220(),
          ...loadoutF1Grenades(2),
          ...loadoutCharacterItems2(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsAdvanced(),
          ...loadoutCharacterDrugsScientific(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_stalker_3_default_1"}
        class={"sim_default_stalker_3"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_neutral_2_mask}
        community={communities.stalker}
        rank={50}
        moneyMin={2500}
        moneyMax={5000}
        soundConfig={"characters_voice\\human_02\\stalker\\"}
        supplies={[
          ...loadoutSpas12(true),
          ...loadoutColt1911(),
          ...loadoutF1Grenades(3),
          ...loadoutCharacterItems2(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsAdvanced(),
          ...loadoutCharacterDrugsScientific(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_stalker_3_default_2"}
        class={"sim_default_stalker_3"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_neutral_2_mask}
        community={communities.stalker}
        rank={50}
        moneyMin={2500}
        moneyMax={5000}
        soundConfig={"characters_voice\\human_02\\stalker\\"}
        supplies={[
          ...loadoutSig550({ ap: true }),
          ...loadoutColt1911(true),
          ...loadoutF1Grenades(3),
          ...loadoutCharacterItems2(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsAdvanced(),
          ...loadoutCharacterDrugsScientific(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_stalker_3_default_3"}
        class={"sim_default_stalker_3"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_neutral_nauchniy}
        community={communities.stalker}
        rank={50}
        moneyMin={2500}
        moneyMax={5000}
        soundConfig={"characters_voice\\human_03\\stalker\\"}
        supplies={[
          ...loadoutG36({ ap: true }),
          ...loadoutSig220({ ap: true }),
          ...loadoutF1Grenades(2),
          ...loadoutCharacterItems2(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsAdvanced(),
          ...loadoutCharacterDrugsScientific(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_stalker_3_default_4"}
        class={"sim_default_stalker_3"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_neutral_2}
        community={communities.stalker}
        rank={50}
        moneyMin={2500}
        moneyMax={5000}
        soundConfig={"characters_voice\\human_03\\stalker\\"}
        supplies={[
          ...loadoutSpas12(true),
          ...loadoutUsp({ ap: true }),
          ...loadoutF1Grenades(2),
          ...loadoutCharacterItems2(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsAdvanced(),
          ...loadoutCharacterDrugsScientific(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_stalker_3_default_5"}
        class={"sim_default_stalker_3"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_neutral_2}
        community={communities.stalker}
        rank={50}
        moneyMin={2500}
        moneyMax={5000}
        soundConfig={"characters_voice\\human_03\\stalker\\"}
        supplies={[
          ...loadoutSig550({ ap: true }),
          ...loadoutUsp(),
          ...loadoutF1Grenades(2),
          ...loadoutCharacterItems2(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsAdvanced(),
          ...loadoutCharacterDrugsScientific(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_stalker_3_default_6"}
        class={"sim_default_stalker_3"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_neutral_2_mask}
        community={communities.stalker}
        rank={50}
        moneyMin={2500}
        moneyMax={5000}
        soundConfig={"characters_voice\\human_02\\stalker\\"}
        supplies={[
          ...loadoutSpas12(true),
          ...loadoutSig220({ ap: true }),
          ...loadoutF1Grenades(2),
          ...loadoutCharacterItems2(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsAdvanced(),
          ...loadoutCharacterDrugsScientific(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_stalker_3_default_7"}
        class={"sim_default_stalker_3"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_neutral_2_mask}
        community={communities.stalker}
        rank={50}
        moneyMin={2500}
        moneyMax={5000}
        soundConfig={"characters_voice\\human_03\\stalker\\"}
        supplies={[
          ...loadoutSig550({ ap: true }),
          ...loadoutUsp({ ap: true }),
          ...loadoutF1Grenades(2),
          ...loadoutCharacterItems2(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsAdvanced(),
          ...loadoutCharacterDrugsScientific(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_stalker_3_default_8"}
        class={"sim_default_stalker_3"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_neutral_nauchniy}
        community={communities.stalker}
        rank={50}
        moneyMin={2500}
        moneyMax={5000}
        soundConfig={"characters_voice\\human_03\\stalker\\"}
        supplies={[
          ...loadoutLr300({ ap: true }),
          ...loadoutSig220({ ap: true }),
          ...loadoutF1Grenades(3),
          ...loadoutCharacterItems2(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsAdvanced(),
          ...loadoutCharacterDrugsScientific(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_stalker_3_default_9"}
        class={"sim_default_stalker_3"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_neutral_3}
        community={communities.stalker}
        rank={50}
        moneyMin={2500}
        moneyMax={5000}
        soundConfig={"characters_voice\\human_03\\stalker\\"}
        supplies={[
          ...loadoutSig550({ ap: true }),
          ...loadoutDesertEagle(true),
          ...loadoutF1Grenades(3),
          ...loadoutCharacterItems2(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsAdvanced(),
          ...loadoutCharacterDrugsScientific(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_stalker_4_default_0"}
        class={"sim_default_stalker_4"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_neutral_4}
        community={communities.stalker}
        rank={60}
        moneyMin={5000}
        moneyMax={10000}
        soundConfig={"characters_voice\\human_03\\stalker\\"}
        supplies={[
          ...loadoutProtecta(true),
          ...loadoutSig220({ ap: true }),
          ...loadoutF1Grenades(4),
          ...loadoutCharacterItems3(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsElite(),
          ...loadoutCharacterDrugsScientific(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_stalker_4_default_1"}
        class={"sim_default_stalker_4"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_neutral_4}
        community={communities.stalker}
        rank={60}
        moneyMin={5000}
        moneyMax={10000}
        soundConfig={"characters_voice\\human_03\\stalker\\"}
        supplies={[
          ...loadoutFn200({ ap: true }),
          ...loadoutSig220({ ap: true }),
          ...loadoutF1Grenades(4),
          ...loadoutCharacterItems3(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsElite(),
          ...loadoutCharacterDrugsScientific(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_stalker_4_default_2"}
        class={"sim_default_stalker_4"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_neutral_4}
        community={communities.stalker}
        rank={60}
        moneyMin={5000}
        moneyMax={10000}
        soundConfig={"characters_voice\\human_03\\stalker\\"}
        supplies={[
          ...loadoutGroza({ ap: true }),
          ...loadoutUsp({ ap: true }),
          ...loadoutF1Grenades(4),
          ...loadoutCharacterItems3(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsElite(),
          ...loadoutCharacterDrugsScientific(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_stalker_4_default_3"}
        class={"sim_default_stalker_4"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_neutral_nauchniy}
        community={communities.stalker}
        rank={60}
        moneyMin={5000}
        moneyMax={10000}
        soundConfig={"characters_voice\\human_03\\stalker\\"}
        supplies={[
          ...loadoutVintorez(true),
          ...loadoutSig220({ ap: true }),
          ...loadoutF1Grenades(4),
          ...loadoutCharacterItems3(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsElite(),
          ...loadoutCharacterDrugsScientific(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>
    </Fragment>
  );
}
