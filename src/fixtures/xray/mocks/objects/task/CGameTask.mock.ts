import { jest } from "@jest/globals";

import { AnyObject, GameTask, Optional, TTaskState } from "@/engine/lib/types";

/**
 * Mock x-ray task object.
 */
export class MockCGameTask implements GameTask {
  public priority: number = -1;
  public title: string = "test_title";
  public description: string = "test_description";
  public iconName: string = "test_icon";
  public id: string = "test_id";
  public state: TTaskState = 1;

  public add_complete_func = jest.fn((value: string): void => {});

  public add_complete_info = jest.fn((value: string): void => {});

  public add_fail_func = jest.fn((value: string): void => {});

  public add_fail_info = jest.fn((value: string): void => {});

  public add_on_complete_func = jest.fn((value: string): void => {});

  public add_on_complete_info = jest.fn((value: string): void => {});

  public add_on_fail_func = jest.fn((value: string): void => {});

  public add_on_fail_info = jest.fn((value: string): void => {});

  public change_map_location = jest.fn((value: string, value2: number): void => {});

  public get_description = jest.fn((): string => {
    return this.description;
  });

  public get_icon_name = jest.fn(<T extends string>(): Optional<T> => {
    return this.iconName as T;
  }) as <T extends string>() => Optional<T>;

  public get_id = jest.fn((): string => {
    return this.id;
  });

  public get_priority = jest.fn((): number => {
    return this.priority;
  });

  public get_state = jest.fn((): TTaskState => {
    return this.state;
  });

  public get_title = jest.fn((): string => {
    return this.title;
  });

  public get_type = jest.fn((): number => {
    return 0;
  });

  public remove_map_locations = jest.fn((flag: boolean): void => {});

  public set_description = jest.fn((description: string): void => {
    this.description = description;
  });

  public set_icon_name = jest.fn((name: string): void => {
    this.iconName = name;
  });

  public set_id = jest.fn((id: string): void => {
    this.id = id;
  });

  public set_map_hint = jest.fn((hint: string): void => {});

  public set_map_location = jest.fn((location: string): void => {});

  public set_map_object_id = jest.fn((id: number): void => {});

  public set_priority = jest.fn((priority: number): void => {
    this.priority = priority;
  });

  public set_title = jest.fn((title: string): void => {
    this.title = title;
  });

  public set_type = jest.fn((type: number): void => {});
}

/**
 * Mock task object.
 */
export function mockCGameTask(overrides: Partial<MockCGameTask> = {}): GameTask {
  const task: MockCGameTask = new MockCGameTask();

  Object.entries(overrides).forEach(([key, value]) => ((task as AnyObject)[key] = value));

  return task as GameTask;
}
