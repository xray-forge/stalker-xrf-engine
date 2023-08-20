import {
  CScriptXmlInit,
  CUI3tButton,
  CUIMessageBoxEx,
  CUIScriptWnd,
  CUIStatic,
  CUITrackBar,
  Frect,
  game,
  level,
  LuabindClass,
  ui_events,
  vector2,
} from "xray16";

import { registry } from "@/engine/core/database";
import { SleepManager } from "@/engine/core/managers/interaction/SleepManager";
import { LuaLogger } from "@/engine/core/utils/logging";
import { disableInfo, giveInfo } from "@/engine/core/utils/object/object_info_portion";
import { isWideScreen, resolveXmlFormPath } from "@/engine/core/utils/ui";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { captions } from "@/engine/lib/constants/captions/captions";
import { infoPortions } from "@/engine/lib/constants/info_portions/info_portions";
import { ClientObject, TPath, TTimestamp, Vector2D } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);
const base: TPath = "interaction\\SleepDialog.component";

/**
 * In-game sleep dialog, shown when interacting with sleeping beds.
 */
@LuabindClass()
export class SleepDialog extends CUIScriptWnd {
  public readonly owner: SleepManager;

  public isWide: boolean = isWideScreen();

  public uiBack!: CUIStatic;
  public uiSleepStatic!: CUIStatic;
  public uiSleepStatic2!: CUIStatic;
  public uiStaticCover!: CUIStatic;
  public uiStMarker!: CUIStatic;
  public uiTimeTrack!: CUITrackBar;
  public uiBtnSleep!: CUI3tButton;
  public uiBtnCancel!: CUI3tButton;
  public uiSleepMessageBox!: CUIMessageBoxEx;
  public uiSleepStTable!: Record<string, CUIStatic>;

  public constructor(owner: SleepManager) {
    super();

    this.owner = owner;

    this.initControls();
    this.initCallbacks();
  }

  /**
   * Initialize UI control elements.
   */
  public initControls(): void {
    this.SetWndRect(new Frect().set(0, 0, gameConfig.UI.BASE_WIDTH, gameConfig.UI.BASE_HEIGHT));

    const xml: CScriptXmlInit = new CScriptXmlInit();

    xml.ParseFile(resolveXmlFormPath(base, true));

    this.uiBack = xml.InitStatic("background", this);

    this.uiSleepStatic = xml.InitStatic("sleep_static", this.uiBack);
    this.uiSleepStatic2 = xml.InitStatic("sleep_static", this.uiBack);
    this.uiStaticCover = xml.InitStatic("static_cover", this.uiBack);
    this.uiStMarker = xml.InitStatic("st_marker", this.uiStaticCover);

    this.uiSleepStTable = {};

    for (let it = 1; it <= 24; it += 1) {
      this.uiSleepStTable[it] = xml.InitStatic("sleep_st_" + it, this.uiBack);
    }

    this.uiTimeTrack = xml.InitTrackBar("time_track", this.uiBack);
    this.Register(this.uiTimeTrack, "time_track");

    this.uiBtnSleep = xml.Init3tButton("btn_sleep", this.uiBack);
    this.Register(this.uiBtnSleep, "btn_sleep");

    this.uiBtnCancel = xml.Init3tButton("btn_cancel", this.uiBack);
    this.Register(this.uiBtnCancel, "btn_cancel");

    this.uiSleepMessageBox = new CUIMessageBoxEx();
    this.Register(this.uiSleepMessageBox, "sleep_mb");
  }

  /**
   * Initialize UI handlers.
   */
  public initCallbacks(): void {
    this.AddCallback("btn_sleep", ui_events.BUTTON_CLICKED, () => this.onButtonSleepClicked(), this);
    this.AddCallback("btn_cancel", ui_events.BUTTON_CLICKED, () => this.onButtonCancel(), this);
    this.AddCallback("sleep_mb", ui_events.MESSAGE_BOX_OK_CLICKED, () => this.onMessageBoxOkClicked(), this);
  }

  /**
   * Initialize display of sleep dialog.
   */
  public initialize(): void {
    const currentHours: TTimestamp = level.get_time_hours();

    for (let it = 1; it <= 24; it += 1) {
      let hours: number = currentHours + it;

      if (hours >= 24) {
        hours = hours - 24;
      }

      this.uiSleepStTable[it].TextControl().SetText(hours + game.translate_string(captions.st_sleep_hours));
    }

    const delta: number = math.floor((591 / 24) * currentHours);
    let rect: Frect = new Frect().set(delta, 413, 591, 531);

    this.uiSleepStatic.SetTextureRect(rect);

    let width: number = 591 - delta;

    if (this.isWide) {
      width = width * 0.8;
    }

    this.uiSleepStatic.SetWndSize(new vector2().set(width, 118));

    rect = new Frect().set(0, 413, delta, 531);
    this.uiSleepStatic2.SetTextureRect(rect);

    width = delta;

    if (this.isWide) {
      width = width * 0.8;
    }

    this.uiSleepStatic2.SetWndSize(new vector2().set(width, 118));

    const position: Vector2D = this.uiSleepStatic2.GetWndPos();

    position.x = this.uiSleepStatic.GetWndPos().x + this.uiSleepStatic.GetWidth();
    this.uiSleepStatic2.SetWndPos(position);
  }

  /**
   * Show in-game sleep dialog options.
   */
  public showSleepOptions(): void {
    logger.info("Show sleep options");

    const actor: ClientObject = registry.actor;

    giveInfo(infoPortions.sleep_active);

    if (actor.bleeding > 0 || actor.radiation > 0) {
      this.uiSleepMessageBox.InitMessageBox("message_box_ok");

      if (actor.bleeding > 0 && actor.radiation > 0) {
        this.uiSleepMessageBox.SetText(captions.sleep_warning_all_pleasures);
      } else if (actor.bleeding > 0) {
        this.uiSleepMessageBox.SetText(captions.sleep_warning_bleeding);
      } else {
        this.uiSleepMessageBox.SetText(captions.sleep_warning_radiation);
      }

      this.uiSleepMessageBox.ShowDialog(true);
    } else {
      this.initialize();
      this.ShowDialog(true);
    }
  }

  /**
   * todo;
   */
  public override Update(): void {
    super.Update();

    const sleepTime: number = this.uiTimeTrack.GetIValue() - 1;
    let x: number = math.floor((591 / 24) * sleepTime);

    if (x === 0) {
      x = 5;
    }

    if (this.isWide) {
      x = x * 0.8;
    }

    this.uiStMarker.SetWndPos(new vector2().set(x, 0));
  }

  public onButtonCancel(): void {
    logger.info("On cancel");

    this.HideDialog();

    giveInfo(infoPortions.tutorial_sleep);
    disableInfo(infoPortions.sleep_active);
  }

  public onButtonSleepClicked(): void {
    logger.info("On button sleep");

    this.HideDialog();
    this.owner.startSleep(this.uiTimeTrack.GetIValue());
  }

  public onMessageBoxOkClicked(): void {
    logger.info("On message box OK");

    giveInfo(infoPortions.tutorial_sleep);
    disableInfo(infoPortions.sleep_active);
  }
}
