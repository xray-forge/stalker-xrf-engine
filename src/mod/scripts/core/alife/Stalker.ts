import {
  alife,
  cse_alife_human_stalker,
  level,
  XR_cse_alife_creature_abstract,
  XR_ini_file,
  XR_net_packet,
} from "xray16";

import { STRINGIFIED_NIL } from "@/mod/globals/lua";
import { MAX_UNSIGNED_16_BIT } from "@/mod/globals/memory";
import { Optional, StringOptional, TSection } from "@/mod/lib/types";
import { on_death, SmartTerrain } from "@/mod/scripts/core/alife/SmartTerrain";
import { initializeOfflineObject, IStoredOfflineObject, registry } from "@/mod/scripts/core/database";
import { get_sim_board } from "@/mod/scripts/core/database/SimBoard";
import { checkSpawnIniForStoryId } from "@/mod/scripts/core/database/StoryObjectsRegistry";
import { unregisterStoryObjectById } from "@/mod/scripts/utils/alife";
import { getConfigString } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("Stalker");

/**
 * todo;
 */
@LuabindClass()
export class Stalker extends cse_alife_human_stalker {
  public ini: Optional<XR_ini_file> = null;
  public ini_initialized: boolean = false;

  public job_online: Optional<boolean> = null;
  public job_online_condlist: Optional<boolean> = null;
  public death_droped: boolean = false;
  public m_registred: boolean = false;
  public sim_forced_online: boolean = false;

  public constructor(section: TSection) {
    super(section);
    initializeOfflineObject(this.id);
  }

  public get_ini(): void {
    if (!this.ini_initialized) {
      this.ini = this.spawn_ini();
      this.ini_initialized = true;
    }
  }

  public can_switch_offline(): boolean {
    if (this.group_id !== MAX_UNSIGNED_16_BIT) {
      return true;
    }

    return super.can_switch_offline();
  }

  public can_switch_online(): boolean {
    if (this.group_id !== MAX_UNSIGNED_16_BIT) {
      return true;
    }

    return super.can_switch_online();
  }

  public switch_online() {
    logger.info("Switch online:", this.name());
    super.switch_online();
  }

  public switch_offline() {
    logger.info("Switch offline:", this.name());
    super.switch_offline();
  }

  public STATE_Write(packet: XR_net_packet) {
    super.STATE_Write(packet);

    if (this.online) {
      packet.w_stringZ(tostring(level?.object_by_id(this.id)?.level_vertex_id() !== null));
    } else {
      packet.w_stringZ(tostring(registry.offlineObjects.get(this.id).level_vertex_id !== null));
    }

    packet.w_stringZ(tostring(registry.offlineObjects.get(this.id).active_section !== null));
    packet.w_bool(this.death_droped);
  }

  public STATE_Read(packet: XR_net_packet, size: number) {
    super.STATE_Read(packet, size);

    if (this.script_version > 10) {
      const oldLevelId: StringOptional = packet.r_stringZ();
      const oldSection: StringOptional = packet.r_stringZ();
      const offlineObject: IStoredOfflineObject = initializeOfflineObject(this.id);

      offlineObject.active_section = oldSection === STRINGIFIED_NIL ? null : oldSection;
      offlineObject.level_vertex_id = oldSection === STRINGIFIED_NIL ? null : (tonumber(oldLevelId) as number);
    }

    this.death_droped = packet.r_bool();
  }

  public on_before_register(): void {
    super.on_before_register();
  }

  public on_register(): void {
    super.on_register();
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

    alife()!.object<SmartTerrain>(smart_obj.id)!.register_npc(this);
  }

  public on_unregister(): void {
    logger.info("Unregister:", this.name());

    const strn_id = this.smart_terrain_id();

    if (strn_id !== MAX_UNSIGNED_16_BIT) {
      const smart: Optional<SmartTerrain> = alife().object(strn_id);

      if (smart !== null) {
        smart.unregister_npc(this);
      }
    }

    registry.offlineObjects.delete(this.id);
    unregisterStoryObjectById(this.id);
    super.on_unregister();
  }

  public on_spawn(): void {
    logger.info("Spawn:", this.name());
    super.on_spawn();
  }

  public on_death(killer: XR_cse_alife_creature_abstract): void {
    logger.info("On death:", this.name(), killer.id, killer?.name());

    super.on_death(killer);

    on_death(this);

    if (this.group_id !== MAX_UNSIGNED_16_BIT) {
      const squad: any = alife().object(this.group_id);

      if (squad === null) {
        abort("There is no squad with ID [%s]", this.group_id);
      }

      squad.on_npc_death(this);
    }
  }

  public update(): void {
    super.update();
  }
}
