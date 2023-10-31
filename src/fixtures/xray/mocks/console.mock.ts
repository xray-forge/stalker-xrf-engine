import { jest } from "@jest/globals";

import { Console, Optional } from "@/engine/lib/types";

/**
 * Mock xray game console class.
 */
export class MockConsole {
  public static instance: Optional<MockConsole> = null;

  public static getInstance(): MockConsole {
    if (!this.instance) {
      this.instance = new MockConsole();
    }

    return this.instance;
  }

  public static getInstanceMock(): Console {
    return this.getInstance() as unknown as Console;
  }

  public static reset(): void {
    this.instance = null;
  }

  public show = jest.fn();
  public hide = jest.fn();
  public execute = jest.fn();
  public execute_deferred = jest.fn();
  public execute_script = jest.fn();
  public get_bool = jest.fn(() => false);
  public get_float = jest.fn(() => 0.5);
  public get_integer = jest.fn(() => 1);
  public get_string = jest.fn(() => "test");
  public get_token = jest.fn(() => "token");
}
