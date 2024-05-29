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
  preconditionOnly3Mode,
  preconditionOnly4andMoreMode,
} from "@/engine/core/ui/menu/options/options_preconditions";
import { EGameRenderer } from "@/engine/core/ui/menu/options/options_types";
import { MockCUIWindow } from "@/fixtures/xray";

function checkPrecondition(
  renderer: EGameRenderer,
  expected: boolean,
  checker: (control: CUIWindow, id: EGameRenderer) => void
): CUIWindow {
  const element: CUIWindow = MockCUIWindow.mock();

  jest.spyOn(element, "Enable");
  jest.spyOn(element, "Show");

  checker(element, renderer);
  expect(element.Enable).toHaveBeenCalledWith(expected);

  return element;
}

describe("preconditionOnly1mode util", () => {
  it("should correctly check r1", () => {
    [EGameRenderer.R1].forEach((it) => {
      checkPrecondition(it, true, preconditionOnly1mode);
    });

    [EGameRenderer.R2A, EGameRenderer.R2, EGameRenderer.R25, EGameRenderer.R3, EGameRenderer.R4].forEach((it) => {
      checkPrecondition(it, false, preconditionOnly1mode);
    });
  });
});

describe("preconditionOnly2aAndMoreMode util", () => {
  it("should correctly check 2a", () => {
    [EGameRenderer.R1].forEach((it) => {
      checkPrecondition(it, false, preconditionOnly2aAndMoreMode);
    });

    [EGameRenderer.R2A, EGameRenderer.R2, EGameRenderer.R25, EGameRenderer.R3, EGameRenderer.R4].forEach((it) => {
      checkPrecondition(it, true, preconditionOnly2aAndMoreMode);
    });
  });
});

describe("preconditionOnly2andMoreMode util", () => {
  it("should correctly check 2", () => {
    [EGameRenderer.R1, EGameRenderer.R2A].forEach((it) => {
      checkPrecondition(it, false, preconditionOnly2andMoreMode);
    });

    [EGameRenderer.R2, EGameRenderer.R25, EGameRenderer.R3, EGameRenderer.R4].forEach((it) => {
      checkPrecondition(it, true, preconditionOnly2andMoreMode);
    });
  });
});

describe("preconditionOnly25andMoreMode util", () => {
  it("should correctly check 25", () => {
    [EGameRenderer.R1, EGameRenderer.R2A, EGameRenderer.R2].forEach((it) => {
      checkPrecondition(it, false, preconditionOnly25andMoreMode);
    });

    [EGameRenderer.R25, EGameRenderer.R3, EGameRenderer.R4].forEach((it) => {
      checkPrecondition(it, true, preconditionOnly25andMoreMode);
    });
  });
});

describe("preconditionOnly3andMoreMode util", () => {
  it("should correctly check 3", () => {
    [EGameRenderer.R1, EGameRenderer.R2A, EGameRenderer.R2, EGameRenderer.R25].forEach((it) => {
      checkPrecondition(it, false, preconditionOnly3andMoreMode);
    });

    [EGameRenderer.R3, EGameRenderer.R4].forEach((it) => {
      checkPrecondition(it, true, preconditionOnly3andMoreMode);
    });
  });
});

describe("preconditionOnly3Mode util", () => {
  it("should correctly check 3", () => {
    [EGameRenderer.R1, EGameRenderer.R2A, EGameRenderer.R2, EGameRenderer.R25, EGameRenderer.R4].forEach((it) => {
      checkPrecondition(it, false, preconditionOnly3Mode);
    });

    [EGameRenderer.R3].forEach((it) => {
      checkPrecondition(it, true, preconditionOnly3Mode);
    });
  });
});

describe("preconditionOnly4andMoreMode util", () => {
  it("should correctly check 4", () => {
    [EGameRenderer.R1, EGameRenderer.R2A, EGameRenderer.R2, EGameRenderer.R25, EGameRenderer.R3].forEach((it) => {
      checkPrecondition(it, false, preconditionOnly4andMoreMode);
    });

    [EGameRenderer.R4].forEach((it) => {
      checkPrecondition(it, true, preconditionOnly4andMoreMode);
    });
  });
});

describe("preconditionOnly3andMoreModeVisible util", () => {
  it("should correctly check 25", () => {
    [EGameRenderer.R1, EGameRenderer.R2A, EGameRenderer.R2, EGameRenderer.R25].forEach((it) => {
      const element: CUIWindow = checkPrecondition(it, false, preconditionOnly3andMoreModeVisible);

      expect(element.Show).toHaveBeenCalledWith(false);
    });

    [EGameRenderer.R3, EGameRenderer.R4].forEach((it) => {
      const element: CUIWindow = checkPrecondition(it, true, preconditionOnly3andMoreModeVisible);

      expect(element.Show).toHaveBeenCalledWith(true);
    });
  });
});

describe("preconditionOnly25andLessModeVisible util", () => {
  it("should correctly check 25", () => {
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
