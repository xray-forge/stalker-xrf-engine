import {
  alife,
  cse_alife_human_stalker,
  level,
  LuabindClass,
  XR_cse_alife_creature_abstract,
  XR_ini_file,
  XR_net_packet,
} from "xray16";

import { STRINGIFIED_NIL } from "@/engine/lib/constants/lua";
import { MAX_UNSIGNED_16_BIT } from "@/engine/lib/constants/memory";
import { Optional, StringOptional, TNumberId, TSection } from "@/engine/lib/types";
import { initializeOfflineObject, IStoredOfflineObject, registry } from "@/engine/scripts/core/database";
import { SimulationBoardManager } from "@/engine/scripts/core/database/SimulationBoardManager";
import { StoryObjectsManager } from "@/engine/scripts/core/managers/StoryObjectsManager";
import { on_death, SmartTerrain } from "@/engine/scripts/core/objects/alife/smart/SmartTerrain";
import { getConfigString } from "@/engine/scripts/utils/config";
import { abort } from "@/engine/scripts/utils/debug";
import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class Stalker extends cse_alife_human_stalker {
  public ini: Optional<XR_ini_file> = null;

  public job_online: Optional<boolean> = null;
  public isCorpseLootDropped: boolean = false;
  public sim_forced_online: boolean = false;

  /**
   * todo;
   */
  public constructor(section: TSection) {
    super(section);
    initializeOfflineObject(this.id);
  }

  /**
   * todo;
   */
  public override can_switch_offline(): boolean {
    if (this.group_id !== MAX_UNSIGNED_16_BIT) {
      return true;
    }

    return super.can_switch_offline();
  }

  /**
   * todo;
   */
  public override can_switch_online(): boolean {
    if (this.group_id !== MAX_UNSIGNED_16_BIT) {
      return true;
    }

    return super.can_switch_online();
  }

  /**
   * todo;
   */
  public override STATE_Write(packet: XR_net_packet) {
    super.STATE_Write(packet);

    if (this.online) {
      packet.w_stringZ(tostring(level?.object_by_id(this.id)?.level_vertex_id() !== null));
    } else {
      packet.w_stringZ(tostring(registry.offlineObjects.get(this.id).level_vertex_id !== null));
    }

    packet.w_stringZ(tostring(registry.offlineObjects.get(this.id).active_section !== null));
    packet.w_bool(this.isCorpseLootDropped);
  }

  /**
   * todo;
   */
  public override STATE_Read(packet: XR_net_packet, size: number) {
    super.STATE_Read(packet, size);

    if (this.script_version > 10) {
      const oldLevelId: StringOptional = packet.r_stringZ();
      const oldSection: StringOptional = packet.r_stringZ();
      const offlineObject: IStoredOfflineObject = initializeOfflineObject(this.id);

      offlineObject.active_section = oldSection === STRINGIFIED_NIL ? null : oldSection;
      offlineObject.level_vertex_id = oldSection === STRINGIFIED_NIL ? null : (tonumber(oldLevelId) as number);
    }

    this.isCorpseLootDropped = packet.r_bool();
  }

  /**
   * todo;
   */
  public override on_register(): void {
    super.on_register();

    logger.info("Register:", this.id, this.name(), this.section_name());
    StoryObjectsManager.checkSpawnIniForStoryId(this);

    const board = SimulationBoardManager.getInstance();
    const obj_ini = this.spawn_ini();

    initializeOfflineObject(this.id);

    this.brain().can_choose_alife_tasks(false);

    const smart = getConfigString(obj_ini, "logic", "smart_terrain", this, false, "", "");
    const smart_obj = board.get_smart_by_name(smart);

    if (smart_obj === null) {
      return;
    }

    alife()!.object<SmartTerrain>(smart_obj.id)!.register_npc(this);
  }

  /**
   * todo;
   */
  public override on_unregister(): void {
    logger.info("Unregister:", this.name());

    const smartTerrainId: TNumberId = this.smart_terrain_id();

    if (smartTerrainId !== MAX_UNSIGNED_16_BIT) {
      const smart: Optional<SmartTerrain> = alife().object(smartTerrainId);

      if (smart !== null) {
        smart.unregister_npc(this);
      }
    }

    registry.offlineObjects.delete(this.id);
    StoryObjectsManager.unregisterStoryObjectById(this.id);
    super.on_unregister();
  }

  /**
   * todo;
   */
  public override on_spawn(): void {
    logger.info("Spawn:", this.name());
    super.on_spawn();
  }

  /**
   * todo;
   */
  public override on_death(killer: XR_cse_alife_creature_abstract): void {
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
}
