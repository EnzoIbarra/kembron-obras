import { notFound } from 'next/navigation';
import { getObraById } from '@/domains/obras/services/obrasService';
import { ObraDetailHeader } from '@/domains/obras/components/ObraDetailHeader';
import { ObraDetailTabs } from '@/domains/obras/components/ObraDetailTabs';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const obra = await getObraById(id);
  return { title: obra ? `${obra.name} — Kembron` : 'Obra no encontrada — Kembron' };
}

export default async function ObraDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const obra = await getObraById(id);
  if (!obra) notFound();

  return (
    <div className="flex flex-col gap-6">
      <ObraDetailHeader obra={obra} />
      <ObraDetailTabs obraId={obra.id} />
    </div>
  );
}
