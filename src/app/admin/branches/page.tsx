'use client';

import SaveBranchModal from '@/components/modals/SaveBranchModal';
import Pagination from '@/components/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { IBranch } from '@/types/Branch';
import { useEffect, useState } from 'react';
import { FaPencil, FaPerson, FaTrash } from 'react-icons/fa6';
import { FaArrowRight } from 'react-icons/fa';
import { redirect } from 'next/navigation';
import AddBranchAssignmentModal from '@/components/modals/AddBranchAssignmentModal';
import ConfirmModal from '@/components/modals/ConfirmationModal';
import { deleteBranch } from '@/services/branch.service';

export default function BranchesPage() {
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [isAssignedModalOpen, setIsAssignedModalOpen] =
    useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const { page, setPage, totalPages, setTotal, pageSize } = usePagination();
  const [selectedBranch, setSelectedBranch] = useState<IBranch | undefined>(
    undefined,
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchBranches(page);
  }, [page]);

  function fetchBranches(pageNumber = 1) {
    fetch(`/api/branches?page=${pageNumber}&limit=${pageSize}`)
      .then((res) => res.json())
      .then((data) => {
        setTotal(data.total);
        setBranches(data.branches);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch branches:', err);
        setLoading(false);
      });
  }

  async function handleDelete() {
    try {
      await deleteBranch(selectedBranch?.id || '');
      setShowDeleteModal(false);
      setSelectedBranch(undefined);
      fetchBranches(page);
    } catch (e) {
      console.error('Failed to delete branch:', e);
    }
  }

  if (loading) return <p>Loading branches...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Branches</h2>
        <button
          onClick={() => setIsSaveModalOpen(true)}
          className="bg-blue-600 cursor-pointer text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Add Branch
        </button>
      </div>
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-6 py-3 text-sm font-medium">Assignment</th>
              <th className="px-6 py-3 text-sm font-medium">Branch name</th>
              <th className="px-6 py-3 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {branches.map((branch) => (
              <tr key={branch.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{branch.assignment}</td>
                <td className="px-6 py-4">{branch.branch_name}</td>
                <td className="px-6 py-4 flex gap-10">
                  <FaPencil
                    className="cursor-pointer"
                    onClick={() => {
                      setIsSaveModalOpen(true);
                      setSelectedBranch(branch);
                    }}
                  />

                  <FaArrowRight
                    className="cursor-pointer"
                    onClick={() => redirect(`/admin/branches/${branch.id}`)}
                  />

                  <FaPerson
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedBranch(branch);
                      setIsAssignedModalOpen(true);
                    }}
                  />
                  <FaTrash
                    className="cursor-pointer text-red-500"
                    onClick={() => {
                      setShowDeleteModal(true);
                      setSelectedBranch(
                        branch.id !== undefined ? branch : undefined,
                      );
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isSaveModalOpen && (
          <SaveBranchModal
            branch={selectedBranch}
            isOpen={isSaveModalOpen}
            fetchBranches={fetchBranches}
            setIsOpen={setIsSaveModalOpen}
          />
        )}
        {isAssignedModalOpen && selectedBranch && (
          <AddBranchAssignmentModal
            branchId={selectedBranch?.id?.toString() || ''}
            isOpen={isAssignedModalOpen}
            setIsOpen={setIsAssignedModalOpen}
          />
        )}
        {showDeleteModal && (
          <ConfirmModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDelete}
            title="Delete Sales Report?"
            description="Are you sure you want to delete this report? This cannot be undone."
            confirmText="Delete"
          />
        )}
      </div>

      <Pagination setPage={setPage} page={page} totalPages={totalPages} />
    </div>
  );
}
