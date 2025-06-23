import { IUser } from "./User";

export type ITimelog = {
  id: string;
  user_id: string; //FK
  clock_in_photo: string;
  clock_in: string;
  clock_out: string;
  clock_out_photo: string;
  date: string;
  users?: IUser;
};
