declare module "xray16" {
  /**
   * C++ class CZoneCampfire : CGameObject {
   * @customConstructor CZoneCampfire
   */
  export class XR_CZoneCampfire extends XR_CGameObject {
    public is_on(): boolean;
    public turn_on(): void;
    public turn_off(): void;
  }

  /**
   * C++ class CPhysicObject : CGameObject {
   * @customConstructor CPhysicObject
   */
  export class XR_CPhysicObject extends XR_CGameObject {
    public set_door_ignore_dynamics(): void;
    public play_bones_sound(): void;
    public run_anim_back(): void;
    public unset_door_ignore_dynamics(): unknown;
    public run_anim_forward(): unknown;
    public stop_anim(): boolean;
    public anim_time_get(): number;
    public anim_time_set(value: number): void;
    public stop_bones_sound(): void;
  }

  /**
   * C++ class hanging_lamp : CGameObject {
   * @customConstructor hanging_lamp
   */
  export class XR_hanging_lamp extends XR_CGameObject {
    public turn_on(): void;
    public turn_off(): void;
  }

  /**
   * C++ class CCar : CGameObject,holder {
   * @customConstructor CCar
   */
  export class XR_CCar extends XR_CGameObject implements XR_holder {
    public static eWpnActivate: 3;
    public static eWpnAutoFire: 5;
    public static eWpnDesiredDir: 1;
    public static eWpnDesiredPos: 2;
    public static eWpnFire: 4;
    public static eWpnToDefaultDir: 6;

    public constructor ();

    public CanHit(): boolean;
    public IsObjectVisible(game_object: XR_game_object): boolean;
    public HasWeapon(): boolean;
    public GetfHealth(): number;
    public CurrentVel(): number;
    public SetExplodeTime(time: number): void;
    public SetfHealth(value: number): void;
    public ExplodeTime(): number;
    public FireDirDiff(): unknown;
    public CarExplode(): unknown;

    public engaged(): boolean;
    public Action(value1: number, value2: number): unknown;
    public SetParam(value1: number, vector: XR_vector): unknown;
  }

  /**
   * C++ class CHelicopter : CGameObject {
   * @customConstructor CHelicopter
   */
  export class XR_CHelicopter extends XR_CGameObject {
    public static eAlive: 0;
    public static eBodyByPath: 0;
    public static eBodyToPoint: 1;
    public static eDead: 1;
    public static eEnemyEntity: 2;
    public static eEnemyNone: 0;
    public static eEnemyPoint: 1;
    public static eMovLanding: 4;
    public static eMovNone: 0;
    public static eMovPatrolPath: 2;
    public static eMovRoundPath: 3;
    public static eMovTakeOff: 5;
    public static eMovToPoint: 1;

    public m_dead: boolean;
    public m_exploded: boolean;
    public m_flame_started: boolean;
    public m_light_started: boolean;
    public m_max_mgun_dist: number;
    public m_max_rocket_dist: number;
    public m_min_mgun_dist: number;
    public m_min_rocket_dist: number;
    public m_syncronize_rocket: unknown;
    public m_time_between_rocket_attack: unknown;
    public m_use_mgun_on_attack: boolean;
    public m_use_rocket_on_attack: boolean;

    public constructor();

    public isVisible(game_object: XR_game_object): boolean;
    public GetSafeAltitude(): unknown;
    public GetRealAltitude(): unknown;
    public GetCurrVelocity(): number;
    public GetSpeedInDestPoint(value: number): number;
    public GetOnPointRangeDist(): unknown;
    public GetMaxVelocity(): number;
    public GetfHealth(): number;
    public GetMovementState(): unknown;
    public GetBodyState(): unknown;
    public GetCurrVelocityVec(): XR_vector;
    public GetState(): unknown;
    public GetDistanceToDestPosition(): number;
    public GetHuntState(): unknown;
    public SetSpeedInDestPoint(value: number): unknown;
    public SetLinearAcc(value1: number, value2: number): unknown;
    public SetfHealth(value: number): unknown;
    public SetMaxVelocity(value: number): unknown;
    public SetEnemy(game_object: XR_game_object | null): void;
    public SetEnemy(vector: XR_vector): void;
    public SetFireTrailLength(value: number): unknown;
    public SetBarrelDirTolerance(value: number): unknown;
    public SetDestPosition(vector: XR_vector): void;
    public SetOnPointRangeDist(value: number): unknown;

    public LookAtPoint(vector: XR_vector, value: boolean): unknown;
    public GoPatrolByPatrolPath(value1: string, value2: number): unknown;
    public Explode(): unknown;
    public TurnLighting(value: boolean): unknown;
    public UseFireTrail(): unknown;
    public UseFireTrail(value: boolean): unknown;
    public GoPatrolByRoundPath(vector: XR_vector, value1: number, value2: boolean): void;
    public Die(): void;
    public StartFlame(): void;
    public TurnEngineSound(enabled: boolean): void;
    public ClearEnemy(): void;
  }
}
