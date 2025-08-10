'use client';

import AddBranchAssignmentModal from '@/components/modals/AddBranchAssignmentModal';
import {
  fetchAssignedEmployeesByBranch,
  getBranchDetails,
} from '@/services/branch.service';
import { IBranch } from '@/types/Branch';
import { IBranchAssignment } from '@/types/BranchAssignment';
import { IUser } from '@/types/User';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BranchDetailsPage() {
  const { id } = useParams();
  const [branch, setBranch] = useState<IBranch>();
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [assignedEmployees, setAssignedEmployees] = useState<IUser[]>([]);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    setLoading(true);
    try {
      await fetchBranch();
      await fetchAssignments();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchBranch() {
    const res = await getBranchDetails(id?.toString() || '');
    setBranch(res);
  }

  async function fetchAssignments() {
    const res = await fetchAssignedEmployeesByBranch(id?.toString() || '');
    const branchAssignments: IBranchAssignment[] = res.branch_assignments;

    const assigned = branchAssignments.map((assignment) => assignment.users);

    setAssignedEmployees(assigned);
  }

  if (loading) return <p>Loading assignments...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          {branch?.assignment} - {branch?.branch_name}
        </h2>
        <button
          onClick={() => setIsSaveModalOpen(true)}
          className="bg-blue-600 cursor-pointer text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Add Employee
        </button>
      </div>
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-6 py-3 text-sm font-medium">Employee</th>
            </tr>
          </thead>
          <tbody>
            {assignedEmployees.map((employee) => (
              <tr
                key={employee.id}
                className="border-b hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4">{employee.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <AddBranchAssignmentModal
          branchId={id?.toString() || ''}
          isOpen={isSaveModalOpen}
          fetchAssignedEmployees={fetchAssignments}
          setIsOpen={setIsSaveModalOpen}
        />
      </div>
    </div>
  );
}
