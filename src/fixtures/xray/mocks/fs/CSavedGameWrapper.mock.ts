import { MockCTime } from "xray16/mocks";

export class MockCSavedGameWrapper {
  public game_time(): MockCTime {
    return new MockCTime();
  }

  public actor_health(): number {
    return 1;
  }

  public level_name(): string {
    return "pripyat";
  }
}
