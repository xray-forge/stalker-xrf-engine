import {
  CScriptXmlInit,
  CUIWindow,
  get_console,
  LuabindClass,
  ui_events,
  XR_CConsole,
  XR_CScriptXmlInit,
  XR_CUICheckButton,
  XR_CUIScriptWnd,
  XR_CUIScrollView,
  XR_CUIStatic,
} from "xray16";

import { LuaLogger } from "@/engine/core/utils/logging";
import { resolveXmlFormPath } from "@/engine/core/utils/ui";
import { on_off_cmds, zero_one_cmds } from "@/engine/forms/menu/debug/sections";
import { Optional, TName } from "@/engine/lib/types";

const base: string = "menu\\debug\\DebugCommandsSection.component";
const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class DebugCommandsSection extends CUIWindow {
  public owner: XR_CUIScriptWnd;
  public commandsList!: XR_CUIScrollView;

  /**
   * todo: Description.
   */
  public constructor(owner: XR_CUIScriptWnd) {
    super();

    this.owner = owner;
    this.SetWindowName(DebugCommandsSection.__name);

    this.initControls();
    this.initCallBacks();
    this.initState();
  }

  /**
   * todo: Description.
   */
  public initControls(): void {
    const xml: XR_CScriptXmlInit = new CScriptXmlInit();
    const console: XR_CConsole = get_console();

    xml.ParseFile(resolveXmlFormPath(base));

    this.commandsList = xml.InitScrollView("commands_list", this);

    zero_one_cmds.forEach((it) => this.initEntry(it, xml, console, "numeric"));
    on_off_cmds.forEach((it) => this.initEntry(it, xml, console, "boolean"));
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
  public initEntry(name: TName, xml: XR_CScriptXmlInit, console: XR_CConsole, type: "numeric" | "boolean"): void {
    const item: XR_CUIStatic = xml.InitStatic("command_item", this.commandsList);
    const caption: XR_CUIStatic = xml.InitStatic("command_label", item);
    const check: XR_CUICheckButton = xml.InitCheck("command_item_" + name, item);

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
