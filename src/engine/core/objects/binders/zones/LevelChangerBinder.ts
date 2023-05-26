import { alife, command_line, cse_alife_object, LuabindClass, net_packet, object_binder, reader } from "xray16";

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
  public override reinit(): void {
    super.reinit();
    resetObject(this.object);
  }

  public override net_spawn(cse_object: cse_alife_object): boolean {
    if (!super.net_spawn(cse_object)) {
      return false;
    }

    const [index] = string.find(command_line(), "-designer");

    if (index !== null) {
      return true;
    }

    registerObject(this.object);

    const serverObject: LevelChanger = alife().object(this.object.id()) as LevelChanger;

    this.object.enable_level_changer(serverObject.isEnabled);
    this.object.set_level_changer_invitation(serverObject.invitationHint);

    logger.info("Net spawned:", this.object.id(), serverObject.isEnabled, serverObject.invitationHint);

    return true;
  }

  public override net_destroy(): void {
    logger.info("Net destroy:", this.object.name());
    unregisterObject(this.object);
    super.net_destroy();
  }

  public override net_save_relevant(): boolean {
    return true;
  }

  public override save(packet: net_packet): void {
    openSaveMarker(packet, LevelChangerBinder.__name);

    super.save(packet);
    saveObjectLogic(this.object, packet);

    closeSaveMarker(packet, LevelChangerBinder.__name);
  }

  public override load(reader: reader): void {
    openLoadMarker(reader, LevelChangerBinder.__name);

    super.load(reader);
    loadObjectLogic(this.object, reader);

    closeLoadMarker(reader, LevelChangerBinder.__name);
  }
}
