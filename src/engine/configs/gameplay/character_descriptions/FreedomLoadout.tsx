import { Fragment, JSXNode, JSXXML } from "jsx-xml";

import { SpecificCharacter } from "@/engine/configs/gameplay/components";
import {
  CharacterProfileCriticals,
  DefaultCharacterDialogs,
  loadoutAk74,
  loadoutBeretta,
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
  loadoutG36,
  loadoutHpsa,
  loadoutL85,
  loadoutLr300,
  loadoutMp5,
  loadoutPm,
  loadoutRgd5Grenades,
  loadoutSig220,
  loadoutSig550,
  loadoutSvd,
  loadoutSvu,
  loadoutVintorez,
  loadoutWalther,
  loadoutWincheaster1300,
  profileIcon,
} from "@/engine/configs/gameplay/loadouts";
import { communities } from "@/engine/lib/constants/communities";
import { GENERATE_STALKER_NAME } from "@/engine/lib/constants/names";

export function FreedomLoadout(): JSXNode {
  return (
    <Fragment>
      <SpecificCharacter
        id={"stalker_freedom_default"}
        class={"Stalker_freedom"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Freedom_2_mask}
        community={communities.freedom}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
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
        id={"sim_default_freedom_0_default_0"}
        class={"sim_default_freedom_0"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Freedom_1}
        community={communities.freedom}
        rank={30}
        moneyMin={500}
        moneyMax={1000}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
        supplies={[
          ...loadoutMp5(),
          ...loadoutHpsa(),
          ...loadoutCharacterItems(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsBase(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_freedom_0_default_1"}
        class={"sim_default_freedom_0"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Freedom_1}
        community={communities.freedom}
        rank={30}
        moneyMin={500}
        moneyMax={1000}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
        supplies={[
          ...loadoutMp5(),
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
        id={"sim_default_freedom_0_default_2"}
        class={"sim_default_freedom_0"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Freedom_1}
        community={communities.freedom}
        rank={30}
        moneyMin={500}
        moneyMax={1000}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
        supplies={[
          ...loadoutL85(),
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
        id={"sim_default_freedom_0_default_3"}
        class={"sim_default_freedom_0"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Freedom_2_mask}
        community={communities.freedom}
        rank={30}
        moneyMin={500}
        moneyMax={1000}
        soundConfig={"characters_voice\\human_01\\freedom\\"}
        supplies={[
          ...loadoutMp5(),
          ...loadoutHpsa(),
          ...loadoutCharacterItems(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsBase(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_freedom_0_default_4"}
        class={"sim_default_freedom_0"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Freedom_2_mask}
        community={communities.freedom}
        rank={30}
        moneyMin={500}
        moneyMax={1000}
        soundConfig={"characters_voice\\human_01\\freedom\\"}
        supplies={[
          ...loadoutMp5(),
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
        id={"sim_default_freedom_0_default_5"}
        class={"sim_default_freedom_0"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Freedom_2_mask}
        community={communities.freedom}
        rank={30}
        moneyMin={500}
        moneyMax={1000}
        soundConfig={"characters_voice\\human_01\\freedom\\"}
        supplies={[
          ...loadoutWincheaster1300(),
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
        id={"sim_default_freedom_1_default_0"}
        class={"sim_default_freedom_1"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Freedom_1}
        community={communities.freedom}
        rank={35}
        moneyMin={1000}
        moneyMax={2000}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
        supplies={[
          ...loadoutWincheaster1300(),
          ...loadoutBeretta(),
          ...loadoutRgd5Grenades(),
          ...loadoutCharacterItems(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterFood(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_freedom_1_default_1"}
        class={"sim_default_freedom_1"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Freedom_1}
        community={communities.freedom}
        rank={35}
        moneyMin={1000}
        moneyMax={2000}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
        supplies={[
          ...loadoutAk74(),
          ...loadoutHpsa(),
          ...loadoutRgd5Grenades(),
          ...loadoutCharacterItems(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterFood(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_freedom_1_default_2"}
        class={"sim_default_freedom_1"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Freedom_2_mask}
        community={communities.freedom}
        rank={35}
        moneyMin={1000}
        moneyMax={2000}
        soundConfig={"characters_voice\\human_01\\freedom\\"}
        supplies={[
          ...loadoutAk74(),
          ...loadoutColt1911(),
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
        id={"sim_default_freedom_1_default_3"}
        class={"sim_default_freedom_1"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Freedom_2_mask}
        community={communities.freedom}
        rank={35}
        moneyMin={1000}
        moneyMax={2000}
        soundConfig={"characters_voice\\human_01\\freedom\\"}
        supplies={[
          ...loadoutL85(),
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
        id={"sim_default_freedom_1_default_4"}
        class={"sim_default_freedom_1"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Freedom_2}
        community={communities.freedom}
        rank={35}
        moneyMin={1000}
        moneyMax={2000}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
        supplies={[
          ...loadoutWincheaster1300(),
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
        id={"sim_default_freedom_1_default_5"}
        class={"sim_default_freedom_1"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Freedom_2}
        community={communities.freedom}
        rank={35}
        moneyMin={1000}
        moneyMax={2000}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
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
        id={"sim_default_freedom_1_default_6"}
        class={"sim_default_freedom_1"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Freedom_2}
        community={communities.freedom}
        rank={35}
        moneyMin={1000}
        moneyMax={2000}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
        supplies={[
          ...loadoutMp5({ silencer: true, ap: true }),
          ...loadoutColt1911(),
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
        id={"sim_default_freedom_1_default_7"}
        class={"sim_default_freedom_1"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Freedom_2}
        community={communities.freedom}
        rank={35}
        moneyMin={1000}
        moneyMax={2000}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
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
        id={"sim_default_freedom_2_default_0"}
        class={"sim_default_freedom_2"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Freedom_1}
        community={communities.freedom}
        rank={40}
        moneyMin={1500}
        moneyMax={2500}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
        supplies={[
          ...loadoutLr300({ silencer: true, scope: true }),
          ...loadoutColt1911(),
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
        id={"sim_default_freedom_2_default_1"}
        class={"sim_default_freedom_2"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Freedom_2_mask}
        community={communities.freedom}
        rank={40}
        moneyMin={1500}
        moneyMax={2500}
        soundConfig={"characters_voice\\human_01\\freedom\\"}
        supplies={[
          ...loadoutL85(true),
          ...loadoutBeretta(),
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
        id={"sim_default_freedom_2_default_2"}
        class={"sim_default_freedom_2"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Freedom_2_mask}
        community={communities.freedom}
        rank={40}
        moneyMin={1500}
        moneyMax={2500}
        soundConfig={"characters_voice\\human_02\\freedom\\"}
        supplies={[
          ...loadoutLr300({ scope: true, silencer: true, ap: true }),
          ...loadoutHpsa(true),
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
        id={"sim_default_freedom_2_default_3"}
        class={"sim_default_freedom_2"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Freedom_2}
        community={communities.freedom}
        rank={40}
        moneyMin={1500}
        moneyMax={2500}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
        supplies={[
          ...loadoutMp5({ silencer: true }),
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
        id={"sim_default_freedom_2_default_4"}
        class={"sim_default_freedom_2"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Freedom_2}
        community={communities.freedom}
        rank={40}
        moneyMin={1500}
        moneyMax={2500}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
        supplies={[
          ...loadoutL85(true),
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
        id={"sim_default_freedom_2_default_5"}
        class={"sim_default_freedom_2"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Freedom_2}
        community={communities.freedom}
        rank={40}
        moneyMin={1500}
        moneyMax={2500}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
        supplies={[
          ...loadoutAk74({ ap: true }),
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
        id={"sim_default_freedom_3_default_0"}
        class={"sim_default_freedom_3"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Freedom_1}
        community={communities.freedom}
        rank={50}
        moneyMin={2500}
        moneyMax={5000}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
        supplies={[
          ...loadoutSvd(),
          ...loadoutColt1911(),
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
        id={"sim_default_freedom_3_default_1"}
        class={"sim_default_freedom_3"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Freedom_2}
        community={communities.freedom}
        rank={50}
        moneyMin={2500}
        moneyMax={5000}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
        supplies={[
          ...loadoutSig550({ ap: true }),
          ...loadoutDesertEagle(),
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
        id={"sim_default_freedom_3_default_2"}
        class={"sim_default_freedom_3"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Freedom_3}
        community={communities.freedom}
        rank={50}
        moneyMin={2500}
        moneyMax={5000}
        soundConfig={"characters_voice\\human_02\\freedom\\"}
        supplies={[
          ...loadoutG36({ ap: true }),
          ...loadoutWalther(),
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
        id={"sim_default_freedom_3_default_3"}
        class={"sim_default_freedom_3"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Freedom_3}
        community={communities.freedom}
        rank={50}
        moneyMin={2500}
        moneyMax={5000}
        soundConfig={"characters_voice\\human_02\\freedom\\"}
        supplies={[
          ...loadoutSig550({ ap: true }),
          ...loadoutSig220(),
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
        id={"sim_default_freedom_3_default_4"}
        class={"sim_default_freedom_3"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Freedom_2_mask}
        community={communities.freedom}
        rank={50}
        moneyMin={2500}
        moneyMax={5000}
        soundConfig={"characters_voice\\human_02\\freedom\\"}
        supplies={[
          ...loadoutSvd(),
          ...loadoutMp5({ silencer: true }),
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
        id={"sim_default_freedom_3_default_5"}
        class={"sim_default_freedom_3"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Freedom_1}
        community={communities.freedom}
        rank={50}
        moneyMin={2500}
        moneyMax={5000}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
        supplies={[
          ...loadoutSvu(),
          ...loadoutColt1911(),
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
        id={"sim_default_freedom_4_default_0"}
        class={"sim_default_freedom_4"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Freedom_1}
        community={communities.freedom}
        rank={70}
        moneyMin={5_000}
        moneyMax={10_000}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
        supplies={[
          ...loadoutVintorez(),
          ...loadoutSig220(),
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
        id={"sim_default_freedom_4_default_1"}
        class={"sim_default_freedom_4"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Freedom_2_mask}
        community={communities.freedom}
        rank={70}
        moneyMin={5000}
        moneyMax={10000}
        soundConfig={"characters_voice\\human_02\\freedom\\"}
        supplies={[
          ...loadoutSvd(),
          ...loadoutWalther(),
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
        id={"sim_default_freedom_4_default_2"}
        class={"sim_default_freedom_4"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Freedom_4}
        community={communities.freedom}
        rank={70}
        moneyMin={5000}
        moneyMax={10000}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
        supplies={[
          ...loadoutSig550({ ap: true }),
          ...loadoutColt1911(true),
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
        id={"sim_default_freedom_4_default_3"}
        class={"sim_default_freedom_4"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Freedom_4}
        community={communities.freedom}
        rank={70}
        moneyMin={5000}
        moneyMax={10000}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
        supplies={[
          ...loadoutSig550({ ap: true }),
          ...loadoutDesertEagle(true),
          ...loadoutF1Grenades(),
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
        id={"sim_default_freedom_4_default_4"}
        class={"sim_default_freedom_4"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Freedom_4}
        community={communities.freedom}
        rank={70}
        moneyMin={5000}
        moneyMax={10000}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
        supplies={[
          ...loadoutG36({ ap: true }),
          ...loadoutDesertEagle(true),
          ...loadoutF1Grenades(),
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
        id={"sim_default_freedom_4_default_5"}
        class={"sim_default_freedom_4"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Freedom_4}
        community={communities.freedom}
        rank={70}
        moneyMin={5000}
        moneyMax={10000}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
        supplies={[
          ...loadoutG36({ ap: true }),
          ...loadoutColt1911(),
          ...loadoutF1Grenades(),
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
