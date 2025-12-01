import { CompanyName, ICompanyExpense } from '@/types/CompanyExpenses';
import { Dialog } from '@headlessui/react';
import {
  ErrorMessage,
  Field,
  FieldArray,
  FieldProps,
  Form,
  Formik,
} from 'formik';
import { formSchema } from './form.schema';
import { IAssignment } from '@/types/User';
import { toast } from 'react-toastify';
import { createCompanyExpense } from '@/services/company_expenses.service';
import DatePicker from 'react-datepicker';
import { useEffect, useState } from 'react';
import { IBranch } from '@/types/Branch';
import { fetchBranches } from '@/services/branch.service';

interface AddBranchAssignmentModalProps {
  isOpen: boolean;
  type: IAssignment;
  fetchExpenses: () => void;
  setIsOpen: (val: boolean) => void;
}

export default function AddExpensesModal({
  isOpen,
  type,
  fetchExpenses,
  setIsOpen,
}: AddBranchAssignmentModalProps) {
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
    expenses: [
      {
        branch_id: '',
        name: '',
        amount: '',
        expense_date: new Date().toISOString().split('T')[0],
        notes: '',
      },
    ],
  };

  const handleSubmit = async (
    values: { expenses: ICompanyExpense[] },
    setSubmitting: (isSubmitting: boolean) => void,
  ) => {
    setSubmitting(true);
    try {
      for (let i = 0; i < values.expenses.length; i++) {
        await createCompanyExpense({
          ...values.expenses[i],
          type: type as CompanyName,
        });
      }
      toast.success('Expenses created successfully');
      fetchExpenses();
      closeModal();
    } catch (e) {
      toast.error('Failed to create expenses');
      console.error(`Failed to create expenses:`, e);
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
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
      <Dialog.Panel className="bg-white p-6 rounded-xl w-full max-w-4xl shadow-lg">
        <Dialog.Title className="text-xl font-bold mb-4 text-center">
          Add expenses
        </Dialog.Title>

        <Formik
          initialValues={initialValues}
          validationSchema={formSchema}
          onSubmit={(values, { setSubmitting }) => {
            handleSubmit(
              values as unknown as { expenses: ICompanyExpense[] },
              setSubmitting,
            );
          }}
        >
          {({ values, isSubmitting }) => (
            <Form className="space-y-4 w-full bg-white rounded">
              <FieldArray name="expenses">
                {({ push, remove }) => (
                  <div className="space-y-6">
                    {values.expenses.map((_, idx) => (
                      <div
                        key={idx}
                        className="border p-4 rounded-lg relative bg-gray-50 flex items-center w-full space-x-3"
                      >
                        {/* Remove Row Button */}
                        {values.expenses.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(idx)}
                            className="absolute top-2 right-2 text-red-500"
                          >
                            ✕
                          </button>
                        )}

                        {/* Branch */}
                        <div>
                          <label className="block mb-1 font-medium">
                            Branch
                          </label>
                          <Field
                            as="select"
                            name={`expenses.${idx}.branch_id`}
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
                            name={`expenses.${idx}.branch_id`}
                            component="div"
                            className="text-red-500 text-sm"
                          />
                        </div>

                        {/* Expense Name */}
                        <div>
                          <label className="block mb-1 font-medium">
                            Expense Name
                          </label>
                          <Field
                            name={`expenses.${idx}.name`}
                            className="w-full border p-2 rounded"
                          />
                          <ErrorMessage
                            name={`expenses.${idx}.name`}
                            component="div"
                            className="text-red-500 text-sm"
                          />
                        </div>

                        {/* Amount */}
                        <div>
                          <label className="block mb-1 font-medium">
                            Amount
                          </label>
                          <Field
                            type="number"
                            name={`expenses.${idx}.amount`}
                            className="w-full border p-2 rounded"
                          />
                          <ErrorMessage
                            name={`expenses.${idx}.amount`}
                            className="text-red-500 text-sm"
                            component="div"
                          />
                        </div>

                        {/* Date */}
                        <div>
                          <label className="block mb-1 font-medium">
                            Expense Date
                          </label>
                          <Field name={`expenses.${idx}.expense_date`}>
                            {({ field, form }: FieldProps) => (
                              <DatePicker
                                className="w-full border p-2 rounded"
                                selected={new Date(field.value)}
                                onChange={(date) =>
                                  form.setFieldValue(field.name, date)
                                }
                              />
                            )}
                          </Field>
                          <ErrorMessage
                            name={`expenses.${idx}.expense_date`}
                            className="text-red-500 text-sm"
                            component="div"
                          />
                        </div>

                        {/* Notes */}
                        <div>
                          <label className="block mb-1 font-medium">
                            Notes
                          </label>
                          <Field
                            name={`expenses.${idx}.notes`}
                            as="textarea"
                            className="w-full border p-2 rounded"
                          />
                          <ErrorMessage
                            name={`expenses.${idx}.notes`}
                            className="text-red-500 text-sm"
                            component="div"
                          />
                        </div>
                      </div>
                    ))}

                    {/* Add New Row Button */}
                    <button
                      type="button"
                      onClick={() =>
                        push({
                          branch_id: '',
                          name: '',
                          amount: '',
                          expense_date: new Date().toISOString().split('T')[0],
                          notes: '',
                        })
                      }
                      className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                      + Add Another Expense
                    </button>
                  </div>
                )}
              </FieldArray>

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
