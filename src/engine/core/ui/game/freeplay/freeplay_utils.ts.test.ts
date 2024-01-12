import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { showFreeplayDialog } from "@/engine/core/ui/game/freeplay/freeplay_utils";
import { FreeplayDialog } from "@/engine/core/ui/game/freeplay/FreeplayDialog";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { infoPortions } from "@/engine/lib/constants/info_portions";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

describe("showFreeplayDialog", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should initialize and reuse same dialog", () => {
    const dialog: FreeplayDialog = showFreeplayDialog("test-selector", "test-text");

    expect(showFreeplayDialog("test-selector", "test-text")).toBe(dialog);
    expect(showFreeplayDialog("test-selector", "test-text-2")).toBe(dialog);
  });

  it("should call show method on init", () => {
    const dialog: FreeplayDialog = showFreeplayDialog("test-selector", "test-text");

    jest.spyOn(dialog, "Show").mockImplementation(jest.fn());

    showFreeplayDialog("test-selector-show", "test-text-show");

    expect(dialog.Show).toHaveBeenCalledWith("test-selector-show", "test-text-show");
  });

  it("onYesMessageClicked should give info portion", () => {
    mockRegisteredActor();

    expect(hasInfoPortion(infoPortions.pri_a28_actor_in_zone_leave)).toBe(false);

    showFreeplayDialog("test-selector", "test-text").onYesMessageClicked();

    expect(hasInfoPortion(infoPortions.pri_a28_actor_in_zone_leave)).toBe(true);
  });

  it("onOkMessageClicked should give info portion", () => {
    mockRegisteredActor();

    expect(hasInfoPortion(infoPortions.pri_a28_actor_in_zone_stay)).toBe(false);

    showFreeplayDialog("test-selector", "test-text").onOkMessageClicked();

    expect(hasInfoPortion(infoPortions.pri_a28_actor_in_zone_stay)).toBe(true);
  });

  it("onNoMessageClicked should give info portion", () => {
    mockRegisteredActor();

    expect(hasInfoPortion(infoPortions.pri_a28_actor_in_zone_stay)).toBe(false);

    showFreeplayDialog("test-selector", "test-text").onNoMessageClicked();

    expect(hasInfoPortion(infoPortions.pri_a28_actor_in_zone_stay)).toBe(true);
  });
});
