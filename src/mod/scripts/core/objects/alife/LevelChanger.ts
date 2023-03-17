import { cse_alife_level_changer, editor, LuabindClass, XR_net_packet } from "xray16";

import { TSection } from "@/mod/lib/types";
import { checkSpawnIniForStoryId } from "@/mod/scripts/core/database/StoryObjectsRegistry";
import { unregisterStoryObjectById } from "@/mod/scripts/utils/alife";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_save";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class LevelChanger extends cse_alife_level_changer {
  public enabled: boolean = true;
  public hint: string = "level_changer_invitation";

  /**
   * todo;
   */
  public constructor(section: TSection) {
    super(section);
  }

  /**
   * todo;
   */
  public override on_register(): void {
    super.on_register();
    logger.info("Register:", this.id, this.name(), this.section_name());
    checkSpawnIniForStoryId(this);
  }

  /**
   * todo;
   */
  public override on_unregister(): void {
    unregisterStoryObjectById(this.id);
    super.on_unregister();
    logger.info("Unregister:", this.name());
  }

  /**
   * todo;
   */
  public override STATE_Write(packet: XR_net_packet): void {
    super.STATE_Write(packet);

    setSaveMarker(packet, false, LevelChanger.__name);
    packet.w_bool(this.enabled);
    packet.w_stringZ(this.hint);
    setSaveMarker(packet, true, LevelChanger.__name);
  }

  /**
   * todo;
   */
  public override STATE_Read(packet: XR_net_packet, size: number): void {
    super.STATE_Read(packet, size);

    if (editor()) {
      return;
    }

    setLoadMarker(packet, false, LevelChanger.__name);
    this.enabled = packet.r_bool();
    this.hint = packet.r_stringZ();
    setLoadMarker(packet, true, LevelChanger.__name);
  }
}
