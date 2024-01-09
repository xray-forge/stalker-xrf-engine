import { Fragment, JSXNode, JSXXML } from "jsx-xml";

import { SpecificCharacter } from "@/engine/configs/gameplay/components";
import {
  CharacterProfileCriticals,
  DefaultCharacterDialogs,
  loadoutAk74,
  loadoutAk74u,
  loadoutBeretta,
  loadoutCharacterDrugsAdvanced,
  loadoutCharacterDrugsBase,
  loadoutCharacterDrugsElite,
  loadoutCharacterDrugsExtended,
  loadoutCharacterDrugsMilitary,
  loadoutCharacterDrugsScientific,
  loadoutCharacterFood,
  loadoutCharacterItems,
  loadoutCharacterItemsMonolith,
  loadoutF1Grenades,
  loadoutFort,
  loadoutG36,
  loadoutGroza,
  loadoutHpsa,
  loadoutL85,
  loadoutLr300,
  loadoutPm,
  loadoutProtecta,
  loadoutRgd5Grenades,
  loadoutSig220,
  loadoutSig550,
  loadoutSvd,
  loadoutUsp,
  loadoutVal,
  loadoutVintorez,
  loadoutWalther,
  loadoutWincheaster1300,
  profileIcon,
} from "@/engine/configs/gameplay/loadouts";
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
        id={"sim_default_monolith_0_default_0"}
        class={"sim_default_monolith_0"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_monolit_2}
        community={communities.monolith}
        rank={30}
        soundConfig={"characters_voice\\human_01\\monolith\\"}
        supplies={[
          ...loadoutAk74u(),
          ...loadoutFort(),
          ...loadoutCharacterItemsMonolith(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsBase(),
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
          ...loadoutAk74(),
          ...loadoutPm(),
          ...loadoutCharacterItemsMonolith(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsBase(),
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
          ...loadoutAk74u(),
          ...loadoutFort(),
          ...loadoutCharacterItemsMonolith(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsBase(),
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
          ...loadoutWincheaster1300(),
          ...loadoutFort(),
          ...loadoutCharacterItemsMonolith(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsExtended(),
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
          ...loadoutL85(),
          ...loadoutPm(),
          ...loadoutRgd5Grenades(),
          ...loadoutCharacterItemsMonolith(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsExtended(),
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
          ...loadoutAk74(),
          ...loadoutPm(),
          ...loadoutRgd5Grenades(),
          ...loadoutCharacterItemsMonolith(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsExtended(),
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
          ...loadoutAk74(),
          ...loadoutFort(),
          ...loadoutRgd5Grenades(),
          ...loadoutCharacterItemsMonolith(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsExtended(),
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
          ...loadoutL85(true),
          ...loadoutWalther(),
          ...loadoutRgd5Grenades(2),
          ...loadoutCharacterItemsMonolith(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsAdvanced(),
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
          ...loadoutAk74(),
          ...loadoutPm(),
          ...loadoutRgd5Grenades(2),
          ...loadoutCharacterItemsMonolith(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsAdvanced(),
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
          ...loadoutLr300(),
          ...loadoutFort(),
          ...loadoutRgd5Grenades(2),
          ...loadoutCharacterItemsMonolith(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsAdvanced(),
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
          ...loadoutAk74(),
          ...loadoutBeretta(),
          ...loadoutRgd5Grenades(2),
          ...loadoutCharacterItemsMonolith(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsAdvanced(),
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
          ...loadoutLr300(),
          ...loadoutHpsa(),
          ...loadoutRgd5Grenades(2),
          ...loadoutCharacterItemsMonolith(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsAdvanced(),
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
          ...loadoutAk74({ ap: true }),
          ...loadoutPm(),
          ...loadoutRgd5Grenades(),
          ...loadoutCharacterItemsMonolith(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsAdvanced(),
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
          ...loadoutL85(true),
          ...loadoutPm(),
          ...loadoutRgd5Grenades(2),
          ...loadoutCharacterItemsMonolith(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsAdvanced(),
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
          ...loadoutCharacterDrugsAdvanced(),
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
          ...loadoutSig550({ ap: true }),
          ...loadoutWalther(),
          ...loadoutF1Grenades(3),
          ...loadoutCharacterItemsMonolith(),
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
        id={"sim_default_monolith_3_default_1"}
        class={"sim_default_monolith_3"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_monolit_2}
        community={communities.monolith}
        rank={55}
        soundConfig={"characters_voice\\human_02\\monolith\\"}
        supplies={[
          ...loadoutVal({ ap: true }),
          ...loadoutSig220(),
          ...loadoutF1Grenades(3),
          ...loadoutCharacterItemsMonolith(),
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
        id={"sim_default_monolith_3_default_2"}
        class={"sim_default_monolith_3"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_monolit_3}
        community={communities.monolith}
        rank={55}
        soundConfig={"characters_voice\\human_02\\monolith\\"}
        supplies={[
          ...loadoutVal({ scope: true, ap: true }),
          ...loadoutSig220({ silencer: true, ap: true }),
          ...loadoutF1Grenades(3),
          ...loadoutCharacterItemsMonolith(),
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
        id={"sim_default_monolith_3_default_3"}
        class={"sim_default_monolith_3"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_monolit_1}
        community={communities.monolith}
        rank={55}
        soundConfig={"characters_voice\\human_02\\monolith\\"}
        supplies={[
          ...loadoutSvd(),
          ...loadoutUsp({ silencer: true }),
          ...loadoutCharacterItemsMonolith(),
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
        id={"sim_default_monolith_3_default_4"}
        class={"sim_default_monolith_3"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_monolit_3}
        community={communities.monolith}
        rank={55}
        soundConfig={"characters_voice\\human_02\\monolith\\"}
        supplies={[
          ...loadoutSig550({ ap: true }),
          ...loadoutUsp({ ap: true }),
          ...loadoutCharacterItemsMonolith(),
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
        id={"sim_default_monolith_4_default_0"}
        class={"sim_default_monolith_4"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_monolit_2}
        community={communities.monolith}
        rank={60}
        soundConfig={"characters_voice\\human_02\\monolith\\"}
        supplies={[
          ...loadoutVintorez(true),
          ...loadoutSig220({ silencer: true, ap: true }),
          ...loadoutCharacterItemsMonolith(),
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
        id={"sim_default_monolith_4_default_1"}
        class={"sim_default_monolith_4"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_monolit_4}
        community={communities.monolith}
        rank={60}
        soundConfig={"characters_voice\\human_02\\monolith\\"}
        supplies={[
          ...loadoutGroza({ ap: true }),
          ...loadoutSig220({ ap: true }),
          ...loadoutF1Grenades(4),
          ...loadoutCharacterItemsMonolith(),
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
        id={"sim_default_monolith_4_default_2"}
        class={"sim_default_monolith_4"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_monolit_4}
        community={communities.monolith}
        rank={60}
        soundConfig={"characters_voice\\human_02\\monolith\\"}
        supplies={[
          ...loadoutProtecta(true),
          ...loadoutUsp({ ap: true }),
          ...loadoutF1Grenades(4),
          ...loadoutCharacterItemsMonolith(),
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
        id={"sim_default_monolith_4_default_3"}
        class={"sim_default_monolith_4"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_monolit_4}
        community={communities.monolith}
        rank={60}
        soundConfig={"characters_voice\\human_02\\monolith\\"}
        supplies={[
          ...loadoutG36({ ap: true }),
          ...loadoutUsp({ ap: true }),
          ...loadoutF1Grenades(4),
          ...loadoutCharacterItemsMonolith(),
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
