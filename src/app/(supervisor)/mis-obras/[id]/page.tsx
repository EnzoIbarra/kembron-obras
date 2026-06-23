import { SupervisorObraView } from '@/domains/obras/components/SupervisorObraView';

export default async function SupervisorObraDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SupervisorObraView obraId={id} />;
}
