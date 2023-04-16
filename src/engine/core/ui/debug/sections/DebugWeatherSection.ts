import { LuabindClass, ui_events, XR_CUI3tButton, XR_CUIComboBox, XR_CUIStatic } from "xray16";

import { IWeatherState, WeatherManager } from "@/engine/core/managers";
import { AbstractDebugSection } from "@/engine/core/ui/debug/sections/AbstractDebugSection";
import { isGameStarted } from "@/engine/core/utils/alife";
import { LuaLogger } from "@/engine/core/utils/logging";
import { resolveXmlFile } from "@/engine/core/utils/ui";
import { NIL } from "@/engine/lib/constants/words";
import { Optional, TPath } from "@/engine/lib/types";

const base: TPath = "menu\\debug\\DebugWeatherSection.component";
const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class DebugWeatherSection extends AbstractDebugSection {
  public currentWeatherSectionLabel!: XR_CUIStatic;
  public currentWeatherStateLabel!: XR_CUIStatic;
  public nextWeatherStateLabel!: XR_CUIStatic;

  public currentWeatherStateSelect!: XR_CUIComboBox;
  public nextWeatherStateSelect!: XR_CUIComboBox;

  public randomizeWeatherButton!: XR_CUI3tButton;

  public initializeControls(): void {
    resolveXmlFile(base, this.xml);

    this.currentWeatherSectionLabel = this.xml.InitStatic("current_weather_section_label", this);
    this.currentWeatherStateLabel = this.xml.InitStatic("current_weather_state_label", this);
    this.nextWeatherStateLabel = this.xml.InitStatic("next_weather_state_label", this);

    this.currentWeatherStateSelect = this.xml.InitComboBox("current_weather_state_select", this);
    this.nextWeatherStateSelect = this.xml.InitComboBox("next_weather_state_select", this);

    this.randomizeWeatherButton = this.xml.Init3tButton("randomize_weather_button", this);

    this.owner.Register(this.randomizeWeatherButton, "randomize_weather_button");
    this.owner.Register(this.currentWeatherStateSelect, "current_weather_state_select");
    this.owner.Register(this.nextWeatherStateSelect, "next_weather_state_select");
  }

  public initializeCallBacks(): void {
    this.owner.AddCallback(
      "randomize_weather_button",
      ui_events.BUTTON_CLICKED,
      () => this.onRandomizeWeatherClicked(),
      this
    );

    this.owner.AddCallback(
      "current_weather_state_select",
      ui_events.LIST_ITEM_SELECT,
      () => this.onCurrentStateChange(),
      this
    );

    this.owner.AddCallback(
      "next_weather_state_select",
      ui_events.LIST_ITEM_SELECT,
      () => this.onNextStateChange(),
      this
    );
  }

  public initializeState(): void {
    this.currentWeatherStateSelect.ClearList();
    this.nextWeatherStateSelect.ClearList();

    if (isGameStarted()) {
      const weatherManager: WeatherManager = WeatherManager.getInstance();
      const weatherState: Optional<IWeatherState> = weatherManager.state.get(weatherManager.weatherName);
      const possibleWeathers = weatherState === null ? [] : Object.keys(weatherState.weatherGraph);

      possibleWeathers.forEach((it, index) => {
        this.currentWeatherStateSelect.AddItem(it, index);
        this.nextWeatherStateSelect.AddItem(it, index);
      });

      this.currentWeatherSectionLabel.SetText("Current weather section: " + weatherManager.weatherSection);

      this.currentWeatherStateLabel.SetText("Current weather state:");
      this.currentWeatherStateSelect.SetText(weatherState?.currentState ?? NIL);

      this.nextWeatherStateLabel.SetText("Next weather state:");
      this.nextWeatherStateSelect.SetText(weatherState?.nextState ?? NIL);

      this.randomizeWeatherButton.Enable(true);
      this.currentWeatherStateSelect.Enable(true);
      this.nextWeatherStateSelect.Enable(true);
    } else {
      this.currentWeatherSectionLabel.SetText("Current weather section: " + NIL);

      this.currentWeatherStateLabel.SetText("Current weather state:");
      this.currentWeatherStateSelect.SetText(NIL);

      this.nextWeatherStateLabel.SetText("Next weather state:");
      this.nextWeatherStateSelect.SetText(NIL);

      this.randomizeWeatherButton.Enable(false);
      this.currentWeatherStateSelect.Enable(false);
      this.nextWeatherStateSelect.Enable(false);
    }
  }

  public onRandomizeWeatherClicked(): void {
    logger.info("Randomize weather");

    const weatherManager: WeatherManager = WeatherManager.getInstance();

    weatherManager.forceWeatherChange();
    weatherManager.updateWeatherStates();
    weatherManager.updateWeather(true);

    this.initializeState();
  }

  public onCurrentStateChange(): void {
    const weatherManager: WeatherManager = WeatherManager.getInstance();
    const weatherState: Optional<IWeatherState> = weatherManager.state.get(weatherManager.weatherName);

    if (weatherState !== null) {
      weatherState.currentState = this.currentWeatherStateSelect.GetText();

      weatherManager.forceWeatherChange();
      weatherManager.updateWeather(true);

      this.initializeState();
    }
  }

  public onNextStateChange(): void {
    const weatherManager: WeatherManager = WeatherManager.getInstance();
    const weatherState: Optional<IWeatherState> = weatherManager.state.get(weatherManager.weatherName);

    if (weatherState !== null) {
      weatherState.nextState = this.nextWeatherStateSelect.GetText();

      weatherManager.forceWeatherChange();
      weatherManager.updateWeather(true);

      this.initializeState();
    }
  }
}
