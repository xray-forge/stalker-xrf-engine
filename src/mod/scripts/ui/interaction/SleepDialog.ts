import { captions } from "@/mod/globals/captions";
import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { Optional } from "@/mod/lib/types";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { resolveXmlFormPath, isWideScreen } from "@/mod/scripts/utils/ui";

const base: string = "interaction\\SleepDialog.component";
const log: LuaLogger = new LuaLogger("SleepDialog");

let sleep_control: Optional<ISleepDialog> = null;
const isWide = isWideScreen();

export interface ISleepDialog extends XR_CUIScriptWnd {
  back: XR_CUIStatic;
  sleep_static: XR_CUIStatic;
  sleep_static2: XR_CUIStatic;
  static_cover: XR_CUIStatic;
  st_marker: XR_CUIStatic;
  time_track: XR_CUITrackBar;
  btn_sleep: XR_CUI3tButton;
  btn_cancel: XR_CUI3tButton;
  sleep_mb: XR_CUIMessageBoxEx;

  sleep_st_tbl: Record<string, XR_CUIStatic>;

  InitControls(): void;
  InitCallbacks(): void;
  Initialize(): void;

  TestAndShow(): void;
  Update(): void;
  OnTrackButton(): void;
  OnButtonSleep(): void;
  OnButtonCancel(): void;
  OnMessageBoxOk(): void;
}

export const SleepDialog = declare_xr_class("SleepDialog", CUIScriptWnd, {
  __init(): void {
    xr_class_super();

    this.InitControls();
    this.InitCallbacks();
  },
  InitControls(): void {
    log.info("Init controls");

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
  },
  InitCallbacks(): void {
    log.info("Init callbacks");

    this.AddCallback("btn_sleep", ui_events.BUTTON_CLICKED, () => this.OnButtonSleep(), this);
    this.AddCallback("btn_cancel", ui_events.BUTTON_CLICKED, () => this.OnButtonCancel(), this);
    this.AddCallback("sleep_mb", ui_events.MESSAGE_BOX_OK_CLICKED, () => this.OnMessageBoxOk(), this);
  },
  Initialize(): void {
    log.info("Initialize:", isWide);

    const cur_hours: number = level.get_time_hours();

    for (let it = 1; it <= 24; it += 1) {
      let hours: number = cur_hours + it;

      if (hours >= 24) {
        hours = hours - 24;
      }

      this.sleep_st_tbl[it].TextControl().SetText(hours + game.translate_string(captions.st_sleep_hours));
    }

    const delta: number = lua_math.floor((591 / 24) * cur_hours);
    let rect: XR_FRect = new Frect().set(delta, 413, 591, 531);

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
  },
  TestAndShow(): void {
    log.info("Test and show");

    if (db.actor.bleeding > 0 || db.actor.radiation > 0) {
      this.sleep_mb.InitMessageBox("message_box_ok");

      if (db.actor.bleeding > 0 && db.actor.radiation > 0) {
        this.sleep_mb.SetText("sleep_warning_all_pleasures");
      } else if (db.actor.bleeding > 0) {
        this.sleep_mb.SetText("sleep_warning_bleeding");
      } else {
        this.sleep_mb.SetText("sleep_warning_radiation");
      }

      this.sleep_mb.ShowDialog(true);
    } else {
      this.Initialize();
      this.ShowDialog(true);
    }
  },
  Update(): void {
    CUIScriptWnd.Update(this);

    const sleep_time: number = this.time_track.GetIValue() - 1;
    let x: number = lua_math.floor((591 / 24) * sleep_time);

    if (x === 0) {
      x = 5;
    }

    if (isWide) {
      x = x * 0.8;
    }

    this.st_marker.SetWndPos(new vector2().set(x, 0));
  },
  OnTrackButton(): void {
    log.info("On track button");
  },
  OnButtonCancel(): void {
    log.info("On cancel");

    this.HideDialog();

    get_global("db").actor.give_info_portion("tutorial_sleep");
    get_global("disable_info")("sleep_active");
  },
  OnButtonSleep(): void {
    log.info("On button sleep");

    this.HideDialog();

    log.info("Disable ui");
    get_global("xr_effects").disable_ui(db.actor, null);

    log.info("Add effects");

    level.add_cam_effector("camera_effects\\sleep.anm", 10, false, "_extern.dream_callback");
    level.add_pp_effector("sleep_fade.ppe", 11, false);

    log.info("Give info portion");
    db.actor.give_info_portion("actor_is_sleeping");

    log.info("Turn off volumes");

    _G.mus_vol = get_console().get_float("snd_volume_music");
    _G.amb_vol = get_console().get_float("snd_volume_eff");

    get_console().execute("snd_volume_music 0");
    get_console().execute("snd_volume_eff 0");

    log.info("Surge manager update resurrect skip message");
    get_global("surge_manager").resurrect_skip_message();
  },
  OnMessageBoxOk(): void {
    log.info("On message box OK");

    get_global("db").actor.give_info_portion("tutorial_sleep");
    get_global("disable_info")("sleep_active");
  }
} as ISleepDialog);

export function dream_callback(): void {
  log.info("Dream callback");

  level.add_cam_effector("camera_effects\\sleep.anm", 10, false, "_extern.dream_callback2");

  const hours = sleep_control!.time_track.GetIValue();

  level.change_game_time(0, hours, 0);

  get_global("level_weathers").get_weather_manager().forced_weather_change();
  get_global("surge_manager").get_surge_manager().time_forwarded = true;

  if (get_global("surge_manager").is_started() && get_global("level_weathers").get_weather_manager().weather_fx) {
    level.stop_weather_fx();
    // --    level_weathers.get_weather_manager().select_weather(true)
    get_global("level_weathers").get_weather_manager().forced_weather_change();
  }

  db.actor.power = 1;
}

export function dream_callback2(): void {
  log.info("Dream callback 2");

  get_global("xr_effects").enable_ui(db.actor, null);
  get_console().execute("snd_volume_music " + tostring(_G.mus_vol));
  get_console().execute("snd_volume_eff " + tostring(_G.amb_vol));

  _G.amb_vol = 0;
  _G.mus_vol = 0;

  db.actor.give_info_portion("tutorial_sleep");

  disable_info("actor_is_sleeping");
  disable_info("sleep_active");
}

export function sleep(): void {
  log.info("Sleep called");

  if (sleep_control == null) {
    sleep_control = create_xr_class_instance(SleepDialog);
  }

  sleep_control.time_track.SetCurrentValue();
  sleep_control.TestAndShow();
}

// @ts-ignore Todo: Get rid of globals
main = () => {
  log.info("[main] Call sleep from main");
  sleep();
};
