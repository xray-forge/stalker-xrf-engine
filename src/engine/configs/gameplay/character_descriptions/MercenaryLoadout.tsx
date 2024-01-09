import { Fragment, JSXNode, JSXXML } from "jsx-xml";

import {
  CharacterProfileCriticals,
  DefaultCharacterDialogs,
  loadoutAk74,
  loadoutBeretta,
  loadoutCharacterDrugsAdvanced,
  loadoutCharacterDrugsBase,
  loadoutCharacterDrugsElite,
  loadoutCharacterDrugsExtended,
  loadoutCharacterDrugsMilitary,
  loadoutCharacterDrugsScientific,
  loadoutCharacterFood,
  loadoutCharacterItemsWithoutDetector,
  loadoutColt1911,
  loadoutF1Grenades,
  loadoutFn200,
  loadoutG36,
  loadoutHpsa,
  loadoutL85,
  loadoutLr300,
  loadoutMp5,
  loadoutRgd5Grenades,
  loadoutSig220,
  loadoutSig550,
  loadoutUsp,
  loadoutWincheaster1300,
  profileIcon,
} from "@/engine/configs/gameplay/loadouts";
import { SpecificCharacter } from "@/engine/configs/gameplay/utils";
import { communities } from "@/engine/lib/constants/communities";
import { GENERATE_STALKER_NAME } from "@/engine/lib/constants/names";

export function MercenaryLoadout(): JSXNode {
  return (
    <Fragment>
      <SpecificCharacter
        id={"sim_default_killer_0_default_0"}
        class={"sim_default_killer_0"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_merc_2}
        rank={35}
        moneyMin={250}
        moneyMax={1750}
        soundConfig={"characters_voice\\human_03\\killer\\"}
        community={communities.killer}
        supplies={[
          ...loadoutMp5(),
          ...loadoutHpsa(),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsBase(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_killer_0_default_1"}
        class={"sim_default_killer_0"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_merc_2}
        rank={35}
        moneyMin={250}
        moneyMax={1750}
        soundConfig={"characters_voice\\human_03\\killer\\"}
        community={communities.killer}
        supplies={[
          ...loadoutAk74(),
          ...loadoutHpsa(),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsBase(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_killer_1_default_0"}
        class={"sim_default_killer_1"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_merc_2}
        rank={40}
        moneyMin={500}
        moneyMax={1750}
        soundConfig={"characters_voice\\human_03\\killer\\"}
        community={communities.killer}
        supplies={[
          ...loadoutMp5(),
          ...loadoutHpsa(),
          ...loadoutRgd5Grenades(),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsExtended(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_killer_1_default_1"}
        class={"sim_default_killer_1"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_merc_2}
        rank={40}
        moneyMin={500}
        moneyMax={1750}
        soundConfig={"characters_voice\\human_03\\killer\\"}
        community={communities.killer}
        supplies={[
          ...loadoutAk74(),
          ...loadoutHpsa(),
          ...loadoutRgd5Grenades(),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsExtended(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_killer_1_default_2"}
        class={"sim_default_killer_1"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_merc_2}
        rank={40}
        moneyMin={500}
        moneyMax={1750}
        soundConfig={"characters_voice\\human_03\\killer\\"}
        community={communities.killer}
        supplies={[
          ...loadoutAk74(),
          ...loadoutBeretta(),
          ...loadoutRgd5Grenades(),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsExtended(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_killer_2_default_0"}
        class={"sim_default_killer_2"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_merc_2}
        rank={45}
        moneyMin={1500}
        moneyMax={2500}
        soundConfig={"characters_voice\\human_03\\killer\\"}
        community={communities.killer}
        supplies={[
          ...loadoutAk74(),
          ...loadoutHpsa(),
          ...loadoutRgd5Grenades(),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsAdvanced(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_killer_2_default_1"}
        class={"sim_default_killer_2"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_merc_2}
        rank={45}
        moneyMin={1500}
        moneyMax={2500}
        soundConfig={"characters_voice\\human_03\\killer\\"}
        community={communities.killer}
        supplies={[
          ...loadoutWincheaster1300(),
          ...loadoutHpsa(),
          ...loadoutRgd5Grenades(2),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsAdvanced(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_killer_2_default_2"}
        class={"sim_default_killer_2"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_merc_2}
        rank={45}
        moneyMin={1500}
        moneyMax={2500}
        soundConfig={"characters_voice\\human_03\\killer\\"}
        community={communities.killer}
        supplies={[
          ...loadoutL85(),
          ...loadoutBeretta(),
          ...loadoutRgd5Grenades(2),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsAdvanced(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_killer_2_default_3"}
        class={"sim_default_killer_2"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_merc_2}
        rank={45}
        moneyMin={1500}
        moneyMax={2500}
        soundConfig={"characters_voice\\human_03\\killer\\"}
        community={communities.killer}
        supplies={[
          ...loadoutLr300(),
          ...loadoutColt1911(),
          ...loadoutRgd5Grenades(2),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsAdvanced(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_killer_2_default_4"}
        class={"sim_default_killer_2"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_merc_2}
        rank={45}
        moneyMin={1500}
        moneyMax={2500}
        soundConfig={"characters_voice\\human_03\\killer\\"}
        community={communities.killer}
        supplies={[
          ...loadoutLr300(),
          ...loadoutSig220(),
          ...loadoutRgd5Grenades(2),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsAdvanced(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_killer_2_default_5"}
        class={"sim_default_killer_2"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_merc_2}
        rank={45}
        moneyMin={1500}
        moneyMax={2500}
        soundConfig={"characters_voice\\human_03\\killer\\"}
        community={communities.killer}
        supplies={[
          ...loadoutL85(),
          ...loadoutUsp(),
          ...loadoutRgd5Grenades(2),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsAdvanced(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_killer_3_default_0"}
        class={"sim_default_killer_3"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_merc_2}
        rank={55}
        moneyMin={2500}
        moneyMax={5000}
        soundConfig={"characters_voice\\human_03\\killer\\"}
        community={communities.killer}
        supplies={[
          ...loadoutG36({ ap: true }),
          ...loadoutSig220({ ap: true }),
          ...loadoutF1Grenades(3),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsAdvanced(),
          ...loadoutCharacterDrugsMilitary(),
          ...loadoutCharacterDrugsScientific(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_killer_3_default_1"}
        class={"sim_default_killer_3"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_merc_2}
        rank={55}
        moneyMin={2500}
        moneyMax={5000}
        soundConfig={"characters_voice\\human_03\\killer\\"}
        community={communities.killer}
        supplies={[
          ...loadoutSig550(),
          ...loadoutSig220({ ap: true }),
          ...loadoutF1Grenades(3),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsAdvanced(),
          ...loadoutCharacterDrugsMilitary(),
          ...loadoutCharacterDrugsScientific(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_killer_3_default_2"}
        class={"sim_default_killer_3"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_merc_4}
        rank={55}
        moneyMin={2500}
        moneyMax={5000}
        soundConfig={"characters_voice\\human_03\\killer\\"}
        community={communities.killer}
        supplies={[
          ...loadoutSig550({ ap: true }),
          ...loadoutSig220({ ap: true }),
          ...loadoutF1Grenades(3),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsAdvanced(),
          ...loadoutCharacterDrugsMilitary(),
          ...loadoutCharacterDrugsScientific(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_killer_3_default_3"}
        class={"sim_default_killer_3"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_merc_4}
        rank={55}
        moneyMin={2500}
        moneyMax={5000}
        soundConfig={"characters_voice\\human_03\\killer\\"}
        community={communities.killer}
        supplies={[
          ...loadoutG36({ ap: true }),
          ...loadoutSig220({ ap: true }),
          ...loadoutF1Grenades(3),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsAdvanced(),
          ...loadoutCharacterDrugsMilitary(),
          ...loadoutCharacterDrugsScientific(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_killer_4_default_0"}
        class={"sim_default_killer_4"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_merc_4}
        rank={60}
        moneyMin={5000}
        moneyMax={10000}
        soundConfig={"characters_voice\\human_03\\killer\\"}
        community={communities.killer}
        supplies={[
          ...loadoutFn200({ ap: true }),
          ...loadoutUsp({ ap: true }),
          ...loadoutF1Grenades(4),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsElite(),
          ...loadoutCharacterDrugsMilitary(),
          ...loadoutCharacterDrugsScientific(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_killer_4_default_1"}
        class={"sim_default_killer_4"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_merc_4}
        rank={60}
        moneyMin={5000}
        moneyMax={10000}
        soundConfig={"characters_voice\\human_03\\killer\\"}
        community={communities.killer}
        supplies={[
          ...loadoutFn200({ ap: true }),
          ...loadoutSig220({ ap: true }),
          ...loadoutF1Grenades(4),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsElite(),
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
