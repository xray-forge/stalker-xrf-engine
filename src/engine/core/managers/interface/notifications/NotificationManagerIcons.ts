/**
 * todo;
 */
export const notificationManagerIcons = {
  pioneer: "ui_inGame2_PD_Pervootkrivatel",
  mutant_hunter: "ui_inGame2_PD_Ohotnik_na_mutantov",
  detective: "ui_inGame2_PD_Sisshik",
  one_of_the_lads: "ui_inGame2_PD_Svoy_paren",
  kingpin: "ui_inGame2_PD_Avtoritet",
  herald_of_justice: "ui_inGame2_PD_Gonets_pravosudiya",
  seeker: "ui_inGame2_PD_Iskatel",
  battle_systems_master: "ui_inGame2_PD_master_boevih_sistem",
  high_tech_master: "ui_inGame2_PD_Master_visokih_technologiy",
  skilled_stalker: "ui_inGame2_PD_Opitniy_stalker",
  leader: "ui_inGame2_PD_Lider",
  diplomat: "ui_inGame2_PD_Diplomat",
  research_man: "ui_inGame2_PD_Nauchniy_sotrudnik",
  friend_of_duty: "ui_inGame2_PD_Drug_Dolga",
  friend_of_freedom: "ui_inGame2_PD_Drug_Swobodi",
  balance_advocate: "ui_inGame2_PD_storonnik_ravnovesiya",
  wealthy: "ui_inGame2_PD_Sostoyatelniy_klient",
  keeper_of_secrets: "ui_inGame2_PD_Hranitel_tayn",
  received_secret_coordinates: "ui_inGame2_Polucheni_koordinaty_taynika",
  item_received: "ui_inGame2_Predmet_poluchen",
  item_given: "ui_inGame2_Predmet_otdan",
  money_received: "ui_inGame2_Dengi_polucheni",
  money_given: "ui_inGame2_Dengi_otdani",
  marked_by_zone: "ui_inGame2_PD_Otmecheniy_zonoy",
  information_dealer: "ui_inGame2_PD_Torgovets_informatsiey",
  friend_of_stalkers: "ui_inGame2_PD_Drug_Stalkerov",
  got_artefact: "ui_inGame2_D_gonets_pravosudiya",
  got_ammo: "ui_inGame2_D_Ohotnik_na_mutantov",
  got_medicine: "ui_inGame2_D_Sisshik",
  got_duty_light_armor: "ui_inGame2_D_Vipolnil_2_zadaniya_dlya_Dolga",
  got_duty_heavy_armor: "ui_inGame2_D_Vipolnil_4_zadaniya_dlya_Dolga",
  got_freedom_light_armor: "ui_inGame2_D_Vipolnil_2_zadaniya_dlya_Swobodi",
  got_freedom_heavy_armor: "ui_inGame2_D_Vipolnil_4_zadaniya_dlya_Swobodi",
  can_resupply: "ui_inGame2_Pered_zadaniyami_voennih",
  recent_surge: "ui_inGame2_V_zone_nedavno_proshel_vibros",
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
