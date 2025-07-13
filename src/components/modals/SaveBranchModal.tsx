import { DUTY_ASSIGNMENTS } from '@/constants/assignments';
import { createBranch, updateBranch } from '@/services/branch.service';
import { IBranch } from '@/types/Branch';
import { IAssignment } from '@/types/User';
import { Dialog } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

interface SaveBranchModalProps {
  isOpen: boolean;
  branch: IBranch | undefined;
  fetchBranches: () => void;
  setIsOpen: (val: boolean) => void;
}

export default function SaveBranchModal({
  isOpen,
  branch,
  setIsOpen,
  fetchBranches,
}: SaveBranchModalProps) {
  const [branchName, setBranchName] = useState('');
  const [assignment, setAssignment] = useState('');
  const [errors, setErrors] = useState<{
    branchName?: string;
    assignment?: string;
  }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!branch) return;

    setBranchName(branch.branch_name);
    setAssignment(branch.assignment);
  }, [branch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};
    if (!branchName.trim()) newErrors.branchName = 'Branch name is required';
    if (!assignment) newErrors.assignment = 'Assignment is required';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);

      if (!branch) {
        await addBranch();
      } else {
        await editBranch();
      }

      closeModal();
    }
  };

  const addBranch = async () => {
    const res = await createBranch({
      branch_name: branchName,
      assignment: assignment as IAssignment,
    });
    const data = await res?.json();

    if (res?.ok) {
      toast.success('Branch added successfully!');
      fetchBranches();
      // You can also close the modal or refresh list here
    } else {
      toast.error(`Error: ${data.error}`);
    }
  };

  const editBranch = async () => {
    const res = await updateBranch({
      id: branch?.id,
      branch_name: branchName,
      assignment: assignment as IAssignment,
    });
    const data = await res?.json();

    if (res?.ok) {
      toast.success('Branch updated successfully!');
      fetchBranches();
      // You can also close the modal or refresh list here
    } else {
      toast.error(`Error: ${data.error}`);
    }
  };

  const clearForm = () => {
    setBranchName('');
    setAssignment('');
  };

  const closeModal = () => {
    setIsLoading(false);
    setIsOpen(false);
    clearForm();
  };

  if (!isOpen) return <></>;

  return (
    <Dialog
      open={isOpen}
      onClose={closeModal}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <Dialog.Panel className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
        <Dialog.Title className="text-xl font-bold mb-4 text-center">
          {!!branch ? 'Update branch' : 'Create new branch'}
        </Dialog.Title>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Branch Name
            </label>
            <input
              type="text"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            {errors.branchName && (
              <p className="text-red-500 text-sm">{errors.branchName}</p>
            )}
          </div>

          <div>
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
          </div>

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
