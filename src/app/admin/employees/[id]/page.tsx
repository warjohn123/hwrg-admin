"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { IUser } from "@/types/User";
import { uploadFile } from "@/lib/uploadFile";
import { toast } from "react-toastify";
import { supabase } from "@/lib/supabase";
import EmployeeDocuments from "@/components/EmployeeDocuments";

const ASSIGNMENT_OPTIONS = ["Imagawayaki", "Chicky Oink", "Potato Fry"];

export default function EmployeeDetailsPage() {
  const { id } = useParams();
  const [employee, setEmployee] = useState<IUser | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [picture, setPicture] = useState<File>();

  const employeePicture = supabase.storage
    .from("employees")
    .getPublicUrl(employee?.picture || "").data.publicUrl;

  const employeeDocuments = useMemo(() => {
    if (!employee?.documents) return [];

    return employee.documents.map((document) => {
      const { data } = supabase.storage
        .from("employee-documents")
        .getPublicUrl(document || "");

      return { url: data.publicUrl, path: document };
    });
  }, [employee]);

  useEffect(() => {
    // Fetch employee data
    const fetchEmployee = async () => {
      const res = await fetch(`/api/users/${id}`);
      const data = await res.json();
      setEmployee(data);
    };
    fetchEmployee();
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!employee) return;
    const { name, value } = e.target;
    setEmployee({ ...employee, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles(Array.from(e.target.files));
  };

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const img = e.target.files[0];
    if (!img || !img.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }
    setPicture(e.target.files[0]);
  };

  const handleSave = async () => {
    if (!employee) return;
    setIsSaving(true);

    try {
      //Upload picture
      const employeePicture = picture
        ? await uploadFile(picture, employee.id, "employees")
        : null;

      // Upload documents (mocked)
      const uploadedDocPaths = await Promise.all(
        files.map(async (file) => {
          const result = await uploadFile(
            file,
            employee.id,
            "employee-documents"
          );
          return result || "";
        })
      );

      const updatedEmployee: IUser = {
        ...employee,
        picture: employeePicture ? employeePicture : null,
        documents: [...(employee.documents || []), ...uploadedDocPaths],
      };

      await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEmployee),
      });

      toast.success("Employee updated successfully!");
      setEmployee(updatedEmployee);
    } catch (e) {
      toast.error("Something went wrong. Please contact IT department");
    } finally {
      setIsSaving(false);
    }
  };

  if (!employee) return <p>Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Edit Employee Details</h1>

      <label className="block font-medium text-sm text-gray-700 mb-1">
        Employee Picture
      </label>
      {employeePicture && (
        <img
          src={employeePicture}
          alt="Employee Picture"
          width={120}
          height={120}
          className="rounded-full"
        />
      )}
      <input
        type="file"
        accept="image/png, image/jpeg"
        onChange={handlePictureChange}
        className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />

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

      <label className="block font-medium text-sm text-gray-700 mb-1">
        Upload Documents
      </label>
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />

      <EmployeeDocuments
        employeeDocuments={employeeDocuments}
        employeeId={employee.id}
      />

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="px-6 py-2 bg-blue-600 cursor-pointer text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isSaving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
