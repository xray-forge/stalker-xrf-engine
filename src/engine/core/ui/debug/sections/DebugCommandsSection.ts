import {
  get_console,
  LuabindClass,
  ui_events,
  XR_CConsole,
  XR_CUICheckButton,
  XR_CUIScrollView,
  XR_CUIStatic,
} from "xray16";

import { AbstractDebugSection } from "@/engine/core/ui/debug/sections/AbstractDebugSection";
import { executeConsoleCommand } from "@/engine/core/utils/console";
import { LuaLogger } from "@/engine/core/utils/logging";
import { resolveXmlFile } from "@/engine/core/utils/ui";
import { on_off_cmds, TConsoleCommand, zero_one_cmds } from "@/engine/lib/constants/console_commands";
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
  public initState(): void {}

  /**
   * todo: Description.
   */
  public initEntry(command: TConsoleCommand, console: XR_CConsole, type: "numeric" | "boolean"): void {
    const item: XR_CUIStatic = this.xml.InitStatic("command_item", this.commandsList);
    const caption: XR_CUIStatic = this.xml.InitStatic("command_label", item);
    const check: XR_CUICheckButton = this.xml.InitCheck("command_check", item);

    const value: Optional<boolean> = console.get_bool(command);

    check.SetCheck(value);
    caption.TextControl().SetText(command);

    this.owner.Register(check, command);
    this.owner.AddCallback(
      command,
      ui_events.CHECK_BUTTON_SET,
      () => this.onCheckboxChange(check, command, type),
      this
    );
    this.owner.AddCallback(
      command,
      ui_events.CHECK_BUTTON_RESET,
      () => this.onCheckboxChange(check, command, type),
      this
    );
  }

  /**
   * todo: Description.
   */
  public onCheckboxChange(check: XR_CUICheckButton, command: TConsoleCommand, type: "numeric" | "boolean"): void {
    const isEnabled: boolean = check.GetCheck();
    let parameter: string = "";

    if (type === "boolean") {
      parameter = isEnabled ? "on" : "off";
    } else {
      parameter = isEnabled ? "1" : "0";
    }

    logger.info("Value toggle:", type, command, parameter);
    executeConsoleCommand(command, parameter);
  }
}
