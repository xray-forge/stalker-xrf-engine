import { command_line, CUI3tButton, CUIStatic, LuabindClass, ui_events } from "xray16";

import { SYSTEM_INI } from "@/engine/core/database";
import { ProfilingManager } from "@/engine/core/managers/debug/profiling";
import { AbstractDebugSection } from "@/engine/core/ui/debug/sections/AbstractDebugSection";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EElementType, registerUiElement, resolveXmlFile } from "@/engine/core/utils/ui";
import { forgeConfig } from "@/engine/lib/configs/ForgeConfig";
import { TPath, XmlInit } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);
const base: TPath = "menu\\debug\\DebugGeneralSection.component";

/**
 * Section of debug menu to handle generic information / generic actions.
 */
@LuabindClass()
export class DebugGeneralSection extends AbstractDebugSection {
  public uiLuaVersionLabel!: CUIStatic;
  public uiMemoryUsageCountLabel!: CUIStatic;
  public uiProfilingToggleButton!: CUI3tButton;
  public uiSimulationDebugToggleButton!: CUI3tButton;
  public uiProfilingReportButton!: CUI3tButton;

  public uiLuaJitLabel!: CUIStatic;

  public initializeControls(): void {
    const xml: XmlInit = resolveXmlFile(base, this.xml);

    xml.InitStatic("lua_version_label", this);
    xml
      .InitStatic("game_command_line", this)
      .TextControl()
      .SetText("Command line args:" + (command_line() || "unknown"));

    this.uiMemoryUsageCountLabel = registerUiElement(xml, "memory_usage_count", {
      type: EElementType.STATIC,
      base: this,
    });
    this.uiLuaVersionLabel = registerUiElement(xml, "lua_version_label", {
      type: EElementType.STATIC,
      base: this,
    });
    this.uiLuaJitLabel = registerUiElement(xml, "lua_jit_label", {
      type: EElementType.STATIC,
      base: this,
    });

    this.uiProfilingToggleButton = registerUiElement(xml, "profiling_toggle_button", {
      type: EElementType.BUTTON,
      base: this,
      context: this.owner,
      handlers: {
        [ui_events.BUTTON_CLICKED]: () => this.onToggleProfilingButtonClick(),
      },
    });

    this.uiSimulationDebugToggleButton = registerUiElement(xml, "debug_simulation_toggle_button", {
      type: EElementType.BUTTON,
      base: this,
      context: this.owner,
      handlers: {
        [ui_events.BUTTON_CLICKED]: () => this.onToggleSimulationDebugButtonClick(),
      },
    });

    registerUiElement(xml, "refresh_memory_button", {
      type: EElementType.BUTTON,
      base: this,
      context: this.owner,
      handlers: {
        [ui_events.BUTTON_CLICKED]: () => this.onRefreshMemoryButtonClick(),
      },
    });

    registerUiElement(xml, "collect_memory_button", {
      type: EElementType.BUTTON,
      base: this,
      context: this.owner,
      handlers: {
        [ui_events.BUTTON_CLICKED]: () => this.onCollectMemoryButtonClick(),
      },
    });

    registerUiElement(xml, "dump_system_ini_button", {
      type: EElementType.BUTTON,
      base: this,
      context: this.owner,
      handlers: {
        [ui_events.BUTTON_CLICKED]: () => this.onDumpSystemIni(),
      },
    });

    this.uiProfilingReportButton = registerUiElement(xml, "profiling_log_button", {
      base: this,
      type: EElementType.BUTTON,
      context: this.owner,
      handlers: {
        [ui_events.BUTTON_CLICKED]: () => this.onLogProfilingStatsButtonClick(),
      },
    });

    registerUiElement(xml, "portions_log_button", {
      base: this,
      type: EElementType.BUTTON,
      context: this.owner,
      handlers: {
        [ui_events.BUTTON_CLICKED]: () => this.onLogPortionsStatsButtonClick(),
      },
    });
  }

  /**
   * Initialize section state from current state.
   */
  public override initializeState(): void {
    const profilingManager: ProfilingManager = ProfilingManager.getInstance();

    this.uiMemoryUsageCountLabel.TextControl().SetText(this.getUsedMemoryLabel());
    this.uiLuaVersionLabel.TextControl().SetText("Lua version: " + (_VERSION || "unknown"));
    this.uiLuaJitLabel.TextControl().SetText("JIT " + (jit === null ? "disabled" : "enabled"));
    this.uiProfilingToggleButton
      .TextControl()
      .SetText(profilingManager.isProfilingStarted ? "Stop profiling" : "Start profiling");
    this.uiProfilingReportButton.Enable(profilingManager.isProfilingStarted);

    this.uiSimulationDebugToggleButton
      .TextControl()
      .SetText(forgeConfig.DEBUG.IS_SIMULATION_ENABLED ? "Disable simulation debug" : "Enable simulation debug");
  }

  /**
   * todo: Description.
   */
  public onCollectMemoryButtonClick(): void {
    logger.info("Collect memory garbage");

    ProfilingManager.getInstance().collectLuaGarbage();
    this.uiMemoryUsageCountLabel.TextControl().SetText(this.getUsedMemoryLabel());
  }

  /**
   * todo: Description.
   */
  public onToggleProfilingButtonClick(): void {
    const profilingManager: ProfilingManager = ProfilingManager.getInstance();

    if (profilingManager.isProfilingStarted) {
      profilingManager.clearHook();
    } else {
      profilingManager.setupHook();
    }

    this.uiProfilingReportButton.Enable(profilingManager.isProfilingStarted);
    this.initializeState();
  }

  /**
   * todo: Description.
   */
  public onLogProfilingStatsButtonClick(): void {
    const profilingManager: ProfilingManager = ProfilingManager.getInstance();

    if (profilingManager.isProfilingStarted) {
      profilingManager.logHookedCallsCountStats();
    } else {
      logger.info("Profiling manager is disabled");
    }
  }

  /**
   * todo: Description.
   */
  public onLogPortionsStatsButtonClick(): void {
    ProfilingManager.getInstance().logProfilingPortionsStats();
  }

  /**
   * Toggle simulation debug with squad / smarts display on map with stats.
   */
  public onToggleSimulationDebugButtonClick(): void {
    forgeConfig.DEBUG.IS_SIMULATION_ENABLED = !forgeConfig.DEBUG.IS_SIMULATION_ENABLED;

    this.initializeState();
  }

  /**
   * Dump system ini file for exploring.
   */
  public onDumpSystemIni(): void {
    logger.info("Saving system ini as gamedata\\system.ltx");
    SYSTEM_INI.save_as("gamedata\\system.ltx");
  }

  /**
   * todo: Description.
   */
  public onRefreshMemoryButtonClick(): void {
    logger.info("Collect memory usage");

    this.uiMemoryUsageCountLabel.TextControl().SetText(this.getUsedMemoryLabel());
  }

  /**
   * todo: Description.
   */
  public getUsedMemoryLabel(): string {
    return string.format("RAM: %.03f MB", ProfilingManager.getInstance().getLuaMemoryUsed() / 1024);
  }
}
