export enum LeaveType {
  SICK = 'SICK',
  VACATION = 'VACATION',
}

export enum LeaveRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export type ILeaveRequest = {
  id: number;
  user_id: string;
  leave_type: LeaveType;
  date_from: string;
  date_to: string;
  reason: string;
  status: LeaveRequestStatus;
  created_at: string | null;
  updated_at: string | null;
};
