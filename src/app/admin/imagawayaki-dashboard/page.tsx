import ChickyMonthlySales from '@/components/MonthlySales';
import { IAssignment } from '@/types/User';

export default function ImagawayakiDashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">
        Chicky Oink Sales, Expenses, and Profit
      </h2>
      <div className="grid grid-cols-3 gap-4">
        <ChickyMonthlySales type={IAssignment.IMAGAWAYAKI} />
      </div>
    </div>
  );
}
