import ExpensesTable from '@/components/ExpensesTable';
import { IAssignment } from '@/types/User';

export default function ChickyOinkExpensesPage() {
  return <ExpensesTable type={IAssignment.CHICKY_OINK} />;
}
