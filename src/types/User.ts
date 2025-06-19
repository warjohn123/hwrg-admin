export type IUser = {
  id: number;
  name: string;
  type: IUserType;
  assignment: IAssignment;
  address: string;
  bday: string;
  contact: string;
  email: string;
};

export enum IUserType {
  EMPLOYEE = "employee",
}

export enum IAssignment {
  CHICKY_OINK = "Chicky Oink",
  IMAGAWAYAKI = "Imagawayaki",
}
