import { CConsole, CUICheckButton, CUIScrollView, CUIStatic, get_console, LuabindClass, ui_events } from "xray16";

import { AbstractDebugSection } from "@/engine/core/ui/debug/sections/AbstractDebugSection";
import { executeConsoleCommand } from "@/engine/core/utils/console";
import { LuaLogger } from "@/engine/core/utils/logging";
import { resolveXmlFile } from "@/engine/core/utils/ui";
import { onOffCommands, TConsoleCommand, zeroOneCommands } from "@/engine/lib/constants/console_commands";
import { Optional, TPath } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);
const base: TPath = "menu\\debug\\DebugCommandsSection.component";

/**
 * Debug section to handle console commands shortcuts.
 */
@LuabindClass()
export class DebugCommandsSection extends AbstractDebugSection {
  public uiCommandsList!: CUIScrollView;

  public initializeControls(): void {
    const console: CConsole = get_console();

    resolveXmlFile(base, this.xml);

    this.uiCommandsList = this.xml.InitScrollView("commands_list", this);

    zeroOneCommands.forEach((it) => this.initializeEntry(it, console, "numeric"));
    onOffCommands.forEach((it) => this.initializeEntry(it, console, "boolean"));
  }

  /**
   * todo: Description.
   */
  public initializeEntry(command: TConsoleCommand, console: CConsole, type: "numeric" | "boolean"): void {
    const item: CUIStatic = this.xml.InitStatic("command_item", this.uiCommandsList);
    const caption: CUIStatic = this.xml.InitStatic("command_label", item);
    const check: CUICheckButton = this.xml.InitCheck("command_check", item);

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
   * Handle change of checkbox value.
   */
  public onCheckboxChange(check: CUICheckButton, command: TConsoleCommand, type: "numeric" | "boolean"): void {
    const isEnabled: boolean = check.GetCheck();
    let parameter: string;

    if (type === "boolean") {
      parameter = isEnabled ? "on" : "off";
    } else {
      parameter = isEnabled ? "1" : "0";
    }

    logger.info("Value toggle: %s %s %s", type, command, parameter);
    executeConsoleCommand(command, parameter);
  }
}
