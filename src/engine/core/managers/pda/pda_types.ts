import { monsters, TMonster } from "@/engine/lib/constants/monsters";
import { PartialRecord, TName } from "@/engine/lib/types";

/**
 * todo;
 */
export const killedMonstersDisplay: PartialRecord<TMonster, { back: TName; icon: TName }> = {
  [monsters.bloodsucker_weak]: { back: "ui_inGame2_Krovosos", icon: "" },
  [monsters.bloodsucker_normal]: { back: "ui_inGame2_Krovosos_1", icon: "" },
  [monsters.bloodsucker_strong]: { back: "ui_inGame2_Krovosos_2", icon: "" },
  [monsters.boar_weak]: { back: "ui_inGame2_Kaban_1", icon: "" },
  [monsters.boar_strong]: { back: "ui_inGame2_Kaban", icon: "" },
  [monsters.burer]: { back: "ui_inGame2_Burer", icon: "" },
  [monsters.chimera]: { back: "ui_inGame2_Himera", icon: "" },
  [monsters.controller]: { back: "ui_inGame2_Controller", icon: "" },
  [monsters.dog]: { back: "ui_inGame2_Blind_Dog", icon: "" },
  [monsters.flesh_weak]: { back: "ui_inGame2_Flesh", icon: "" },
  [monsters.flesh_strong]: { back: "ui_inGame2_Flesh_1", icon: "" },
  [monsters.gigant]: { back: "ui_inGame2_Pseudo_Gigant", icon: "" },
  [monsters.poltergeist_tele]: { back: "ui_inGame2_Poltergeyst", icon: "" },
  [monsters.poltergeist_flame]: { back: "ui_inGame2_Poltergeist_1", icon: "" },
  [monsters.psy_dog_weak]: { back: "ui_inGame2_PseudoDog_1", icon: "" },
  [monsters.psy_dog_strong]: { back: "ui_inGame2_PseudoDog", icon: "" },
  [monsters.pseudodog_weak]: { back: "ui_inGame2_PseudoDog_1", icon: "" },
  [monsters.pseudodog_strong]: { back: "ui_inGame2_PseudoDog", icon: "" },
  [monsters.snork]: { back: "ui_inGame2_Snork", icon: "" },
  [monsters.tushkano]: { back: "ui_inGame2_Tushkan", icon: "" },
};

/**
 * todo;
 */
export enum EPdaStatSection {
  UNKNOWN,
  SURGES,
  COMPLETED_QUESTS,
  KILLED_MONSTERS,
  KILLED_STALKERS,
  ARTEFACTS_FOUND,
  SECRETS_FOUND,
}
