import {
  CScriptXmlInit,
  get_console,
  LuabindClass,
  ui_events,
  XR_CConsole,
  XR_CScriptXmlInit,
  XR_CUICheckButton,
  XR_CUIScrollView,
  XR_CUIStatic,
} from "xray16";

import { AbstractDebugSection } from "@/engine/core/ui/debug/sections/AbstractDebugSection";
import { LuaLogger } from "@/engine/core/utils/logging";
import { resolveXmlFile, resolveXmlFormPath } from "@/engine/core/utils/ui";
import { on_off_cmds, zero_one_cmds } from "@/engine/forms/menu/debug/sections";
import { Optional, TName, TPath } from "@/engine/lib/types";

const base: TPath = "menu\\debug\\DebugCommandsSection.component";
const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class DebugCommandsSection extends AbstractDebugSection {
  public commandsList!: XR_CUIScrollView;

  /**
   * todo: Description.
   */
  public initControls(): void {
    const console: XR_CConsole = get_console();

    resolveXmlFile(base, this.xml);

    this.commandsList = this.xml.InitScrollView("commands_list", this);

    zero_one_cmds.forEach((it) => this.initEntry(it, console, "numeric"));
    on_off_cmds.forEach((it) => this.initEntry(it, console, "boolean"));
  }

  /**
   * todo: Description.
   */
  public initCallBacks(): void {}

  /**
   * todo: Description.
   */
  public initState(): void {
    logger.info("Initialized state");
  }

  /**
   * todo: Description.
   */
  public initEntry(name: TName, console: XR_CConsole, type: "numeric" | "boolean"): void {
    const item: XR_CUIStatic = this.xml.InitStatic("command_item", this.commandsList);
    const caption: XR_CUIStatic = this.xml.InitStatic("command_label", item);
    const check: XR_CUICheckButton = this.xml.InitCheck("command_item_" + name, item);

    const value: Optional<boolean> = console.get_bool(name);

    check.SetCheck(value);
    caption.TextControl().SetText(name);

    this.owner.Register(check, name);
    this.owner.AddCallback(name, ui_events.CHECK_BUTTON_SET, () => this.onCheckboxChange(check, name, type), this);
    this.owner.AddCallback(name, ui_events.CHECK_BUTTON_RESET, () => this.onCheckboxChange(check, name, type), this);
  }

  /**
   * todo: Description.
   */
  public onCheckboxChange(check: XR_CUICheckButton, name: TName, type: "numeric" | "boolean"): void {
    const isEnabled: boolean = check.GetCheck();
    let cmd: string = name + " ";

    if (type === "boolean") {
      cmd += isEnabled ? "on" : "off";
    } else {
      cmd += isEnabled ? "1" : "0";
    }

    logger.info("Value toggle:", type, cmd);
    get_console().execute(cmd);
  }
}
