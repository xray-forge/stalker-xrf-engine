import {
  alife,
  cse_alife_human_stalker,
  level,
  LuabindClass,
  XR_cse_alife_creature_abstract,
  XR_ini_file,
  XR_net_packet,
} from "xray16";

import {
  IStoredOfflineObject,
  registerObjectStoryLinks,
  registerOfflineObject,
  registry,
  unregisterStoryLinkByObjectId,
} from "@/engine/core/database";
import { SimulationBoardManager } from "@/engine/core/managers/SimulationBoardManager";
import { onSmartTerrainObjectDeath, SmartTerrain } from "@/engine/core/objects/alife/smart/SmartTerrain";
import { abort } from "@/engine/core/utils/debug";
import { getConfigString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { MAX_UNSIGNED_16_BIT } from "@/engine/lib/constants/memory";
import { STRINGIFIED_NIL } from "@/engine/lib/constants/words";
import { Optional, StringOptional, TName, TNumberId, TSection } from "@/engine/lib/types";

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
   * todo: Description.
   */
  public constructor(section: TSection) {
    super(section);
    registerOfflineObject(this.id);
  }

  /**
   * todo: Description.
   */
  public override can_switch_offline(): boolean {
    if (this.group_id !== MAX_UNSIGNED_16_BIT) {
      return true;
    }

    return super.can_switch_offline();
  }

  /**
   * todo: Description.
   */
  public override can_switch_online(): boolean {
    if (this.group_id !== MAX_UNSIGNED_16_BIT) {
      return true;
    }

    return super.can_switch_online();
  }

  /**
   * todo: Description.
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
   * todo: Description.
   */
  public override STATE_Read(packet: XR_net_packet, size: number) {
    super.STATE_Read(packet, size);

    const oldLevelId: StringOptional = packet.r_stringZ();
    const oldSection: StringOptional = packet.r_stringZ();
    const offlineObject: IStoredOfflineObject = registerOfflineObject(this.id);

    offlineObject.active_section = oldSection === STRINGIFIED_NIL ? null : oldSection;
    offlineObject.level_vertex_id = oldSection === STRINGIFIED_NIL ? null : (tonumber(oldLevelId) as number);

    this.isCorpseLootDropped = packet.r_bool();
  }

  /**
   * todo: Description.
   */
  public override on_register(): void {
    super.on_register();

    logger.info("Register:", this.id, this.name(), this.section_name());
    registerObjectStoryLinks(this);

    const simulationBoardManager: SimulationBoardManager = SimulationBoardManager.getInstance();
    const objectIni: XR_ini_file = this.spawn_ini();

    registerOfflineObject(this.id);

    this.brain().can_choose_alife_tasks(false);

    const smartName: TName = getConfigString(objectIni, "logic", "smart_terrain", this, false, "", "");
    const smartTerrain: Optional<SmartTerrain> = simulationBoardManager.getSmartTerrainByName(smartName);

    if (smartTerrain === null) {
      return;
    }

    alife().object<SmartTerrain>(smartTerrain.id)!.register_npc(this);
  }

  /**
   * todo: Description.
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
    unregisterStoryLinkByObjectId(this.id);
    super.on_unregister();
  }

  /**
   * todo: Description.
   */
  public override on_spawn(): void {
    logger.info("Spawn:", this.name());
    super.on_spawn();
  }

  /**
   * todo: Description.
   */
  public override on_death(killer: XR_cse_alife_creature_abstract): void {
    super.on_death(killer);

    logger.info("On death:", this.name(), killer.id, killer?.name());

    onSmartTerrainObjectDeath(this);

    if (this.group_id !== MAX_UNSIGNED_16_BIT) {
      const squad: any = alife().object(this.group_id);

      if (squad === null) {
        abort("There is no squad with ID [%s]", this.group_id);
      }

      squad.on_npc_death(this);
    }
  }
}
