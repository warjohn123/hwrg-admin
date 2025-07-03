import { IUser } from "@/types/User";
import { useState } from "react";

export function useEmployeeDetails() {
  const [employee, setEmployee] = useState<IUser | null>(null);
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!employee) return;
    const { name, value } = e.target;
    setEmployee({ ...employee, [name]: value });
  };

  return { employee, setEmployee, handleInputChange };
}
