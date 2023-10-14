import { jest } from "@jest/globals";

import { LoginManager } from "@/engine/lib/types";

/**
 * Mocking internals working with multiplayer login management.
 */
export class MockLoginManager {
  public static mock(): LoginManager {
    return new MockLoginManager() as unknown as LoginManager;
  }

  public get_current_profile = jest.fn(() => null);

  public login_offline = jest.fn();

  public save_remember_me_to_registry = jest.fn();

  public save_nick_to_registry = jest.fn();
}
