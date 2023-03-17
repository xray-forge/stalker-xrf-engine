import {
  CScriptXmlInit,
  CUIMessageBoxEx,
  CUIScriptWnd,
  Frect,
  game,
  get_console,
  level,
  LuabindClass,
  ui_events,
  vector2,
  XR_CConsole,
  XR_CScriptXmlInit,
  XR_CUI3tButton,
  XR_CUIMessageBoxEx,
  XR_CUIStatic,
  XR_CUITrackBar,
  XR_Frect,
  XR_game_object,
} from "xray16";

import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { animations } from "@/engine/lib/constants/animation/animations";
import { post_processors } from "@/engine/lib/constants/animation/post_processors";
import { captions } from "@/engine/lib/constants/captions";
import { info_portions } from "@/engine/lib/constants/info_portions/info_portions";
import { AnyCallablesModule, Optional } from "@/engine/lib/types";
import { registry } from "@/engine/scripts/core/database";
import { SurgeManager } from "@/engine/scripts/core/managers/SurgeManager";
import { WeatherManager } from "@/engine/scripts/core/managers/WeatherManager";
import { disableInfo, giveInfo } from "@/engine/scripts/utils/info_portion";
import { LuaLogger } from "@/engine/scripts/utils/logging";
import { isWideScreen, resolveXmlFormPath } from "@/engine/scripts/utils/ui";

const base: string = "interaction\\SleepDialog.component";
const logger: LuaLogger = new LuaLogger($filename);

let sleep_control: Optional<SleepDialog> = null;
const isWide: boolean = isWideScreen();

/**
 * todo;
 */
@LuabindClass()
export class SleepDialog extends CUIScriptWnd {
  public back!: XR_CUIStatic;
  public sleep_static!: XR_CUIStatic;
  public sleep_static2!: XR_CUIStatic;
  public static_cover!: XR_CUIStatic;
  public st_marker!: XR_CUIStatic;
  public time_track!: XR_CUITrackBar;
  public btn_sleep!: XR_CUI3tButton;
  public btn_cancel!: XR_CUI3tButton;
  public sleep_mb!: XR_CUIMessageBoxEx;
  public sleep_st_tbl!: Record<string, XR_CUIStatic>;

  public constructor() {
    super();

    this.InitControls();
    this.InitCallbacks();
  }

  public InitControls(): void {
    this.SetWndRect(new Frect().set(0, 0, gameConfig.UI.BASE_WIDTH, gameConfig.UI.BASE_HEIGHT));

    const xml: XR_CScriptXmlInit = new CScriptXmlInit();

    xml.ParseFile(resolveXmlFormPath(base, true));

    this.back = xml.InitStatic("background", this);
    // --  this.sleep_static = xml.InitSleepStatic("sleep_static", this.back)

    this.sleep_static = xml.InitStatic("sleep_static", this.back);
    this.sleep_static2 = xml.InitStatic("sleep_static", this.back);
    this.static_cover = xml.InitStatic("static_cover", this.back);
    this.st_marker = xml.InitStatic("st_marker", this.static_cover);

    this.sleep_st_tbl = {};

    for (let it = 1; it <= 24; it += 1) {
      this.sleep_st_tbl[it] = xml.InitStatic("sleep_st_" + it, this.back);
    }

    this.time_track = xml.InitTrackBar("time_track", this.back);
    this.Register(this.time_track, "time_track");

    this.btn_sleep = xml.Init3tButton("btn_sleep", this.back);
    this.Register(this.btn_sleep, "btn_sleep");

    this.btn_cancel = xml.Init3tButton("btn_cancel", this.back);
    this.Register(this.btn_cancel, "btn_cancel");

    this.sleep_mb = new CUIMessageBoxEx();
    this.Register(this.sleep_mb, "sleep_mb");
  }

  public InitCallbacks(): void {
    this.AddCallback("btn_sleep", ui_events.BUTTON_CLICKED, () => this.OnButtonSleep(), this);
    this.AddCallback("btn_cancel", ui_events.BUTTON_CLICKED, () => this.OnButtonCancel(), this);
    this.AddCallback("sleep_mb", ui_events.MESSAGE_BOX_OK_CLICKED, () => this.OnMessageBoxOk(), this);
  }

  public Initialize(): void {
    const cur_hours: number = level.get_time_hours();

    for (let it = 1; it <= 24; it += 1) {
      let hours: number = cur_hours + it;

      if (hours >= 24) {
        hours = hours - 24;
      }

      this.sleep_st_tbl[it].TextControl().SetText(hours + game.translate_string(captions.st_sleep_hours));
    }

    const delta: number = math.floor((591 / 24) * cur_hours);
    let rect: XR_Frect = new Frect().set(delta, 413, 591, 531);

    this.sleep_static.SetTextureRect(rect);

    let width = 591 - delta;

    if (isWide) {
      width = width * 0.8;
    }

    this.sleep_static.SetWndSize(new vector2().set(width, 118));

    rect = new Frect().set(0, 413, delta, 531);
    this.sleep_static2.SetTextureRect(rect);

    width = delta;

    if (isWide) {
      width = width * 0.8;
    }

    this.sleep_static2.SetWndSize(new vector2().set(width, 118));

    const pos = this.sleep_static2.GetWndPos();

    pos.x = this.sleep_static.GetWndPos().x + this.sleep_static.GetWidth();
    this.sleep_static2.SetWndPos(pos);
  }

  public TestAndShow(): void {
    logger.info("Test and show");

    const actor: XR_game_object = registry.actor;

    if (actor.bleeding > 0 || actor.radiation > 0) {
      this.sleep_mb.InitMessageBox("message_box_ok");

      if (actor.bleeding > 0 && actor.radiation > 0) {
        this.sleep_mb.SetText("sleep_warning_all_pleasures");
      } else if (actor.bleeding > 0) {
        this.sleep_mb.SetText("sleep_warning_bleeding");
      } else {
        this.sleep_mb.SetText("sleep_warning_radiation");
      }

      this.sleep_mb.ShowDialog(true);
    } else {
      this.Initialize();
      this.ShowDialog(true);
    }
  }

  public override Update(): void {
    super.Update();

    const sleep_time: number = this.time_track.GetIValue() - 1;
    let x: number = math.floor((591 / 24) * sleep_time);

    if (x === 0) {
      x = 5;
    }

    if (isWide) {
      x = x * 0.8;
    }

    this.st_marker.SetWndPos(new vector2().set(x, 0));
  }

  public OnTrackButton(): void {
    logger.info("On track button");
  }

  public OnButtonCancel(): void {
    logger.info("On cancel");

    this.HideDialog();

    giveInfo(info_portions.tutorial_sleep);
    disableInfo(info_portions.sleep_active);
  }

  public OnButtonSleep(): void {
    logger.info("On button sleep");

    this.HideDialog();

    get_global<AnyCallablesModule>("xr_effects").disable_ui(registry.actor, null);

    level.add_cam_effector(animations.camera_effects_sleep, 10, false, "engine.dream_callback");
    level.add_pp_effector(post_processors.sleep_fade, 11, false);

    giveInfo(info_portions.actor_is_sleeping);

    const console: XR_CConsole = get_console();
    const surgeManager = SurgeManager.getInstance();

    registry.sounds.musicVolume = console.get_float("snd_volume_music");
    registry.sounds.effectsVolume = console.get_float("snd_volume_eff");

    console.execute("snd_volume_music 0");
    console.execute("snd_volume_eff 0");

    logger.info("Surge manager update resurrect skip message");
    surgeManager.setSkipResurrectMessage();
  }

  public OnMessageBoxOk(): void {
    logger.info("On message box OK");

    giveInfo("tutorial_sleep");
    disableInfo(info_portions.sleep_active);
  }
}

export function dream_callback(): void {
  logger.info("Dream callback");

  level.add_cam_effector(animations.camera_effects_sleep, 10, false, "engine.dream_callback2");

  const actor: XR_game_object = registry.actor;
  const hours = sleep_control!.time_track.GetIValue();
  const weatherManager = WeatherManager.getInstance();
  const surgeManager = SurgeManager.getInstance();

  level.change_game_time(0, hours, 0);

  weatherManager.forced_weather_change();
  SurgeManager.getInstance().isTimeForwarded = true;

  if (surgeManager.isStarted && weatherManager.weather_fx) {
    level.stop_weather_fx();
    // --    WeatherManager.get_weather_manager().select_weather(true)
    weatherManager.forced_weather_change();
  }

  actor.power = 1;
}

export function dream_callback2(): void {
  logger.info("Dream callback 2");

  get_global<AnyCallablesModule>("xr_effects").enable_ui(registry.actor, null);
  get_console().execute("snd_volume_music " + tostring(registry.sounds.musicVolume));
  get_console().execute("snd_volume_eff " + tostring(registry.sounds.effectsVolume));

  registry.sounds.musicVolume = 0;
  registry.sounds.effectsVolume = 0;

  giveInfo(info_portions.tutorial_sleep);
  disableInfo(info_portions.actor_is_sleeping);
  disableInfo(info_portions.sleep_active);
}

export function sleep(): void {
  logger.info("Sleep called");

  if (sleep_control === null) {
    sleep_control = new SleepDialog();
  }

  sleep_control.time_track.SetCurrentValue();
  sleep_control.TestAndShow();
}

// @ts-ignore Todo: Get rid of globals
main = () => {
  logger.info("[main] Call sleep from main");
};
