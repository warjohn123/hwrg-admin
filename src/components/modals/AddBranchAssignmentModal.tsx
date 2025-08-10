import { assignBranch } from '@/services/branch_assignments.service';
import { getEmployees } from '@/services/employees.service';
import { IUser } from '@/types/User';
import { Dialog } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import EmployeeAssignmentInput from '../EmployeeAssignmentInput';
import { fetchAssignedEmployeesByBranch } from '@/services/branch.service';
import { IBranchAssignment } from '@/types/BranchAssignment';

interface Props {
  isOpen: boolean;
  branchId: string;
  fetchAssignedEmployees?: () => void;
  setIsOpen: (val: boolean) => void;
}

export default function AddBranchAssignmentModal({
  isOpen,
  branchId,
  fetchAssignedEmployees,
  setIsOpen,
}: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [employees, setEmployees] = useState<IUser[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState<boolean>(true);
  const [assignedEmployees, setAssignedEmployees] = useState<IUser[]>([]);
  const [currentAssignedEmployees, setCurrentAssignedEmployees] = useState<
    IUser[]
  >([]);

  const closeModal = () => {
    setIsLoading(false);
    setIsOpen(false);
  };

  const fetchAllEmployees = async () => {
    try {
      const res = await getEmployees();
      setEmployees(res.users);
    } catch (e) {
      console.error(e);
    }
  };

  async function fetchAssignments() {
    const res = await fetchAssignedEmployeesByBranch(branchId);
    const branchAssignments: IBranchAssignment[] = res.branch_assignments;

    const assigned = branchAssignments.map((assignment) => assignment.users);

    setAssignedEmployees(assigned);
    setCurrentAssignedEmployees(assigned);
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);

    const beforeIds = new Set(currentAssignedEmployees.map((e) => e.id));
    const nowIds = new Set(assignedEmployees.map((e) => e.id));

    const added = assignedEmployees.filter((e) => !beforeIds.has(e.id));
    const removed = currentAssignedEmployees.filter((e) => !nowIds.has(e.id));

    try {
      for (const employee of added) {
        await assignBranch(employee.id, branchId, 'add');
      }

      for (const employee of removed || []) {
        await assignBranch(employee.id, branchId, 'remove');
      }

      fetchAssignedEmployees?.();
      toast.success('Employees assigned successfully');
      closeModal();
    } catch (e) {
      toast.error('Something went wrong. Please try again');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchAllEmployees();
      await fetchAssignments();

      setIsLoadingEmployees(false);
    };

    init();
  }, []);

  if (!isOpen || !branchId) return <></>;

  return (
    <Dialog
      open={isOpen}
      onClose={closeModal}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <Dialog.Panel className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
        <Dialog.Title className="text-xl font-bold mb-4 text-center">
          Assign Employees
        </Dialog.Title>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isLoadingEmployees && (
            <p className="text-center text-gray-500">Loading employees...</p>
          )}

          {!isLoadingEmployees && (
            <EmployeeAssignmentInput
              allEmployees={employees}
              selectedEmployees={assignedEmployees}
              setSelectedEmployees={setAssignedEmployees}
            />
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="cursor-pointer px-4 py-2 bg-gray-300 text-black rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded"
            >
              {isLoading ? 'Saving' : 'Save'}
            </button>
          </div>
        </form>
      </Dialog.Panel>
    </Dialog>
  );
}
