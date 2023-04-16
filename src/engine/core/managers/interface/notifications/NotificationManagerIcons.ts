import { textures } from "@/engine/lib/constants/textures";

/**
 * todo;
 */
export const notificationManagerIcons = {
  pioneer: textures.ui_inGame2_PD_Pervootkrivatel,
  mutant_hunter: textures.ui_inGame2_PD_Ohotnik_na_mutantov,
  detective: textures.ui_inGame2_PD_Sisshik,
  one_of_the_lads: textures.ui_inGame2_PD_Svoy_paren,
  kingpin: textures.ui_inGame2_PD_Avtoritet,
  herald_of_justice: textures.ui_inGame2_PD_Gonets_pravosudiya,
  seeker: textures.ui_inGame2_PD_Iskatel,
  battle_systems_master: textures.ui_inGame2_PD_master_boevih_sistem,
  high_tech_master: textures.ui_inGame2_PD_Master_visokih_technologiy,
  skilled_stalker: textures.ui_inGame2_PD_Opitniy_stalker,
  leader: textures.ui_inGame2_PD_Lider,
  diplomat: textures.ui_inGame2_PD_Diplomat,
  research_man: textures.ui_inGame2_PD_Nauchniy_sotrudnik,
  friend_of_duty: textures.ui_inGame2_PD_Drug_Dolga,
  friend_of_freedom: textures.ui_inGame2_PD_Drug_Swobodi,
  balance_advocate: textures.ui_inGame2_PD_storonnik_ravnovesiya,
  wealthy: textures.ui_inGame2_PD_Sostoyatelniy_klient,
  keeper_of_secrets: textures.ui_inGame2_PD_Hranitel_tayn,
  marked_by_zone: textures.ui_inGame2_PD_Otmecheniy_zonoy,
  information_dealer: textures.ui_inGame2_PD_Torgovets_informatsiey,
  friend_of_stalkers: textures.ui_inGame2_PD_Drug_Stalkerov,
  got_artefact: textures.ui_inGame2_D_gonets_pravosudiya,
  got_ammo: textures.ui_inGame2_D_Ohotnik_na_mutantov,
  got_medicine: textures.ui_inGame2_D_Sisshik,
  got_duty_light_armor: textures.ui_inGame2_D_Vipolnil_2_zadaniya_dlya_Dolga,
  got_duty_heavy_armor: textures.ui_inGame2_D_Vipolnil_4_zadaniya_dlya_Dolga,
  got_freedom_light_armor: textures.ui_inGame2_D_Vipolnil_2_zadaniya_dlya_Swobodi,
  got_freedom_heavy_armor: textures.ui_inGame2_D_Vipolnil_4_zadaniya_dlya_Swobodi,
  can_resupply: textures.ui_inGame2_Pered_zadaniyami_voennih,
  recent_surge: textures.ui_inGame2_V_zone_nedavno_proshel_vibros,
} as const;

/**
 * todo;
 */
export type TNotificationIcons = typeof notificationManagerIcons;

/**
 * todo;
 */
export type TNotificationIcon = TNotificationIcons[keyof TNotificationIcons];

/**
 * todo;
 */
export type TNotificationIconKey = keyof TNotificationIcons;
