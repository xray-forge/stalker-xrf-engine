import { LuabindClass, ui_events, XR_CUI3tButton } from "xray16";

import { registry } from "@/engine/core/database";
import { AbstractDebugSection } from "@/engine/core/ui/debug/sections/AbstractDebugSection";
import { LuaLogger } from "@/engine/core/utils/logging";
import { resolveXmlFile } from "@/engine/core/utils/ui";
import { TPath } from "@/engine/lib/types";

const base: TPath = "menu\\debug\\DebugRegistrySection.component";
const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class DebugRegistrySection extends AbstractDebugSection {
  public logGeneralReportButton!: XR_CUI3tButton;

  public initControls(): void {
    resolveXmlFile(base, this.xml);

    this.logGeneralReportButton = this.xml.Init3tButton("log_general_report", this);

    this.owner.Register(this.logGeneralReportButton, "log_general_report");
  }

  public initCallBacks(): void {
    this.owner.AddCallback("log_general_report", ui_events.BUTTON_CLICKED, () => this.onPrintGeneralReport(), this);
  }

  public initState(): void {}

  /**
   * Report state of the registry.
   */
  public onPrintGeneralReport(): void {
    logger.pushSeparator();
    logger.info("General report of registry:");
    logger.info("Collections in registry:", Object.keys(registry).length);
    logger.info("Actor exists:", registry.actor !== null);
    logger.info("Managers exists:", Object.keys(registry.managers).length);
    logger.info("Schemes exists:", Object.keys(registry.schemes).length);
    logger.info("Actor combat:", Object.keys(registry.actorCombat).length);
    logger.info("Objects registered:", Object.keys(registry.objects).length);
    logger.info("Offline objects registered:", Object.keys(registry.offlineObjects).length);
    logger.info("Simulation objects registered:", Object.keys(registry.simulationObjects).length);
    logger.info("Story links:", Object.keys(registry.storyLink.idBySid).length);
    logger.info("Stalkers registered:", Object.keys(registry.stalkers).length);
    logger.info("Trade states registered:", Object.keys(registry.trade).length);
    logger.info("Camp stories registered:", Object.keys(registry.camps.stories).length);
    logger.info("Crows count:", registry.crows.count);
    logger.info("Helicopter enemies registered:", Object.keys(registry.helicopter.enemies).length);
    logger.info("Helicopter registered:", Object.keys(registry.helicopter.storage).length);
    logger.info("Anomalies registered:", Object.keys(registry.anomalies).length);
    logger.info("Zones registered:", Object.keys(registry.zones).length);
    logger.info("Silence zones registered:", Object.keys(registry.silenceZones).length);
    logger.info("No weapon zones registered:", Object.keys(registry.noWeaponZones).length);
    logger.info("Light zones registered:", Object.keys(registry.lightZones).length);
    logger.info("Smart terrains registered:", Object.keys(registry.smartTerrains).length);
    logger.info("Smart covers registered:", Object.keys(registry.smartCovers).length);
    logger.info("Script spawned:", Object.keys(registry.scriptSpawned).length);
    logger.info("Animated doors registered:", Object.keys(registry.animatedDoors).length);
    logger.info("Save markers registered:", Object.keys(registry.saveMarkers).length);
    logger.info("Signal lights registered:", Object.keys(registry.signalLights).length);
    logger.info("Spawned vertexes registered:", Object.keys(registry.spawnedVertexes).length);
    logger.info("Patrols registered:", Object.keys(registry.patrols.generic).length);
    logger.info("Reach tasks registered:", Object.keys(registry.patrols.reachTask).length);
    logger.info("Sound managers registered:", Object.keys(registry.sounds.managers).length);
    logger.info("Sound generic registered:", Object.keys(registry.sounds.generic).length);
    logger.info("Sound themes registered:", Object.keys(registry.sounds.themes).length);
    logger.info("Sound looped registered:", Object.keys(registry.sounds.looped).length);
    logger.info("Sound music volume registered:", registry.sounds.musicVolume);
    logger.info("Sound effects volume registered:", registry.sounds.effectsVolume);
    logger.pushSeparator();
  }
}
