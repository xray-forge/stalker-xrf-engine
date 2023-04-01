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

  public onPrintGeneralReport(): void {
    logger.info("General report of registry:", Object.keys(registry).length);
  }
}
