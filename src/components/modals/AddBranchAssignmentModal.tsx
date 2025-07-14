import { assignBranch } from '@/services/branch_assignments.service';
import { getEmployees } from '@/services/employees.service';
import { IUser } from '@/types/User';
import { Dialog } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import EmployeeAssignmentInput from '../EmployeeAssignmentInput';

interface Props {
  isOpen: boolean;
  branchId: string;
  selectedEmployeesList: IUser[];
  fetchAssignedEmployees: () => void;
  setIsOpen: (val: boolean) => void;
}

export default function AddBranchAssignmentModal({
  isOpen,
  branchId,
  selectedEmployeesList,
  fetchAssignedEmployees,
  setIsOpen,
}: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [employees, setEmployees] = useState<IUser[]>([]);
  const closeModal = () => {
    setIsLoading(false);
    setIsOpen(false);
  };
  const [newSelectedEmployees, setNewSelectedEmployees] = useState<IUser[]>(
    selectedEmployeesList,
  );

  const fetchAllEmployees = async () => {
    try {
      const res = await getEmployees();
      setEmployees(res.users);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);

    const beforeIds = new Set(selectedEmployeesList.map((e) => e.id));
    const nowIds = new Set(newSelectedEmployees.map((e) => e.id));

    const added = newSelectedEmployees.filter((e) => !beforeIds.has(e.id));
    const removed = selectedEmployeesList.filter((e) => !nowIds.has(e.id));

    try {
      for (const employee of added) {
        await assignBranch(employee.id, branchId, 'add');
      }

      for (const employee of removed) {
        await assignBranch(employee.id, branchId, 'remove');
      }

      fetchAssignedEmployees();
      closeModal();
    } catch (e) {
      toast.error('Something went wrong. Please try again');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllEmployees();
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
          <EmployeeAssignmentInput
            allEmployees={employees}
            selectedEmployees={newSelectedEmployees}
            setSelectedEmployees={setNewSelectedEmployees}
          />

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
