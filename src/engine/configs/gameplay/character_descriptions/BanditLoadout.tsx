import { Fragment, JSXNode, JSXXML } from "jsx-xml";

import { SpecificCharacter } from "@/engine/configs/gameplay/components";
import {
  CharacterProfileCriticals,
  DefaultCharacterDialogs,
  loadoutAk74,
  loadoutAk74u,
  loadoutBeretta,
  loadoutBm16,
  loadoutCharacterDrugsBase,
  loadoutCharacterDrugsExtended,
  loadoutCharacterFood,
  loadoutCharacterItems,
  loadoutCharacterItemsWithoutDetector,
  loadoutCharacterSellWeapons,
  loadoutColt1911,
  loadoutDesertEagle,
  loadoutF1Grenades,
  loadoutFort,
  loadoutHpsa,
  loadoutLr300,
  loadoutMp5,
  loadoutPm,
  loadoutProtecta,
  loadoutRgd5Grenades,
  loadoutSig550,
  loadoutSpas12,
  loadoutWincheaster1300,
  profileIcon,
} from "@/engine/configs/gameplay/loadouts";
import { communities } from "@/engine/lib/constants/communities";
import { GENERATE_BANDIT_NAME } from "@/engine/lib/constants/names";

export function BanditLoadout(): JSXNode {
  return (
    <Fragment>
      <SpecificCharacter
        id={"stalker_bandit_default"}
        class={"Stalker_bandit"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_1}
        soundConfig={"characters_voice\\human_01\\stalker\\"}
        rank={0}
        supplies={[
          ...loadoutSig550(),
          ...loadoutBeretta(),
          ...loadoutRgd5Grenades(),
          ...loadoutCharacterItems(),
          ...loadoutCharacterDrugsBase(),
          ...loadoutCharacterFood(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_0_default_0"}
        class={"sim_default_bandit_0"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_1}
        soundConfig={"characters_voice\\human_01\\bandit\\"}
        rank={20}
        moneyMin={250}
        moneyMax={1750}
        supplies={[
          ...loadoutBm16(),
          ...loadoutPm(),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsBase(),
          ...loadoutCharacterFood(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_0_default_1"}
        class={"sim_default_bandit_0"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_1}
        soundConfig={"characters_voice\\human_01\\bandit\\"}
        rank={20}
        moneyMin={250}
        moneyMax={1750}
        supplies={[
          ...loadoutBm16(),
          ...loadoutFort(),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsBase(),
          ...loadoutCharacterFood(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_0_default_2"}
        class={"sim_default_bandit_0"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_1}
        soundConfig={"characters_voice\\human_01\\bandit\\"}
        rank={20}
        moneyMin={250}
        moneyMax={1750}
        supplies={[
          ...loadoutAk74u(),
          ...loadoutPm(),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsBase(),
          ...loadoutCharacterFood(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_1_default_0"}
        class={"sim_default_bandit_1"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_1}
        soundConfig={"characters_voice\\human_01\\bandit\\"}
        rank={30}
        moneyMin={250}
        moneyMax={1750}
        supplies={[
          ...loadoutAk74u(),
          ...loadoutHpsa(),
          ...loadoutRgd5Grenades(),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsBase(),
          ...loadoutCharacterFood(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_1_default_1"}
        class={"sim_default_bandit_1"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_3}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        rank={30}
        moneyMin={250}
        moneyMax={1750}
        supplies={[
          ...loadoutAk74u(),
          ...loadoutHpsa(),
          ...loadoutRgd5Grenades(),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsBase(),
          ...loadoutCharacterFood(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_1_default_2"}
        class={"sim_default_bandit_1"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_3_mask}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        rank={30}
        moneyMin={250}
        moneyMax={1750}
        supplies={[
          ...loadoutAk74(),
          ...loadoutPm(),
          ...loadoutRgd5Grenades(),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsBase(),
          ...loadoutCharacterFood(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_1_default_3"}
        class={"sim_default_bandit_1"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_3_mask}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        rank={30}
        moneyMin={250}
        moneyMax={1750}
        supplies={[
          ...loadoutAk74u(),
          ...loadoutPm(),
          ...loadoutRgd5Grenades(),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsBase(),
          ...loadoutCharacterFood(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_1_default_4"}
        class={"sim_default_bandit_1"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_4}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        rank={30}
        moneyMin={250}
        moneyMax={1750}
        supplies={[
          ...loadoutAk74u(),
          ...loadoutHpsa(),
          ...loadoutRgd5Grenades(),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsBase(),
          ...loadoutCharacterFood(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_1_default_5"}
        class={"sim_default_bandit_1"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_1}
        soundConfig={"characters_voice\\human_01\\bandit\\"}
        rank={30}
        moneyMin={250}
        moneyMax={1750}
        supplies={[
          ...loadoutAk74u(),
          ...loadoutFort(),
          ...loadoutRgd5Grenades(),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsBase(),
          ...loadoutCharacterFood(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_2_default_0"}
        class={"sim_default_bandit_2"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_3}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        rank={35}
        moneyMin={250}
        moneyMax={1750}
        supplies={[
          ...loadoutWincheaster1300(true),
          ...loadoutHpsa(),
          ...loadoutRgd5Grenades(),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterFood(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_2_default_1"}
        class={"sim_default_bandit_2"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_2}
        soundConfig={"characters_voice\\human_01\\bandit\\"}
        rank={35}
        moneyMin={500}
        moneyMax={1750}
        supplies={[
          ...loadoutAk74(),
          ...loadoutBeretta(true),
          ...loadoutRgd5Grenades(2),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterFood(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_2_default_2"}
        class={"sim_default_bandit_2"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_2}
        soundConfig={"characters_voice\\human_01\\bandit\\"}
        rank={35}
        moneyMin={500}
        moneyMax={1750}
        supplies={[
          ...loadoutMp5(),
          ...loadoutBeretta(),
          ...loadoutRgd5Grenades(2),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterFood(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_2_default_3"}
        class={"sim_default_bandit_2"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_3_mask}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        rank={35}
        moneyMin={500}
        moneyMax={1750}
        supplies={[
          ...loadoutAk74u(),
          ...loadoutHpsa(),
          ...loadoutRgd5Grenades(2),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterFood(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_2_default_4"}
        class={"sim_default_bandit_2"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_2}
        soundConfig={"characters_voice\\human_01\\bandit\\"}
        rank={35}
        moneyMin={500}
        moneyMax={1750}
        supplies={[
          ...loadoutMp5({ ap: true }),
          ...loadoutColt1911(),
          ...loadoutRgd5Grenades(2),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterFood(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_2_default_5"}
        class={"sim_default_bandit_2"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_4}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        rank={35}
        moneyMin={500}
        moneyMax={1750}
        supplies={[
          ...loadoutAk74u(),
          ...loadoutColt1911(),
          ...loadoutRgd5Grenades(2),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterFood(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_3_default_0"}
        class={"sim_default_bandit_3"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_3}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        rank={45}
        moneyMin={3000}
        moneyMax={4000}
        supplies={[
          ...loadoutSpas12(true),
          ...loadoutColt1911(),
          ...loadoutF1Grenades(3),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_3_default_1"}
        class={"sim_default_bandit_3"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_3_mask}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        rank={45}
        moneyMin={3000}
        moneyMax={4000}
        supplies={[
          ...loadoutSpas12(),
          ...loadoutBeretta(),
          ...loadoutF1Grenades(3),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_3_default_2"}
        class={"sim_default_bandit_3"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_4}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        rank={45}
        moneyMin={3000}
        moneyMax={4000}
        supplies={[
          ...loadoutSpas12(),
          ...loadoutBeretta(),
          ...loadoutF1Grenades(3),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_3_default_3"}
        class={"sim_default_bandit_3"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_2}
        soundConfig={"characters_voice\\human_01\\bandit\\"}
        rank={45}
        moneyMin={3000}
        moneyMax={4000}
        supplies={[
          ...loadoutAk74({ ap: true }),
          ...loadoutColt1911(),
          ...loadoutF1Grenades(3),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_3_default_4"}
        class={"sim_default_bandit_3"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_2}
        soundConfig={"characters_voice\\human_01\\bandit\\"}
        rank={45}
        moneyMin={3000}
        moneyMax={4000}
        supplies={[
          ...loadoutLr300({ ap: true }),
          ...loadoutBeretta(true),
          ...loadoutF1Grenades(3),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_4_default_0"}
        class={"sim_default_bandit_4"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_4}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        rank={55}
        moneyMin={3000}
        moneyMax={4000}
        supplies={[
          ...loadoutSig550({ ap: true }),
          ...loadoutDesertEagle(),
          ...loadoutF1Grenades(4),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_4_default_1"}
        class={"sim_default_bandit_4"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_3}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        rank={55}
        moneyMin={3000}
        moneyMax={8000}
        supplies={[
          ...loadoutSig550({ ap: true }),
          ...loadoutColt1911(true),
          ...loadoutF1Grenades(4),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_4_default_2"}
        class={"sim_default_bandit_4"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_2}
        soundConfig={"characters_voice\\human_01\\bandit\\"}
        rank={55}
        moneyMin={3000}
        moneyMax={8000}
        supplies={[
          ...loadoutSig550({ ap: true }),
          ...loadoutDesertEagle(),
          ...loadoutF1Grenades(4),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_4_default_3"}
        class={"sim_default_bandit_4"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_2}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        rank={55}
        moneyMin={3000}
        moneyMax={8000}
        supplies={[
          ...loadoutProtecta(true),
          ...loadoutDesertEagle(true),
          ...loadoutF1Grenades(4),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_4_default_4"}
        class={"sim_default_bandit_4"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_3_mask}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        rank={55}
        moneyMin={3000}
        moneyMax={8000}
        supplies={[
          ...loadoutProtecta(true),
          ...loadoutDesertEagle(true),
          ...loadoutF1Grenades(4),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>
    </Fragment>
  );
}
