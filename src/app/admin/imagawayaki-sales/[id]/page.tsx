import ImagawayakiReportDetails from '@/components/ImagawayakiReportDetails';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ImagawayakiReportDetails reportId={id?.toString() || ''} />;
}
