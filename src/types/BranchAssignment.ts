import { IUser } from './User';

export interface IBranchAssignment {
  id: number;
  users: IUser;
  branch_id: number;
}
