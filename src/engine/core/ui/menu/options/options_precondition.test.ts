import { describe, expect, it, jest } from "@jest/globals";
import { CUIWindow } from "xray16";

import {
  preconditionOnly1mode,
  preconditionOnly25andLessModeVisible,
  preconditionOnly25andMoreMode,
  preconditionOnly2aAndMoreMode,
  preconditionOnly2andMoreMode,
  preconditionOnly3andMoreMode,
  preconditionOnly3andMoreModeVisible,
} from "@/engine/core/ui/menu/options/options_preconditions";
import { EGameRenderer } from "@/engine/core/ui/menu/options/types";
import { MockCUIWindow } from "@/fixtures/xray";

describe("options_precondition.test.ts class", () => {
  const checkPrecondition = (
    renderer: EGameRenderer,
    expected: boolean,
    checker: (control: CUIWindow, id: EGameRenderer) => void
  ) => {
    const element: CUIWindow = MockCUIWindow.mock();

    jest.spyOn(element, "Enable");
    jest.spyOn(element, "Show");

    checker(element, renderer);
    expect(element.Enable).toHaveBeenCalledWith(expected);

    return element;
  };

  it("preconditionOnly1mode should correctly check r1", () => {
    [EGameRenderer.R1].forEach((it) => {
      checkPrecondition(it, true, preconditionOnly1mode);
    });

    [EGameRenderer.R2A, EGameRenderer.R2, EGameRenderer.R25, EGameRenderer.R3, EGameRenderer.R4].forEach((it) => {
      checkPrecondition(it, false, preconditionOnly1mode);
    });
  });

  it("preconditionOnly2aAndMoreMode should correctly check 2a", () => {
    [EGameRenderer.R1].forEach((it) => {
      checkPrecondition(it, false, preconditionOnly2aAndMoreMode);
    });

    [EGameRenderer.R2A, EGameRenderer.R2, EGameRenderer.R25, EGameRenderer.R3, EGameRenderer.R4].forEach((it) => {
      checkPrecondition(it, true, preconditionOnly2aAndMoreMode);
    });
  });

  it("preconditionOnly2andMoreMode should correctly check 2", () => {
    [EGameRenderer.R1, EGameRenderer.R2A].forEach((it) => {
      checkPrecondition(it, false, preconditionOnly2andMoreMode);
    });

    [EGameRenderer.R2, EGameRenderer.R25, EGameRenderer.R3, EGameRenderer.R4].forEach((it) => {
      checkPrecondition(it, true, preconditionOnly2andMoreMode);
    });
  });

  it("preconditionOnly25andMoreMode should correctly check 25", () => {
    [EGameRenderer.R1, EGameRenderer.R2A, EGameRenderer.R2].forEach((it) => {
      checkPrecondition(it, false, preconditionOnly25andMoreMode);
    });

    [EGameRenderer.R25, EGameRenderer.R3, EGameRenderer.R4].forEach((it) => {
      checkPrecondition(it, true, preconditionOnly25andMoreMode);
    });
  });

  it("preconditionOnly3andMoreMode should correctly check 25", () => {
    [EGameRenderer.R1, EGameRenderer.R2A, EGameRenderer.R2, EGameRenderer.R25].forEach((it) => {
      checkPrecondition(it, false, preconditionOnly3andMoreMode);
    });

    [EGameRenderer.R3, EGameRenderer.R4].forEach((it) => {
      checkPrecondition(it, true, preconditionOnly3andMoreMode);
    });
  });

  it("preconditionOnly3andMoreModeVisible should correctly check 25", () => {
    [EGameRenderer.R1, EGameRenderer.R2A, EGameRenderer.R2, EGameRenderer.R25].forEach((it) => {
      const element: CUIWindow = checkPrecondition(it, false, preconditionOnly3andMoreModeVisible);

      expect(element.Show).toHaveBeenCalledWith(false);
    });

    [EGameRenderer.R3, EGameRenderer.R4].forEach((it) => {
      const element: CUIWindow = checkPrecondition(it, true, preconditionOnly3andMoreModeVisible);

      expect(element.Show).toHaveBeenCalledWith(true);
    });
  });

  it("preconditionOnly25andLessModeVisible should correctly check 25", () => {
    [EGameRenderer.R1, EGameRenderer.R2A, EGameRenderer.R2, EGameRenderer.R25].forEach((it) => {
      const element: CUIWindow = checkPrecondition(it, true, preconditionOnly25andLessModeVisible);

      expect(element.Show).toHaveBeenCalledWith(true);
    });

    [EGameRenderer.R3, EGameRenderer.R4].forEach((it) => {
      const element: CUIWindow = checkPrecondition(it, false, preconditionOnly25andLessModeVisible);

      expect(element.Show).toHaveBeenCalledWith(false);
    });
  });
});
