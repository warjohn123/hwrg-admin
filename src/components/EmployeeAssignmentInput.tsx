import { IUser } from '@/types/User';
import { useState } from 'react';

interface Props {
  allEmployees: IUser[];
  selectedEmployees: IUser[];
  setSelectedEmployees: (val: IUser[]) => void;
}

export default function ChipsAutocomplete({
  allEmployees,
  selectedEmployees,
  setSelectedEmployees,
}: Props) {
  const [inputValue, setInputValue] = useState('');

  const filtered = allEmployees.filter(
    (u) =>
      u.name.toLowerCase().includes(inputValue.toLowerCase()) &&
      !selectedEmployees.find((s) => s.id === u.id),
  );

  const addUser = (user: IUser) => {
    setSelectedEmployees([...selectedEmployees, user]);
    setInputValue('');
  };

  const removeUser = (userId: string) => {
    setSelectedEmployees(selectedEmployees.filter((u) => u.id !== userId));
  };

  console.log('selectedEmployees', selectedEmployees);

  return (
    <div className="w-full max-w-md">
      <label className="block mb-1 text-sm font-medium text-gray-700">
        Assign Employees
      </label>

      <div className="flex flex-wrap items-center gap-2 border rounded px-2 py-2">
        {selectedEmployees.map((user) => (
          <div
            key={user.id}
            className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
          >
            {user.name}
            <button
              onClick={() => removeUser(user.id)}
              className="ml-1 text-blue-600 hover:text-red-500"
            >
              &times;
            </button>
          </div>
        ))}

        <div className="relative flex-1">
          <input
            type="text"
            className="w-full px-2 py-1 outline-none"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search users..."
          />
          {inputValue && filtered.length > 0 && (
            <ul className="absolute z-10 bg-white border rounded shadow w-full mt-1 max-h-40 overflow-y-auto">
              {filtered.map((user) => (
                <li
                  key={user.id}
                  onClick={() => addUser(user)}
                  className="px-3 py-1 hover:bg-blue-100 cursor-pointer"
                >
                  {user.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
