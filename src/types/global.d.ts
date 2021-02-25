export {};

declare global {
  type ValueOf<T> = T[keyof T];
  type TypeGuard<T extends (args: any) => any> = T extends (
    args: any
  ) => args is infer R
    ? R
    : any;
  type Nullish<T> = {
    [P in keyof T]: T[P] | null;
  };
  type PartialNullish<T> = Partial<Nullish<T>>;
  type Arrayify<T> = {
    [P in keyof T]: T[P][];
  };
}
