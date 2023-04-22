import {
  alife,
  command_line,
  LuabindClass,
  object_binder,
  XR_cse_alife_object,
  XR_net_packet,
  XR_reader,
} from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  openSaveMarker,
  registerObject,
  resetObject,
  unregisterObject,
} from "@/engine/core/database";
import { loadObjectLogic, saveObjectLogic } from "@/engine/core/database/logic";
import { openLoadMarker } from "@/engine/core/database/save_markers";
import { LevelChanger } from "@/engine/core/objects/server/LevelChanger";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class LevelChangerBinder extends object_binder {
  /**
   * todo: Description.
   */
  public override reinit(): void {
    super.reinit();
    resetObject(this.object);
  }

  /**
   * todo: Description.
   */
  public override net_spawn(cse_object: XR_cse_alife_object): boolean {
    if (!super.net_spawn(cse_object)) {
      return false;
    }

    const [index] = string.find(command_line(), "-designer");

    if (index !== null) {
      return true;
    }

    registerObject(this.object);

    const s_obj: LevelChanger = alife().object(this.object.id()) as LevelChanger;

    this.object.enable_level_changer(s_obj.enabled);
    this.object.set_level_changer_invitation(s_obj.hint);

    logger.info("Net spawned:", this.object.id(), s_obj.enabled, s_obj.hint);

    return true;
  }

  /**
   * todo: Description.
   */
  public override net_destroy(): void {
    logger.info("Net destroy:", this.object.name());
    unregisterObject(this.object);
    super.net_destroy();
  }

  /**
   * todo: Description.
   */
  public override net_save_relevant(): boolean {
    return true;
  }

  /**
   * todo: Description.
   */
  public override save(packet: XR_net_packet): void {
    openSaveMarker(packet, LevelChangerBinder.__name);

    super.save(packet);
    saveObjectLogic(this.object, packet);

    closeSaveMarker(packet, LevelChangerBinder.__name);
  }

  /**
   * todo: Description.
   */
  public override load(reader: XR_reader): void {
    openLoadMarker(reader, LevelChangerBinder.__name);

    super.load(reader);
    loadObjectLogic(this.object, reader);

    closeLoadMarker(reader, LevelChangerBinder.__name);
  }
}
