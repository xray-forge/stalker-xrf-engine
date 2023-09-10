import { TNotificationIcon } from "@/engine/core/managers/notifications/index";
import { ETaskState } from "@/engine/core/managers/tasks/types";
import {
  ClientObject,
  GameTask,
  Optional,
  TCount,
  TDuration,
  TLabel,
  TName,
  TNumberId,
  TPath,
  TSection,
  TStringId,
  TTimestamp,
} from "@/engine/lib/types";

/**
 * Generic notification type.
 */
export enum ENotificationType {
  ITEM = 1,
  MONEY,
  SOUND,
  TASK,
  TIP,
  TREASURE,
}

/**
 * With items / notification transfer divide directions.
 */
export enum ENotificationDirection {
  OUT = 1,
  IN = 2,
}

/**
 * Notifications related to treasure separation.
 */
export enum ETreasureState {
  NEW_TREASURE_COORDINATES,
  FOUND_TREASURE,
  LOOTED_TREASURE_COORDINATES,
}

/**
 * Generic notification.
 */
export interface INotification {
  type: ENotificationType;
}

/**
 * Item relocated notification.
 */
export interface IItemRelocatedNotification extends INotification {
  direction: ENotificationDirection;
  itemSection: TSection;
  amount?: TCount;
}

/**
 * Money relocated notification
 */
export interface IMoneyRelocatedNotification extends INotification {
  direction: ENotificationDirection;
  amount: TCount;
}

/**
 * Task updated notification.
 */
export interface ITaskUpdatedNotification extends INotification {
  state: ETaskState;
  task: GameTask;
}
/**
 * Treasure update notification.
 */
export interface ITreasureNotification extends INotification {
  state: ETreasureState;
}

/**
 * Generic tip notification.
 */
export interface ITipNotification extends INotification {
  caption: TLabel;
  delay?: Optional<TDuration>;
  sender?: Optional<TNotificationIcon | ClientObject>;
  showtime?: Optional<TTimestamp>;
  senderId?: Optional<TStringId>;
}

/**
 * Sound play notification.
 */
export interface ISoundNotification extends INotification {
  object?: Optional<ClientObject>;
  faction: TName;
  point: Optional<TName | TNumberId>;
  soundPath: TPath;
  soundCaption?: Optional<TLabel>;
  delay?: TDuration;
}
