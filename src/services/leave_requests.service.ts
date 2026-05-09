export async function fetchLeaveRequests(
  page?: number,
  limit?: number,
  name?: string,
  status?: string,
  leaveType?: string,
  sortField?: string,
  sortDirection?: string,
) {
  const params = new URLSearchParams();
  if (page) params.set('page', page.toString());
  if (limit) params.set('limit', limit.toString());
  if (name) params.set('name', name);
  if (status) params.set('status', status);
  if (leaveType) params.set('leave_type', leaveType);
  if (sortField) params.set('sort_field', sortField);
  if (sortDirection) params.set('sort_direction', sortDirection);

  const res = await fetch(`/api/leave-requests?${params.toString()}`);
  return res.json();
}

export async function fetchLeaveRequest(id: number) {
  const res = await fetch(`/api/leave-requests/${id}`);
  return res.json();
}

export async function createLeaveRequest(data: {
  user_id: string;
  leave_type: string;
  date_from: string;
  date_to: string;
  reason: string;
}) {
  const res = await fetch('/api/leave-requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateLeaveRequest(
  id: number,
  data: Partial<{
    leave_type: string;
    date_from: string;
    date_to: string;
    reason: string;
    status: string;
  }>,
) {
  const res = await fetch(`/api/leave-requests/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteLeaveRequest(id: number) {
  const res = await fetch(`/api/leave-requests/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}
