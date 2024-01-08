import { Fragment, JSXNode, JSXXML } from "jsx-xml";

import {
  CharacterProfileCriticals,
  DefaultCharacterDialogs,
  loadoutAbakan,
  loadoutAk74,
  loadoutAk74u,
  loadoutCharacterDrugsBase,
  loadoutCharacterDrugsElite,
  loadoutCharacterDrugsExtended,
  loadoutCharacterDrugsMilitary,
  loadoutCharacterFood,
  loadoutCharacterItemsWithoutTorch,
  loadoutCharacterItemsWithoutTorch2,
  loadoutCharacterItemsWithoutTorch3,
  loadoutColt1911,
  loadoutFort,
  loadoutGroza,
  loadoutHpsa,
  loadoutMp5,
  loadoutPkm,
  loadoutPm,
  loadoutSig220,
  loadoutSig550,
  loadoutSpas12,
  loadoutUsp,
  loadoutWalther,
  loadoutWincheaster1300,
  profileIcon,
} from "@/engine/configs/gameplay/loadouts";
import { SpecificCharacter } from "@/engine/configs/gameplay/utils";
import { communities } from "@/engine/lib/constants/communities";
import {
  GENERATE_LIEUTENANT_NAME,
  GENERATE_PRIVATE_NAME,
  GENERATE_SERGEANT_NAME,
  GENERATE_STALKER_NAME,
} from "@/engine/lib/constants/names";

export function ZombiedLoadout(): JSXNode {
  return (
    <Fragment>
      <SpecificCharacter
        id={"sim_default_zombied_1_default_0"}
        class={"sim_default_zombied_1"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Zombied_1}
        bio={""}
        soundConfig={"characters_voice\\human_01\\zombied\\"}
        crouchType={0}
        community={communities.zombied}
        supplies={[
          ...loadoutAk74u(),
          ...loadoutFort(),
          ...loadoutCharacterItemsWithoutTorch(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsBase(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_zombied_1_default_1"}
        class={"sim_default_zombied_1"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Zombied_1}
        bio={""}
        soundConfig={"characters_voice\\human_01\\zombied\\"}
        crouchType={0}
        community={communities.zombied}
        supplies={[
          ...loadoutWincheaster1300(),
          ...loadoutPm(),
          ...loadoutCharacterItemsWithoutTorch(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsBase(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_zombied_1_default_2"}
        class={"sim_default_zombied_1"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Zombied_1}
        bio={""}
        soundConfig={"characters_voice\\human_01\\zombied\\"}
        crouchType={0}
        community={communities.zombied}
        supplies={[
          ...loadoutMp5(),
          ...loadoutPm(),
          ...loadoutCharacterItemsWithoutTorch(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsBase(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_zombied_2_default_0"}
        class={"sim_default_zombied_2"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Zombied_2}
        bio={""}
        soundConfig={"characters_voice\\human_01\\zombied\\"}
        crouchType={0}
        rank={10}
        community={communities.zombied}
        supplies={[
          ...loadoutAk74u(),
          ...loadoutFort(),
          ...loadoutCharacterItemsWithoutTorch(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsExtended(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_zombied_2_default_1"}
        class={"sim_default_zombied_2"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Zombied_2}
        bio={""}
        soundConfig={"characters_voice\\human_01\\zombied\\"}
        crouchType={0}
        rank={10}
        community={communities.zombied}
        supplies={[
          ...loadoutWincheaster1300(),
          ...loadoutHpsa(),
          ...loadoutCharacterItemsWithoutTorch(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsExtended(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_zombied_2_default_2"}
        class={"sim_default_zombied_2"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Zombied_2}
        bio={""}
        soundConfig={"characters_voice\\human_01\\zombied\\"}
        crouchType={0}
        rank={10}
        community={communities.zombied}
        supplies={[
          ...loadoutMp5(),
          ...loadoutHpsa(),
          ...loadoutCharacterItemsWithoutTorch(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsExtended(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_zombied_2_default_3"}
        class={"sim_default_zombied_2"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Zombied_2}
        bio={""}
        soundConfig={"characters_voice\\human_01\\zombied\\"}
        crouchType={0}
        rank={10}
        community={communities.zombied}
        supplies={[
          ...loadoutAk74(),
          ...loadoutColt1911(),
          ...loadoutCharacterItemsWithoutTorch2(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsExtended(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_zombied_3_default_0"}
        class={"sim_default_zombied_3"}
        name={GENERATE_PRIVATE_NAME}
        icon={profileIcon.ui_inGame2_Zombied_3}
        bio={""}
        soundConfig={"characters_voice\\human_01\\zombied\\"}
        crouchType={0}
        rank={20}
        community={communities.zombied}
        supplies={[
          ...loadoutAk74u(),
          ...loadoutFort(),
          ...loadoutCharacterItemsWithoutTorch2(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterDrugsMilitary(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_zombied_3_default_1"}
        class={"sim_default_zombied_3"}
        name={GENERATE_SERGEANT_NAME}
        icon={profileIcon.ui_inGame2_Zombied_3}
        bio={""}
        soundConfig={"characters_voice\\human_01\\zombied\\"}
        crouchType={0}
        rank={20}
        community={communities.zombied}
        supplies={[
          ...loadoutAk74(),
          ...loadoutFort(),
          ...loadoutCharacterItemsWithoutTorch2(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterDrugsMilitary(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_zombied_3_default_2"}
        class={"sim_default_zombied_3"}
        name={GENERATE_LIEUTENANT_NAME}
        icon={profileIcon.ui_inGame2_Zombied_3}
        bio={""}
        soundConfig={"characters_voice\\human_01\\zombied\\"}
        crouchType={0}
        rank={20}
        community={communities.zombied}
        supplies={[
          ...loadoutAbakan(),
          ...loadoutFort(),
          ...loadoutCharacterItemsWithoutTorch2(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterDrugsMilitary(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_zombied_3_default_3"}
        class={"sim_default_zombied_3"}
        name={GENERATE_PRIVATE_NAME}
        icon={profileIcon.ui_inGame2_Zombied_3}
        bio={""}
        soundConfig={"characters_voice\\human_01\\zombied\\"}
        crouchType={0}
        rank={20}
        community={communities.zombied}
        supplies={[
          ...loadoutAk74(),
          ...loadoutFort(),
          ...loadoutCharacterItemsWithoutTorch2(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterDrugsMilitary(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_zombied_4_default_0"}
        class={"sim_default_zombied_4"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Zombied_4}
        bio={""}
        soundConfig={"characters_voice\\human_01\\zombied\\"}
        crouchType={0}
        rank={25}
        community={communities.zombied}
        supplies={[
          ...loadoutSig550({ ap: true }),
          ...loadoutWalther(),
          ...loadoutCharacterItemsWithoutTorch3(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsElite(),
          ...loadoutCharacterDrugsMilitary(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_zombied_4_default_1"}
        class={"sim_default_zombied_4"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Zombied_4}
        bio={""}
        soundConfig={"characters_voice\\human_01\\zombied\\"}
        crouchType={0}
        rank={25}
        community={communities.zombied}
        supplies={[
          ...loadoutSpas12(true),
          ...loadoutUsp(),
          ...loadoutCharacterItemsWithoutTorch3(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsElite(),
          ...loadoutCharacterDrugsMilitary(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_zombied_4_default_2"}
        class={"sim_default_zombied_4"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Zombied_4}
        bio={""}
        soundConfig={"characters_voice\\human_01\\zombied\\"}
        crouchType={0}
        rank={25}
        community={communities.zombied}
        supplies={[
          ...loadoutGroza({ ap: true }),
          ...loadoutSig220(),
          ...loadoutCharacterItemsWithoutTorch3(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsElite(),
          ...loadoutCharacterDrugsMilitary(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_zombied_4_default_3"}
        class={"sim_default_zombied_4"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_Zombied_4}
        bio={""}
        soundConfig={"characters_voice\\human_01\\zombied\\"}
        crouchType={0}
        rank={25}
        community={communities.zombied}
        supplies={[
          ...loadoutPkm(),
          ...loadoutColt1911(true),
          ...loadoutCharacterItemsWithoutTorch3(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsElite(),
          ...loadoutCharacterDrugsMilitary(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>
    </Fragment>
  );
}
