import { IAssignment, IUser } from "@/types/User";

const ASSIGNMENT_OPTIONS = [
  IAssignment.IMAGAWAYAKI,
  IAssignment.CHICKY_OINK,
  IAssignment.POTATO_FRY,
];

interface Props {
  employee: IUser;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
}

export default function EmployeeDetailsForm({
  employee,
  handleInputChange,
}: Props) {
  return (
    <>
      <label className="block font-medium text-sm text-gray-700 mb-1">
        Employee Name
      </label>
      <input
        type="text"
        name="name"
        value={employee.name}
        onChange={handleInputChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <label className="block font-medium text-sm text-gray-700 mb-1">
        Employee Email
      </label>
      <input
        type="text"
        name="email"
        value={employee.email}
        onChange={handleInputChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <label className="block font-medium text-sm text-gray-700 mb-1">
        Employee Contact
      </label>
      <input
        type="text"
        name="contact"
        value={employee.contact}
        onChange={handleInputChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <label className="block font-medium text-sm text-gray-700 mb-1">
        Address
      </label>
      <input
        type="text"
        name="address"
        value={employee.address}
        onChange={handleInputChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <label className="block font-medium text-sm text-gray-700 mb-1">
        Birthday
      </label>
      <input
        type="text"
        name="bday"
        value={employee.bday}
        onChange={handleInputChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <label className="block font-medium text-sm text-gray-700 mb-1">
        Rate per Day (₱)
      </label>
      <input
        type="number"
        name="rate_per_day"
        value={employee.rate_per_day}
        onChange={handleInputChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <label className="block font-medium text-sm text-gray-700 mb-1">
        First Duty Date
      </label>
      <input
        type="text"
        name="first_duty_date"
        value={employee.first_duty_date}
        onChange={handleInputChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <label className="block font-medium text-sm text-gray-700 mb-1">
        Assignment
      </label>
      <select
        name="assignment"
        value={employee.assignment}
        onChange={handleInputChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {ASSIGNMENT_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </>
  );
}
