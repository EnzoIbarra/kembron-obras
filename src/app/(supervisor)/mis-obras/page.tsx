import { MisObrasView } from '@/domains/obras/components/MisObrasView';

export const metadata = { title: 'Mis obras — Kembron' };

export default function MisObrasPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Mis obras</h1>
        <p className="mt-1 text-sm text-gray-500">Tus obras asignadas</p>
      </div>
      <MisObrasView />
    </div>
  );
}
