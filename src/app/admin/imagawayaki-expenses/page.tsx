import ExpensesTable from '@/components/ExpensesTable';
import { IAssignment } from '@/types/User';

export default function ImagawayakiExpensesPage() {
  return <ExpensesTable type={IAssignment.IMAGAWAYAKI} />;
}
