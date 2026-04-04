import { IUser } from '@/types/User';
import { useState } from 'react';

export function useEmployeeDetails() {
  const [employee, setEmployee] = useState<IUser | null>(null);
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    if (!employee) return;

    const { name, value } = e.target;
    const newValue =
      e.target instanceof HTMLInputElement && e.target.type === 'checkbox'
        ? e.target.checked
        : name === 'is_active'
          ? value === 'true'
          : value;

    setEmployee({ ...employee, [name]: newValue });
  };

  return { employee, setEmployee, handleInputChange };
}
