import { supabase } from '@/lib/supabaseClient';
import { IUser } from '@/types/User';
import { useState } from 'react';

interface Props {
  employeeDocuments: { url: string; path: string }[];
  employee: IUser;
  setEmployee: (employee: IUser) => void;
}

export default function EmployeeDocuments({
  employeeDocuments,
  employee,
  setEmployee,
}: Props) {
  const [documents, setDocuments] = useState(employeeDocuments);
  const handleDelete = async (pathToDelete: string) => {
    const { error } = await supabase.storage
      .from('employee-documents')
      .remove([pathToDelete]);

    if (error) {
      alert('Error deleting file: ' + error.message);
      return;
    }

    // Step 2: Remove from local state
    const updatedDocuments = documents.filter(
      (doc) => doc.path !== pathToDelete,
    );

    // Step 3: Update Supabase table
    const updatedPaths = updatedDocuments.map((doc) => doc.path);
    const { error: dbError } = await supabase
      .from('users')
      .update({ documents: updatedPaths })
      .eq('id', employee.id)
      .select();

    if (dbError) {
      alert('Failed to update employee record: ' + dbError.message);
    }
    setDocuments(updatedDocuments);
    setEmployee({ ...employee, documents: updatedPaths } as IUser);
  };

  return (
    <ul className="list-disc ml-6 space-y-2">
      {documents.map(({ url, path }, index) => (
        <li key={index} className="flex items-center justify-between gap-2">
          <a
            href={url}
            download
            target="_blank"
            className="text-blue-600 underline break-all"
          >
            {path.split('/').pop()}
          </a>
          <button
            onClick={() => handleDelete(path)}
            className="text-red-500 hover:underline text-sm cursor-pointer"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
