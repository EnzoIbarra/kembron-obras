import { ObrasList } from '@/domains/obras/components/ObrasList';

export const metadata = { title: 'Obras — Kembron' };

export default function ObrasPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Obras</h1>
      <p className="text-sm text-gray-500 mb-8">Administración de obras activas e inactivas.</p>
      <ObrasList />
    </div>
  );
}
