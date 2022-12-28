declare module "xray16" {
  /**
   * C++ class SServerFilters {
   * @customConstructor SServerFilters
   */
  export class XR_SServerFilters {
    public empty: boolean;
    public full: boolean;
    public listen_servers: boolean;
    public with_pass: boolean;
    public without_ff: boolean;
    public without_pass: boolean;
  }

  /**
   * C++ class account_manager {
   */
  export class XR_account_manager {
    public get_account_profiles(a: string, b: string, cb: XR_account_profiles_cb): unknown;
    public create_profile(a: string, b: string, c: string, d: string, cb: XR_account_profiles_cb): unknown;
    public get_suggested_unicks(): LuaIterable<string>;
    public stop_suggest_unique_nicks(): unknown;
    public verify_password(password: string): boolean;
    public verify_unique_nick(nick: string): boolean;
    public stop_searching_email(): void;
    public verify_email(email: string): boolean;
    public search_for_email(email: string, cb: XR_found_email_cb): void;
    public suggest_unique_nicks(nick: string, b: XR_suggest_nicks_cb): void;
    public get_verify_error_descr(): string;
    public delete_profile(operation: XR_account_operation_cb): void;
    public stop_fetching_account_profiles(): unknown;
    public get_found_profiles(): LuaIterable<string>;
  }

  /**
   *  C++ class login_manager {
   */
  export class XR_login_manager {
    public save_nick_to_registry(nick: string): void;
    public forgot_password(url: string): unknown;
    public get_nick_from_registry(): string;
    public get_current_profile(): XR_profile;
    public get_remember_me_from_registry(): boolean;
    public stop_login(): void;
    public save_password_to_registry(password: string): unknown;
    public login_offline(nick: string, cb: XR_login_operation_cb): unknown;
    public set_unique_nick(nick: string, cb: XR_login_operation_cb): unknown;
    public login(a: string, b: string, c: string, cb: XR_login_operation_cb): unknown;
    public save_remember_me_to_registry(value: boolean): void;
    public get_email_from_registry(): string;
    public logout(): void;
    public get_password_from_registry(): string;
    public save_email_to_registry(email: string): unknown;
    public stop_setting_unique_nick(): unknown;
  }

  /**
   * C++ class award_pair_t {
   * @constructor award_pair_t
   */
  export class XR_award_pair_t {
    public first: XR_award_data;
    public second: XR_award_data;
  }

  /**
   * C++ class best_scores_pair_t {
   * @customConstructor best_scores_pair_t
   */
  export class XR_best_scores_pair_t {
    public first: XR_award_data;
    public second: XR_award_data;
  }

  /**
   * C++ class account_profiles_cb {
   * @customConstructor account_profiles_cb
   */
  export class XR_account_profiles_cb {
    public constructor (object: object, cb: (this: object, code: number, description: string) => void);
    public bind(object: object, cb: (this: object, code: number, description: string) => void): void;
    public clear(): void;
  }

  /**
   * C++ class login_operation_cb {
   * @customConstructor login_operation_cb
   */
  export class XR_login_operation_cb {
    public constructor (
      object: object,
      cb: (this: object, profile: XR_profile | null, description: string) => void
    );

    public bind(object: object, cb: (this: object, profile: XR_profile | null, description: string) => void): void;
    public clear(): void;
  }

  /**
   * C++ class connect_error_cb {
   * @customConstructor connect_error_cb
   */
  export class XR_connect_error_cb {
    public constructor (object: object, cb: (this: object, code: number, description: string) => void);
    public bind(object: object, cb: (this: object, code: number, description: string) => void): void;
    public clear(): void;
  }

  /**
   * C++ class account_operation_cb {
   * @customConstructor account_operation_cb
   */
  export class XR_account_operation_cb {
    public constructor (object: object, cb: (this: object, code: number, description: string) => void);
    public bind(object: unknown, cb: (this: object, code: number, description: string) => void): void;
    public clear(): void;
  }

  /**
   * C++ class found_email_cb {
   * @customConstructor found_email_cb
   */
  export class XR_found_email_cb {
    public constructor (object: object, cb: (this: object, found: boolean, description: string) => void);
    public bind(object: object, cb: (this: object, found: boolean, description: string) => void): void;
    public clear(): void;
  }

  /**
   * C++ class store_operation_cb {
   * @customConstructor store_operation_cb
   */
  export class XR_store_operation_cb {
    public constructor (object: object, cb: (this: object, code: number, description: string) => void);

    public bind(object: object, cb: (this: object, code: number, description: string) => void): void;

    public clear(): void;
  }

  /**
   * C++ class suggest_nicks_cb {
   * @customConstructor suggest_nicks_cb
   */
  export class XR_suggest_nicks_cb {
    public constructor (object: object, cb: (this: object, result: number, description: string) => void);
    public bind(object: object, cb: (this: object, result: number, description: string) => void): void;
    public clear(): void;
  }

  /**
   * C++ class Patch_Dawnload_Progress {
   */
  export class XR_Patch_Dawnload_Progress {
    public GetProgress(): number;
    public GetInProgress(): boolean;
    public GetStatus(): string;
    public GetFlieName(): string;
  }

  /**
   * C++ class profile_store {
   */
  export class XR_profile_store {
    public static at_award_massacre: 0;
    public static at_awards_count: 30;
    public static bst_backstabs_in_row: 2;
    public static bst_bleed_kills_in_row: 2;
    public static bst_explosive_kills_in_row: 3;
    public static bst_eye_kills_in_row: 4;
    public static bst_head_shots_in_row: 3;
    public static bst_kills_in_row: 0;
    public static bst_kinife_kills_in_row: 1;
    public static bst_score_types_count: 7;

    public get_best_scores(): LuaIterable<XR_best_scores_pair_t>;
    public get_awards(): LuaIterable<XR_award_pair_t>;
    public stop_loading(): unknown;
    public load_current_profile(onProgress: XR_store_operation_cb, onComlete: XR_store_operation_cb): unknown;
  }
}
