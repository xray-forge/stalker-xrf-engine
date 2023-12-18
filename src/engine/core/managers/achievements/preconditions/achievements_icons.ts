import { EAchievement } from "@/engine/core/managers/achievements/achievements_types";
import { notificationsIcons, TNotificationIcon } from "@/engine/core/managers/notifications/notifications_icons";

/**
 * Map of icons used for achievements display in PDA/notifications.
 */
export const achievementsIcons: Record<EAchievement, TNotificationIcon> = {
  [EAchievement.PIONEER]: notificationsIcons.pioneer,
  [EAchievement.MUTANT_HUNTER]: notificationsIcons.mutant_hunter,
  [EAchievement.DETECTIVE]: notificationsIcons.detective,
  [EAchievement.ONE_OF_THE_LADS]: notificationsIcons.one_of_the_lads,
  [EAchievement.KINGPIN]: notificationsIcons.kingpin,
  [EAchievement.HERALD_OF_JUSTICE]: notificationsIcons.herald_of_justice,
  [EAchievement.SEEKER]: notificationsIcons.seeker,
  [EAchievement.BATTLE_SYSTEMS_MASTER]: notificationsIcons.battle_systems_master,
  [EAchievement.HIGH_TECH_MASTER]: notificationsIcons.high_tech_master,
  [EAchievement.SKILLED_STALKER]: notificationsIcons.skilled_stalker,
  [EAchievement.LEADER]: notificationsIcons.leader,
  [EAchievement.DIPLOMAT]: notificationsIcons.diplomat,
  [EAchievement.RESEARCH_MAN]: notificationsIcons.research_man,
  [EAchievement.FRIEND_OF_DUTY]: notificationsIcons.friend_of_duty,
  [EAchievement.FRIEND_OF_FREEDOM]: notificationsIcons.friend_of_freedom,
  [EAchievement.BALANCE_ADVOCATE]: notificationsIcons.balance_advocate,
  [EAchievement.WEALTHY]: notificationsIcons.wealthy,
  [EAchievement.KEEPER_OF_SECRETS]: notificationsIcons.keeper_of_secrets,
  [EAchievement.MARKED_BY_ZONE]: notificationsIcons.marked_by_zone,
  [EAchievement.INFORMATION_DEALER]: notificationsIcons.information_dealer,
  [EAchievement.FRIEND_OF_STALKERS]: notificationsIcons.friend_of_stalkers,
};
