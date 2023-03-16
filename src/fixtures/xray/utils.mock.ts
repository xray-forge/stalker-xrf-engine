import { jest } from "@jest/globals";

import { AnyArgs } from "@/mod/lib/types";

export function resetMethodMock(mock: (...args: AnyArgs) => any): void {
  (mock as jest.Mock).mockReset();
}
