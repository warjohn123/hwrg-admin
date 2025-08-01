import { CompanyName, ICompanyExpense } from '@/types/CompanyExpenses';
import { IAssignment } from '@/types/User';
import { Dialog } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { formSchema } from './form.schema';
import { IBranch } from '@/types/Branch';
import { fetchBranches } from '@/services/branch.service';
import {
  createCompanyExpense,
  updateCompanyExpense,
} from '@/services/company_expenses.service';
import { toast } from 'react-toastify';

interface SaveCompanyExpenseModalProps {
  isOpen: boolean;
  type: IAssignment;
  expense: ICompanyExpense | undefined;
  fetchExpenses: () => void;
  setIsOpen: (val: boolean) => void;
  setSelectedExpense: (expense: ICompanyExpense | null) => void;
}

export default function SaveCompanyExpenseModal({
  isOpen,
  type,
  expense,
  fetchExpenses,
  setIsOpen,
  setSelectedExpense,
}: SaveCompanyExpenseModalProps) {
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState<boolean>(true);

  async function getBranches() {
    try {
      const res = await fetchBranches(type);
      setBranches(res.branches);
    } catch (e) {
      console.error(`Failed to fetch branches:`, e);
    } finally {
      setIsLoadingBranches(false);
    }
  }

  const initialValues = {
    branch_id: expense?.branches?.id ?? '',
    name: expense?.name ?? '',
    amount: expense?.amount ?? '',
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedExpense(null);
  };

  const handleSubmit = async (
    values: ICompanyExpense,
    setSubmitting: (isSubmitting: boolean) => void,
  ) => {
    setSubmitting(true);
    try {
      if (expense) {
        await updateCompanyExpense(expense.id, values);
      } else {
        await createCompanyExpense({
          ...values,
          type: type as CompanyName,
        });
      }
      toast.success('Expense created successfully');
      fetchExpenses();
      closeModal();
    } catch (e) {
      toast.error('Failed to create expense');
      console.error(`Failed to create expense:`, e);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    getBranches();
  }, []);

  return (
    <Dialog
      open={isOpen}
      onClose={closeModal}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <Dialog.Panel className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
        <Dialog.Title className="text-xl font-bold mb-4 text-center">
          {!!expense ? 'Edit expense' : 'Add expense'}
        </Dialog.Title>

        <Formik
          initialValues={initialValues}
          validationSchema={formSchema}
          onSubmit={(values, { setSubmitting }) => {
            handleSubmit(values as unknown as ICompanyExpense, setSubmitting);
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4 max-w-md bg-white rounded">
              <div>
                <label className="block mb-1 font-medium">Branch</label>
                <Field
                  as="select"
                  name="branch_id"
                  className="w-full border p-2 rounded"
                >
                  <option value="">Select a branch</option>
                  {isLoadingBranches ? (
                    <option value="">Loading branches...</option>
                  ) : (
                    branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.branch_name}
                      </option>
                    ))
                  )}
                </Field>
                <ErrorMessage
                  name="branch_id"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Expense Name</label>
                <Field
                  name="name"
                  type="text"
                  className="w-full border p-2 rounded"
                  placeholder="e.g. Gas, Supplies"
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Amount</label>
                <Field
                  name="amount"
                  type="number"
                  className="w-full border p-2 rounded"
                  placeholder="e.g. 500.00"
                />
                <ErrorMessage
                  name="amount"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-500 text-white px-4 cursor-pointer py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-4 cursor-pointer py-2 rounded hover:bg-blue-700"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </Dialog.Panel>
    </Dialog>
  );
}
