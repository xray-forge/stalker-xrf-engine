import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { TRUE } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { showFreeplayDialog } from "@/engine/core/ui/game/freeplay";
import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/quests/show_freeplay_dialog");
});

jest.mock("@/engine/core/ui/game/freeplay");

beforeEach(() => {
  resetFunctionMock(showFreeplayDialog);
});

describe("show_freeplay_dialog", () => {
  it("should show freeplay dialog", () => {
    expect(() => {
      callXrEffect("show_freeplay_dialog", MockGameObject.mockActor(), MockGameObject.mock(), "");
    }).toThrow("Expected text message to be provided for 'show_freeplay_dialog' effect.");

    callXrEffect("show_freeplay_dialog", MockGameObject.mockActor(), MockGameObject.mock(), "test-text-1", TRUE);
    expect(showFreeplayDialog).toHaveBeenCalledWith("message_box_yes_no", "test-text-1");

    callXrEffect("show_freeplay_dialog", MockGameObject.mockActor(), MockGameObject.mock(), "test-text-2");
    expect(showFreeplayDialog).toHaveBeenCalledWith("message_box_ok", "test-text-2");
  });
});
