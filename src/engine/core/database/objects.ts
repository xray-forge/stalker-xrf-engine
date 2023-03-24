import { XR_CTime, XR_game_object, XR_ini_file } from "xray16";

import { registry } from "@/engine/core/database/registry";
import { StalkerMoveManager } from "@/engine/core/objects/state/StalkerMoveManager";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { IBaseSchemeState } from "@/engine/core/schemes";
import { ObjectRestrictionsManager } from "@/engine/core/schemes/base/ObjectRestrictionsManager";
import { ISchemePostCombatIdleState } from "@/engine/core/schemes/danger/ISchemePostCombatIdleState";
import { IActionSchemeHearState } from "@/engine/core/schemes/hear";
import {
  AnyObject,
  EScheme,
  ESchemeType,
  Optional,
  TDuration,
  TName,
  TNumberId,
  TSection,
  TTimestamp,
} from "@/engine/lib/types";

/**
 * todo;
 */
export interface IRegistryObjectState extends Record<EScheme, Optional<IBaseSchemeState>> {
  object: XR_game_object;
  ini: XR_ini_file;
  ini_filename: Optional<TName>;

  /**
   * Dynamically stored flags / variables.
   */
  portableStore: Optional<LuaTable<TName>>;

  active_section: Optional<TSection>;
  active_scheme: Optional<EScheme>;
  section_logic: Optional<TName>;
  gulag_name: Optional<TName>;
  overrides: Optional<AnyObject>;
  stype: ESchemeType;

  activation_time: TTimestamp;
  activation_game_time: XR_CTime;

  moveManager: Optional<StalkerMoveManager>;
  stateManager: Optional<StalkerStateManager>;
  restrictionsManager: Optional<ObjectRestrictionsManager>;
  hearInfo: Optional<IActionSchemeHearState>;

  // Todo: Try to avoid globals if possible.
  disable_input_time: Optional<XR_CTime>;
  disable_input_idle: Optional<TDuration>;
  invulnerable: Optional<boolean>;
  immortal: Optional<boolean>;
  mute: Optional<boolean>;
  corpse_already_selected: Optional<TNumberId>;
  wounded_already_selected: Optional<TNumberId>;
  old_aim_time: Optional<TTimestamp>;
  post_combat_wait: Optional<ISchemePostCombatIdleState>;

  enemy_id: Optional<TNumberId>;
  enemy: Optional<XR_game_object>;
  script_combat_type: Optional<TName>;
  registred_camp: Optional<TNumberId>;

  job_ini: Optional<TName>;
  loaded_ini_filename: Optional<TName>;
  loaded_section_logic: Optional<TSection>;
  loaded_active_section: Optional<TSection>;
  loaded_gulag_name: Optional<TName>;
}

/**
 * todo;
 */
export function registerObject(object: XR_game_object): IRegistryObjectState {
  const stored: Optional<IRegistryObjectState> = registry.objects.get(object.id());

  if (stored === null) {
    const newRecord: IRegistryObjectState = { object: object } as IRegistryObjectState;

    registry.objects.set(object.id(), newRecord);

    return newRecord;
  } else {
    stored.object = object;

    return stored;
  }
}

/**
 * todo;
 */
export function unregisterObject(object: XR_game_object): void {
  registry.objects.delete(object.id());
}

/**
 * todo;
 */
export function resetObject(object: XR_game_object, record: Partial<IRegistryObjectState> = {}): IRegistryObjectState {
  record.object = object;
  registry.objects.set(object.id(), record as IRegistryObjectState);

  return record as IRegistryObjectState;
}
