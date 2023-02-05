declare module "xray16" {
  /**
   * C++ class CArtefact : CGameObject {
   * @customConstructor CArtefact
   */
  export class XR_CArtefact extends XR_CGameObject {
    public constructor();

    public FollowByPath(a: string, b: i32, c: XR_vector): void;
    public GetAfRank(): u8;
    public SwitchVisibility(to: boolean): void;
  }

  /**
   * C++ class CZudaArtefact : CArtefact {
   */
  export class XR_CZudaArtefact extends XR_CArtefact {
  }

  /**
   * C++ class CThornArtefact : CArtefact {
   */
  export class XR_CThornArtefact extends XR_CArtefact {
  }

  /**
   * C++ class CBastArtefact : CArtefact {
   */
  export class XR_CBastArtefact extends XR_CArtefact {
  }

  /**
   * C++ class CBlackDrops : CArtefact {
   */
  export class XR_CBlackDrops extends XR_CArtefact {
  }

  /**
   * C++ class CBlackGraviArtefact : CArtefact {
   */
  export class XR_CBlackGraviArtefact extends XR_CArtefact {
  }

  /**
   * C++ class CDummyArtefact : CArtefact {
   */
  export class XR_CDummyArtefact extends XR_CArtefact {
  }

  /**
   * C++ class CElectricBall : CArtefact {
   */
  export class XR_CElectricBall extends XR_CArtefact {
  }

  /**
   * C++ class CFadedBall : CArtefact {
   */
  export class XR_CFadedBall extends XR_CArtefact {
  }

  /**
   * C++ class CGalantineArtefact : CArtefact {
   */
  export class XR_CGalantineArtefact extends XR_CArtefact {
  }

  /**
   * C++ class CGraviArtefact : CArtefact {
   */
  export class XR_CGraviArtefact extends XR_CArtefact {
  }

  /**
   * C++ class CMercuryBall : CArtefact {
   */
  export class XR_CMercuryBall extends XR_CArtefact {
  }

  /**
   * C++ class CRustyHairArtefact : CArtefact {
   */
  export class XR_CRustyHairArtefact extends XR_CArtefact {
  }
}
