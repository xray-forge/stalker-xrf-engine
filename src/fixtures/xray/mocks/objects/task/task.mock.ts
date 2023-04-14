import { XR_task } from "xray16";

/**
 * Task state enumeration mock.
 */
export class MockTask implements XR_task {
  public static readonly additional: number = 1;
  public static readonly completed: number = 2;
  public static readonly fail: number = 0;
  public static readonly in_progress: number = 1;
  public static readonly storyline: number = 0;
  public static readonly task_dummy: number = 65535;
}
