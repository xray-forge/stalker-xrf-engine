import { EAchievement } from "@/engine/core/managers/interaction/achievements/EAchievement";
import {
  notificationManagerIcons,
  TNotificationIcon,
} from "@/engine/core/managers/interface/notifications/NotificationManagerIcons";

/**
 * todo;
 */
export const achievementIcons: Record<EAchievement, TNotificationIcon> = {
  [EAchievement.PIONEER]: notificationManagerIcons.pioneer,
  [EAchievement.MUTANT_HUNTER]: notificationManagerIcons.mutant_hunter,
  [EAchievement.DETECTIVE]: notificationManagerIcons.detective,
  [EAchievement.ONE_OF_THE_LADS]: notificationManagerIcons.one_of_the_lads,
  [EAchievement.KINGPIN]: notificationManagerIcons.kingpin,
  [EAchievement.HERALD_OF_JUSTICE]: notificationManagerIcons.herald_of_justice,
  [EAchievement.SEEKER]: notificationManagerIcons.seeker,
  [EAchievement.BATTLE_SYSTEMS_MASTER]: notificationManagerIcons.battle_systems_master,
  [EAchievement.HIGH_TECH_MASTER]: notificationManagerIcons.high_tech_master,
  [EAchievement.SKILLED_STALKER]: notificationManagerIcons.skilled_stalker,
  [EAchievement.LEADER]: notificationManagerIcons.leader,
  [EAchievement.DIPLOMAT]: notificationManagerIcons.diplomat,
  [EAchievement.RESEARCH_MAN]: notificationManagerIcons.research_man,
  [EAchievement.FRIEND_OF_DUTY]: notificationManagerIcons.friend_of_duty,
  [EAchievement.FRIEND_OF_FREEDOM]: notificationManagerIcons.friend_of_freedom,
  [EAchievement.BALANCE_ADVOCATE]: notificationManagerIcons.balance_advocate,
  [EAchievement.WEALTHY]: notificationManagerIcons.wealthy,
  [EAchievement.KEEPER_OF_SECRETS]: notificationManagerIcons.keeper_of_secrets,
  [EAchievement.MARKED_BY_ZONE]: notificationManagerIcons.marked_by_zone,
  [EAchievement.INFORMATION_DEALER]: notificationManagerIcons.information_dealer,
  [EAchievement.FRIEND_OF_STALKERS]: notificationManagerIcons.friend_of_stalkers,
};
