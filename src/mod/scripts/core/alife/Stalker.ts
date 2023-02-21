import {
  alife,
  cse_alife_human_stalker,
  level,
  XR_cse_alife_creature_abstract,
  XR_cse_alife_human_stalker,
  XR_ini_file,
  XR_net_packet,
} from "xray16";

import { STRINGIFIED_NIL } from "@/mod/globals/lua";
import { MAX_UNSIGNED_16_BIT } from "@/mod/globals/memory";
import { Optional, StringOptional, TSection } from "@/mod/lib/types";
import { ISmartTerrain, on_death } from "@/mod/scripts/core/alife/SmartTerrain";
import { initializeOfflineObject, IStoredOfflineObject, registry } from "@/mod/scripts/core/database";
import { get_sim_board } from "@/mod/scripts/core/database/SimBoard";
import { checkSpawnIniForStoryId } from "@/mod/scripts/core/database/StoryObjectsRegistry";
import { unregisterStoryObjectById } from "@/mod/scripts/utils/alife";
import { getConfigString } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("Stalker");

export interface IStalker extends XR_cse_alife_human_stalker {
  ini: Optional<XR_ini_file>;
  ini_initialized: boolean;

  smart_terrain_conditions: Optional<boolean>;
  smart_terrain_conditions_initialized: boolean;

  job_online: Optional<boolean>;
  job_online_condlist: Optional<boolean>;

  death_droped: boolean;
  m_registred: boolean;
  sim_forced_online: boolean;

  get_ini(): void;
}

export const Stalker: IStalker = declare_xr_class("Stalker", cse_alife_human_stalker, {
  __init(section: TSection): void {
    cse_alife_human_stalker.__init(this, section);

    this.ini = null;
    this.ini_initialized = false;

    this.smart_terrain_conditions = null;
    this.smart_terrain_conditions_initialized = false;

    this.job_online = null;
    this.job_online_condlist = null;

    this.death_droped = false;

    this.m_registred = false;

    this.sim_forced_online = false;

    initializeOfflineObject(this.id);
  },
  get_ini(): void {
    if (!this.ini_initialized) {
      this.ini = this.spawn_ini();
      this.ini_initialized = true;
    }
  },
  can_switch_offline(): boolean {
    if (this.group_id !== MAX_UNSIGNED_16_BIT) {
      return true;
    }

    return cse_alife_human_stalker.can_switch_offline(this);
  },
  can_switch_online(): boolean {
    if (this.group_id !== MAX_UNSIGNED_16_BIT) {
      return true;
    }

    return cse_alife_human_stalker.can_switch_online(this);
  },
  switch_online() {
    logger.info("Switch online:", this.name());
    cse_alife_human_stalker.switch_online(this);
  },
  switch_offline() {
    logger.info("Switch offline:", this.name());
    cse_alife_human_stalker.switch_offline(this);
  },
  STATE_Write(packet: XR_net_packet) {
    cse_alife_human_stalker.STATE_Write(this, packet);

    if (this.online) {
      packet.w_stringZ(tostring(level?.object_by_id(this.id)?.level_vertex_id() !== null));
    } else {
      packet.w_stringZ(tostring(registry.offlineObjects.get(this.id).level_vertex_id !== null));
    }

    packet.w_stringZ(tostring(registry.offlineObjects.get(this.id).active_section !== null));
    packet.w_bool(this.death_droped);
  },
  STATE_Read(packet: XR_net_packet, size: number) {
    cse_alife_human_stalker.STATE_Read(this, packet, size);

    if (this.script_version > 10) {
      const oldLevelId: StringOptional = packet.r_stringZ();
      const oldSection: StringOptional = packet.r_stringZ();
      const offlineObject: IStoredOfflineObject = initializeOfflineObject(this.id);

      offlineObject.active_section = oldSection === STRINGIFIED_NIL ? null : oldSection;
      offlineObject.level_vertex_id = oldSection === STRINGIFIED_NIL ? null : (tonumber(oldLevelId) as number);
    }

    this.death_droped = packet.r_bool();
  },
  on_before_register(): void {},
  on_register(): void {
    cse_alife_human_stalker.on_register(this);
    logger.info("Register:", this.id, this.name(), this.section_name());
    checkSpawnIniForStoryId(this);

    const board = get_sim_board();
    const obj_ini = this.spawn_ini();

    this.m_registred = true;

    initializeOfflineObject(this.id);

    this.brain().can_choose_alife_tasks(false);

    const smart = getConfigString(obj_ini, "logic", "smart_terrain", this, false, "", "");
    const smart_obj = board.get_smart_by_name(smart);

    if (smart_obj === null) {
      return;
    }

    alife()!.object<ISmartTerrain>(smart_obj.id)!.register_npc(this);
  },
  on_unregister(): void {
    logger.info("Unregister:", this.name());

    const strn_id = this.smart_terrain_id();

    if (strn_id !== MAX_UNSIGNED_16_BIT) {
      const smart: Optional<ISmartTerrain> = alife().object(strn_id);

      if (smart !== null) {
        smart.unregister_npc(this);
      }
    }

    registry.offlineObjects.delete(this.id);
    unregisterStoryObjectById(this.id);
    cse_alife_human_stalker.on_unregister(this);
  },
  on_spawn(): void {
    logger.info("Spawn:", this.name());
    cse_alife_human_stalker.on_spawn(this);
  },
  on_death(killer: XR_cse_alife_creature_abstract): void {
    logger.info("On death:", this.name(), killer.id, killer?.name());

    cse_alife_human_stalker.on_death(this, killer);

    on_death(this);

    if (this.group_id !== MAX_UNSIGNED_16_BIT) {
      const squad: any = alife().object(this.group_id);

      if (squad === null) {
        abort("There is no squad with ID [%s]", this.group_id);
      }

      squad.on_npc_death(this);
    }
  },
  update(): void {
    cse_alife_human_stalker.update(this);
  },
} as IStalker);
