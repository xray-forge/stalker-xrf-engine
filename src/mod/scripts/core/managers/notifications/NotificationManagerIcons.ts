import { texturesIngame } from "@/mod/globals/textures";

/**
 * todo;
 */
export const notificationManagerIcons = {
  pioneer: texturesIngame.ui_inGame2_PD_Pervootkrivatel,
  mutant_hunter: texturesIngame.ui_inGame2_PD_Ohotnik_na_mutantov,
  detective: texturesIngame.ui_inGame2_PD_Sisshik,
  one_of_the_lads: texturesIngame.ui_inGame2_PD_Svoy_paren,
  kingpin: texturesIngame.ui_inGame2_PD_Avtoritet,
  herald_of_justice: texturesIngame.ui_inGame2_PD_Gonets_pravosudiya,
  seeker: texturesIngame.ui_inGame2_PD_Iskatel,
  battle_systems_master: texturesIngame.ui_inGame2_PD_master_boevih_sistem,
  high_tech_master: texturesIngame.ui_inGame2_PD_Master_visokih_technologiy,
  skilled_stalker: texturesIngame.ui_inGame2_PD_Opitniy_stalker,
  leader: texturesIngame.ui_inGame2_PD_Lider,
  diplomat: texturesIngame.ui_inGame2_PD_Diplomat,
  research_man: texturesIngame.ui_inGame2_PD_Nauchniy_sotrudnik,
  friend_of_duty: texturesIngame.ui_inGame2_PD_Drug_Dolga,
  friend_of_freedom: texturesIngame.ui_inGame2_PD_Drug_Swobodi,
  balance_advocate: texturesIngame.ui_inGame2_PD_storonnik_ravnovesiya,
  wealthy: texturesIngame.ui_inGame2_PD_Sostoyatelniy_klient,
  keeper_of_secrets: texturesIngame.ui_inGame2_PD_Hranitel_tayn,
  marked_by_zone: texturesIngame.ui_inGame2_PD_Otmecheniy_zonoy,
  information_dealer: texturesIngame.ui_inGame2_PD_Torgovets_informatsiey,
  friend_of_stalkers: texturesIngame.ui_inGame2_PD_Drug_Stalkerov,
  got_artefact: texturesIngame.ui_inGame2_D_gonets_pravosudiya,
  got_ammo: texturesIngame.ui_inGame2_D_Ohotnik_na_mutantov,
  got_medicine: texturesIngame.ui_inGame2_D_Sisshik,
  got_duty_light_armor: texturesIngame.ui_inGame2_D_Vipolnil_2_zadaniya_dlya_Dolga,
  got_duty_heavy_armor: texturesIngame.ui_inGame2_D_Vipolnil_4_zadaniya_dlya_Dolga,
  got_freedom_light_armor: texturesIngame.ui_inGame2_D_Vipolnil_2_zadaniya_dlya_Swobodi,
  got_freedom_heavy_armor: texturesIngame.ui_inGame2_D_Vipolnil_4_zadaniya_dlya_Swobodi,
  can_resupply: texturesIngame.ui_inGame2_Pered_zadaniyami_voennih,
  recent_surge: texturesIngame.ui_inGame2_V_zone_nedavno_proshel_vibros,
} as const;

/**
 * todo;
 */
export type TNotificationIcons = typeof notificationManagerIcons;

/**
 * todo;
 */
export type TNotificationIcon = keyof TNotificationIcons;
