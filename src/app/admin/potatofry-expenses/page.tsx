import ExpensesTable from '@/components/ExpensesTable';
import { IAssignment } from '@/types/User';

export default function ExpensesPage() {
  return <ExpensesTable type={IAssignment.POTATO_FRY} />;
}
