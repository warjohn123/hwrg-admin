import { supabase } from "@/lib/supabase";

interface Props {
  employeeDocuments: { url: string; path: string }[];
}

export default function EmployeeDocuments({ employeeDocuments }: Props) {
  const handleDelete = async (pathToDelete: string) => {
    console.log("path to delete", pathToDelete);
    const { error } = await supabase.storage
      .from("employee-documents")
      .remove([pathToDelete]);

    console.log("error", error);

    if (error) {
      alert("Error deleting file: " + error.message);
      return;
    }
  };
  return (
    <ul className="list-disc ml-6 space-y-2">
      {employeeDocuments.map(({ url, path }, index) => (
        <li key={index} className="flex items-center justify-between gap-2">
          <a
            href={url}
            download
            target="_blank"
            className="text-blue-600 underline break-all"
          >
            {path.split("/").pop()}
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
