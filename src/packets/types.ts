/**
 * @generated from enum lunarclient.apollo.staffmod.v1.StaffMod
 */
export enum StaffMod {
  /**
   * @generated from enum value: STAFF_MOD_UNSPECIFIED = 0;
   */
  UNSPECIFIED = 0,

  /**
   * @generated from enum value: STAFF_MOD_XRAY = 1;
   */
  XRAY = 1,
}

export type EasyValue =
  | null
  | number
  | string
  | boolean
  | {
      [key: string]: EasyValue;
    }
  | EasyValue[];

export interface Location {
  world: string;
  x: number;
  y: number;
  z: number;
}
