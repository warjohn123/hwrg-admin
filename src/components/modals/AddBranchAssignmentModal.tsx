import { getEmployees } from '@/services/employees.service';
import { IUser } from '@/types/User';
import { Dialog } from '@headlessui/react';
import { useEffect, useState } from 'react';
import EmployeeAssignmentInput from '../EmployeeAssignmentInput';

interface Props {
  isOpen: boolean;
  branchId: string;
  setIsOpen: (val: boolean) => void;
}

export default function AddBranchAssignmentModal({
  isOpen,
  branchId,
  setIsOpen,
}: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [employees, setEmployees] = useState<IUser[]>([]);
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
            selectedEmployees={[]}
          />
          {/* <div>
            <label className="block text-sm font-medium mb-1">Assignment</label>
            <select
              value={assignment}
              onChange={(e) => setAssignment(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select an assignment</option>
              {DUTY_ASSIGNMENTS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            {errors.assignment && (
              <p className="text-red-500 text-sm">{errors.assignment}</p>
            )}
          </div> */}

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
