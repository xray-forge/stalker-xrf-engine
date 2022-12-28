import {
  command_line,
  CScriptXmlInit,
  CUIWindow,
  ui_events,
  XR_CScriptXmlInit,
  XR_CUIScriptWnd,
  XR_CUIStatic
} from "xray16";

import { LuaLogger } from "@/mod/scripts/utils/logging";
import { collectLuaGarbage, getLuaMemoryUsed } from "@/mod/scripts/utils/ram";
import { resolveXmlFormPath } from "@/mod/scripts/utils/ui";

const base: string = "menu\\debug\\DebugGeneralSection.component";
const log: LuaLogger = new LuaLogger("DebugGeneralSection");

export interface IDebugGeneralSection extends XR_CUIScriptWnd {
  owner: XR_CUIScriptWnd;

  luaVersionLabel: XR_CUIStatic;
  memoryUsageCountLabel: XR_CUIStatic;

  InitControls(): void;
  InitCallBacks(): void;
  InitState(): void;

  onRefreshMemoryButtonClick(): void;
  onCollectMemoryButtonClick(): void;

  getUsedMemoryLabel(): string;
}

export const DebugGeneralSection: IDebugGeneralSection = declare_xr_class("DebugGeneralSection", CUIWindow, {
  __init(this: IDebugGeneralSection, owner: XR_CUIScriptWnd): void {
    xr_class_super();

    log.info("Init");

    this.owner = owner;

    this.InitControls();
    this.InitCallBacks();
    this.InitState();
  },
  __finalize(): void {
    log.info("Finalize");
  },
  InitControls(): void {
    log.info("Init controls");

    const xml: XR_CScriptXmlInit = new CScriptXmlInit();

    xml.ParseFile(resolveXmlFormPath(base));

    xml.InitStatic("lua_version_label", this);
    xml
      .InitStatic("game_command_line", this)
      .TextControl()
      .SetText("Command line args:" + (command_line() || "unknown"));

    this.memoryUsageCountLabel = xml.InitStatic("memory_usage_count", this);
    this.luaVersionLabel = xml.InitStatic("lua_version_label", this);

    this.owner.Register(xml.Init3tButton("refresh_memory_button", this), "refresh_memory_button");
    this.owner.Register(xml.Init3tButton("collect_memory_button", this), "collect_memory_button");
  },
  InitCallBacks(): void {
    log.info("Init callbacks");

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
  },
  InitState(): void {
    log.info("Init state");

    this.memoryUsageCountLabel.TextControl().SetText(this.getUsedMemoryLabel());
    this.luaVersionLabel.TextControl().SetText("Lua version: " + (_VERSION || "unknown"));
  },
  onCollectMemoryButtonClick(): void {
    log.info("Collect memory garbage");

    collectLuaGarbage();
    this.memoryUsageCountLabel.TextControl().SetText(this.getUsedMemoryLabel());
  },
  onRefreshMemoryButtonClick(): void {
    log.info("Collect memory usage");

    this.memoryUsageCountLabel.TextControl().SetText(this.getUsedMemoryLabel());
  },
  getUsedMemoryLabel(): string {
    return string.format("RAM: %.03f MB", getLuaMemoryUsed() / 1000);
  }
} as IDebugGeneralSection);
