import { jest } from "@jest/globals";
import { TXR_TaskState, XR_CGameTask } from "xray16";

/**
 * Mock x-ray task object.
 */
export class MockCGameTask implements XR_CGameTask {
  public priority: number = -1;
  public title: string = "test-title";
  public description: string = "test-description";
  public iconName: string = "test-icon";
  public id: string = "test-id";
  public state: TXR_TaskState = 1;

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

  public get_icon_name = jest.fn((): string => {
    return this.iconName;
  });

  public get_id = jest.fn((): string => {
    return this.id;
  });

  public get_priority = jest.fn((): number => {
    return this.priority;
  });

  public get_state = jest.fn((): TXR_TaskState => {
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
