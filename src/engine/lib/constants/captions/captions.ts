import { achievementsCaptions } from "@/engine/lib/constants/captions/achievements_captions";
import { charactersCaptions } from "@/engine/lib/constants/captions/characters_captions";
import { dialogCaptions } from "@/engine/lib/constants/captions/dialog_captions";
import { dialogManagerCaptions } from "@/engine/lib/constants/captions/dialog_manager_captions";
import { inventoryCaptions } from "@/engine/lib/constants/captions/inventory_captions";
import { itemsArtefactsCaptions } from "@/engine/lib/constants/captions/items_artefacts_captions";
import { itemsWeaponsUpgradesCaptions } from "@/engine/lib/constants/captions/items_weapons_upgrades_captions";
import { landNamesCaptions } from "@/engine/lib/constants/captions/land_names_captions";
import { mainMenuCaptions } from "@/engine/lib/constants/captions/main_menu_captions";
import { otherCaptions } from "@/engine/lib/constants/captions/other_captions";
import { pdaCaptions } from "@/engine/lib/constants/captions/pda_captions";
import { questsGeneralCaptions } from "@/engine/lib/constants/captions/quests_general_captions";
import { screenCaptions } from "@/engine/lib/constants/captions/screen_captions";

/**
 * Translation enum captions.
 */
export const captions = {
  ...achievementsCaptions,
  ...charactersCaptions,
  ...dialogCaptions,
  ...dialogManagerCaptions,
  ...inventoryCaptions,
  ...itemsArtefactsCaptions,
  ...itemsWeaponsUpgradesCaptions,
  ...landNamesCaptions,
  ...mainMenuCaptions,
  ...otherCaptions,
  ...pdaCaptions,
  ...questsGeneralCaptions,
  ...screenCaptions,
};

/**
 * Type definition of translated captions list.
 */
export type TCaptions = typeof captions;

/**
 * Type definition of single translated caption item.
 */
export type TCaption = TCaptions[keyof TCaptions];
