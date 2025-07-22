'use client';

import { DUTY_ASSIGNMENTS } from '@/constants/assignments';
import { IAssignment, IUserType } from '@/types/User';
import { useState } from 'react';
import { toast } from 'react-toastify';

type Props = {
  isModalOpen: boolean;
  fetchEmployees: () => void;
  setIsModalOpen: (val: boolean) => void;
};

export default function SaveEmployeeModal({
  isModalOpen,
  fetchEmployees,
  setIsModalOpen,
}: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [assignment, setAssignment] = useState<IAssignment>(
    IAssignment.CHICKY_OINK,
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const addEmployee = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/users/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          assignment,
          type: IUserType.EMPLOYEE,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success('Employee added successfully!');
        setIsModalOpen(false);
        fetchEmployees();
        // You can also close the modal or refresh list here
      } else {
        toast.error(`Error: ${data.error}`);
      }
    } catch (e) {
      console.error(e);
      toast.error('Error adding employee');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">Add New Employee</h3>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mb-3 px-3 py-2 border rounded"
            />
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-4 px-3 py-2 border rounded"
            />
            <input
              type="text"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mb-4 px-3 py-2 border rounded"
            />
            <select
              className="w-full mb-4 px-3 py-2 border rounded"
              onChange={(e) => setAssignment(e.target.value as IAssignment)}
            >
              {DUTY_ASSIGNMENTS.map((assignment) => (
                <option key={assignment} value={assignment}>
                  {assignment}
                </option>
              ))}
              <option value={IAssignment.POTATO_FRY}>
                {IAssignment.POTATO_FRY}
              </option>
            </select>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 cursor-pointer bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={addEmployee}
                disabled={isLoading}
                className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
