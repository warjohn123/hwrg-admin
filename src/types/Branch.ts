import { IAssignment } from './User';

export type IBranch = {
  id?: string;
  branch_name: string;
  assignment: IAssignment;
};
