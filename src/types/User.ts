export type IUser = {
  id: string;
  name: string;
  type: IUserType;
  assignment: IAssignment;
  address: string;
  bday: string;
  contact: string;
  email: string;
  picture: string | null;
  documents: string[];
  rate_per_day: number;
  first_duty_date: string;
};

export enum IUserType {
  EMPLOYEE = "employee",
  SALES_REPORT = "sales_report",
  ADMIN = "admin",
}

export enum IAssignment {
  CHICKY_OINK = "Chicky Oink",
  IMAGAWAYAKI = "Imagawayaki",
  POTATO_FRY = "Potato Fry",
}
