import { jest } from "@jest/globals";
import { CUIMMShniaga } from "xray16";

export class MockCUIMMShniaga {
  public static readonly epi_main: number = 0;
  public static readonly epi_new_game: number = 1;
  public static readonly epi_new_network_game: number = 2;

  public static mock(): CUIMMShniaga {
    return new MockCUIMMShniaga() as unknown as CUIMMShniaga;
  }

  public SetPage = jest.fn();

  public ShowPage = jest.fn();
}
