import {
  command_line,
  CUIWindow,
  LuabindClass,
  ui_events,
  XR_CScriptXmlInit,
  XR_CUIScriptWnd,
  XR_CUIStatic,
} from "xray16";

import { ProfilingManager } from "@/engine/core/managers/ProfilingManager";
import { LuaLogger } from "@/engine/core/utils/logging";
import { collectLuaGarbage, getLuaMemoryUsed } from "@/engine/core/utils/ram";
import { resolveXmlFile } from "@/engine/core/utils/ui";

const base: string = "menu\\debug\\DebugGeneralSection.component";
const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class DebugGeneralSection extends CUIWindow {
  public owner: XR_CUIScriptWnd;

  public uiLuaVersionLabel!: XR_CUIStatic;
  public uiMemoryUsageCountLabel!: XR_CUIStatic;
  public uiProfilingToggleButton!: XR_CUIStatic;
  public uiProfilingReportButton!: XR_CUIStatic;
  public uiLuaJitLabel!: XR_CUIStatic;

  /**
   * todo;
   */
  public constructor(owner: XR_CUIScriptWnd) {
    super();

    this.owner = owner;

    this.initControls();
    this.initCallBacks();
    this.initState();
  }

  /**
   * todo;
   */
  public initControls(): void {
    const xml: XR_CScriptXmlInit = resolveXmlFile(base);

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

    this.owner.Register(xml.Init3tButton("refresh_memory_button", this), "refresh_memory_button");
    this.owner.Register(xml.Init3tButton("collect_memory_button", this), "collect_memory_button");
    this.owner.Register(this.uiProfilingToggleButton, "profiling_toggle_button");
    this.owner.Register(this.uiProfilingReportButton, "profiling_log_button");
  }

  /**
   * todo;
   */
  public initCallBacks(): void {
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
  }

  /**
   * todo;
   */
  public initState(): void {
    const profilingManager: ProfilingManager = ProfilingManager.getInstance();

    this.uiMemoryUsageCountLabel.TextControl().SetText(this.getUsedMemoryLabel());
    this.uiLuaVersionLabel.TextControl().SetText("Lua version: " + (_VERSION || "unknown"));
    this.uiLuaJitLabel.TextControl().SetText("JIT " + (jit === null ? "disabled" : "enabled"));
    this.uiProfilingToggleButton
      .TextControl()
      .SetText(profilingManager.isProfilingStarted ? "Stop profiling" : "Start profiling");
    this.uiProfilingReportButton.Enable(profilingManager.isProfilingStarted);
  }

  /**
   * todo;
   */
  public onCollectMemoryButtonClick(): void {
    logger.info("Collect memory garbage");

    collectLuaGarbage();
    this.uiMemoryUsageCountLabel.TextControl().SetText(this.getUsedMemoryLabel());
  }

  /**
   * todo;
   */
  public onToggleProfilingButtonClick(): void {
    const profilingManager: ProfilingManager = ProfilingManager.getInstance();

    if (profilingManager.isProfilingStarted) {
      profilingManager.clearHook();
    } else {
      profilingManager.setupHook();
    }

    this.uiProfilingReportButton.Enable(profilingManager.isProfilingStarted);
    this.uiProfilingToggleButton
      .TextControl()
      .SetText(profilingManager.isProfilingStarted ? "Stop profiling" : "Start profiling");
  }

  /**
   * todo;
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
   * todo;
   */
  public onRefreshMemoryButtonClick(): void {
    logger.info("Collect memory usage");

    this.uiMemoryUsageCountLabel.TextControl().SetText(this.getUsedMemoryLabel());
  }

  /**
   * todo;
   */
  public getUsedMemoryLabel(): string {
    return string.format("RAM: %.03f MB", getLuaMemoryUsed() / 1024);
  }
}
