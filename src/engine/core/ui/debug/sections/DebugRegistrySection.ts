import { CUI3tButton, CUICheckButton, CUIListBox, CUIStatic, LuabindClass, ui_events } from "xray16";

import { registry } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { AbstractDebugSection } from "@/engine/core/ui/debug/sections/AbstractDebugSection";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EElementType, initializeElement, resolveXmlFile } from "@/engine/core/utils/ui";
import { NIL } from "@/engine/lib/constants/words";
import { AlifeSimulator, Optional, TCount, TPath } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);
const base: TPath = "menu\\debug\\DebugRegistrySection.component";

/**
 * Debugging of game objects registry / database.
 */
@LuabindClass()
export class DebugRegistrySection extends AbstractDebugSection {
  public uiLogGeneralReportButton!: CUI3tButton;
  public uiRegistryCountLabel!: CUIStatic;
  public uiRegistryFilterOnline!: CUICheckButton;

  public uiRegistryList!: CUIListBox;

  public filterIsOnline: boolean = true;

  public initializeControls(): void {
    resolveXmlFile(base, this.xml);

    initializeElement(this.xml, "registry_list_frame", {
      base: this,
      type: EElementType.FRAME,
    });

    this.uiRegistryCountLabel = initializeElement(this.xml, "registry_filter_count", {
      type: EElementType.STATIC,
      base: this,
    });
    this.uiLogGeneralReportButton = initializeElement(this.xml, "log_general_report", {
      type: EElementType.BUTTON,
      base: this,
      context: this.owner,
      handlers: {
        [ui_events.BUTTON_CLICKED]: () => this.onPrintGeneralReport(),
      },
    });

    this.uiRegistryFilterOnline = initializeElement(this.xml, "registry_filter_online", {
      type: EElementType.CHECK_BOX,
      base: this,
      context: this.owner,
      handlers: {
        [ui_events.CHECK_BUTTON_RESET]: () => this.onToggleFilterOnline(),
        [ui_events.CHECK_BUTTON_SET]: () => this.onToggleFilterOnline(),
      },
    });

    this.uiRegistryList = initializeElement(this.xml, "registry_list", {
      type: EElementType.LIST_BOX,
      base: this,
      context: this.owner,
      handlers: {
        [ui_events.LIST_ITEM_SELECT]: () => this.onSelectedObjectChange(),
      },
    });
  }

  public override initializeState(): void {
    const simulator: Optional<AlifeSimulator> = registry.simulator;

    this.uiRegistryFilterOnline.SetCheck(this.filterIsOnline);

    if (simulator !== null) {
      let total: TCount = 0;

      this.uiRegistryList.Clear();

      simulator.iterate_objects((it): void => {
        const isValid: boolean = this.filterIsOnline ? it.online : true;

        if (isValid) {
          total += 1;

          this.uiRegistryList.AddTextItem(
            string.format(
              "#%s# - %s - %s - %s - %s",
              it.id,
              it.clsid(),
              it.online ? "online" : "offline",
              it.name(),
              it.section_name()
            )
          );
        }
      });

      this.uiRegistryCountLabel.SetText(string.format("Total: %s", total));
    }
  }

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
    logger.info("Camp stories registered:", Object.keys(registry.camps).length);
    logger.info("Crows count:", registry.crows.count);
    logger.info("Helicopter enemies registered:", Object.keys(registry.helicopter.enemies).length);
    logger.info("Helicopter registered:", Object.keys(registry.helicopter.storage).length);
    logger.info("Anomalies registered:", Object.keys(registry.anomalyZones).length);
    logger.info("Zones registered:", Object.keys(registry.zones).length);
    logger.info("Silence zones registered:", Object.keys(registry.silenceZones).length);
    logger.info("No weapon zones registered:", Object.keys(registry.noWeaponZones).length);
    logger.info("Light zones registered:", Object.keys(registry.lightZones).length);
    logger.info("Smart terrains registered:", Object.keys(registry.smartTerrains).length);
    logger.info("Smart covers registered:", Object.keys(registry.smartCovers).length);
    logger.info("Animated doors registered:", Object.keys(registry.doors).length);
    logger.info("Save markers registered:", Object.keys(registry.saveMarkers).length);
    logger.info("Signal lights registered:", Object.keys(registry.signalLights).length);
    logger.info("Spawned vertexes registered:", Object.keys(registry.spawnedVertexes).length);
    logger.info("Patrols registered:", Object.keys(registry.patrols.generic).length);
    logger.info("Reach tasks registered:", Object.keys(registry.patrols.reachTask).length);

    const eventsManager: EventsManager = EventsManager.getInstance();

    logger.info("Event handlers exist:", Object.keys(eventsManager.callbacks).length);
    Object.entries(eventsManager.callbacks).forEach(([key, values]) => {
      logger.info("*:", EGameEvent[key as unknown as number], values !== null ? Object.keys(values).length : NIL);
    });

    logger.pushSeparator();
  }

  public onSelectedObjectChange(): void {
    logger.info("Selected another item");
  }

  public onToggleFilterOnline(): void {
    this.filterIsOnline = this.uiRegistryFilterOnline.GetCheck();
    this.initializeState();

    logger.info("Changed online filter:", this.filterIsOnline);
  }
}
