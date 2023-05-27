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
import { disableInfo, giveInfo } from "@/engine/core/utils/info_portion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isWideScreen, resolveXmlFormPath } from "@/engine/core/utils/ui";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { captions } from "@/engine/lib/constants/captions/captions";
import { infoPortions } from "@/engine/lib/constants/info_portions/info_portions";
import { ClientObject, TPath } from "@/engine/lib/types";

const base: TPath = "interaction\\SleepDialog.component";
const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class SleepDialog extends CUIScriptWnd {
  public readonly owner: SleepManager;

  public isWide: boolean = isWideScreen();

  public back!: CUIStatic;
  public sleepStatic!: CUIStatic;
  public sleepStatic2!: CUIStatic;
  public staticCover!: CUIStatic;
  public stMarker!: CUIStatic;
  public timeTrack!: CUITrackBar;
  public btnSleep!: CUI3tButton;
  public btnCancel!: CUI3tButton;
  public sleepMessageBox!: CUIMessageBoxEx;
  public sleepStTable!: Record<string, CUIStatic>;

  public constructor(owner: SleepManager) {
    super();

    this.owner = owner;

    this.InitControls();
    this.InitCallbacks();
  }

  /**
   * todo;
   */
  public InitControls(): void {
    this.SetWndRect(new Frect().set(0, 0, gameConfig.UI.BASE_WIDTH, gameConfig.UI.BASE_HEIGHT));

    const xml: CScriptXmlInit = new CScriptXmlInit();

    xml.ParseFile(resolveXmlFormPath(base, true));

    this.back = xml.InitStatic("background", this);

    this.sleepStatic = xml.InitStatic("sleep_static", this.back);
    this.sleepStatic2 = xml.InitStatic("sleep_static", this.back);
    this.staticCover = xml.InitStatic("static_cover", this.back);
    this.stMarker = xml.InitStatic("st_marker", this.staticCover);

    this.sleepStTable = {};

    for (let it = 1; it <= 24; it += 1) {
      this.sleepStTable[it] = xml.InitStatic("sleep_st_" + it, this.back);
    }

    this.timeTrack = xml.InitTrackBar("time_track", this.back);
    this.Register(this.timeTrack, "time_track");

    this.btnSleep = xml.Init3tButton("btn_sleep", this.back);
    this.Register(this.btnSleep, "btn_sleep");

    this.btnCancel = xml.Init3tButton("btn_cancel", this.back);
    this.Register(this.btnCancel, "btn_cancel");

    this.sleepMessageBox = new CUIMessageBoxEx();
    this.Register(this.sleepMessageBox, "sleep_mb");
  }

  /**
   * todo;
   */
  public InitCallbacks(): void {
    this.AddCallback("btn_sleep", ui_events.BUTTON_CLICKED, () => this.OnButtonSleep(), this);
    this.AddCallback("btn_cancel", ui_events.BUTTON_CLICKED, () => this.OnButtonCancel(), this);
    this.AddCallback("sleep_mb", ui_events.MESSAGE_BOX_OK_CLICKED, () => this.OnMessageBoxOk(), this);
  }

  /**
   * todo;
   */
  public Initialize(): void {
    const currentHours: number = level.get_time_hours();

    for (let it = 1; it <= 24; it += 1) {
      let hours: number = currentHours + it;

      if (hours >= 24) {
        hours = hours - 24;
      }

      this.sleepStTable[it].TextControl().SetText(hours + game.translate_string(captions.st_sleep_hours));
    }

    const delta: number = math.floor((591 / 24) * currentHours);
    let rect: Frect = new Frect().set(delta, 413, 591, 531);

    this.sleepStatic.SetTextureRect(rect);

    let width = 591 - delta;

    if (this.isWide) {
      width = width * 0.8;
    }

    this.sleepStatic.SetWndSize(new vector2().set(width, 118));

    rect = new Frect().set(0, 413, delta, 531);
    this.sleepStatic2.SetTextureRect(rect);

    width = delta;

    if (this.isWide) {
      width = width * 0.8;
    }

    this.sleepStatic2.SetWndSize(new vector2().set(width, 118));

    const pos = this.sleepStatic2.GetWndPos();

    pos.x = this.sleepStatic.GetWndPos().x + this.sleepStatic.GetWidth();
    this.sleepStatic2.SetWndPos(pos);
  }

  /**
   * todo;
   */
  public TestAndShow(): void {
    logger.info("Show sleep options");

    const actor: ClientObject = registry.actor;

    giveInfo(infoPortions.sleep_active);

    if (actor.bleeding > 0 || actor.radiation > 0) {
      this.sleepMessageBox.InitMessageBox("message_box_ok");

      if (actor.bleeding > 0 && actor.radiation > 0) {
        this.sleepMessageBox.SetText(captions.sleep_warning_all_pleasures);
      } else if (actor.bleeding > 0) {
        this.sleepMessageBox.SetText(captions.sleep_warning_bleeding);
      } else {
        this.sleepMessageBox.SetText(captions.sleep_warning_radiation);
      }

      this.sleepMessageBox.ShowDialog(true);
    } else {
      this.Initialize();
      this.ShowDialog(true);
    }
  }

  /**
   * todo;
   */
  public override Update(): void {
    super.Update();

    const sleepTime: number = this.timeTrack.GetIValue() - 1;
    let x: number = math.floor((591 / 24) * sleepTime);

    if (x === 0) {
      x = 5;
    }

    if (this.isWide) {
      x = x * 0.8;
    }

    this.stMarker.SetWndPos(new vector2().set(x, 0));
  }

  public OnButtonCancel(): void {
    logger.info("On cancel");

    this.HideDialog();

    giveInfo(infoPortions.tutorial_sleep);
    disableInfo(infoPortions.sleep_active);
  }

  public OnButtonSleep(): void {
    logger.info("On button sleep");

    this.HideDialog();
    this.owner.startSleep(this.timeTrack.GetIValue());
  }

  public OnMessageBoxOk(): void {
    logger.info("On message box OK");

    giveInfo(infoPortions.tutorial_sleep);
    disableInfo(infoPortions.sleep_active);
  }
}

// @ts-ignore Todo: Get rid of globals
main = () => {
  logger.info("[main] Call sleep from main");
};
