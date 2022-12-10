declare global {
  var aocDebug: boolean;
}

export type CacheKeyParams = {
  year: number;
  day: number;
  token: string;
  part: number;
};

export type Config = {
  year: number;
  day: number;
  token: string;
  /**
   * @default true
   */
  useCache?: boolean;
  /**
   * @default false
   */
  debug?: boolean;
};

export type ClientOptions<TransformedInput = string> = Config & {
  inputTransform?: TransformFn<TransformedInput>;
};

export type Cache = {
  get: (key: string, options?: { ignoreMaxAge?: boolean }) => any;
  set: (
    key: string,
    value: any,
    options?: {
      maxAge?: number;
      version?: string;
    }
  ) => void;
  isExpired: (key: string) => boolean;
};

export type TransformFn<T> = (input: string) => T;

export type Result = number | string;

export type PartFn<T> = (input: T) => Result;
