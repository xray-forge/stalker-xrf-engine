import {
  command_line,
  CScriptXmlInit,
  CUIWindow,
  ui_events,
  XR_CScriptXmlInit,
  XR_CUIScriptWnd,
  XR_CUIStatic,
} from "xray16";

import { LuaLogger } from "@/mod/scripts/utils/logging";
import { collectLuaGarbage, getLuaMemoryUsed } from "@/mod/scripts/utils/ram";
import { resolveXmlFormPath } from "@/mod/scripts/utils/ui";

const base: string = "menu\\debug\\DebugGeneralSection.component";
const logger: LuaLogger = new LuaLogger("DebugGeneralSection");

/**
 * todo;
 */
@LuabindClass()
export class DebugGeneralSection extends CUIWindow {
  public owner: XR_CUIScriptWnd;

  public luaVersionLabel!: XR_CUIStatic;
  public memoryUsageCountLabel!: XR_CUIStatic;
  public juaJitLabel!: XR_CUIStatic;

  public constructor(owner: XR_CUIScriptWnd) {
    super();

    this.owner = owner;

    this.InitControls();
    this.InitCallBacks();
    this.InitState();
  }

  public InitControls(): void {
    const xml: XR_CScriptXmlInit = new CScriptXmlInit();

    xml.ParseFile(resolveXmlFormPath(base));

    xml.InitStatic("lua_version_label", this);
    xml
      .InitStatic("game_command_line", this)
      .TextControl()
      .SetText("Command line args:" + (command_line() || "unknown"));

    this.memoryUsageCountLabel = xml.InitStatic("memory_usage_count", this);
    this.luaVersionLabel = xml.InitStatic("lua_version_label", this);
    this.juaJitLabel = xml.InitStatic("lua_jit_label", this);

    this.owner.Register(xml.Init3tButton("refresh_memory_button", this), "refresh_memory_button");
    this.owner.Register(xml.Init3tButton("collect_memory_button", this), "collect_memory_button");
  }

  public InitCallBacks(): void {
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
  }

  public InitState(): void {
    this.memoryUsageCountLabel.TextControl().SetText(this.getUsedMemoryLabel());
    this.luaVersionLabel.TextControl().SetText("Lua version: " + (_VERSION || "unknown"));
    this.juaJitLabel.TextControl().SetText("JIT " + (jit === null ? "disabled" : "enabled"));
  }

  public onCollectMemoryButtonClick(): void {
    logger.info("Collect memory garbage");

    collectLuaGarbage();
    this.memoryUsageCountLabel.TextControl().SetText(this.getUsedMemoryLabel());
  }

  public onRefreshMemoryButtonClick(): void {
    logger.info("Collect memory usage");

    this.memoryUsageCountLabel.TextControl().SetText(this.getUsedMemoryLabel());
  }

  public getUsedMemoryLabel(): string {
    return string.format("RAM: %.03f MB", getLuaMemoryUsed() / 1024);
  }
}
