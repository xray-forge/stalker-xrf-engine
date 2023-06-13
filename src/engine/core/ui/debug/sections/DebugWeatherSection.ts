import { CUI3tButton, CUIComboBox, CUIStatic, LuabindClass, ui_events } from "xray16";

import { IWeatherState, WeatherManager } from "@/engine/core/managers/world/WeatherManager";
import { AbstractDebugSection } from "@/engine/core/ui/debug/sections/AbstractDebugSection";
import { isGameStarted } from "@/engine/core/utils/alife";
import { LuaLogger } from "@/engine/core/utils/logging";
import { resolveXmlFile } from "@/engine/core/utils/ui";
import { NIL } from "@/engine/lib/constants/words";
import { Optional, TPath } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);
const base: TPath = "menu\\debug\\DebugWeatherSection.component";

/**
 * todo;
 */
@LuabindClass()
export class DebugWeatherSection extends AbstractDebugSection {
  public uiCurrentWeatherSectionLabel!: CUIStatic;
  public uiCurrentWeatherStateLabel!: CUIStatic;
  public uiNextWeatherStateLabel!: CUIStatic;

  public uiCurrentWeatherStateSelect!: CUIComboBox;
  public uiNextWeatherStateSelect!: CUIComboBox;

  public uiRandomizeWeatherButton!: CUI3tButton;

  public initializeControls(): void {
    resolveXmlFile(base, this.xml);

    this.uiCurrentWeatherSectionLabel = this.xml.InitStatic("current_weather_section_label", this);
    this.uiCurrentWeatherStateLabel = this.xml.InitStatic("current_weather_state_label", this);
    this.uiNextWeatherStateLabel = this.xml.InitStatic("next_weather_state_label", this);

    this.uiCurrentWeatherStateSelect = this.xml.InitComboBox("current_weather_state_select", this);
    this.uiNextWeatherStateSelect = this.xml.InitComboBox("next_weather_state_select", this);

    this.uiRandomizeWeatherButton = this.xml.Init3tButton("randomize_weather_button", this);

    this.owner.Register(this.uiRandomizeWeatherButton, "randomize_weather_button");
    this.owner.Register(this.uiCurrentWeatherStateSelect, "current_weather_state_select");
    this.owner.Register(this.uiNextWeatherStateSelect, "next_weather_state_select");
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
    this.uiCurrentWeatherStateSelect.ClearList();
    this.uiNextWeatherStateSelect.ClearList();

    if (isGameStarted()) {
      const weatherManager: WeatherManager = WeatherManager.getInstance();
      const weatherState: Optional<IWeatherState> = weatherManager.state.get(weatherManager.weatherName);
      const possibleWeathers = weatherState === null ? [] : Object.keys(weatherState.weatherGraph);

      possibleWeathers.forEach((it, index) => {
        this.uiCurrentWeatherStateSelect.AddItem(it, index);
        this.uiNextWeatherStateSelect.AddItem(it, index);
      });

      this.uiCurrentWeatherSectionLabel.SetText("Current weather section: " + weatherManager.weatherSection);

      this.uiCurrentWeatherStateLabel.SetText("Current weather state:");
      this.uiCurrentWeatherStateSelect.SetText(weatherState?.currentState ?? NIL);

      this.uiNextWeatherStateLabel.SetText("Next weather state:");
      this.uiNextWeatherStateSelect.SetText(weatherState?.nextState ?? NIL);

      this.uiRandomizeWeatherButton.Enable(true);
      this.uiCurrentWeatherStateSelect.Enable(true);
      this.uiNextWeatherStateSelect.Enable(true);
    } else {
      this.uiCurrentWeatherSectionLabel.SetText("Current weather section: " + NIL);

      this.uiCurrentWeatherStateLabel.SetText("Current weather state:");
      this.uiCurrentWeatherStateSelect.SetText(NIL);

      this.uiNextWeatherStateLabel.SetText("Next weather state:");
      this.uiNextWeatherStateSelect.SetText(NIL);

      this.uiRandomizeWeatherButton.Enable(false);
      this.uiCurrentWeatherStateSelect.Enable(false);
      this.uiNextWeatherStateSelect.Enable(false);
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
      weatherState.currentState = this.uiCurrentWeatherStateSelect.GetText();

      weatherManager.forceWeatherChange();
      weatherManager.updateWeather(true);

      this.initializeState();
    }
  }

  public onNextStateChange(): void {
    const weatherManager: WeatherManager = WeatherManager.getInstance();
    const weatherState: Optional<IWeatherState> = weatherManager.state.get(weatherManager.weatherName);

    if (weatherState !== null) {
      weatherState.nextState = this.uiNextWeatherStateSelect.GetText();

      weatherManager.forceWeatherChange();
      weatherManager.updateWeather(true);

      this.initializeState();
    }
  }
}
