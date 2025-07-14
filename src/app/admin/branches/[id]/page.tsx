'use client';

import AddBranchAssignmentModal from '@/components/modals/AddBranchAssignmentModal';
import Pagination from '@/components/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { getBranchDetails } from '@/services/branch.service';
import { IBranch } from '@/types/Branch';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BranchDetailsPage() {
  const { id } = useParams();
  const [branch, setBranch] = useState<IBranch>();
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const { page, setPage, totalPages, setTotal, pageSize } = usePagination();

  useEffect(() => {
    init();
  }, [page]);

  async function init() {
    await fetchBranch(id as string);
    fetchBranchAssignments(page);
  }

  async function fetchBranch(id: string) {
    const res = await getBranchDetails(id);
    setBranch(res);
  }

  function fetchBranchAssignments(pageNumber = 1) {
    fetch(`/api/branches/${id}?page=${pageNumber}&limit=${pageSize}`)
      .then((res) => res.json())
      .then((data) => {
        setTotal(data.total);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch branches:', err);
        setLoading(false);
      });
  }

  if (loading) return <p>Loading assignments...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          {branch?.assignment} - {branch?.branch_name}
        </h2>
        <button
          onClick={() => setIsSaveModalOpen(true)}
          className="bg-blue-600 cursor-pointer text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Add Employee
        </button>
      </div>
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-6 py-3 text-sm font-medium">Employee</th>
            </tr>
          </thead>
          <tbody>
            {/* {branches.map((branch) => (
              <tr
                key={branch.id}
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setIsSaveModalOpen(true);
                  setSelectedBranch(branch);
                }}
              >
                <td className="px-6 py-4">{branch.assignment}</td>
                <td className="px-6 py-4">{branch.branch_name}</td>
              </tr>
            ))} */}
          </tbody>
        </table>
        <AddBranchAssignmentModal
          branchId={id?.toString() || ''}
          isOpen={isSaveModalOpen}
          setIsOpen={setIsSaveModalOpen}
        />
        {/* <SaveBranchModal
          branch={selectedBranch}
          isOpen={isSaveModalOpen}
          fetchBranches={fetchBranches}
          setIsOpen={setIsSaveModalOpen}
        /> */}
      </div>

      <Pagination setPage={setPage} page={page} totalPages={totalPages} />
    </div>
  );
}
