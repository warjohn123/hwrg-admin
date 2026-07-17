export interface ICommission {
  id: number;
  sales_report_id: number;
  amount: number;
  date: string;
  created_at: string | null;
  sales_reports: {
    report_date: string;
    on_duty: string | null;
    title: string;
  };
}
