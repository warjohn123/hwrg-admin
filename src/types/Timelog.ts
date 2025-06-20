export type ITimelog = {
  id: string;
  user_id: string; //FK
  photo_url: string;
  clock_in: string;
  clock_out: string;
  date: string;
};
