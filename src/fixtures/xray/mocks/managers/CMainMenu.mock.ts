import type { CMainMenu } from "xray16";

import { Optional } from "@/engine/lib/types";
import { MockLoginManager } from "@/fixtures/xray/mocks/managers/LoginManager.mock";

/**
 * Mocking internal C main menu manager.
 */
export class MockCMainMenu {
  protected static instance: Optional<MockCMainMenu> = null;

  public static getInstance(): MockCMainMenu {
    if (!this.instance) {
      this.instance = new MockCMainMenu();
    }

    return this.instance;
  }

  public static getMockInstance(): CMainMenu {
    return this.getInstance() as unknown as CMainMenu;
  }

  public static mock(): CMainMenu {
    return new MockCMainMenu() as unknown as CMainMenu;
  }

  public loginManager: MockLoginManager = new MockLoginManager();

  public GetLoginMngr(): MockLoginManager {
    return this.loginManager;
  }

  public GetAccountMngr(): void {}

  public GetProfileStore(): void {}

  public GetGSVer(): string {
    return "1.0-test";
  }
}
