import { command_line, CUI3tButton, CUIStatic, LuabindClass, ui_events } from "xray16";

import { ProfilingManager } from "@/engine/core/managers/debug/ProfilingManager";
import { AbstractDebugSection } from "@/engine/core/ui/debug/sections/AbstractDebugSection";
import { LuaLogger } from "@/engine/core/utils/logging";
import { resolveXmlFile } from "@/engine/core/utils/ui";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { TPath, XmlInit } from "@/engine/lib/types";

const base: TPath = "menu\\debug\\DebugGeneralSection.component";
const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class DebugGeneralSection extends AbstractDebugSection {
  public uiLuaVersionLabel!: CUIStatic;
  public uiMemoryUsageCountLabel!: CUIStatic;
  public uiProfilingToggleButton!: CUI3tButton;
  public uiSimulationDebugToggleButton!: CUI3tButton;
  public uiProfilingReportButton!: CUI3tButton;
  public uiLuaJitLabel!: CUIStatic;

  /**
   * todo: Description.
   */
  public initializeControls(): void {
    const xml: XmlInit = resolveXmlFile(base, this.xml);

    xml.InitStatic("lua_version_label", this);
    xml
      .InitStatic("game_command_line", this)
      .TextControl()
      .SetText("Command line args:" + (command_line() || "unknown"));

    this.uiMemoryUsageCountLabel = xml.InitStatic("memory_usage_count", this);
    this.uiLuaVersionLabel = xml.InitStatic("lua_version_label", this);
    this.uiLuaJitLabel = xml.InitStatic("lua_jit_label", this);
    this.uiProfilingToggleButton = xml.Init3tButton("profiling_toggle_button", this);
    this.uiProfilingReportButton = xml.Init3tButton("profiling_log_button", this);
    this.uiSimulationDebugToggleButton = xml.Init3tButton("debug_simulation_toggle_button", this);

    this.owner.Register(xml.Init3tButton("refresh_memory_button", this), "refresh_memory_button");
    this.owner.Register(xml.Init3tButton("collect_memory_button", this), "collect_memory_button");
    this.owner.Register(this.uiProfilingToggleButton, "profiling_toggle_button");
    this.owner.Register(this.uiProfilingReportButton, "profiling_log_button");
    this.owner.Register(this.uiSimulationDebugToggleButton, "debug_simulation_toggle_button");
  }

  /**
   * todo: Description.
   */
  public initializeCallBacks(): void {
    this.owner.AddCallback(
      "refresh_memory_button",
      ui_events.BUTTON_CLICKED,
      () => this.onRefreshMemoryButtonClick(),
      this
    );

    this.owner.AddCallback(
      "collect_memory_button",
      ui_events.BUTTON_CLICKED,
      () => this.onCollectMemoryButtonClick(),
      this
    );

    this.owner.AddCallback(
      "profiling_toggle_button",
      ui_events.BUTTON_CLICKED,
      () => this.onToggleProfilingButtonClick(),
      this
    );

    this.owner.AddCallback(
      "profiling_log_button",
      ui_events.BUTTON_CLICKED,
      () => this.onLogProfilingStatsButtonClick(),
      this
    );

    this.owner.AddCallback(
      "debug_simulation_toggle_button",
      ui_events.BUTTON_CLICKED,
      () => this.onToggleSimulationDebugButtonClick(),
      this
    );
  }

  /**
   * Initialize section state from current state.
   */
  public initializeState(): void {
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
      .SetText(gameConfig.DEBUG.IS_SIMULATION_DEBUG_ENABLED ? "Disable simulation debug" : "Enable simulation debug");
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
      profilingManager.logCallsCountStats();
    } else {
      logger.info("Profiler manager is disabled");
    }
  }

  /**
   * Toggle simulation debug with squad / smarts display on map with stats.
   */
  public onToggleSimulationDebugButtonClick(): void {
    gameConfig.DEBUG.IS_SIMULATION_DEBUG_ENABLED = !gameConfig.DEBUG.IS_SIMULATION_DEBUG_ENABLED;

    this.initializeState();
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
