import ChickyOinkReportDetails from '@/components/ChickyOinkReportDetails';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ChickyOinkReportDetails reportId={id?.toString() || ''} />;
}
