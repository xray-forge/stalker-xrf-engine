declare module "xray16" {
  /**
   * C++ class CZoneCampfire : CGameObject {
   * @customConstructor CZoneCampfire
   */
  export class XR_CZoneCampfire extends XR_CGameObject {
    public constructor();

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
    public unset_door_ignore_dynamics(): void;
    public run_anim_forward(): void;
    public stop_anim(): boolean;
    public anim_time_get(): f32;
    public anim_time_set(value: f32): void;
    public stop_bones_sound(): void;
  }

  /**
   * C++ class hanging_lamp : CGameObject {
   * @customConstructor hanging_lamp
   */
  export class XR_hanging_lamp extends XR_CGameObject {
    public constructor();

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
    public CarExplode(): void;
    public ChangefFuel(fule: f32): void
    public ChangefHealth(value: f32): void;
    public CurrentVel(): XR_vector;
    public ExplodeTime(): u32;
    public FireDirDiff(): f32;
    public GetfFuel(): f32;
    public GetfFuelConsumption(): f32;
    public GetfFuelTank(): f32;
    public GetfHealth(): f32;
    public HasWeapon(): boolean;
    public IsActiveEngine(): boolean;
    public IsObjectVisible(game_object: XR_game_object): boolean;
    public PlayDamageParticles(): void;
    public SetExplodeTime(time: u32): void;
    public SetfFuel(fuel: f32): void;
    public SetfFuelConsumption(consumption: f32): void;
    public SetfFuelTank(fuel: f32): void;
    public SetfHealth(health: f32): void;
    public StartEngine(): void;
    public StopDamageParticles(): void;
    public StopEngine(): void;

    public engaged(): boolean;
    public Action(value1: u16, value2: u32): void;
    public SetParam(value: i32, vector: XR_vector): void;
    public SetParam(value: TXR_CCar_weapon_param, vector: XR_vector): void;
  }

  export type TXR_CCar_weapon_param = EnumerateStaticsValues<typeof XR_CCar>;

  /**
   * C++ class CHelicopter : CGameObject {
   * @customConstructor CHelicopter
   */
  export class XR_CHelicopter extends XR_CGameObject {
    public static readonly eAlive: 0;
    public static readonly eBodyByPath: 0;
    public static readonly eBodyToPoint: 1;
    public static readonly eDead: 1;
    public static readonly eEnemyEntity: 2;
    public static readonly eEnemyNone: 0;
    public static readonly eEnemyPoint: 1;
    public static readonly eMovLanding: 4;
    public static readonly eMovNone: 0;
    public static readonly eMovPatrolPath: 2;
    public static readonly eMovRoundPath: 3;
    public static readonly eMovTakeOff: 5;
    public static readonly eMovToPoint: 1;

    public readonly m_exploded: boolean;
    public readonly m_light_started: boolean;
    public readonly m_flame_started: boolean;
    public readonly m_dead: boolean;
    public m_max_mgun_dist: f32;
    public m_max_rocket_dist: f32;
    public m_min_mgun_dist: f32;
    public m_min_rocket_dist: f32;
    public m_syncronize_rocket: boolean;
    public m_time_between_rocket_attack: u32;
    public m_use_mgun_on_attack: boolean;
    public m_use_rocket_on_attack: boolean;

    public constructor();

    public isVisible(game_object: XR_game_object): boolean;
    public GetSafeAltitude(): f32;
    public GetRealAltitude(): f32;
    public GetCurrVelocity(): f32;
    public GetSpeedInDestPoint(value: f32): f32;
    public GetOnPointRangeDist(): f32;
    public GetMaxVelocity(): f32;
    public GetfHealth(): f32;
    public GetMovementState(): i32; /* enum ? */
    public GetBodyState(): i32; /* enum ? */
    public GetCurrVelocityVec(): XR_vector;
    public GetState(): i32;
    public GetDistanceToDestPosition(): f32;
    public GetHuntState(): i32; /* enum ? */
    public SetSpeedInDestPoint(value: f32): unknown;
    public SetLinearAcc(value1: f32, value2: f32): void;
    public SetfHealth(health: f32): f32;
    public SetMaxVelocity(value: f32): void;
    public SetEnemy(game_object: XR_game_object | null): void;
    public SetEnemy(vector: XR_vector): void;
    public SetFireTrailLength(value: f32): void;
    public SetBarrelDirTolerance(value: f32): void;
    public SetDestPosition(vector: XR_vector): void;
    public SetOnPointRangeDist(value: f32): void;

    public LookAtPoint(vector: XR_vector, value: boolean): void;
    public GoPatrolByPatrolPath(value1: string, value2: i32): void;
    public Explode(): void;
    public TurnLighting(value: boolean): void;
    public UseFireTrail(): boolean;
    public UseFireTrail(value: boolean): void;
    public GoPatrolByRoundPath(vector: XR_vector, value1: f32, value2: boolean): void;
    public Die(): void;
    public StartFlame(): void;
    public TurnEngineSound(enabled: boolean): void;
    public ClearEnemy(): void;
  }
}
