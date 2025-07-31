'use client';

import ChickyOinkReportDetails from '@/components/ChickyOinkReportDetails';
import { getSalesReportDetails } from '@/services/sales_reports.service';
import { IChickyOinkReport } from '@/types/ChickyOinkReport';
import { IAssignment } from '@/types/User';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ReportDetailsPage() {
  const { id } = useParams();
  const [report, setReport] = useState<IChickyOinkReport | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchReport() {
    try {
      const res = await getSalesReportDetails(id?.toString() || '');
      setReport(res);
    } catch (error) {
      console.error('Failed to fetch report:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading) return <>Loading report....</>;

  if (report?.type === IAssignment.CHICKY_OINK)
    return <ChickyOinkReportDetails report={report} />;

  return <></>;
}
