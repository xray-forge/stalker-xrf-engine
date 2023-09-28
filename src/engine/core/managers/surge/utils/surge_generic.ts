import { registry } from "@/engine/core/database";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export function launchSurgeSignalRockets(): void {
  logger.info("Launch signal light rockets");

  for (const [, signalLight] of registry.signalLights) {
    logger.info("Start signal light");
    if (!signalLight.isFlying()) {
      signalLight.launch();
    }
  }
}
