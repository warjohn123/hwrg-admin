import MonthlySales from '@/components/MonthlySales';
import { IAssignment } from '@/types/User';

export default function HWRGEggsDashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">
        HWRG Eggs Sales, Expenses, and Profit
      </h2>
      <div className="grid grid-cols-3 gap-4">
        <MonthlySales type={IAssignment.HWRG_EGGS} />
      </div>
    </div>
  );
}
