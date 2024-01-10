import { CUI3tButton, CUICheckButton, CUIListBox, CUIStatic, LuabindClass, ui_events } from "xray16";

import { getManager, registry } from "@/engine/core/database";
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

    initializeElement(this.xml, EElementType.FRAME, "registry_list_frame", this);

    this.uiRegistryCountLabel = initializeElement(this.xml, EElementType.STATIC, "registry_filter_count", this);
    this.uiLogGeneralReportButton = initializeElement(this.xml, EElementType.BUTTON, "log_general_report", this, {
      context: this.owner,
      [ui_events.BUTTON_CLICKED]: () => this.onPrintGeneralReport(),
    });

    this.uiRegistryFilterOnline = initializeElement(
      this.xml,
      EElementType.CHECK_BUTTON,
      "registry_filter_online",
      this,
      {
        context: this.owner,
        [ui_events.CHECK_BUTTON_RESET]: () => this.onToggleFilterOnline(),
        [ui_events.CHECK_BUTTON_SET]: () => this.onToggleFilterOnline(),
      }
    );

    this.uiRegistryList = initializeElement(this.xml, EElementType.LIST_BOX, "registry_list", this, {
      context: this.owner,
      [ui_events.LIST_ITEM_SELECT]: () => this.onSelectedObjectChange(),
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
    logger.format("General report of registry:");
    logger.format("Collections in registry: %s", Object.keys(registry).length);
    logger.format("Actor exists: %s", registry.actor !== null);
    logger.format("Managers exists: %s", Object.keys(registry.managers).length);
    logger.format("Schemes exists: %s", Object.keys(registry.schemes).length);
    logger.format("Actor combat: %s", Object.keys(registry.actorCombat).length);
    logger.format("Objects registered: %s", Object.keys(registry.objects).length);
    logger.format("Offline objects registered: %s", Object.keys(registry.offlineObjects).length);
    logger.format("Simulation objects registered: %s", Object.keys(registry.simulationObjects).length);
    logger.format("Story links: %s", Object.keys(registry.storyLink.idBySid).length);
    logger.format("Stalkers registered: %s", Object.keys(registry.stalkers).length);
    logger.format("Trade states registered: %s", Object.keys(registry.trade).length);
    logger.format("Camp stories registered: %s", Object.keys(registry.camps).length);
    logger.format("Crows count: %s", registry.crows.count);
    logger.format("Helicopter enemies registered: %s", Object.keys(registry.helicopter.enemies).length);
    logger.format("Helicopter registered: %s", Object.keys(registry.helicopter.storage).length);
    logger.format("Anomalies registered: %s", Object.keys(registry.anomalyZones).length);
    logger.format("Zones registered: %s", Object.keys(registry.zones).length);
    logger.format("Silence zones registered: %s", Object.keys(registry.silenceZones).length);
    logger.format("No weapon zones registered: %s", Object.keys(registry.noWeaponZones).length);
    logger.format("Light zones registered: %s", Object.keys(registry.lightZones).length);
    logger.format("Smart terrains registered: %s", Object.keys(registry.smartTerrains).length);
    logger.format("Smart covers registered: %s", Object.keys(registry.smartCovers).length);
    logger.format("Animated doors registered: %s", Object.keys(registry.doors).length);
    logger.format("Save markers registered: %s", Object.keys(registry.saveMarkers).length);
    logger.format("Signal lights registered: %s", Object.keys(registry.signalLights).length);
    logger.format("Spawned vertexes registered: %s", Object.keys(registry.spawnedVertexes).length);

    const eventsManager: EventsManager = getManager(EventsManager);

    logger.format("Event handlers exist: %s", Object.keys(eventsManager.callbacks).length);
    Object.entries(eventsManager.callbacks).forEach(([key, values]) => {
      logger.format(
        "*: %s %s",
        EGameEvent[key as unknown as number],
        values !== null ? Object.keys(values).length : NIL
      );
    });

    logger.pushSeparator();
  }

  public onSelectedObjectChange(): void {
    logger.format("Selected another item");
  }

  public onToggleFilterOnline(): void {
    this.filterIsOnline = this.uiRegistryFilterOnline.GetCheck();
    this.initializeState();

    logger.format("Changed online filter: %s", this.filterIsOnline);
  }
}
