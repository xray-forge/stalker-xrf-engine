import { TXR_SightType } from "xray16";

/**
 * todo;
 */
export class MockCSightParams {
  public static readonly eSightTypeDummy: TXR_SightType = -1;
  public static readonly eSightTypeCurrentDirection: TXR_SightType = 0;
  public static readonly eSightTypePathDirection: TXR_SightType = 1;
  public static readonly eSightTypeDirection: TXR_SightType = 2;
  public static readonly eSightTypePosition: TXR_SightType = 3;
  public static readonly eSightTypeObject: TXR_SightType = 4;
  public static readonly eSightTypeCover: TXR_SightType = 5;
  public static readonly eSightTypeSearch: TXR_SightType = 6;
  public static readonly eSightTypeLookOver: TXR_SightType = 7;
  public static readonly eSightTypeCoverLookOver: TXR_SightType = 8;
  public static readonly eSightTypeFireObject: TXR_SightType = 9;
  public static readonly eSightTypeFirePosition: TXR_SightType = 10;
  public static readonly eSightTypeAnimationDirection: TXR_SightType = 11;
}
