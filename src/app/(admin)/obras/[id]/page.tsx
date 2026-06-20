import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getObraById } from '@/domains/obras/services/obrasService';
import { ObraDetailTabs } from '@/domains/obras/components/ObraDetailTabs';
import { STATUS_LABEL, STATUS_COLOR, formatDate } from '@/domains/obras/utils/obraFormatting';
import { ObraStatus } from '@prisma/client';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const obra = await getObraById(id);
  return { title: obra ? `${obra.name} — Kembron` : 'Obra no encontrada — Kembron' };
}

export default async function ObraDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const obra = await getObraById(id);
  if (!obra) notFound();

  const status = obra.status as ObraStatus;

  return (
    <div className="flex flex-col gap-6">
      {/* Back link */}
      <Link
        href="/obras"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors w-fit"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Volver a obras
      </Link>

      {/* Obra header */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl leading-tight">{obra.name}</h1>
          {!obra.active && (
            <span className="shrink-0 rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-600">
              Inactiva
            </span>
          )}
        </div>

        <span className={`inline-block w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[status]}`}>
          {STATUS_LABEL[status]}
        </span>

        <dl className="flex flex-col gap-1 text-sm text-gray-600 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-1">
          <div className="flex gap-1.5">
            <dt className="font-medium text-gray-500">Cliente</dt>
            <dd>{obra.client}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="font-medium text-gray-500">Ubicación</dt>
            <dd>{obra.location}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="font-medium text-gray-500">Período</dt>
            <dd>{formatDate(obra.startDate.toISOString())} – {formatDate(obra.theoreticalEndDate.toISOString())}</dd>
          </div>
        </dl>
      </div>

      {/* Tab shell */}
      <ObraDetailTabs />
    </div>
  );
}
